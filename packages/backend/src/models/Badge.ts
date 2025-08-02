import mongoose, { Document, Schema } from "mongoose";

export interface IBadge {
  conceptTag: string;
  name: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

export interface Badge extends IBadge, Document {}

const BadgeSchema = new Schema({
  conceptTag: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  icon: { type: String, required: true },
});

export const BadgeModel = mongoose.model<Badge>("Badge", BadgeSchema);
