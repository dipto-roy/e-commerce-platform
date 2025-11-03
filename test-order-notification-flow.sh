#!/bin/bash

# Test order placement to trigger notifications
echo "🧪 Testing Order Placement Notification Flow"
echo "=============================================="

# Set backend URL
BACKEND_URL="http://localhost:4002"

# Get admin token
echo "📝 Getting admin token..."
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST \
  "${BACKEND_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/test_cookies.txt \
  -d '{
    "email": "Mridul@example.com",
    "password": "SecurePass123!"
  }')

if [[ $? -ne 0 ]]; then
  echo "❌ Failed to connect to backend"
  exit 1
fi

# Extract token from cookies
ADMIN_TOKEN=$(grep "access_token" /tmp/test_cookies.txt 2>/dev/null | tail -1 | awk '{print $7}')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin login failed or no token found"
  echo "Response: $ADMIN_LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Admin logged in successfully"

# Create a customer user
echo "📝 Creating test customer..."
CUSTOMER_EMAIL="customer-$(date +%s)@test.com"
CUSTOMER_RESPONSE=$(curl -s -X POST \
  "${BACKEND_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"customer-$(date +%s)\",
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"password123\",
    \"phone\": \"+1234567890\",
    \"firstName\": \"Test\",
    \"lastName\": \"Customer\",
    \"role\": \"USER\"
  }")

CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | jq -r '.user.id')

if [ "$CUSTOMER_ID" = "null" ]; then
  echo "❌ Customer creation failed"
  echo "Response: $CUSTOMER_RESPONSE"
  exit 1
fi

echo "✅ Customer created with ID: $CUSTOMER_ID"

# Get customer token
echo "📝 Getting customer token..."
CUSTOMER_LOGIN_RESPONSE=$(curl -s -X POST \
  "${BACKEND_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/customer_cookies.txt \
  -d "{
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"password123\"
  }")

CUSTOMER_TOKEN=$(grep "access_token" /tmp/customer_cookies.txt 2>/dev/null | tail -1 | awk '{print $7}')

if [ -z "$CUSTOMER_TOKEN" ]; then
  echo "❌ Customer login failed"
  echo "Response: $CUSTOMER_LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Customer logged in successfully"

# Get first product from seller (user ID 62)
echo "📝 Getting products from seller..."
PRODUCTS_RESPONSE=$(curl -s -X GET \
  "${BACKEND_URL}/products?limit=50" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")

# Find a product from seller 62
PRODUCT_INFO=$(echo "$PRODUCTS_RESPONSE" | jq -r '.[] | select(.userId == 62) | {id: .id, name: .name, price: .price} | "\(.id)|\(.name)|\(.price)"' | head -1)

if [ -z "$PRODUCT_INFO" ]; then
  echo "❌ No products found for seller 62"
  echo "Available products:"
  echo "$PRODUCTS_RESPONSE" | jq -r '.[] | "ID: \(.id), Seller: \(.userId), Name: \(.name)"' | head -5
  exit 1
fi

PRODUCT_ID=$(echo "$PRODUCT_INFO" | cut -d'|' -f1)
PRODUCT_NAME=$(echo "$PRODUCT_INFO" | cut -d'|' -f2)
PRODUCT_PRICE=$(echo "$PRODUCT_INFO" | cut -d'|' -f3)

if [ -z "$PRODUCT_ID" ]; then
  echo "❌ No products found for seller 62"
  echo "Response: $PRODUCTS_RESPONSE"
  exit 1
fi

echo "✅ Found product: $PRODUCT_NAME (ID: $PRODUCT_ID, Price: $PRODUCT_PRICE)"

# Check seller notifications BEFORE order
echo "📊 Checking seller notifications BEFORE order..."
BEFORE_NOTIFICATIONS=$(curl -s -X GET \
  "${BACKEND_URL}/notifications/user/62?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

BEFORE_COUNT=$(echo "$BEFORE_NOTIFICATIONS" | jq -r '.total')
echo "📊 Seller has $BEFORE_COUNT notifications before order"

# Place order
echo "🛒 Placing order..."
ORDER_DATA="{
  \"items\": [
    {
      \"productId\": $PRODUCT_ID,
      \"quantity\": 1,
      \"price\": $PRODUCT_PRICE
    }
  ],
  \"shippingAddress\": {
    \"fullName\": \"Test Customer\",
    \"addressLine1\": \"123 Test Street\",
    \"city\": \"Test City\",
    \"state\": \"Test State\",
    \"postalCode\": \"12345\",
    \"country\": \"Test Country\",
    \"phone\": \"+1234567890\"
  },
  \"paymentMethod\": \"CASH_ON_DELIVERY\",
  \"totalAmount\": $PRODUCT_PRICE
}"

echo "📦 Order data:"
echo "$ORDER_DATA" | jq .

ORDER_RESPONSE=$(curl -s -X POST \
  "${BACKEND_URL}/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "$ORDER_DATA")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')

if [ "$ORDER_ID" = "null" ]; then
  echo "❌ Order placement failed"
  echo "Response: $ORDER_RESPONSE"
  exit 1
fi

echo "✅ Order placed successfully with ID: $ORDER_ID"

# Wait a moment for notification processing
echo "⏳ Waiting 3 seconds for notification processing..."
sleep 3

# Check seller notifications AFTER order
echo "📊 Checking seller notifications AFTER order..."
AFTER_NOTIFICATIONS=$(curl -s -X GET \
  "${BACKEND_URL}/notifications/user/62?limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

AFTER_COUNT=$(echo "$AFTER_NOTIFICATIONS" | jq -r '.total')
echo "📊 Seller has $AFTER_COUNT notifications after order"

# Show recent notifications
echo "📋 Recent seller notifications:"
echo "$AFTER_NOTIFICATIONS" | jq -r '.notifications[] | "- " + .title + " (" + .type + ") - " + .createdAt'

# Calculate new notifications
NEW_NOTIFICATIONS=$((AFTER_COUNT - BEFORE_COUNT))
echo ""
echo "📈 RESULT: $NEW_NOTIFICATIONS new notification(s) created"

if [ $NEW_NOTIFICATIONS -gt 0 ]; then
  echo "✅ Order notification system is working!"
  echo ""
  echo "🔍 Debug Information:"
  echo "Order ID: $ORDER_ID"
  echo "Customer ID: $CUSTOMER_ID"
  echo "Product ID: $PRODUCT_ID"
  echo "Seller ID: 62"
  
  echo ""
  echo "📱 Next Steps for Frontend Debugging:"
  echo "1. Open seller dashboard in browser"
  echo "2. Open browser console (F12)"
  echo "3. Check for Pusher connection logs"
  echo "4. Look for 'new-notification' events"
  echo "5. Verify NotificationPopupManager is receiving new notifications"
  
  echo ""
  echo "🎯 Latest notification details:"
  echo "$AFTER_NOTIFICATIONS" | jq -r '.notifications[0]'
else
  echo "❌ No new notifications created - check order service!"
fi

echo ""
echo "✅ Test completed!"