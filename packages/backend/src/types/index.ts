// backend/src/types/index.ts
import { IChallenge, TestCase } from "../models/Challenge";
import { Types } from "mongoose";

export type { IChallenge, TestCase };

export interface ExecutionResult {
  passed: boolean;
  error?: string;
  output?: any;
  testCase: TestCase;
  executionTime: number;
  memoryUsed: number;
}

export interface SubmissionResult {
  success: boolean;
  results: ExecutionResult[];
  metrics: {
    totalTime: number;
    totalMemory: number;
    passedTests: number;
    totalTests: number;
  };
  certificateAwarded?: boolean;
  certificate?: any;
}

export interface Submission {
  challengeId: Types.ObjectId;
  timestamp: Date;
  status: "passed" | "failed";
  language: string;
  code: string;
  results: any[];
}

export interface DashboardStats {
  totalChallenges: number;
  completedChallenges: number;
  totalSubmissions: number;
  successRate: number;
  submissionsByLanguage: { [key: string]: number };
  recentSubmissions: Submission[];
}
