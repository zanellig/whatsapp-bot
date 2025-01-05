import * as fs from "fs";
import * as path from "path";

export default function loadEnvFile(
  envPath = path.resolve(process.cwd(), ".env")
): void {
  try {
    const envContent = fs.readFileSync(envPath, "utf-8");

    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, value] = trimmedLine.split("=");
        if (key && value !== undefined) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
    console.log("Environment variables loaded successfully.");
  } catch (err) {
    console.error("Error loading .env file:", err);
  }
}
