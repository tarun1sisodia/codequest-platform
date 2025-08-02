<?php
// Include user solution
include 'user-solution.php';

// Get test cases from JSON input
$testCasesJson = file_get_contents('test-cases.json');
$testCases = json_decode($testCasesJson, true);

// Get function name from parameter
$functionName = isset($argv[1]) ? $argv[1] : 'helloWorld';

// Function to compare arrays or objects deeply
function isEqual($a, $b) {
    if (is_array($a) && is_array($b)) {
        if (count($a) !== count($b)) {
            return false;
        }
        
        ksort($a);
        ksort($b);
        
        return json_encode($a) === json_encode($b);
    }
    
    return $a === $b;
}

// Run tests
function runTests() {
    global $testCases, $functionName;
    
    foreach ($testCases as $index => $testCase) {
        try {
            $result = null;
            
            // Determine how to call the function
            if (empty($testCase["input"])) {
                // No parameters
                $result = call_user_func($functionName);
            } else if (count($testCase["input"]) === 1 && is_array($testCase["input"][0])) {
                // Single array parameter
                $result = call_user_func($functionName, $testCase["input"][0]);
            } else {
                // Multiple parameters
                $result = call_user_func_array($functionName, $testCase["input"]);
            }
            
            // Compare result with expected
            $passed = isEqual($result, $testCase["expected"]);
            
            echo json_encode([
                "index" => $index,
                "passed" => $passed,
                "output" => $result,
                "error" => null
            ]) . "\n";
        } catch (Throwable $e) {
            echo json_encode([
                "index" => $index,
                "passed" => false,
                "output" => null,
                "error" => $e->getMessage()
            ]) . "\n";
        }
    }
}

// Execute tests
runTests();
