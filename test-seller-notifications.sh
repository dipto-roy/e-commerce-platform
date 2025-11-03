#!/bin/bash

# 🔔 SELLER NOTIFICATION SYSTEM TEST SCRIPT
# This script tests the seller notification system comprehensively

echo "🚀 Starting Seller Notification System Test..."
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:4002"

echo -e "\n${BLUE}Step 1: Checking Backend Health${NC}"
echo "----------------------------------------"
health_response=$(curl -s "${BACKEND_URL}/notification-test/health")
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    echo "Response: $health_response"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "Please ensure backend is running on port 4002"
    exit 1
fi

echo -e "\n${BLUE}Step 2: Testing Notification Service${NC}"
echo "----------------------------------------"
demo_response=$(curl -s -X POST "${BACKEND_URL}/notification-test/demo-seller-order-notification")
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Demo notifications sent successfully${NC}"
    echo "Response: $demo_response"
else
    echo -e "${RED}❌ Failed to send demo notifications${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 3: Testing Seller Verification Notifications${NC}"
echo "----------------------------------------"
verification_response=$(curl -s -X POST "${BACKEND_URL}/notification-test/demo-seller-verification")
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Seller verification notifications sent${NC}"
    echo "Response: $verification_response"
else
    echo -e "${YELLOW}⚠️ Seller verification test failed (this may be expected if no unverified sellers exist)${NC}"
fi

echo -e "\n${BLUE}Step 4: Checking Available Sellers${NC}"
echo "----------------------------------------"
echo "Fetching verified sellers for testing..."
sellers=$(curl -s "${BACKEND_URL}/users?role=SELLER" | grep -o '"id":[0-9]*' | head -5)
if [[ ! -z "$sellers" ]]; then
    echo -e "${GREEN}✅ Found sellers:${NC}"
    echo "$sellers"
else
    echo -e "${YELLOW}⚠️ No sellers found${NC}"
fi

echo -e "\n${BLUE}Step 5: Frontend Verification Checklist${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}Now follow these manual steps:${NC}"
echo ""
echo "1. 🌐 Open your browser and navigate to:"
echo "   ${BACKEND_URL/4002/3000}/seller/dashboard"
echo ""
echo "2. 🔑 Login as a seller (use one of the seller accounts above)"
echo ""
echo "3. 🔧 Check the Debug Panel (yellow box at top of dashboard):"
echo "   - User ID should be set"
echo "   - Role should be 'SELLER'"
echo "   - Connection should show '✅ Connected'"
echo "   - Notifications count should be > 0"
echo ""
echo "4. 🔔 Click the notification bell icon to see notifications"
echo ""
echo "5. 🧪 Test real-time notifications:"
echo "   - Keep seller dashboard open"
echo "   - Run this command in another terminal:"
echo "   curl -X POST ${BACKEND_URL}/notification-test/demo-seller-order-notification"
echo "   - You should see the notification bell update immediately"

echo -e "\n${BLUE}Step 6: Expected Results${NC}"
echo "----------------------------------------"
echo -e "${GREEN}✅ Success indicators:${NC}"
echo "   - Debug panel shows 'Connected'"
echo "   - Notification count increases after running test"
echo "   - Notification bell shows unread count"
echo "   - Notification panel displays order details"
echo ""
echo -e "${RED}❌ Failure indicators:${NC}"
echo "   - Debug panel shows 'Disconnected'"
echo "   - User ID shows 'Not set'"
echo "   - No notifications appear after test"
echo "   - Browser console shows Pusher errors"

echo -e "\n${BLUE}Step 7: Troubleshooting Commands${NC}"
echo "----------------------------------------"
echo "If notifications aren't working, run these diagnostic commands:"
echo ""
echo "Check Pusher configuration:"
echo "grep -r PUSHER /home/dip-roy/e-commerce_project/e-commerce-frontend/.env*"
echo ""
echo "Check browser console for errors:"
echo "Open DevTools → Console → Look for Pusher connection errors"
echo ""
echo "Test with specific seller ID (replace 29 with actual seller ID):"
echo "curl -X POST ${BACKEND_URL}/notification-test/demo-seller-order-notification -H 'Content-Type: application/json' -d '{\"sellerId\": 29}'"

echo -e "\n${GREEN}🎉 Test script completed!${NC}"
echo "Follow the manual steps above to verify frontend notifications."
echo ""
echo -e "${YELLOW}📝 Remember:${NC}"
echo "- Only verified sellers receive notifications"
echo "- Make sure you're logged in as a SELLER role"
echo "- Check browser permissions for notifications"
echo "- Use the debug panel to troubleshoot issues"