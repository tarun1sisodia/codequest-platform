import mongoose from "mongoose";
import { connectDB } from "../db";

const updateChallengeSchema = async () => {
  try {
    await connectDB();

    // Access the Challenge collection directly
    const db = mongoose.connection.db;
    const challengeCollection = db.collection("challenges");

    // Update schema to add conceptTags field to all challenges
    const result = await challengeCollection.updateMany(
      { conceptTags: { $exists: false } },
      { $set: { conceptTags: [] } },
    );

    console.log(
      `Updated ${result.modifiedCount} challenges with empty conceptTags array`,
    );
    process.exit(0);
  } catch (error) {
    console.error("Error updating challenge schema:", error);
    process.exit(1);
  }
};

updateChallengeSchema();
