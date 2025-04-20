# Meal Mashup Database

This directory contains the database schema, migrations, and setup scripts for the Meal Mashup application.

## Database Structure

The database uses PostgreSQL and consists of the following tables:

1. **ingredients** - Stores information about food ingredients
2. **recipes** - Stores recipes with their details
3. **recipe_ingredients** - Junction table that connects recipes with their ingredients

## Setting Up the Database

### Prerequisites

- PostgreSQL (local or remote instance)
- Node.js

### Configuration

Database connection is configured through environment variables:

- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)
- `POSTGRES_HOST` - Database host (default: localhost)
- `POSTGRES_PORT` - Database port (default: 5432)
- `POSTGRES_DB` - Database name (default: meal_mashup)

You can set these environment variables in a `.env` file in the project root.

### Running Setup

To set up the database and run all migrations:

```bash
npm run db:setup
```

This script will:

1. Create the database if it doesn't exist
2. Run all migrations in the `migrations` directory in order

## Migrations

Migrations are stored in the `migrations` directory as SQL files with sequential naming (e.g., `001_initial_schema.sql`, `002_sample_data.sql`).

To add a new migration:

1. Create a new SQL file in the `migrations` directory with a sequential number
2. Add the SQL statements for the schema changes
3. Run `npm run db:migrate` to apply the new migration

## Database Schema

### `ingredients` Table

```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  unit_of_measure VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `recipes` Table

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  instructions TEXT,
  tags TEXT[],
  rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `recipe_ingredients` Table

```sql
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2),
  unit VARCHAR(30),
  notes VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(recipe_id, ingredient_id)
);
```
