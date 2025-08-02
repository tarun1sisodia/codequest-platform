#!/usr/bin/env node

// Production Go Docker test script
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing Go Docker container in production...');

// Test Go code
const testGoCode = `package main

import (
    "encoding/json"
    "fmt"
    "reflect"
)

type TestResult struct {
    Passed      bool        \`json:"passed"\`
    Error       string      \`json:"error,omitempty"\`
    Expected    interface{} \`json:"expected"\`
    Actual      interface{} \`json:"actual,omitempty"\`
    Description string      \`json:"description"\`
}

func demonstrateTypes() string {
    intVar := 42
    floatVar := 3.14
    boolVar := true
    stringVar := "hello"
    return fmt.Sprintf("int: %d, float: %.2f, bool: %t, string: %s", 
        intVar, floatVar, boolVar, stringVar)
}

func main() {
    results := []TestResult{}
    
    expected := "int: 42, float: 3.14, bool: true, string: hello"
    actual := demonstrateTypes()
    result := TestResult{
        Expected:    expected,
        Actual:      actual,
        Description: "should demonstrate basic Go types",
    }
    
    if reflect.DeepEqual(actual, expected) {
        result.Passed = true
    } else {
        result.Passed = false
        result.Error = fmt.Sprintf("Expected %v, got %v", expected, actual)
    }
    
    results = append(results, result)
    
    jsonOutput, _ := json.Marshal(results)
    fmt.Println(string(jsonOutput))
}`;

// Write test file
const testFile = path.join(__dirname, 'temp', 'test-production.go');
const tempDir = path.join(__dirname, 'temp');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

fs.writeFileSync(testFile, testGoCode);

console.log('Test file created:', testFile);
console.log('Testing Docker container...');

// Test Docker container
const dockerCmd = `docker run --rm -v "${testFile}:/code/solution.go:ro" -w /code --memory=512m go-runner sh -c "cd /code && timeout 30 go run solution.go"`;

console.log('Running command:', dockerCmd);

const startTime = Date.now();

exec(dockerCmd, { timeout: 35000 }, (error, stdout, stderr) => {
    const duration = Date.now() - startTime;
    
    console.log(`\nExecution completed in ${duration}ms`);
    
    if (error) {
        console.error('Docker execution failed:');
        console.error('Error:', error.message);
        console.error('Exit code:', error.code);
        console.error('Signal:', error.signal);
    }
    
    if (stderr) {
        console.error('STDERR:', stderr);
    }
    
    if (stdout) {
        console.log('STDOUT:', stdout);
        try {
            const result = JSON.parse(stdout);
            console.log('Parsed result:', JSON.stringify(result, null, 2));
            
            if (result[0] && result[0].passed) {
                console.log('✅ Test PASSED!');
            } else {
                console.log('❌ Test FAILED!');
            }
        } catch (parseError) {
            console.error('Failed to parse JSON output:', parseError.message);
        }
    }
    
    // Cleanup
    try {
        fs.unlinkSync(testFile);
        console.log('Test file cleaned up');
    } catch (cleanupError) {
        console.warn('Failed to cleanup test file:', cleanupError.message);
    }
});

// Also test basic Docker info
console.log('\nChecking Docker system info...');
exec('docker system info --format "{{ .Name }}: {{ .DockerRootDir }}"', (error, stdout, stderr) => {
    if (error) {
        console.error('Docker system info failed:', error.message);
    } else {
        console.log('Docker info:', stdout.trim());
    }
});

// Check available images
console.log('Checking available Docker images...');
exec('docker images go-runner', (error, stdout, stderr) => {
    if (error) {
        console.error('Failed to list Docker images:', error.message);
    } else {
        console.log('Go runner images:');
        console.log(stdout);
    }
});