import { ChallengeDocument } from "../models/Challenge";
import axios from "axios";

interface AIAssistanceRequest {
  code: string;
  challengeSlug: string; // Changed from challengeId to challengeSlug
  helpLevel: number;
  functionName: string;
  testCases: Array<{ input: unknown; expected: unknown }>;
}

interface AIAssistanceResponse {
  suggestion: string;
}

// Define help levels
enum HelpLevel {
  HINT = 0,
  CONCEPT = 1,
  APPROACH = 2,
  PSEUDOCODE = 3,
  CODE_SNIPPET = 4,
}

export class AIAssistanceService {
  private API_KEY: string = process.env.AI_API_KEY || "";
  private API_ENDPOINT: string = process.env.AI_API_ENDPOINT || "";
  private useExternalAPI: boolean = !!process.env.USE_EXTERNAL_AI_API;

  // Get AI assistance based on code and help level
  public async getAssistance(
    challenge: ChallengeDocument,
    request: AIAssistanceRequest
  ): Promise<AIAssistanceResponse> {
    try {
      // Use external AI API if configured
      if (this.useExternalAPI && this.API_KEY) {
        return await this.getAssistanceFromAPI(challenge, request);
      }

      // Otherwise use our rule-based implementation
      return this.generateAssistance(challenge, request);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error getting AI assistance:", error);
      throw new Error("Failed to get AI assistance");
    }
  }

  // Call external AI API (e.g., OpenAI) for assistance
  private async getAssistanceFromAPI(
    challenge: ChallengeDocument,
    request: AIAssistanceRequest
  ): Promise<AIAssistanceResponse> {
    try {
      // Construct the prompt based on help level
      const prompt = this.constructPrompt(challenge, request);

      // Call external API
      const response = await axios.post(
        this.API_ENDPOINT,
        {
          model: "gpt-3.5-turbo", // or your preferred model
          messages: [
            {
              role: "system",
              content: `You are a coding assistant that helps learners with ${challenge.language} challenges.`,
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.API_KEY}`,
          },
        }
      );

      // Extract and return the AI's suggestion
      const suggestion =
        response.data.choices[0]?.message?.content ||
        "I'm having trouble generating a suggestion right now.";

      return { suggestion };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error calling external AI API:", error);
      throw new Error("Failed to get AI assistance from external API");
    }
  }

  // Construct prompt based on help level
  private constructPrompt(
    challenge: ChallengeDocument,
    request: AIAssistanceRequest
  ): string {
    const { helpLevel, code } = request;
    const {
      title,
      description,
      functionName,
      testCases,
      conceptTags,
      language,
    } = challenge;

    let basePrompt = `
Challenge: ${title}
Description: ${description}
Function Name: ${functionName}
Language: ${language}
Concepts: ${conceptTags?.join(", ") || "Not specified"}
Current Code:
\`\`\`${language}
${code}
\`\`\`

Test Cases:
${JSON.stringify(testCases, null, 2)}
`;

    // Add help level specific instructions
    switch (helpLevel) {
      case HelpLevel.HINT:
        return `${basePrompt}\nProvide a gentle hint about how to approach this problem without giving away the solution.`;

      case HelpLevel.CONCEPT:
        return `${basePrompt}\nExplain the key programming concepts needed to solve this problem.`;

      case HelpLevel.APPROACH:
        return `${basePrompt}\nOutline a step-by-step approach to solve this problem without providing actual code.`;

      case HelpLevel.PSEUDOCODE:
        return `${basePrompt}\nProvide pseudocode that outlines the solution to this problem.`;

      case HelpLevel.CODE_SNIPPET:
        return `${basePrompt}\nProvide a partial implementation of the solution in ${language}. Don't solve the entire problem, but give enough code to guide them in the right direction.`;

      default:
        return `${basePrompt}\nProvide assistance with this coding challenge.`;
    }
  }

  // Generate assistance based on rule-based system (fallback when no external API)
  private generateAssistance(
    challenge: ChallengeDocument,
    request: AIAssistanceRequest
  ): AIAssistanceResponse {
    const { helpLevel } = request;
    // Challenge properties are passed to individual helper methods as needed

    // Generate suggestion based on help level
    let suggestion: string;

    switch (helpLevel) {
      case HelpLevel.HINT:
        suggestion = this.generateHint(challenge);
        break;

      case HelpLevel.CONCEPT:
        suggestion = this.generateConceptExplanation(challenge);
        break;

      case HelpLevel.APPROACH:
        suggestion = this.generateApproach(challenge);
        break;

      case HelpLevel.PSEUDOCODE:
        suggestion = this.generatePseudocode(challenge);
        break;

      case HelpLevel.CODE_SNIPPET:
        suggestion = this.generateCodeSnippet(challenge);
        break;

      default:
        suggestion = `I'm here to help with your "${challenge.title}" challenge. What would you like to know?`;
    }

    return { suggestion };
  }

  // Helper methods to generate different types of assistance
  private generateHint(challenge: ChallengeDocument): string {
    const { functionName, conceptTags, language } = challenge;

    // Look at concept tags to provide relevant hints
    if (
      conceptTags?.includes("arrays") ||
      conceptTags?.includes("php-arrays")
    ) {
      return `Think about how you can use array methods to solve this problem. Look at the test cases to understand what the function should do with its inputs.`;
    } else if (conceptTags?.includes("recursion")) {
      return `This problem might be solved elegantly using recursion. Think about the base case and how to break down the problem into smaller parts.`;
    } else if (
      conceptTags?.includes("strings") ||
      conceptTags?.includes("php-strings")
    ) {
      return `Think about string manipulation methods that might help you solve this problem. Pay attention to the examples in the test cases.`;
    } else if (
      conceptTags?.includes("php-oop") ||
      conceptTags?.includes("php-classes")
    ) {
      return `Think about how to structure your class with properties and methods. Consider the functionality required by the test cases.`;
    }

    // Language-specific hints
    if (language === "php") {
      return `In PHP, consider using built-in functions that might help solve this problem. Check the PHP documentation for ${
        conceptTags?.join(", ") || "relevant"
      } functions.`;
    }

    // Default hint based on function name
    return `Look carefully at the function name "${functionName}" and what it suggests about the problem. Examine the test cases to understand the expected behavior.`;
  }

  private generateConceptExplanation(challenge: ChallengeDocument): string {
    const { conceptTags, language } = challenge;

    let concepts: string[] = [];

    // Generate explanations for each concept tag
    (conceptTags || []).forEach((tag) => {
      // PHP-specific concepts
      if (language === "php") {
        switch (tag) {
          case "php-basics":
            concepts.push(
              `PHP Basics: PHP is a server-side scripting language designed for web development. Variables in PHP start with a $ sign, and statements end with a semicolon.`
            );
            break;
          case "php-functions":
            concepts.push(
              `PHP Functions: Functions in PHP are defined using the 'function' keyword. Parameters are passed inside parentheses, and values are returned using the 'return' statement.`
            );
            break;
          case "php-strings":
            concepts.push(
              `PHP Strings: Strings in PHP can be created with single quotes (') or double quotes ("). PHP provides many built-in functions for string manipulation like strlen(), substr(), str_replace(), and more.`
            );
            break;
          case "php-arrays":
            concepts.push(
              `PHP Arrays: PHP arrays can be indexed numerically or associatively (key-value pairs). You can create arrays using array() or the short syntax []. PHP provides many functions for array manipulation.`
            );
            break;
          case "php-associative-arrays":
            concepts.push(
              `PHP Associative Arrays: Associative arrays use named keys instead of numeric indices. They're defined like $array = ['key' => 'value']. You can access elements using $array['key'].`
            );
            break;
          case "php-loops":
            concepts.push(
              `PHP Loops: PHP supports several loop types including for, foreach, while, and do-while. The foreach loop is particularly useful for iterating over arrays.`
            );
            break;
          case "php-error-handling":
            concepts.push(
              `PHP Error Handling: PHP allows you to handle errors using try/catch blocks for exceptions, or with custom error handlers. The try/catch syntax is similar to other languages.`
            );
            break;
          case "php-oop":
            concepts.push(
              `PHP Object-Oriented Programming: PHP supports object-oriented programming with classes, objects, inheritance, interfaces, and more. Classes are defined with the 'class' keyword.`
            );
            break;
          case "php-classes":
            concepts.push(
              `PHP Classes: Classes in PHP are templates for creating objects. They can contain properties (variables) and methods (functions). The constructor method is named __construct().`
            );
            break;
          case "php-math":
            concepts.push(
              `PHP Math Functions: PHP provides various mathematical functions like round(), ceil(), floor(), min(), max(), and more for performing calculations.`
            );
            break;
          default:
            concepts.push(
              `${tag}: A PHP programming concept needed for this challenge.`
            );
        }
      } else {
        // Existing concepts for other languages
        switch (tag) {
          case "arrays":
            concepts.push(
              `Arrays: Collections of items stored at contiguous memory locations. The items can be accessed using their index.`
            );
            break;
          case "strings":
            concepts.push(
              `Strings: Sequences of characters. In ${language}, strings are immutable, so operations create new strings.`
            );
            break;
          case "loops":
            concepts.push(
              `Loops: Control structures that repeat a block of code while a condition is true (while, do-while) or for a set number of iterations (for, for...of, for...in).`
            );
            break;
          case "recursion":
            concepts.push(
              `Recursion: A technique where a function calls itself to solve a problem by breaking it down into smaller, similar problems.`
            );
            break;
          case "conditionals":
            concepts.push(
              `Conditionals: Control structures (if, else, switch) that allow your code to make decisions based on conditions.`
            );
            break;
          case "functions":
            concepts.push(
              `Functions: Blocks of reusable code that perform a specific task and can take inputs (parameters) and return outputs.`
            );
            break;
          case "objects":
            concepts.push(
              `Objects: Collections of related data and/or functionality as properties and methods.`
            );
            break;
          default:
            concepts.push(
              `${tag}: A programming concept needed for this challenge.`
            );
        }
      }
    });

    if (concepts.length === 0) {
      concepts.push(
        `This challenge tests basic ${language} programming concepts and problem-solving skills.`
      );
    }

    return concepts.join("\n\n");
  }

  private generateApproach(challenge: ChallengeDocument): string {
    const { functionName, language } = challenge;

    // PHP-specific approaches
    if (language === "php") {
      if (functionName === "sum") {
        return `To add two numbers in PHP:\n1. Take in two parameters $a and $b\n2. Use the addition operator (+) to add them together\n3. Return the result`;
      } else if (functionName === "reverseString") {
        return `To reverse a string in PHP:\n1. Consider using the built-in PHP function strrev() which reverses a string\n2. Alternatively, you could implement your own solution using a loop that goes through each character\n3. Return the reversed string`;
      } else if (functionName === "doubleValues") {
        return `To double values in an array:\n1. Create an empty result array\n2. Loop through each element in the input array\n3. Double each value and add it to the result array\n4. Return the result array\n\nAlternatively, consider using PHP's array_map() function to apply a transformation to each element.`;
      } else if (functionName === "countOccurrences") {
        return `To count occurrences in an array:\n1. Create an empty associative array to store counts\n2. Loop through each element in the input array\n3. For each element, check if it exists as a key in your counts array\n4. If it exists, increment the count; if not, initialize it to 1\n5. Return the associative array of counts\n\nYou might also explore PHP's array_count_values() function which does exactly this.`;
      } else if (functionName === "countVowels") {
        return `To count vowels in a string:\n1. Initialize a counter variable to 0\n2. Convert the string to lowercase\n3. Loop through each character in the string\n4. Check if the character is a vowel (a, e, i, o, u)\n5. If it is, increment the counter\n6. Return the final count`;
      } else if (functionName === "filterEvenNumbers") {
        return `To filter even numbers from an array:\n1. Create an empty result array\n2. Loop through each number in the input array\n3. Check if the number is even (divisible by 2)\n4. If it is, add it to the result array\n5. Return the result array\n\nAlternatively, consider using PHP's array_filter() function with a callback that checks for even numbers.`;
      }

      // Generic PHP approach
      return `General approach for this PHP problem:\n1. Understand the inputs and expected outputs from the test cases\n2. Consider which PHP built-in functions might help solve this problem\n3. Break down the problem into smaller steps\n4. Implement each step one by one\n5. Test your solution against the provided test cases`;
    }

    // Generate approach based on function name and concepts for other languages
    if (functionName === "sum" || functionName === "add") {
      return `To add two numbers:\n1. Take in two parameters\n2. Use the addition operator (+) to add them together\n3. Return the result`;
    } else if (functionName === "multiply") {
      return `To multiply two numbers:\n1. Take in two parameters\n2. Use the multiplication operator (*) to multiply them\n3. Return the result`;
    } else if (functionName === "isEven") {
      return `To check if a number is even:\n1. Take in a number parameter\n2. Use the modulo operator (%) to check if the number divided by 2 has a remainder of 0\n3. Return true if the remainder is 0, false otherwise`;
    } else if (functionName === "reverseString") {
      return `To reverse a string:\n1. Split the string into an array of characters\n2. Reverse the array\n3. Join the array back into a string\n4. Return the result`;
    } else if (functionName === "factorial") {
      return `To calculate factorial recursively:\n1. Define the base case (factorial of 0 or 1 is 1)\n2. For all other cases, return n * factorial(n-1)\n3. Make sure to handle edge cases like negative numbers`;
    }

    // Default approach for unknown function
    return `General approach to solve this problem:\n1. Understand the inputs and expected outputs from the test cases\n2. Break down the problem into smaller steps\n3. Implement each step one by one\n4. Test your solution against the provided test cases`;
  }

  private generatePseudocode(challenge: ChallengeDocument): string {
    const { functionName, language } = challenge;

    // PHP-specific pseudocode
    if (language === "php") {
      if (functionName === "sum") {
        return `function sum($a, $b):\n  $result = $a + $b\n  return $result`;
      } else if (functionName === "helloWorld") {
        return `function helloWorld():\n  return "Hello, World!"`;
      } else if (functionName === "reverseString") {
        return `function reverseString($str):\n  # Option 1: Use built-in function\n  $reversed = strrev($str)\n  return $reversed\n\n  # Option 2: Manual implementation\n  $reversed = ""\n  for $i from strlen($str) - 1 down to 0:\n    $reversed = $reversed + $str[$i]\n  return $reversed`;
      } else if (functionName === "doubleValues") {
        return `function doubleValues($arr):\n  $result = []\n  foreach $arr as $value:\n    append $value * 2 to $result\n  return $result`;
      } else if (functionName === "countOccurrences") {
        return `function countOccurrences($arr):\n  $counts = []\n  foreach $arr as $value:\n    if $value exists as key in $counts:\n      $counts[$value] = $counts[$value] + 1\n    else:\n      $counts[$value] = 1\n  return $counts`;
      } else if (functionName === "countVowels") {
        return `function countVowels($str):\n  $count = 0\n  $str = lowercase($str)\n  for $i from 0 to length($str) - 1:\n    if $str[$i] is in ['a', 'e', 'i', 'o', 'u']:\n      $count = $count + 1\n  return $count`;
      }
    }

    // Generate pseudocode based on function name
    if (functionName === "sum" || functionName === "add") {
      return `function sum(a, b):\n  result = a + b\n  return result`;
    } else if (functionName === "multiply") {
      return `function multiply(a, b):\n  result = a * b\n  return result`;
    } else if (functionName === "isEven") {
      return `function isEven(num):\n  if num % 2 equals 0:\n    return true\n  else:\n    return false`;
    } else if (functionName === "reverseString") {
      return `function reverseString(str):\n  charArray = convert str to array\n  reversedArray = reverse charArray\n  reversedString = join reversedArray to string\n  return reversedString`;
    } else if (functionName === "factorial") {
      return `function factorial(n):\n  if n is 0 or n is 1:\n    return 1\n  else:\n    return n * factorial(n - 1)`;
    }

    // Default pseudocode
    return `function ${functionName}(parameters):\n  // Process inputs\n  // Apply necessary operations\n  // Return result`;
  }

  private generateCodeSnippet(challenge: ChallengeDocument): string {
    const { functionName, testCases, language } = challenge;

    // Create type signature based on first test case
    let parameterList = "";
    if (testCases && testCases.length > 0) {
      const firstTest = testCases[0];
      if (firstTest.input) {
        if (language === "php") {
          parameterList = firstTest.input
            .map((_, i) => `$param${i + 1}`)
            .join(", ");
        } else {
          parameterList = firstTest.input
            .map((_, i) => `param${i + 1}`)
            .join(", ");
        }
      }
    }

    // PHP-specific code snippets
    if (language === "php") {
      if (functionName === "sum") {
        return `function sum($a, $b) {\n  // Add the two numbers together\n  $result = $a + $b;\n  \n  return $result;\n}`;
      } else if (functionName === "helloWorld") {
        return `function helloWorld() {\n  // Return the string "Hello, World!"\n  return "Hello, World!";\n}`;
      } else if (functionName === "reverseString") {
        return `function reverseString($str) {\n  // Option 1: Use the built-in strrev function\n  return strrev($str);\n  \n  // Option 2: Manual implementation\n  // $reversed = "";\n  // for ($i = strlen($str) - 1; $i >= 0; $i--) {\n  //   $reversed .= $str[$i];\n  // }\n  // return $reversed;\n}`;
      } else if (functionName === "doubleValues") {
        return `function doubleValues($arr) {\n  // Option 1: Using array_map\n  return array_map(function($value) {\n    return $value * 2;\n  }, $arr);\n  \n  // Option 2: Using a foreach loop\n  // $result = [];\n  // foreach ($arr as $value) {\n  //   $result[] = $value * 2;\n  // }\n  // return $result;\n}`;
      } else if (functionName === "countOccurrences") {
        return `function countOccurrences($arr) {\n  // Option 1: Using built-in function\n  return array_count_values($arr);\n  \n  // Option 2: Manual implementation\n  // $counts = [];\n  // foreach ($arr as $value) {\n  //   $key = (string)$value; // Convert to string for array key\n  //   if (isset($counts[$key])) {\n  //     $counts[$key]++;\n  //   } else {\n  //     $counts[$key] = 1;\n  //   }\n  // }\n  // return $counts;\n}`;
      } else if (functionName === "countVowels") {
        return `function countVowels($str) {\n  // Convert to lowercase for easier comparison\n  $str = strtolower($str);\n  \n  // Option 1: Using regular expression\n  return preg_match_all('/[aeiou]/i', $str);\n  \n  // Option 2: Manual counting\n  // $count = 0;\n  // $vowels = ['a', 'e', 'i', 'o', 'u'];\n  // \n  // for ($i = 0; $i < strlen($str); $i++) {\n  //   if (in_array($str[$i], $vowels)) {\n  //     $count++;\n  //   }\n  // }\n  // \n  // return $count;\n}`;
      } else if (functionName === "calculateDiscount") {
        return `function calculateDiscount($price, $discountPercent) {\n  // Calculate the discount amount\n  $discountAmount = $price * ($discountPercent / 100);\n  \n  // Subtract the discount from the original price\n  $finalPrice = $price - $discountAmount;\n  \n  return $finalPrice;\n}`;
      } else if (functionName === "createRectangleClass") {
        return `function createRectangleClass() {\n  // Define the Rectangle class\n  return 'class Rectangle {\n    // Properties\n    private $width;\n    private $height;\n    \n    // Constructor\n    public function __construct($width, $height) {\n      $this->width = $width;\n      $this->height = $height;\n    }\n    \n    // Method to calculate area\n    public function getArea() {\n      return $this->width * $this->height;\n    }\n    \n    // Method to calculate perimeter\n    public function getPerimeter() {\n      return 2 * ($this->width + $this->height);\n    }\n  }';\n}`;
      } else if (functionName === "safeDivide") {
        return `function safeDivide($a, $b) {\n  // Check for division by zero\n  if ($b === 0) {\n    return [null, "Division by zero"];\n  }\n  \n  // Perform the division\n  $result = $a / $b;\n  \n  // Return the result with no error\n  return [$result, null];\n}`;
      } else if (functionName === "palindromeChecker") {
        return `function palindromeChecker($str) {\n  // Remove non-alphanumeric characters and convert to lowercase\n  $cleanStr = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($str));\n  \n  // Compare the string with its reverse\n  return $cleanStr === strrev($cleanStr);\n}`;
      } else if (functionName === "fibonacci") {
        return `function fibonacci($n) {\n  // Base cases\n  if ($n <= 0) {\n    return 0;\n  }\n  if ($n === 1) {\n    return 1;\n  }\n  \n  // Calculate fibonacci using recursion\n  // You could also use an iterative approach for better performance\n  return fibonacci($n - 1) + fibonacci($n - 2);\n}`;
      }

      // Generic PHP code snippet
      return `function ${functionName}(${parameterList}) {\n  // Your implementation here\n  \n  // Extract the inputs\n  // Process the data\n  // Return the result\n}`;
    }

    // JavaScript/TypeScript code snippets
    if (language === "javascript" || language === "typescript") {
      if (functionName === "sum" || functionName === "add") {
        return `function ${functionName}(a, b) {\n  // Add the two numbers together\n  return a + b;\n}`;
      } else if (functionName === "multiply") {
        return `function multiply(a, b) {\n  // Multiply the two numbers\n  return a * b;\n}`;
      } else if (functionName === "isEven") {
        return `function isEven(num) {\n  // Check if the number is even\n  return num % 2 === 0;\n}`;
      } else if (functionName === "reverseString") {
        return `function reverseString(str) {\n  // Option 1: Using built-in methods\n  return str.split('').reverse().join('');\n  \n  // Option 2: Manual implementation\n  // let reversed = '';\n  // for (let i = str.length - 1; i >= 0; i--) {\n  //   reversed += str[i];\n  // }\n  // return reversed;\n}`;
      } else if (functionName === "factorial") {
        return `function factorial(n) {\n  // Base case\n  if (n === 0 || n === 1) {\n    return 1;\n  }\n  \n  // Recursive case\n  return n * factorial(n - 1);\n}`;
      } else if (functionName === "filterEvenNumbers") {
        return `function filterEvenNumbers(numbers) {\n  // Use filter to keep only even numbers\n  return numbers.filter(num => num % 2 === 0);\n}`;
      } else if (functionName === "countOccurrences") {
        return `function countOccurrences(arr) {\n  // Use reduce to count occurrences\n  return arr.reduce((counts, value) => {\n    counts[value] = (counts[value] || 0) + 1;\n    return counts;\n  }, {});\n}`;
      }

      // Generic JavaScript/TypeScript code snippet
      return `function ${functionName}(${parameterList}) {\n  // Your implementation here\n  \n  // Extract the inputs\n  // Process the data\n  // Return the result\n}`;
    }

    // Default code snippet for any language
    return `function ${functionName}(${
      parameterList || "parameters"
    }) {\n  // Implement the ${functionName} function here\n  // Consider the requirements and test cases\n  // This is a placeholder to help you get started\n}`;
  }
}
