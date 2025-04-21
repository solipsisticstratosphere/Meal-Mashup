-- Drop old ingredients table and related data first
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredients;

-- Create updated ingredients table
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('Protein', 'Vegetables', 'Fruit', 'Grain', 'Dairy', 'Spice', 'Herb', 'Oil', 'Condiment', 'Other')),
  unit_of_measure VARCHAR(30),
  image_url VARCHAR(255),
  common_pairings TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate recipe_ingredients table that depends on ingredients
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

-- Recreate indexes
DROP INDEX IF EXISTS idx_ingredients_name;
DROP INDEX IF EXISTS idx_recipe_ingredients_recipe_id;
DROP INDEX IF EXISTS idx_recipe_ingredients_ingredient_id;

CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- Check if function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_modified_column'
    ) THEN
        -- Create function to update updated_at timestamp
        CREATE FUNCTION update_modified_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_ingredients_modtime ON ingredients;
DROP TRIGGER IF EXISTS update_recipe_ingredients_modtime ON recipe_ingredients;

-- Create triggers for the new tables
CREATE TRIGGER update_ingredients_modtime
BEFORE UPDATE ON ingredients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_recipe_ingredients_modtime
BEFORE UPDATE ON recipe_ingredients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Insert expanded list of ingredients with properly formatted categories and image URLs
INSERT INTO ingredients (name, category, unit_of_measure, image_url) VALUES
-- Proteins
('Chicken breast', 'Protein', 'grams', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Ground beef', 'Protein', 'grams', 'https://images.unsplash.com/photo-1588347785102-2c3864901aee?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Salmon fillet', 'Protein', 'grams', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Tofu', 'Protein', 'grams', 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Eggs', 'Protein', 'pieces', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Shrimp', 'Protein', 'grams', 'https://images.unsplash.com/photo-1579164362336-064e8aa5eb0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Pork chops', 'Protein', 'grams', 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Turkey breast', 'Protein', 'grams', 'https://images.unsplash.com/photo-1574672281194-db2c7650d704?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Vegetables
('Garlic', 'Vegetables', 'cloves', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Onion', 'Vegetables', 'pieces', 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Tomato', 'Vegetables', 'pieces', 'https://images.unsplash.com/photo-1561136594-7f68413baa99?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Bell pepper', 'Vegetables', 'pieces', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Cucumber', 'Vegetables', 'pieces', 'https://images.unsplash.com/photo-1558196220-e8b4cadf5bbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Spinach', 'Vegetables', 'grams', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Carrot', 'Vegetables', 'pieces', 'https://images.unsplash.com/photo-1582515073490-39981397c445?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Broccoli', 'Vegetables', 'grams', 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Zucchini', 'Vegetables', 'pieces', 'https://images.unsplash.com/photo-1583687355032-89b902b7335f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Mushrooms', 'Vegetables', 'grams', 'https://images.unsplash.com/photo-1611491401563-252acfa8b9ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Fruits
('Apple', 'Fruit', 'pieces', 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Banana', 'Fruit', 'pieces', 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Lemon', 'Fruit', 'pieces', 'https://images.unsplash.com/photo-1582476459800-3654d10c10ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Lime', 'Fruit', 'pieces', 'https://images.unsplash.com/photo-1620145000179-84c7fa96a1c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Avocado', 'Fruit', 'pieces', 'https://images.unsplash.com/photo-1601039641847-7857b994d704?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Strawberry', 'Fruit', 'grams', 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Blueberry', 'Fruit', 'grams', 'https://images.unsplash.com/photo-1589723448736-967887c5e8bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Grains
('Rice', 'Grain', 'grams', 'https://images.unsplash.com/photo-1626078299034-58af957b9f7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Pasta', 'Grain', 'grams', 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Quinoa', 'Grain', 'grams', 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Bread', 'Grain', 'slices', 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Oats', 'Grain', 'grams', 'https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Dairy
('Milk', 'Dairy', 'ml', 'https://images.unsplash.com/photo-1576186726115-4d51596775d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Cheese', 'Dairy', 'grams', 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Butter', 'Dairy', 'grams', 'https://images.unsplash.com/photo-1589985270958-bf087b516458?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Yogurt', 'Dairy', 'grams', 'https://images.unsplash.com/photo-1553787499-6f9133242821?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Heavy cream', 'Dairy', 'ml', 'https://images.unsplash.com/photo-1623862087523-2a8e34c64cce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Spices
('Salt', 'Spice', 'grams', 'https://images.unsplash.com/photo-1621965458361-959e2032006e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Black pepper', 'Spice', 'grams', 'https://images.unsplash.com/photo-1585999058927-946cbf1f7a45?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Cumin', 'Spice', 'grams', 'https://images.unsplash.com/photo-1590736458114-5b6c7d33f758?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Paprika', 'Spice', 'grams', 'https://images.unsplash.com/photo-1598513837-0eb401948546?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Cinnamon', 'Spice', 'grams', 'https://images.unsplash.com/photo-1544576171-4eaacf429c3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Nutmeg', 'Spice', 'grams', 'https://images.unsplash.com/photo-1621887348744-6b0444f4c777?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Turmeric', 'Spice', 'grams', 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Herbs
('Basil', 'Herb', 'grams', 'https://images.unsplash.com/photo-1592165479705-205466700312?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Cilantro', 'Herb', 'grams', 'https://images.unsplash.com/photo-1606423559509-f29e7862b44f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Parsley', 'Herb', 'grams', 'https://images.unsplash.com/photo-1603904068602-8f93f27a33f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Rosemary', 'Herb', 'grams', 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Thyme', 'Herb', 'grams', 'https://images.unsplash.com/photo-1597070897412-ef0e4146e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Mint', 'Herb', 'grams', 'https://images.unsplash.com/photo-1582556885444-8e0671d36d5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Oils
('Olive oil', 'Oil', 'ml', 'https://images.unsplash.com/photo-1619021016996-0195a788b5db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Coconut oil', 'Oil', 'ml', 'https://images.unsplash.com/photo-1609642818554-76dda5cd04de?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Sesame oil', 'Oil', 'ml', 'https://images.unsplash.com/photo-1612100688020-45d75ba0be2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Vegetable oil', 'Oil', 'ml', 'https://images.unsplash.com/photo-1624521793559-136bfe16fc86?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Condiments
('Soy sauce', 'Condiment', 'ml', 'https://images.unsplash.com/photo-1589411454940-67a017535ecf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Honey', 'Condiment', 'ml', 'https://images.unsplash.com/photo-1558642891-54be180ea339?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Maple syrup', 'Condiment', 'ml', 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Mustard', 'Condiment', 'grams', 'https://images.unsplash.com/photo-1528750717929-32d7e4d2ac3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Ketchup', 'Condiment', 'grams', 'https://images.unsplash.com/photo-1613768131904-830f1b3aa7bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Mayonnaise', 'Condiment', 'grams', 'https://images.unsplash.com/photo-1550969014-9f9ca6788edb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Vinegar', 'Condiment', 'ml', 'https://images.unsplash.com/photo-1624806992066-3e528a59032d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),

-- Other
('Flour', 'Other', 'grams', 'https://images.unsplash.com/photo-1583253618799-7451f429033a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Sugar', 'Other', 'grams', 'https://images.unsplash.com/photo-1592834555168-37e33e4f1ada?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Brown sugar', 'Other', 'grams', 'https://images.unsplash.com/photo-1590117637581-fd4ad4f76355?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Chocolate chips', 'Other', 'grams', 'https://images.unsplash.com/photo-1629220608817-0a191a152782?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'),
('Nuts', 'Other', 'grams', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'); 