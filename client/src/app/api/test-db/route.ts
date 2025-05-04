import { NextResponse } from "next/server";
import { query } from "@/lib/db.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await query("SELECT NOW() as time");

    return NextResponse.json({
      status: "ok",
      message: "Database query executed successfully",
      result,
      database: process.env.POSTGRES_DB,
      host: process.env.POSTGRES_HOST,
    });
  } catch (error) {
    console.error("Database test query error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to execute database query",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
