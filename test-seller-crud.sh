#!/bin/bash
# Test script for seller product CRUD operations

echo "🧪 Testing Seller Product CRUD Operations"
echo "=========================================="

# Get login token first (you'll need to update these credentials)
echo "📝 Note: Update the credentials below with valid seller account"

# Test credentials - UPDATE THESE
SELLER_USERNAME="testuser8"
SELLER_PASSWORD="testuser8"
API_BASE="http://localhost:4002"

echo ""
echo "🔐 Step 1: Login as seller..."

# Login and get token
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${SELLER_USERNAME}\",
    \"password\": \"${SELLER_PASSWORD}\"
  }")

if [ $? -eq 0 ]; then
  echo "✅ Login request sent"
  echo "Response: $LOGIN_RESPONSE"
  
  # Extract token (basic extraction - you might need to adjust based on response format)
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$TOKEN" ]; then
    echo "✅ Token extracted: ${TOKEN:0:20}..."
    
    echo ""
    echo "📦 Step 2: Testing product operations..."
    
    # Get seller's products
    echo "Getting seller's products..."
    curl -s -H "Authorization: Bearer $TOKEN" "${API_BASE}/products/my-products" | head -200
    
    echo ""
    echo ""
    echo "🗑️ Step 3: Testing product deletion..."
    echo "Note: Try deleting a product that exists in orders to test the foreign key handling"
    echo ""
    echo "Manual test command (replace PRODUCT_ID):"
    echo "curl -X DELETE -H \"Authorization: Bearer $TOKEN\" \"${API_BASE}/products/my-product/PRODUCT_ID\""
    
  else
    echo "❌ Could not extract token from login response"
  fi
else
  echo "❌ Login failed"
fi

echo ""
echo "🎯 What to expect:"
echo "==================="
echo "✅ Products referenced in orders: Will be soft-deleted (marked inactive)"
echo "✅ Products NOT in orders: Will be hard-deleted (completely removed)"
echo "✅ Proper authorization: Only sellers can delete their own products"
echo "✅ Error handling: Clear messages for all scenarios"

echo ""
echo "🔧 Testing manually:"
echo "1. Login to seller dashboard: http://localhost:7000/seller/dashboard"
echo "2. Go to your products page"
echo "3. Try deleting a product"
echo "4. Check if it shows appropriate message"