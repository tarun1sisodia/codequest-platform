import mongoose, { Document, Schema } from "mongoose";

export interface Certificate extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  earnedAt: Date;
  challenges: mongoose.Types.ObjectId[];
}

const CertificateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  language: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  challenges: [{ type: Schema.Types.ObjectId, ref: "Challenge" }],
});

// Add compound index to prevent duplicate certificates for same user/language
CertificateSchema.index({ userId: 1, language: 1 }, { unique: true });

export const CertificateModel = mongoose.model<Certificate>(
  "Certificate",
  CertificateSchema
);
