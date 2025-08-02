import fs from "fs";
import path from "path";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

function updateChallengesSlugs(filePath: string): void {
  try {
    // Read the challenges file
    const rawData = fs.readFileSync(filePath, "utf8");
    const challenges = JSON.parse(rawData);

    // Update slugs based on language
    const updatedChallenges = challenges.map((challenge: any) => ({
      ...challenge,
      slug: `${createSlug(challenge.title)}${challenge.language === 'typescript' ? '-ts' : '-php'}`,
    }));

    // Write back to file with proper formatting
    fs.writeFileSync(
      filePath,
      JSON.stringify(updatedChallenges, null, 2),
      "utf8"
    );

    console.log("Successfully updated challenge slugs");
  } catch (error) {
    console.error("Error updating slugs:", error);
  }
}

// Execute the update for both challenge files
const phpChallengesPath = path.join(__dirname, "../../data/php-challenges.json");
const tsChallengesPath = path.join(__dirname, "../../data/challenges.json");

// Update PHP challenges
updateChallengesSlugs(phpChallengesPath);

// Update TypeScript challenges
updateChallengesSlugs(tsChallengesPath);
