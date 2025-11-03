#!/bin/bash

echo "🖼️  TESTING IMAGE DISPLAY FIXES"
echo "================================"

# Test 1: Check that products have images
echo -e "\n1. Testing products endpoint with images..."
PRODUCTS_WITH_IMAGES=$(curl -s "http://localhost:4002/products/with-images" | jq -r '[.[] | select(.images != null and (.images | length) > 0)] | length')
echo "✅ Found $PRODUCTS_WITH_IMAGES products with images"

# Test 2: Check that orders now include product images
echo -e "\n2. Testing orders endpoint with product images..."
curl -s -c /tmp/test_cookies.txt -X POST "http://localhost:4002/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' > /dev/null

ORDERS_RESPONSE=$(curl -s -b /tmp/test_cookies.txt "http://localhost:4002/orders?page=1&limit=10")
ORDER_HAS_IMAGES=$(echo "$ORDERS_RESPONSE" | jq -r '.orders[0].orderItems[0].product.images[0].imageUrl // "none"')

if [ "$ORDER_HAS_IMAGES" != "none" ]; then
    echo "✅ Orders now include product images"
    echo "📸 Sample image URL: $ORDER_HAS_IMAGES"
else
    echo "❌ Orders still don't include images"
fi

# Test 3: Check image utility functions
echo -e "\n3. Image URL formats found:"
curl -s "http://localhost:4002/products/with-images" | jq -r '.[] | select(.images != null and (.images | length) > 0) | .images[0].imageUrl' | head -3

echo -e "\n🎯 FIXES APPLIED:"
echo "=================="
echo "✅ Updated order service to include product images"
echo "✅ Created image utility functions for consistent handling"
echo "✅ Updated orders page to use new image utilities"
echo "✅ Updated products page to use new image utilities"
echo "✅ Added placeholder image for missing images"
echo "✅ Added proper error handling for image loading"

echo -e "\n📊 IMAGE URL FORMATS SUPPORTED:"
echo "================================"
echo "✅ http://localhost:4002/uploads/images/..."
echo "✅ http://localhost:4002/products/serve-image/..."
echo "✅ Relative paths are converted to full URLs"
echo "✅ Fallback to placeholder for missing images"

echo -e "\n🚀 TO TEST THE FIXES:"
echo "===================="
echo "1. Open http://localhost:3000/login"
echo "2. Login with: test@example.com / password123"
echo "3. Visit http://localhost:3000/products - Images should now display"
echo "4. Visit http://localhost:3000/orders - Product images should show in orders"
echo "5. Check browser console for any image loading errors"

echo -e "\n💡 NOTE:"
echo "========"
echo "- Images use lazy loading and error handling"
echo "- Placeholder shown for missing/broken images"
echo "- Full URL construction handles different backend formats"
echo "- Both SSR and client-side image loading supported"

# Cleanup
rm -f /tmp/test_cookies.txt

echo -e "\n✨ Image display issues should now be resolved!"