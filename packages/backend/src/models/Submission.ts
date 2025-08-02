import mongoose, { Document, Schema } from "mongoose";

export interface Submission extends Document {
  userId: mongoose.Types.ObjectId;
  challengeSlug: string; // Changed from challengeId to challengeSlug
  code: string;
  language: "javascript" | "typescript" | "php" | "go"; // Added PHP and Go as language options
  status: "passed" | "failed";
  results: {
    passed: boolean;
    error?: string;
    output?: any;
    testCase: {
      input: any[];
      expected: any;
      description?: string;
    };
    executionTime: number;
    memoryUsed: number;
  }[];
  metrics: {
    totalTime: number;
    totalMemory: number;
    passedTests: number;
    totalTests: number;
  };
  createdAt: Date;
}

const SubmissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  challengeSlug: {
    type: String,
    required: true,
  },
  code: { type: String, required: true },
  language: {
    type: String,
    enum: ["javascript", "typescript", "php", "go"], // Added PHP and Go to enum
    required: true,
  },
  status: {
    type: String,
    enum: ["passed", "failed"],
    required: true,
  },
  results: [
    {
      passed: Boolean,
      error: String,
      output: Schema.Types.Mixed,
      testCase: {
        input: [Schema.Types.Mixed],
        expected: Schema.Types.Mixed,
        description: String,
      },
      executionTime: Number,
      memoryUsed: Number,
    },
  ],
  metrics: {
    totalTime: Number,
    totalMemory: Number,
    passedTests: Number,
    totalTests: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

export const SubmissionModel = mongoose.model<Submission>(
  "Submission",
  SubmissionSchema
);
