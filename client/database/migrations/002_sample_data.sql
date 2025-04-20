-- Migration: 002_sample_data
-- Description: Insert sample data for ingredients and recipes

BEGIN;

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

COMMIT; 