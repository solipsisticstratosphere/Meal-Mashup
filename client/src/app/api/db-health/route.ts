import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/db";

export async function GET() {
  try {
    const isHealthy = await healthCheck();
    return NextResponse.json({
      success: isHealthy,
      message: isHealthy
        ? "Database connection successful"
        : "Database connection failed",
    });
  } catch (error) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      { success: false, message: "Database connection error" },
      { status: 500 }
    );
  }
}
