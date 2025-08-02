// In packages/backend/src/services/phpExecutor.ts

import Docker from "dockerode";
import { TestCase, ExecutionResult, SubmissionResult } from "../types";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { config } from "../config";

interface ChallengeMetadata {
  functionName: string;
  parameterTypes: string[];
  returnType: string;
}

export class PHPExecutor {
  private docker: Docker;
  private readonly tempDir: string;
  private readonly TIMEOUT_MS: number;
  private readonly testRunnerPath: string;

  constructor() {
    this.docker = new Docker();

    // Use environment variable for temp directory with fallback
    this.tempDir = config.docker.tempDir || path.join(process.cwd(), "temp");

    // Set timeout from config (convert string to number if needed)
    this.TIMEOUT_MS =
      typeof config.docker.timeout === "string"
        ? parseInt(config.docker.timeout, 10)
        : config.docker.timeout || 5000;

    // Path to the PHP test runner template
    this.testRunnerPath = path.join(
      __dirname,
      "../templates/php-test-runner.php"
    );

    // Log important configurations
    console.log(`PHP Executor initialized with:
      - Temp directory: ${this.tempDir}
      - Timeout: ${this.TIMEOUT_MS}ms
      - Memory limit: ${config.docker.memory}
      - CPU quota: ${config.docker.cpuQuota}
      - Test Runner: ${this.testRunnerPath}
    `);
  }

  private async ensureTempDir(): Promise<void> {
    try {
      // Check if directory exists and create if it doesn't
      await fs.access(this.tempDir).catch(async () => {
        console.log(`Creating temp directory: ${this.tempDir}`);
        await fs.mkdir(this.tempDir, { recursive: true });
      });

      // Make sure permissions are set correctly
      await fs.chmod(this.tempDir, 0o777);

      console.log(`Temp directory ready: ${this.tempDir}`);
    } catch (error) {
      console.error(`Failed to ensure temp directory: ${error}`);
      throw new Error(`Failed to prepare temp directory: ${error}`);
    }
  }

  private async prepareFiles(
    code: string,
    containerId: string,
    testCases: TestCase[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    _metadata: ChallengeMetadata
  ): Promise<{
    userCodePath: string;
    testCasesPath: string;
    testRunnerPath: string;
  }> {
    // Ensure temp directory exists with proper permissions
    await this.ensureTempDir();

    // Create paths for the files
    const userCodePath = path.join(this.tempDir, `${containerId}-solution.php`);
    const testCasesPath = path.join(
      this.tempDir,
      `${containerId}-test-cases.json`
    );
    const destTestRunnerPath = path.join(
      this.tempDir,
      `${containerId}-test-runner.php`
    );

    // Save user code to file - don't add PHP tags since they're already in the code
    console.log(`Saving user code to: ${userCodePath}`);
    await fs.writeFile(userCodePath, code, { mode: 0o666 });

    // Save test cases to JSON file
    console.log(`Saving test cases to: ${testCasesPath}`);
    await fs.writeFile(testCasesPath, JSON.stringify(testCases), {
      mode: 0o666,
    });

    // Copy test runner template
    console.log(`Copying test runner to: ${destTestRunnerPath}`);
    await fs.copyFile(this.testRunnerPath, destTestRunnerPath);
    await fs.chmod(destTestRunnerPath, 0o666);

    return {
      userCodePath,
      testCasesPath,
      testRunnerPath: destTestRunnerPath,
    };
  }

  async executePHP(
    code: string,
    testCases: TestCase[],
    metadata: ChallengeMetadata
  ): Promise<SubmissionResult> {
    const containerId = uuidv4();
    let container: Docker.Container | null = null;
    let filePaths: {
      userCodePath: string;
      testCasesPath: string;
      testRunnerPath: string;
    } | null = null;

    try {
      // Prepare necessary files
      filePaths = await this.prepareFiles(
        code,
        containerId,
        testCases,
        metadata
      );

      console.log(`Starting container for PHP execution with files prepared`);

      // Create container using php-runner image
      container = await this.docker.createContainer({
        Image: "php-runner",
        name: `php-execution-${containerId}`,
        Cmd: ["php", "/code/test-runner.php", metadata.functionName],
        HostConfig: {
          AutoRemove: true,
          Memory:
            parseInt(config.docker.memory.replace("m", ""), 10) * 1024 * 1024,
          MemorySwap: -1,
          CpuQuota: parseInt(config.docker.cpuQuota, 10),
          NetworkMode: "none",
          Binds: [
            `${path.resolve(
              filePaths.userCodePath
            )}:/code/user-solution.php:ro`,
            `${path.resolve(filePaths.testCasesPath)}:/code/test-cases.json:ro`,
            `${path.resolve(
              filePaths.testRunnerPath
            )}:/code/test-runner.php:ro`,
          ],
        },
        WorkingDir: "/code",
      });

      console.log(`PHP container created: ${container.id}`);

      const startTime = process.hrtime();
      await container.start();
      console.log(`PHP container started: ${container.id}`);

      // Create a promise that resolves with the logs
      const logsPromise = this.getContainerLogs(container);

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `PHP execution timeout - took longer than ${this.TIMEOUT_MS}ms`
            )
          );
        }, this.TIMEOUT_MS);
      });

      // Race between logs and timeout
      const logs = await Promise.race([logsPromise, timeoutPromise]);
      const executionTime = process.hrtime(startTime);

      console.log(`PHP execution completed, processing results...`);
      return this.processResults(logs, testCases, executionTime);
    } catch (error) {
      console.error("PHP execution error:", error);

      // Return timeout error result
      return {
        success: false,
        results: testCases.map((testCase) => ({
          passed: false,
          error: error instanceof Error ? error.message : "Execution failed",
          testCase,
          executionTime: this.TIMEOUT_MS,
          memoryUsed: 0,
        })),
        metrics: {
          totalTime: this.TIMEOUT_MS,
          totalMemory: 0,
          passedTests: 0,
          totalTests: testCases.length,
        },
      };
    } finally {
      // Make sure to force stop and remove the container in case of timeout
      if (container) {
        try {
          console.log(`Stopping PHP container: ${container.id}`);
          await container
            .stop()
            .catch((err) =>
              console.log(
                `PHP container stop error (expected if already stopped): ${err.message}`
              )
            );
          await container
            .remove()
            .catch((err) =>
              console.log(
                `PHP container remove error (expected if auto-removed): ${err.message}`
              )
            );
        } catch (error) {
          console.error("Error cleaning up PHP container:", error);
        }
      }

      await this.cleanup(containerId, filePaths);
    }
  }

  private async getContainerLogs(container: Docker.Container): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      container.logs(
        {
          follow: true,
          stdout: true,
          stderr: true,
          timestamps: false,
        },
        (err, stream) => {
          if (err) {
            reject(err);
            return;
          }

          const chunks: Buffer[] = [];
          (stream as Readable).on("data", (chunk) => chunks.push(chunk));
          (stream as Readable).on("end", () => resolve(Buffer.concat(chunks)));
          (stream as Readable).on("error", reject);
        }
      );
    });
  }

  private async cleanup(
    containerId: string,
    filePaths: {
      userCodePath: string;
      testCasesPath: string;
      testRunnerPath: string;
    } | null
  ): Promise<void> {
    try {
      if (filePaths) {
        console.log(`Cleaning up PHP files...`);

        await fs.unlink(filePaths.userCodePath).catch((err) => {
          console.error(
            `Failed to remove PHP file ${filePaths.userCodePath}:`,
            err
          );
        });

        await fs.unlink(filePaths.testCasesPath).catch((err) => {
          console.error(
            `Failed to remove test cases file ${filePaths.testCasesPath}:`,
            err
          );
        });

        await fs.unlink(filePaths.testRunnerPath).catch((err) => {
          console.error(
            `Failed to remove test runner file ${filePaths.testRunnerPath}:`,
            err
          );
        });
      }

      try {
        const container = await this.docker.getContainer(
          `php-execution-${containerId}`
        );
        await container.stop().catch(() => {
          // Ignore stop errors - container might already be stopped
        });
        await container.remove().catch(() => {
          // Ignore remove errors - container might already be removed
        });
      } catch (error) {
        console.log(
          "PHP container cleanup: container might already be removed"
        );
      }
    } catch (error) {
      console.error("PHP cleanup error:", error);
    }
  }

  private processResults(
    logs: Buffer,
    testCases: TestCase[],
    executionTime: [number, number]
  ): SubmissionResult {
    const outputStr = logs.toString("utf8");
    console.log("PHP raw logs length:", outputStr.length);

    if (outputStr.length > 200) {
      console.log("PHP raw logs preview:", outputStr.substring(0, 200) + "...");
    } else {
      console.log("PHP raw logs:", outputStr);
    }

    const results: ExecutionResult[] = [];

    // Clean and parse the log output - split by lines and filter for JSON data
    const outputLines = outputStr
      .split("\n")
      .map((line) => {
        // Find JSON data in the line, even if it has prefixes
        const jsonMatch = line.match(/(\{.*\})/);
        return jsonMatch ? jsonMatch[1] : "";
      })
      .filter((line) => line.length > 0);

    console.log(`Found ${outputLines.length} PHP result lines to parse`);

    for (const line of outputLines) {
      try {
        console.log("Parsing PHP result line:", line);
        const result = JSON.parse(line);

        const testCase = testCases[result.index];

        if (testCase) {
          results.push({
            passed: result.passed,
            error: result.error,
            output: result.output,
            testCase,
            executionTime: executionTime[0] * 1000 + executionTime[1] / 1000000,
            memoryUsed: 0,
          });
        }
      } catch (error) {
        console.error("Failed to parse PHP result line:", line);
        console.error("Parse error:", error);
      }
    }

    console.log(`Processed ${results.length} PHP results`);

    // If no results were parsed, create failed results for all test cases
    if (results.length === 0) {
      // Get total execution time in ms
      const totalExecTime =
        executionTime[0] * 1000 + executionTime[1] / 1000000;

      results.push(
        ...testCases.map((testCase) => ({
          passed: false,
          error:
            "Failed to parse PHP test results. Check your code for syntax errors or infinite loops.",
          testCase,
          executionTime: totalExecTime,
          memoryUsed: 0,
        }))
      );

      console.log(
        `Created ${testCases.length} PHP failure results due to no parsed output`
      );
    }

    const finalResult = {
      success: results.every((r) => r.passed),
      results,
      metrics: {
        totalTime: executionTime[0] * 1000 + executionTime[1] / 1000000,
        totalMemory: 0,
        passedTests: results.filter((r) => r.passed).length,
        totalTests: testCases.length,
      },
    };

    console.log(
      `Final PHP result: success=${finalResult.success}, passedTests=${finalResult.metrics.passedTests}/${finalResult.metrics.totalTests}`
    );
    return finalResult;
  }
}
