export interface TestCase {
  input: any[];
  expected: any;
  description?: string;
}

export interface SubmissionResult {
  success: boolean;
  results: {
    success: boolean;
    results: ExecutionResult[];
    metrics: {
      totalTime: number;
      totalMemory: number;
      passedTests: number;
      totalTests: number;
    };
  };
  metrics: {
    totalTime: number;
    totalMemory: number;
    passedTests: number;
    totalTests: number;
  };
  certificateAwarded?: boolean;
  certificate?: any;
}

export interface Challenge {
  _id: string;
  slug: string; // Added slug property
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  language: "javascript" | "typescript" | "php" | "go"; // Added PHP and Go as language options
  template: string;
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
  conceptTags: string[];
  functionName: string;
  conceptResources?: {
    title: string;
    url: string;
    type: string;
  }[];
}

export interface ExecutionResult {
  passed: boolean;
  error?: string;
  output?: any;
  testCase: TestCase;
  executionTime: number;
  memoryUsed: number;
}

export interface ConceptProgress {
  completed: number;
  totalChallenges: number;
  lastCompleted?: string;
  earnedBadge: boolean;
  completedChallenges: string[];
}

export interface Badge {
  conceptTag: string;
  name: string;
  description: string;
  earnedAt: string; // ISO date string
  icon: string;
}

// Add other types you might need for the user profile
export interface UserProgress {
  conceptsProgress: Record<
    string,
    {
      completed: number;
      lastCompleted?: string;
    }
  >;
  languageProgress: {
    javascript?: {
      completed: number;
      lastCompleted?: string;
    };
    typescript?: {
      completed: number;
      lastCompleted?: string;
    };
    php?: {
      completed: number;
      lastCompleted?: string;
    };
    go?: {
      completed: number;
      lastCompleted?: string;
    };
  };
  streak?: {
    current: number;
    longest: number;
    lastActive?: string;
  };
  totalPoints: number;
}

export interface Certificate {
  _id: string;
  userId: string;
  language: string;
  earnedAt: string; // ISO date string
  challenges: string[] | Challenge[]; // Can be either IDs or populated Challenge objects
}
