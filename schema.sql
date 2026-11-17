-- ====================================================================
-- SHREE YASH HOTEL - RESTAURANT POS, INVENTORY & ANALYTICS DATABASE SCHEMA
-- PostgreSQL / Supabase Compatible Schema
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES

-- MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL DEFAULT 'Chinese',
    category TEXT NOT NULL,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    half_price NUMERIC(10, 2) NULL, -- NULL indicates Custom / Market / Variable price
    full_price NUMERIC(10, 2) NULL, -- NULL indicates Custom / Market / Variable price
    is_out_of_stock BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INVENTORY (KITCHEN STOCK & INGREDIENTS) TABLE
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    current_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg', -- 'kg', 'liters', 'packets', 'pcs'
    min_threshold NUMERIC(10, 2) NOT NULL DEFAULT 5,
    category TEXT DEFAULT 'Raw Materials',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    order_type TEXT NOT NULL DEFAULT 'dine_in', -- 'dine_in' or 'takeaway'
    table_number INTEGER NULL, -- Table 1-15 for dine_in, NULL for takeaway
    customer_name TEXT NULL,
    customer_phone TEXT NULL,
    kitchen_notes TEXT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'cash', -- 'upi', 'cash', 'unpaid'
    payment_status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'unpaid'
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    item_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    portion TEXT NOT NULL, -- 'Half', 'Full', 'Custom'
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 3. INDEXES FOR HIGH-SPEED QUERYING
CREATE INDEX IF NOT EXISTS idx_menu_items_cuisine_category ON menu_items(cuisine, category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for menu_items" ON menu_items;
CREATE POLICY "Enable all access for menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for inventory_items" ON inventory_items;
CREATE POLICY "Enable all access for inventory_items" ON inventory_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for orders" ON orders;
CREATE POLICY "Enable all access for orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for order_items" ON order_items;
CREATE POLICY "Enable all access for order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);


-- ====================================================================
-- SEED DATA: 39 PRE-LOADED MENU ITEMS FOR SHREE YASH HOTEL (CHINESE)
-- ====================================================================

INSERT INTO menu_items (name, cuisine, category, is_veg, half_price, full_price) VALUES
-- SOUPS (8 items)
('Veg Manchow Soup', 'Chinese', 'Soups', true, 60.00, 100.00),
('Veg Manchurian Soup', 'Chinese', 'Soups', true, 60.00, 100.00),
('Veg Clear Soup', 'Chinese', 'Soups', true, 60.00, 100.00),
('Veg Hot & Sour Soup', 'Chinese', 'Soups', true, 60.00, 100.00),
('Chic. Manchow Soup', 'Chinese', 'Soups', false, 60.00, 100.00),
('Chic. Manchurian Soup', 'Chinese', 'Soups', false, 60.00, 100.00),
('Chic. Clear Soup', 'Chinese', 'Soups', false, 60.00, 100.00),
('Chic. Hot & Sour Soup', 'Chinese', 'Soups', false, 60.00, 100.00),

-- STARTERS (10 items)
('Veg Chinese Bhel', 'Chinese', 'Starters', true, 110.00, 160.00),
('Chicken Chinese Bhel', 'Chinese', 'Starters', false, 120.00, 180.00),
('Chicken Lollipop', 'Chinese', 'Starters', false, 100.00, 180.00),
('Chicken Lollipop Gravy', 'Chinese', 'Starters', false, 120.00, 200.00),
('Egg Chilly', 'Chinese', 'Starters', false, 120.00, 180.00),
('Chicken Chilly', 'Chinese', 'Starters', false, 120.00, 180.00),
('Chicken Crispy', 'Chinese', 'Starters', false, 120.00, 180.00),
('Chicken 65', 'Chinese', 'Starters', false, 120.00, 180.00),
('Chicken 85', 'Chinese', 'Starters', false, 120.00, 180.00),
('Chicken Manchurian', 'Chinese', 'Starters', false, 120.00, 180.00),

-- NOODLES (10 items)
('Veg Hakka Noodles', 'Chinese', 'Noodles', true, 80.00, 120.00),
('Veg Schezwan Noodles', 'Chinese', 'Noodles', true, 90.00, 120.00),
('Egg Hakka Noodles', 'Chinese', 'Noodles', false, 80.00, 120.00),
('Egg Schezwan Noodles', 'Chinese', 'Noodles', false, 90.00, 130.00),
('Egg Tripple Noodle', 'Chinese', 'Noodles', false, 120.00, 180.00),
('Egg Choper Noodles', 'Chinese', 'Noodles', false, 140.00, 200.00),
('Chicken Hakka Noodles', 'Chinese', 'Noodles', false, 80.00, 120.00),
('Chicken Schezwan Noodles', 'Chinese', 'Noodles', false, 90.00, 130.00),
('Chicken Tripple Noodle', 'Chinese', 'Noodles', false, 120.00, 180.00),
('Chicken Chilly Noodles', 'Chinese', 'Noodles', false, 140.00, 200.00),
('Chicken Choper Noodles', 'Chinese', 'Noodles', false, 140.00, 200.00),
('Shree Yash Special Noodles', 'Chinese', 'Noodles', false, NULL, NULL), -- Variable / Custom Price

-- RICE (11 items)
('Veg Fried Rice', 'Chinese', 'Rice', true, 80.00, 120.00),
('Veg Schezwan Fried Rice', 'Chinese', 'Rice', true, 90.00, 130.00),
('Veg Tripple Rice', 'Chinese', 'Rice', true, 120.00, 180.00),
('Egg Fried Rice', 'Chinese', 'Rice', false, 80.00, 120.00),
('Egg Schezwan Rice', 'Chinese', 'Rice', false, 90.00, 120.00),
('Egg Combination Rice', 'Chinese', 'Rice', false, 100.00, 140.00),
('Egg Manchurian Rice', 'Chinese', 'Rice', false, 120.00, 180.00),
('Egg Tripple Rice', 'Chinese', 'Rice', false, 120.00, 180.00),
('Egg Choper Rice', 'Chinese', 'Rice', false, 140.00, 200.00),
('Chicken Fried Rice', 'Chinese', 'Rice', false, 80.00, 120.00),
('Chicken Schezwan Rice', 'Chinese', 'Rice', false, 90.00, 130.00),
('Chicken Burnt Garlic Rice', 'Chinese', 'Rice', false, 100.00, 140.00),
('Chicken Manchurian Rice', 'Chinese', 'Rice', false, 120.00, 180.00),
('Chicken Tripple Rice', 'Chinese', 'Rice', false, 120.00, 180.00),
('Chicken Chilly Rice', 'Chinese', 'Rice', false, 140.00, 200.00),
('Chicken Cirispy Rice', 'Chinese', 'Rice', false, 140.00, 200.00),
('Chicken Choper Rice', 'Chinese', 'Rice', false, 140.00, 200.00),
('Chicken 1000 Rice', 'Chinese', 'Rice', false, 150.00, 250.00),
('Chicken Boxer Rice', 'Chinese', 'Rice', false, 150.00, 220.00),
('Chicken Pieking Rice', 'Chinese', 'Rice', false, 200.00, 280.00),
('Lollypop Masala Rice', 'Chinese', 'Rice', false, 220.00, 320.00),
('Shree Yash Special Rice', 'Chinese', 'Rice', false, NULL, NULL) -- Variable / Custom Price
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- SEED DATA: KITCHEN INVENTORY & RAW INGREDIENTS
-- ====================================================================

INSERT INTO inventory_items (name, current_quantity, unit, min_threshold, category) VALUES
('Hakka Noodles (Dry)', 18.00, 'kg', 10.00, 'Grains & Pasta'),
('Basmati Rice', 25.00, 'kg', 15.00, 'Grains & Pasta'),
('Fresh Chicken (Dressed)', 14.50, 'kg', 8.00, 'Meat & Poultry'),
('Farm Eggs', 75.00, 'pcs', 30.00, 'Dairy & Eggs'),
('Schezwan Sauce', 3.00, 'kg', 6.00, 'Sauces & Condiments'), -- Low Stock alert!
('Dark Soy Sauce', 7.50, 'liters', 4.00, 'Sauces & Condiments'),
('Refined Cooking Oil', 4.00, 'liters', 12.00, 'Oils & Fats'), -- Low Stock alert!
('Fresh Cabbage', 12.00, 'kg', 8.00, 'Vegetables'),
('Capsicum (Green Bell Pepper)', 6.50, 'kg', 5.00, 'Vegetables'),
('Peeled Garlic', 2.00, 'kg', 4.00, 'Vegetables'), -- Low Stock alert!
('Ginger Paste', 3.50, 'kg', 3.00, 'Spices & Pastes'),
('Spring Onions', 4.00, 'kg', 3.00, 'Vegetables'),
('White Pepper Powder', 1.80, 'kg', 1.00, 'Spices & Pastes'),
('Manchurian Balls (Pre-rolled)', 120.00, 'pcs', 50.00, 'Prepared Items'),
('Takeaway Packaging Containers (750ml)', 24.00, 'pcs', 60.00, 'Packaging'), -- Low Stock alert!
('Soup Bowls & Lids', 18.00, 'pcs', 40.00, 'Packaging') -- Low Stock alert!
ON CONFLICT (name) DO UPDATE SET
    current_quantity = EXCLUDED.current_quantity,
    min_threshold = EXCLUDED.min_threshold;
