-- Check for order items with null or invalid seller IDs
-- This query will help identify the root cause of undefined sellerIds

-- Check for null seller IDs in order_items
SELECT 
    id,
    product_id,
    seller_id,
    quantity,
    price,
    subtotal,
    created_at
FROM order_items 
WHERE seller_id IS NULL 
   OR seller_id = 0
ORDER BY created_at DESC 
LIMIT 10;

-- Check the overall distribution of seller IDs
SELECT 
    seller_id,
    COUNT(*) as count,
    AVG(subtotal) as avg_subtotal
FROM order_items 
GROUP BY seller_id 
ORDER BY count DESC;

-- Check if products table has missing seller information
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.seller_id as product_seller_id,
    oi.seller_id as orderitem_seller_id,
    oi.id as orderitem_id
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.seller_id IS NULL 
   OR oi.seller_id IS NULL
   OR p.seller_id != oi.seller_id
LIMIT 10;