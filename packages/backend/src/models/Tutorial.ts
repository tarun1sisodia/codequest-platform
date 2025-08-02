import mongoose, { Document, Schema } from "mongoose";

interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: "javascript" | "typescript" | "php" | "go";
}

interface Step {
  title: string;
  content: string;
  codeExamples: CodeExample[];
  challengeId?: mongoose.Types.ObjectId; // Optional reference to a challenge
}

interface ITutorial {
  title: string;
  slug: string;
  description: string;
  category: "fundamentals" | "intermediate" | "advanced" | "patterns";
  language: "typescript" | "javascript" | "php" | "go" | "all";
  order: number;
  prerequisites?: string[]; // tutorials that should be completed first
  steps: Step[];
  mainImage?: string; // URL to tutorial main image
  timeToComplete: number; // estimated minutes to complete
  relatedConcepts: mongoose.Types.ObjectId[]; // related concept IDs
  author: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TutorialDocument extends ITutorial, Document {}

const CodeExampleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, required: true },
  language: {
    type: String,
    enum: ["javascript", "typescript", "php", "go"],
    required: true,
  },
});

const StepSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  codeExamples: [CodeExampleSchema],
  challengeId: { type: Schema.Types.ObjectId, ref: "Challenge" },
});

const TutorialSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["fundamentals", "intermediate", "advanced", "patterns"],
      required: true,
    },
    language: {
      type: String,
      enum: ["typescript", "javascript", "php", "go", "all"],
      required: true,
    },
    order: { type: Number, required: true },
    prerequisites: [String],
    steps: [StepSchema],
    mainImage: { type: String },
    timeToComplete: { type: Number, required: true },
    relatedConcepts: [{ type: Schema.Types.ObjectId, ref: "Concept" }],
    author: { type: String, required: true },
  },
  { timestamps: true }
);

// Add indexes for efficient querying
TutorialSchema.index({ category: 1, language: 1 });
TutorialSchema.index({ slug: 1 }, { unique: true });

export const TutorialModel = mongoose.model<TutorialDocument>(
  "Tutorial",
  TutorialSchema
);

export type { ITutorial, Step, CodeExample };