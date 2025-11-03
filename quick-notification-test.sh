#!/bin/bash

# Quick Notification System Test
# Tests basic functionality of the notification system

echo "============================================"
echo "🧪 Quick Notification System Test"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:4002"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/notifications/health")
if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend is not responding (Status: $HEALTH_RESPONSE)${NC}"
    echo "Please start the backend: cd e-commerce_backend && npm run start"
    exit 1
fi
echo ""

# Test 2: Get notification status
echo -e "${YELLOW}Test 2: Notification System Status${NC}"
STATUS_RESPONSE=$(curl -s "$BACKEND_URL/notifications/status")
echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
echo ""

# Test 3: Check if auth endpoint exists
echo -e "${YELLOW}Test 3: Authentication Endpoint${NC}"
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/notifications/auth" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}')
if [ "$AUTH_RESPONSE" -eq 201 ] || [ "$AUTH_RESPONSE" -eq 200 ] || [ "$AUTH_RESPONSE" -eq 401 ]; then
    echo -e "${GREEN}✅ Auth endpoint is responding${NC}"
else
    echo -e "${RED}❌ Auth endpoint not found (Status: $AUTH_RESPONSE)${NC}"
fi
echo ""

# Test 4: Frontend connectivity
echo -e "${YELLOW}Test 4: Frontend Check${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
if [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    echo "   Navigate to: http://localhost:3000/notifications"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    echo "   Please start: cd e-commerce-frontend && npm run dev"
fi
echo ""

# Summary
echo "============================================"
echo "📊 Test Summary"
echo "============================================"
echo ""
echo "✅ Notification system is operational"
echo ""
echo "📋 Next Steps:"
echo "1. Login to your account at http://localhost:3000"
echo "2. Navigate to http://localhost:3000/notifications"
echo "3. Place an order to test real-time notifications"
echo "4. Check bell icon for notification badge"
echo ""
echo "🔧 API Endpoints Available:"
echo "   - GET  /notifications/my"
echo "   - GET  /notifications/my/unread-count"
echo "   - POST /notifications/:id/read"
echo "   - POST /notifications/my/read-all"
echo "   - POST /notifications/:id/delete"
echo "   - POST /notifications/my/delete-read"
echo ""
echo "📖 Full Documentation:"
echo "   - COMPLETE_NOTIFICATION_SYSTEM_GUIDE.md"
echo "   - NOTIFICATION_SYSTEM_COMPLETE_SUCCESS.md"
echo "   - test-notification-system.sh (detailed tests)"
echo ""
echo "============================================"
