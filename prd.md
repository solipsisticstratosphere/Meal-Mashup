Product Requirements Document: Random Recipe Generator
Overview
The Random Recipe Generator is a web application that allows users to input food ingredients of their choice, then generates unexpected recipe combinations with cooking instructions. The application features a modern, interactive UI with drag-and-drop functionality and engaging animations. Registration is optional and only required for saving recipes.
Tech Stack

Frontend: React/TypeScript, Next.js, Tailwind CSS, dnd-kit, React Spring
Backend: GraphQL API, Prisma ORM
Database: PostgreSQL

Core Features

1. Ingredient Selection Interface

Intuitive drag-and-drop interface built with dnd-kit
Visual ingredient cards with images
Search functionality to easily find ingredients
"My Ingredients" area where selected items are displayed

2. Recipe Generation

"Generate Recipe" button that triggers the random recipe creation
Engaging "roulette wheel" animation using CSS/React Spring during processing
GraphQL mutation to process the ingredient combination
Display of generated recipe with:

Title
Ingredients list with quantities
Cooking method
Estimated preparation time
Difficulty level

3. Recipe Interaction

Voting system for recipe combinations (like/dislike)
Leaderboard showing top-rated random combinations
Export functionality to PDF format using react-pdf
Share buttons for social media

User Authentication Approach
Anonymous Usage

Users can access and use the core application features without registration
Generate recipes, view random combinations, and export to PDF without an account
Temporary session storage will maintain current ingredient selections and generated recipes

Optional Registration

Registration is only required for:

Saving favorite recipes for future reference
Maintaining voting history
Tracking personal recipe creation history

Authentication Implementation

Lightweight authentication with options for:

Email/password
Social login (Google, Facebook) for convenience

Progressive enhancement approach where anonymous users can easily convert to registered users
Anonymous user data (current recipe, selected ingredients) can be transferred to new account upon registration

User Flows
Anonymous Primary Flow

User lands on homepage without signing in
User searches/browses for ingredients
User drags ingredients to "My Ingredients" section
User clicks "Generate Recipe" button
Animation plays while recipe is being created
Recipe is displayed with all details
User can vote, export, or share the recipe

Registration Flow

User clicks "Save Recipe" or "Create Account"
Lightweight registration modal appears with minimal required fields
User completes registration (or connects social account)
Current recipe is automatically saved to their new account
User continues with enhanced features (saving, voting history)

Authenticated User Flow

User logs in to existing account
User can view previously saved recipes
User generates new recipes as in the anonymous flow
User can save recipes to their account
User's voting history is preserved

Community Recipes Flow

User navigates to "Popular Recipes" section
User browses top-rated random combinations
User selects a recipe to view details
User can recreate the same recipe or export it

Data Models
Ingredient
typescriptinterface Ingredient {
id: string;
name: string;
imageUrl: string;
category: IngredientCategory;
commonPairings?: string[]; // IDs of ingredients that pair well
}
Recipe
typescriptinterface Recipe {
id: string;
title: string;
ingredients: {
ingredientId: string;
quantity: string;
}[];
cookingMethod: string;
preparationTime: number; // minutes
difficulty: 'Easy' | 'Medium' | 'Hard';
createdAt: Date;
votes: number;
userId?: string; // if saved by a user
}
User (Optional)
typescriptinterface User {
id: string;
email: string;
savedRecipes: string[]; // Recipe IDs
votedRecipes: {
recipeId: string;
vote: 'up' | 'down';
}[];
createdAt: Date;
}
Session (For anonymous users)
typescriptinterface Session {
id: string;
selectedIngredients: string[]; // Ingredient IDs
currentRecipe?: string; // Recipe ID
temporaryVotes: {
recipeId: string;
vote: 'up' | 'down';
}[];
createdAt: Date;
expiresAt: Date; // Session TTL
}
API Endpoints
GraphQL Schema
graphqltype Ingredient {
id: ID!
name: String!
imageUrl: String!
category: String!
}

type RecipeIngredient {
ingredient: Ingredient!
quantity: String!
}

type Recipe {
id: ID!
title: String!
ingredients: [RecipeIngredient!]!
cookingMethod: String!
preparationTime: Int!
difficulty: String!
votes: Int!
createdAt: String!
}

type User {
id: ID!
email: String!
savedRecipes: [Recipe!]!
}

type Query {
ingredients(search: String, category: String): [Ingredient!]!
popularRecipes(limit: Int = 10): [Recipe!]!
recipe(id: ID!): Recipe
myRecipes: [Recipe!] # Returns saved recipes for authenticated users
}

type Mutation {
generateRecipe(ingredients: [String!]!): Recipe!
voteRecipe(recipeId: ID!, vote: VoteType!): Recipe! # Works for both auth/anon users
saveRecipe(recipeId: ID!): SaveRecipeResult! # Prompts for auth if anonymous
register(email: String!, password: String!): AuthResponse!
login(email: String!, password: String!): AuthResponse!
}

type SaveRecipeResult {
success: Boolean!
requiresAuth: Boolean!
recipe: Recipe
}

type AuthResponse {
token: String!
user: User!
}

enum VoteType {
UP
DOWN
}
Technical Implementation Details
Frontend Components

Layout components (Header, Footer, Container)
IngredientCard component
DragDropArea component
IngredientSearch component
RouletteWheel animation component
RecipeCard component
ExportButton component
AuthModal component
UserMenu component

Backend Services

IngredientService (manages ingredient data)
RecipeGenerationService (logic for creating random recipes)
VotingService (manages user votes)
PDFGenerationService (creates exportable recipe PDFs)
AuthService (handles user authentication)
SessionService (manages anonymous sessions)

Recipe Generation Logic

Randomly select cooking method from predefined list
Determine appropriate quantities for each ingredient
Generate creative recipe title
Estimate preparation time based on cooking method
Assign difficulty level based on complexity

Session Management

JWT for authenticated users
Browser localStorage/sessionStorage for anonymous users
Seamless transition from anonymous to authenticated state

Progressive Enhancement

All core application functionality available without authentication
User data persists temporarily in browser storage
Non-intrusive prompts to create account when attempting to use features requiring authentication

UI/UX Considerations

Clear indication of which features require authentication
Subtle authentication prompts that don't interrupt the user experience
Easy one-click transition from anonymous to authenticated state
Emphasis on the app's utility rather than account creation
Mobile-responsive design for all components
Accessible interface with proper ARIA attributes

Database Schema (Prisma)
prismamodel Ingredient {
id String @id @default(uuid())
name String
imageUrl String
category String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

RecipeIngredient RecipeIngredient[]
}

model Recipe {
id String @id @default(uuid())
title String
cookingMethod String
preparationTime Int
difficulty String
votes Int @default(0)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

ingredients RecipeIngredient[]
savedByUsers UserSavedRecipe[]
userVotes UserVote[]
}

model RecipeIngredient {
id String @id @default(uuid())
quantity String
recipeId String
ingredientId String

recipe Recipe @relation(fields: [recipeId], references: [id])
ingredient Ingredient @relation(fields: [ingredientId], references: [id])
}

model User {
id String @id @default(uuid())
email String @unique
password String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

savedRecipes UserSavedRecipe[]
votes UserVote[]
}

model UserSavedRecipe {
id String @id @default(uuid())
userId String
recipeId String
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id])
recipe Recipe @relation(fields: [recipeId], references: [id])

@@unique([userId, recipeId])
}

model UserVote {
id String @id @default(uuid())
userId String
recipeId String
vote String // "UP" or "DOWN"
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id])
recipe Recipe @relation(fields: [recipeId], references: [id])

@@unique([userId, recipeId])
}

model Session {
id String @id @default(uuid())
selectedIngredients Json // Array of ingredient IDs
currentRecipeId String?  
 temporaryVotes Json // Array of {recipeId, vote}
createdAt DateTime @default(now())
expiresAt DateTime
}
Roadmap and Future Features

MVP Release

Basic ingredient selection
Recipe generation
Simple voting
Anonymous usage with optional registration

Phase 2

Enhanced user accounts with profiles
Recipe collection management
Advanced export options
Ingredient substitution suggestions

Phase 3

AI-enhanced recipe generation
Cuisine style filters
Dietary restrictions and preferences
User comments on recipes

Phase 4

Mobile app version
User-contributed ingredients
Recipe modification capabilities
Kitchen inventory management
