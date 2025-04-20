import { healthCheck } from "./db";

export async function initDatabase(): Promise<boolean> {
  if (typeof window !== "undefined") {
    console.log("Database initialization skipped on client side");
    return true;
  }

  try {
    console.log("Checking database connection...");
    const isConnected = await healthCheck();

    if (isConnected) {
      console.log("✅ Successfully connected to database");
      return true;
    } else {
      console.error("❌ Database connection failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Error initializing database connection:", error);
    return false;
  }
}
