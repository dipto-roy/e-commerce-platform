#!/bin/bash

echo "🔍 Testing Pusher Real-time Events for Order Notifications"
echo "========================================================"

# This script will:
# 1. Place a real order 
# 2. Monitor backend logs for Pusher events
# 3. Check if notification was sent via Pusher

# Get admin token (we know this works)
echo "📝 Getting admin token..."
LOGIN_RESPONSE=$(curl -s -X POST \
  "http://localhost:4002/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/test_admin.txt \
  -d '{
    "email": "Mridul@example.com",
    "password": "SecurePass123!"
  }')

ADMIN_TOKEN=$(grep "access_token" /tmp/test_admin.txt 2>/dev/null | tail -1 | awk '{print $7}')

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Admin login failed"
  exit 1
fi

echo "✅ Admin logged in"

# Create customer
CUSTOMER_EMAIL="pusher-test-$(date +%s)@test.com"
CUSTOMER_RESPONSE=$(curl -s -X POST \
  "http://localhost:4002/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"pusher-test-$(date +%s)\",
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"password123\",
    \"phone\": \"+1234567890\",
    \"firstName\": \"Pusher\",
    \"lastName\": \"Test\",
    \"role\": \"USER\"
  }")

CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | jq -r '.user.id')
echo "✅ Customer created: $CUSTOMER_ID"

# Login customer
CUSTOMER_LOGIN=$(curl -s -X POST \
  "http://localhost:4002/auth/login" \
  -H "Content-Type: application/json" \
  -c /tmp/test_customer.txt \
  -d "{
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"password123\"
  }")

CUSTOMER_TOKEN=$(grep "access_token" /tmp/test_customer.txt 2>/dev/null | tail -1 | awk '{print $7}')
echo "✅ Customer logged in"

# Start monitoring backend logs
echo "📡 Starting backend log monitor..."
echo "   (Check for Pusher trigger logs in another terminal)"

# Place order
echo "🛒 Placing order to trigger notification..."
ORDER_RESPONSE=$(curl -s -X POST \
  "http://localhost:4002/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "items": [
      {
        "productId": 45,
        "quantity": 1,
        "price": 100.00
      }
    ],
    "shippingAddress": {
      "fullName": "Pusher Test",
      "addressLine1": "123 Test Street",
      "city": "Test City",
      "state": "Test State",
      "postalCode": "12345",
      "country": "Test Country",
      "phone": "+1234567890"
    },
    "paymentMethod": "CASH_ON_DELIVERY",
    "totalAmount": 100.00
  }')

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id')

if [ "$ORDER_ID" = "null" ]; then
  echo "❌ Order placement failed:"
  echo "$ORDER_RESPONSE"
  exit 1
fi

echo "✅ Order placed successfully: $ORDER_ID"

# Wait for notification processing
echo "⏳ Waiting 5 seconds for notification processing..."
sleep 5

# Check if notification was created
echo "📊 Checking notifications for seller 62..."
NOTIFICATIONS=$(curl -s -X GET \
  "http://localhost:4002/notifications/user/62?limit=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

LATEST_NOTIFICATION=$(echo "$NOTIFICATIONS" | jq -r '.notifications[0]')
NOTIFICATION_TITLE=$(echo "$LATEST_NOTIFICATION" | jq -r '.title')

echo "📋 Latest notification: $NOTIFICATION_TITLE"

if [[ "$NOTIFICATION_TITLE" == "New Order Received" ]]; then
  echo "✅ Notification created successfully in database"
  echo ""
  echo "🔍 DEBUGGING CHECKLIST:"
  echo "1. ✅ Order placement: SUCCESS"
  echo "2. ✅ Notification creation: SUCCESS"
  echo "3. ❓ Pusher real-time event: CHECK MANUALLY"
  echo ""
  echo "🎯 NEXT STEPS:"
  echo "1. Open seller dashboard: http://localhost:3000/seller/dashboard"
  echo "2. Open browser console (F12)"
  echo "3. Look for these logs during order placement:"
  echo "   - '🔔 New notification received via Pusher'"
  echo "   - '📱 Creating popup for notification'"
  echo "   - '🎵 Playing notification sound'"
  echo ""
  echo "4. If NO Pusher events appear:"
  echo "   - Backend is not sending real-time events for real orders"
  echo "   - Only saving to database"
  echo ""
  echo "5. If Pusher events appear but NO popup:"
  echo "   - Frontend NotificationPopupManager issue"
  echo "   - Check React component logs"
  echo ""
  echo "Order ID: $ORDER_ID"
  echo "Customer ID: $CUSTOMER_ID"
  echo "Expected notification for Seller ID: 62"
else
  echo "❌ No new order notification found"
fi

# Clean up temp files
rm -f /tmp/test_admin.txt /tmp/test_customer.txt

echo ""
echo "✅ Test completed - Check browser console for Pusher events!"