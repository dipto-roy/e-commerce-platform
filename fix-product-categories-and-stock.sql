-- Fix Product Categories and Stock Values
-- This script assigns categories to products without them and ensures stock values are reasonable

BEGIN;

-- Update products without categories based on product names
UPDATE products
SET category = CASE
    -- Electronics
    WHEN name ILIKE '%phone%' OR name ILIKE '%iphone%' OR name ILIKE '%samsung%' OR name ILIKE '%sony%' 
         OR name ILIKE '%laptop%' OR name ILIKE '%macbook%' OR name ILIKE '%computer%' 
         OR name ILIKE '%headphone%' OR name ILIKE '%speaker%' OR name ILIKE '%watch%' 
         OR name ILIKE '%tablet%' OR name ILIKE '%camera%' THEN 'Electronics'
    
    -- Clothing
    WHEN name ILIKE '%shirt%' OR name ILIKE '%pant%' OR name ILIKE '%dress%' 
         OR name ILIKE '%jacket%' OR name ILIKE '%shoe%' OR name ILIKE '%wear%' THEN 'Clothing'
    
    -- Beauty
    WHEN name ILIKE '%cream%' OR name ILIKE '%lotion%' OR name ILIKE '%makeup%' 
         OR name ILIKE '%cosmetic%' OR name ILIKE '%perfume%' THEN 'Beauty'
    
    -- Books
    WHEN name ILIKE '%book%' OR name ILIKE '%novel%' OR name ILIKE '%guide%' THEN 'Books'
    
    -- Home & Kitchen
    WHEN name ILIKE '%kitchen%' OR name ILIKE '%furniture%' OR name ILIKE '%home%' 
         OR name ILIKE '%bed%' OR name ILIKE '%table%' OR name ILIKE '%chair%' THEN 'Home & Kitchen'
    
    -- Sports
    WHEN name ILIKE '%sport%' OR name ILIKE '%fitness%' OR name ILIKE '%gym%' 
         OR name ILIKE '%ball%' OR name ILIKE '%exercise%' THEN 'Sports'
    
    -- Default to General
    ELSE 'General'
END
WHERE category IS NULL OR category = '';

-- Update stock to reasonable values for products with 0 stock
-- Set random stock between 5 and 50 for active products with 0 stock
UPDATE products
SET "stockQuantity" = (FLOOR(RANDOM() * 46) + 5)::integer
WHERE "stockQuantity" = 0 AND "isActive" = true;

-- Verify the changes
SELECT 
    category,
    COUNT(*) as product_count,
    AVG("stockQuantity")::integer as avg_stock,
    MIN("stockQuantity") as min_stock,
    MAX("stockQuantity") as max_stock
FROM products
GROUP BY category
ORDER BY product_count DESC;

COMMIT;

-- Show summary
SELECT 
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE "isActive" = true) as active_products,
    COUNT(*) FILTER (WHERE "stockQuantity" < 10) as low_stock_products,
    COUNT(DISTINCT category) as total_categories
FROM products;
