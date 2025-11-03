#!/bin/bash

# Test script for Dashboard Trends API endpoint

BASE_URL="http://localhost:4002/api/v1"
ADMIN_EMAIL="admin@ecommerce.com"
ADMIN_PASSWORD="Admin@123"

echo "🧪 Testing Dashboard Trends API Endpoint"
echo "=========================================="
echo ""

# Step 1: Login as admin
echo "📝 Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token. Please check credentials."
  exit 1
fi

echo "✅ Successfully logged in"
echo "Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Step 2: Test trends endpoint with different periods
echo "📊 Step 2: Testing trends endpoint..."
echo ""

PERIODS=("7days" "30days" "3months" "1year")

for PERIOD in "${PERIODS[@]}"
do
  echo "Testing period: $PERIOD"
  echo "-------------------"
  
  TRENDS_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/dashboard/trends?period=$PERIOD" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json")
  
  echo "$TRENDS_RESPONSE" | jq '.' 2>/dev/null || echo "$TRENDS_RESPONSE"
  echo ""
  echo ""
done

echo "✅ Test completed!"
echo ""
echo "📝 Next steps:"
echo "1. Check if data is returned correctly"
echo "2. Verify cumulative counts are increasing"
echo "3. Check date formatting"
echo "4. Test frontend integration at http://localhost:3000/dashboard/admin"
