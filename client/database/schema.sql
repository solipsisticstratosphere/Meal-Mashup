-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS ingredients;

-- Ingredients table
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  unit_of_measure VARCHAR(30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
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

-- Junction table for recipe-ingredient relationship
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2),
  unit VARCHAR(30),
  notes VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique combinations of recipe-ingredient
  UNIQUE(recipe_id, ingredient_id)
);

-- Create indexes for better performance
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_recipes_title ON recipes(title);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- Add sample data for ingredients
INSERT INTO ingredients (name, category, unit_of_measure) VALUES
('Chicken breast', 'Meat', 'grams'),
('Olive oil', 'Oil', 'ml'),
('Garlic', 'Vegetables', 'cloves'),
('Salt', 'Spices', 'grams'),
('Black pepper', 'Spices', 'grams'),
('Onion', 'Vegetables', 'pieces'),
('Tomato', 'Vegetables', 'pieces'),
('Basil', 'Herbs', 'grams'),
('Pasta', 'Grains', 'grams'),
('Cheese', 'Dairy', 'grams');

-- Add sample data for recipes
INSERT INTO recipes (title, description, image_url, prep_time_minutes, cook_time_minutes, servings, difficulty, instructions, tags, rating, featured) VALUES
('Classic Pasta', 'A simple and delicious pasta dish with garlic and olive oil', '/images/pasta.jpg', 10, 20, 4, 'easy', 'Cook pasta. Sauté garlic in olive oil. Mix together. Add salt and pepper to taste.', ARRAY['pasta', 'italian', 'quick'], 4.7, true),
('Chicken Stir Fry', 'Quick and healthy chicken stir fry with vegetables', '/images/stir-fry.jpg', 15, 15, 2, 'medium', 'Cut chicken into pieces. Dice vegetables. Stir fry chicken then add vegetables. Season and serve.', ARRAY['chicken', 'asian', 'healthy'], 4.5, false),
('Tomato Basil Soup', 'A warm and comforting tomato soup with fresh basil', '/images/tomato-soup.jpg', 5, 25, 6, 'easy', 'Sauté onions and garlic. Add tomatoes and simmer. Blend, then add fresh basil.', ARRAY['soup', 'vegetarian', 'comfort food'], 4.8, true);

-- Connect recipes with ingredients
-- Recipe 1: Classic Pasta
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
SELECT r.id, i.id, 200, 'grams'
FROM recipes r, ingredients i
WHERE r.title = 'Classic Pasta' AND i.name = 'Pasta';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
SELECT r.id, i.id, 3, 'cloves'
FROM recipes r, ingredients i
WHERE r.title = 'Classic Pasta' AND i.name = 'Garlic';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
SELECT r.id, i.id, 30, 'ml'
FROM recipes r, ingredients i
WHERE r.title = 'Classic Pasta' AND i.name = 'Olive oil';

-- Recipe 2: Chicken Stir Fry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
SELECT r.id, i.id, 300, 'grams'
FROM recipes r, ingredients i
WHERE r.title = 'Chicken Stir Fry' AND i.name = 'Chicken breast';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
SELECT r.id, i.id, 1, 'pieces'
FROM recipes r, ingredients i
WHERE r.title = 'Chicken Stir Fry' AND i.name = 'Onion';

-- Recipe 3: Tomato Basil Soup
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
SELECT r.id, i.id, 5, 'pieces'
FROM recipes r, ingredients i
WHERE r.title = 'Tomato Basil Soup' AND i.name = 'Tomato';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) 
SELECT r.id, i.id, 20, 'grams'
FROM recipes r, ingredients i
WHERE r.title = 'Tomato Basil Soup' AND i.name = 'Basil';

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_ingredients_modtime
BEFORE UPDATE ON ingredients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_recipes_modtime
BEFORE UPDATE ON recipes
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_recipe_ingredients_modtime
BEFORE UPDATE ON recipe_ingredients
FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 