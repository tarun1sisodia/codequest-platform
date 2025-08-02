import mongoose, { Document, Schema, Types } from "mongoose";

export interface Badge {
  conceptTag: string;
  name: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

export interface UserProgress {
  conceptsProgress?: {
    [key: string]: {
      completed: number;
      totalAvailable: number;
      lastCompleted?: Date;
    };
  };
  languageProgress?: {
    [key: string]: {
      completed: number;
      totalAvailable: number;
      lastCompleted?: Date;
    };
  };
  totalPoints?: number;
  streak?: {
    current: number;
    longest: number;
    lastActive: Date;
  };
}

// Base User interface
export interface IUser {
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  completedChallenges: string[]; // Changed to string array for challenge slugs
  submissions: Array<{
    challengeSlug: string; // Changed from challengeId to challengeSlug
    timestamp: Date;
    status: "passed" | "failed";
    language: string;
    code: string;
    results: any[];
  }>;
  badges?: Types.ObjectId[];
  progress?: UserProgress;
  createdAt: Date;
  lastLogin: Date;
}

export interface User extends IUser, Document {}

const UserSchema = new Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String },
  avatarUrl: { type: String },
  completedChallenges: [{ type: String }], // Changed to string array for challenge slugs
  submissions: [
    {
      challengeSlug: { type: String, required: true }, // Changed from challengeId to challengeSlug
      timestamp: { type: Date, default: Date.now },
      status: { type: String, enum: ["passed", "failed"] },
      language: { type: String },
      code: { type: String },
      results: [Schema.Types.Mixed],
    },
  ],
  badges: [{ type: Schema.Types.ObjectId, ref: "Badge" }],
  progress: {
    conceptsProgress: {
      type: Map,
      of: new Schema({
        completed: { type: Number, default: 0 },
        totalAvailable: { type: Number, default: 0 },
        lastCompleted: Date,
      }),
      default: () => new Map(),
    },
    languageProgress: {
      type: Map,
      of: new Schema({
        completed: { type: Number, default: 0 },
        totalAvailable: { type: Number, default: 0 },
        lastCompleted: Date,
      }),
      default: () => new Map(),
    },
    totalPoints: { type: Number, default: 0 },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now },
    },
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<User>("User", UserSchema);
