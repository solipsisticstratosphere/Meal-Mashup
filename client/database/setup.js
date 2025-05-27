#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const { Client } = require("pg");
const fs = require("fs");

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
};

console.log("Database setup using:");
console.log(`- Host: ${dbConfig.host}`);
console.log(`- Port: ${dbConfig.port}`);
console.log(`- Database: ${dbConfig.database}`);
console.log(`- User: ${dbConfig.user}`);

async function setupDatabase() {
  console.log("Starting database setup...");

  const pgClient = new Client({
    ...dbConfig,
    database: "postgres",
  });

  try {
    await pgClient.connect();
    console.log("Connected to PostgreSQL server");

    const dbResult = await pgClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database]
    );

    if (dbResult.rowCount === 0) {
      console.log(`Creating database ${dbConfig.database}...`);
      await pgClient.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`Database ${dbConfig.database} created`);
    } else {
      console.log(`Database ${dbConfig.database} already exists`);
    }
  } catch (error) {
    console.error(
      "Error connecting to PostgreSQL or creating database:",
      error
    );
    process.exit(1);
  } finally {
    await pgClient.end();
  }

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log(`Connected to ${dbConfig.database} database`);

    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log("Running migrations...");

    for (const migrationFile of migrationFiles) {
      const filePath = path.join(migrationsDir, migrationFile);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`Applying migration: ${migrationFile}`);
      await client.query(sql);
      console.log(`Migration ${migrationFile} applied successfully`);
    }

    console.log("All migrations applied successfully");
    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
