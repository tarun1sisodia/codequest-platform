import mongoose from "mongoose";
import { config } from "../config";

export const connectDB = async (overrideUri?: string): Promise<void> => {
  try {
    console.log("Attempting to connect to MongoDB...");
    // Use override URI if provided (for scripts), otherwise use config
    const uri = (overrideUri || config.mongoUri).trim();

    // Log the URI with hidden credentials if present
    const logUri = uri.includes("@")
      ? uri.replace(/\/\/([^:]+):([^@]+)@/, "//****:****@")
      : uri;
    console.log("MongoDB URI:", logUri);

    // Connect to MongoDB with authentication
    await mongoose.connect(uri);

    console.log("MongoDB connected successfully");

    // Set up event listeners
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
