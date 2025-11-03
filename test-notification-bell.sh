#!/bin/bash

echo "🧪 Testing Notification Bell with Real Notifications"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the access token from cookies
echo "1️⃣ Getting authentication token..."
TOKEN=$(grep "access_token" cookies.txt 2>/dev/null | tail -1 | awk '{print $7}')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No access token found. Please login first.${NC}"
    echo ""
    echo "Login commands:"
    echo "  For Seller: curl -X POST http://localhost:4002/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"Likhon@example.com\",\"password\":\"password123\"}' -c cookies.txt"
    echo "  For Admin:  curl -X POST http://localhost:4002/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@example.com\",\"password\":\"password123\"}' -c cookies.txt"
    exit 1
fi

echo -e "${GREEN}✅ Token found${NC}"

# Get current user info
echo ""
echo "2️⃣ Getting current user info..."
USER_INFO=$(curl -s -X GET http://localhost:4002/auth/me -b "access_token=$TOKEN")
USER_ID=$(echo $USER_INFO | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
USERNAME=$(echo $USER_INFO | grep -o '"username":"[^"]*"' | sed 's/"username":"//;s/"$//')
ROLE=$(echo $USER_INFO | grep -o '"role":"[^"]*"' | sed 's/"role":"//;s/"$//')

if [ -z "$USER_ID" ]; then
    echo -e "${RED}❌ Failed to get user info. Token might be expired.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged in as: $USERNAME (ID: $USER_ID, Role: $ROLE)${NC}"

# Check current notifications
echo ""
echo "3️⃣ Checking existing notifications..."
NOTIF_RESPONSE=$(curl -s -X GET "http://localhost:4002/notifications/my?page=1&limit=5" -b "access_token=$TOKEN")
NOTIF_COUNT=$(echo $NOTIF_RESPONSE | grep -o '"total":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -z "$NOTIF_COUNT" ]; then
    NOTIF_COUNT=0
fi

echo -e "${YELLOW}📊 Current notifications: $NOTIF_COUNT${NC}"

# Send test notifications
echo ""
echo "4️⃣ Sending test notifications..."

# Test 1: System notification
echo "   • Sending system notification..."
RESPONSE1=$(curl -s -X POST http://localhost:4002/notifications/send-to-user/$USER_ID \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "system",
    "title": "Welcome! 🎉",
    "message": "Your notification system is working perfectly!",
    "urgent": false,
    "actionUrl": "/dashboard"
  }')

if echo $RESPONSE1 | grep -q "success"; then
    echo -e "     ${GREEN}✅ System notification sent${NC}"
else
    echo -e "     ${RED}❌ Failed: $RESPONSE1${NC}"
fi

sleep 1

# Test 2: Order notification
echo "   • Sending order notification..."
RESPONSE2=$(curl -s -X POST http://localhost:4002/notifications/send-to-user/$USER_ID \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "order",
    "title": "New Order Received! 📦",
    "message": "You have a new order #12345 - Items: 3, Value: $125.99",
    "urgent": true,
    "actionUrl": "/seller/orders/12345",
    "data": {
      "orderId": 12345,
      "itemsCount": 3,
      "totalAmount": 125.99
    }
  }')

if echo $RESPONSE2 | grep -q "success"; then
    echo -e "     ${GREEN}✅ Order notification sent${NC}"
else
    echo -e "     ${RED}❌ Failed: $RESPONSE2${NC}"
fi

sleep 1

# Test 3: Payment notification
echo "   • Sending payment notification..."
RESPONSE3=$(curl -s -X POST http://localhost:4002/notifications/send-to-user/$USER_ID \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "payment",
    "title": "Payment Received 💰",
    "message": "You received a payment of $125.99 for order #12345",
    "urgent": false,
    "actionUrl": "/seller/financial/records"
  }')

if echo $RESPONSE3 | grep -q "success"; then
    echo -e "     ${GREEN}✅ Payment notification sent${NC}"
else
    echo -e "     ${RED}❌ Failed: $RESPONSE3${NC}"
fi

sleep 1

# Test 4: Product notification
echo "   • Sending product notification..."
RESPONSE4=$(curl -s -X POST http://localhost:4002/notifications/send-to-user/$USER_ID \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "product",
    "title": "Low Stock Alert 🛍️",
    "message": "Your product \"Gaming Mouse\" is running low on stock (5 remaining)",
    "urgent": false,
    "actionUrl": "/seller/products"
  }')

if echo $RESPONSE4 | grep -q "success"; then
    echo -e "     ${GREEN}✅ Product notification sent${NC}"
else
    echo -e "     ${RED}❌ Failed: $RESPONSE4${NC}"
fi

# Verify notifications in database
echo ""
echo "5️⃣ Verifying notifications in database..."
DB_CHECK=$(PGPASSWORD=postgres psql -h localhost -U postgres -d e_commerce -t -c \
  "SELECT COUNT(*) FROM notifications WHERE \"userId\" = $USER_ID AND \"createdAt\" > NOW() - INTERVAL '1 minute';")

DB_COUNT=$(echo $DB_CHECK | tr -d ' ')

if [ "$DB_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $DB_COUNT new notifications in database${NC}"
else
    echo -e "${RED}❌ No new notifications found in database${NC}"
fi

# Show recent notifications
echo ""
echo "6️⃣ Recent notifications for user $USER_ID:"
PGPASSWORD=postgres psql -h localhost -U postgres -d e_commerce -c \
  "SELECT id, type, title, message, read, \"createdAt\" 
   FROM notifications 
   WHERE \"userId\" = $USER_ID 
   ORDER BY \"createdAt\" DESC 
   LIMIT 5;"

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Test notifications sent successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to: http://localhost:3000"
echo "2. Look at the bell icon in the navbar (top right)"
echo "3. You should see:"
echo "   • Red badge with number of unread notifications"
echo "   • Green dot (connected to Pusher)"
echo "   • Click bell to see dropdown with notifications"
echo ""
echo "Expected in browser console:"
echo "   📨 Received notification on user-$USER_ID channel"
echo "   🔔 NotificationBell mounted/updated: { unreadCount: 4 }"
echo ""
echo "If notifications don't appear:"
echo "   • Check browser console for Pusher connection"
echo "   • Refresh the page"
echo "   • Check that you're logged in as user ID $USER_ID"
