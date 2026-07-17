INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Pepperoni Pizza',
    'Classic pizza with tomato sauce, mozzarella and pepperoni',
    12.99,
    'pizza, italian, popular',
    'dough, tomato sauce, mozzarella, pepperoni',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Pepperoni Pizza'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Margherita Pizza',
    'Fresh pizza with tomato, mozzarella and basil',
    10.50,
    'pizza, vegetarian, italian',
    'dough, tomato sauce, mozzarella, basil',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Margherita Pizza'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Classic Cheeseburger',
    'Grilled beef burger with cheese, lettuce and tomato',
    9.99,
    'burger, beef, lunch',
    'beef, cheese, lettuce, tomato, bun',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Classic Cheeseburger'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Grilled Chicken Burger',
    'Grilled chicken breast with lettuce and house sauce',
    10.25,
    'burger, chicken, high-protein',
    'chicken, lettuce, tomato, sauce, bun',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Grilled Chicken Burger'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Caesar Salad',
    'Crisp romaine lettuce with parmesan and Caesar dressing',
    8.50,
    'salad, healthy, vegetarian',
    'romaine lettuce, parmesan, croutons, Caesar dressing',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Caesar Salad'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Chicken Rice Bowl',
    'Seasoned chicken served with rice and vegetables',
    11.50,
    'chicken, rice, healthy, high-protein',
    'chicken, rice, broccoli, carrots',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Chicken Rice Bowl'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Vegan Avocado Salad',
    'Fresh avocado salad with tomatoes, cucumber and greens',
    8.75,
    'vegan, salad, healthy',
    'avocado, tomato, cucumber, mixed greens',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Vegan Avocado Salad'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'California Roll',
    'Sushi roll with crab, avocado and cucumber',
    9.50,
    'sushi, seafood, lunch',
    'rice, crab, avocado, cucumber, seaweed',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'California Roll'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Chicken Tacos',
    'Three soft tacos with seasoned chicken and salsa',
    9.25,
    'tacos, chicken, mexican',
    'tortilla, chicken, salsa, lettuce, cheese',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Chicken Tacos'
);

INSERT INTO menu_items (
    restaurant_id,
    name,
    description,
    price,
    tags,
    ingredients,
    expires_at
)
SELECT
    6,
    'Blueberry Muffin',
    'Freshly baked muffin filled with blueberries',
    3.50,
    'breakfast, bakery, vegetarian',
    'flour, blueberries, sugar, eggs',
    '2027-12-31 22:00:00'
WHERE NOT EXISTS (
    SELECT 1
    FROM menu_items
    WHERE restaurant_id = 6
      AND name = 'Blueberry Muffin'
);

UPDATE menu_items
SET expires_at = '2027-12-31 22:00:00'
WHERE name = 'Tofu Protein Bowl';
