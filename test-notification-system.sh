#!/bin/bash

# Complete Notification System Testing Script
# This script tests all notification endpoints and functionality

API_URL="http://localhost:4002"
ADMIN_COOKIE="your-admin-cookie-here"
USER_COOKIE="your-user-cookie-here"
SELLER_COOKIE="your-seller-cookie-here"

echo "🔔 =================================="
echo "🔔 Notification System Test Suite"
echo "🔔 =================================="
echo ""

# Test 1: Health Check
echo "📊 Test 1: Health Check"
curl -s "$API_URL/notification-test/health" | jq '.'
echo ""
echo "---"

# Test 2: Get Unread Count
echo "📊 Test 2: Get Unread Count (requires auth)"
curl -s -b "$USER_COOKIE" "$API_URL/notifications/my/unread-count" | jq '.'
echo ""
echo "---"

# Test 3: Send Test Notification
echo "📊 Test 3: Send Custom Notification (Admin)"
curl -s -X POST "$API_URL/notifications/send" \
  -b "$ADMIN_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "notification": {
      "type": "system",
      "title": "Test Notification",
      "message": "This is a test notification from the testing script",
      "urgent": false,
      "actionUrl": "/dashboard"
    }
  }' | jq '.'
echo ""
echo "---"

# Test 4: Demo Seller Order Notification
echo "📊 Test 4: Demo Seller Order Notification"
curl -s -X POST "$API_URL/notification-test/demo-seller-order-notification" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 2,
    "customerName": "Test Customer",
    "orderTotal": 149.99,
    "orderId": 9999
  }' | jq '.'
echo ""
echo "---"

# Test 5: Demo Admin Notification
echo "📊 Test 5: Demo Admin Notification"
curl -s -X POST "$API_URL/notification-test/demo-admin-notification" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "---"

# Test 6: Demo Seller Verification
echo "📊 Test 6: Demo Seller Verification"
curl -s -X POST "$API_URL/notification-test/demo-seller-verification" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 2,
    "isVerified": true
  }' | jq '.'
echo ""
echo "---"

# Test 7: Get My Notifications (requires auth)
echo "📊 Test 7: Get My Notifications (with pagination)"
curl -s -b "$USER_COOKIE" "$API_URL/notifications/my" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "---"

# Test 8: Mark Notification as Read (requires auth and notificationId)
echo "📊 Test 8: Mark Notification as Read"
echo "Note: Replace NOTIFICATION_ID with actual ID from Test 7"
# curl -s -X POST -b "$USER_COOKIE" "$API_URL/notifications/NOTIFICATION_ID/read" | jq '.'
echo "Command: curl -X POST -b COOKIE '$API_URL/notifications/{id}/read'"
echo ""
echo "---"

# Test 9: Mark All as Read (requires auth)
echo "📊 Test 9: Mark All as Read"
# curl -s -X POST -b "$USER_COOKIE" "$API_URL/notifications/my/read-all" | jq '.'
echo "Command: curl -X POST -b COOKIE '$API_URL/notifications/my/read-all'"
echo ""
echo "---"

# Test 10: Delete Notification (requires auth and notificationId)
echo "📊 Test 10: Delete Notification"
echo "Note: Replace NOTIFICATION_ID with actual ID"
# curl -s -X POST -b "$USER_COOKIE" "$API_URL/notifications/NOTIFICATION_ID/delete" | jq '.'
echo "Command: curl -X POST -b COOKIE '$API_URL/notifications/{id}/delete'"
echo ""
echo "---"

# Test 11: Delete All Read Notifications (requires auth)
echo "📊 Test 11: Delete All Read Notifications"
# curl -s -X POST -b "$USER_COOKIE" "$API_URL/notifications/my/delete-read" | jq '.'
echo "Command: curl -X POST -b COOKIE '$API_URL/notifications/my/delete-read'"
echo ""
echo "---"

# Test 12: Notification System Status (Admin)
echo "📊 Test 12: Notification System Status"
curl -s -b "$ADMIN_COOKIE" "$API_URL/notifications/status" | jq '.'
echo ""
echo "---"

echo ""
echo "🎉 =================================="
echo "🎉 Test Suite Completed!"
echo "🎉 =================================="
echo ""
echo "📝 Next Steps:"
echo "1. Update cookie values in this script with actual auth tokens"
echo "2. Test notification endpoints with authenticated requests"
echo "3. Open frontend at http://localhost:3000 to see real-time notifications"
echo "4. Check bell icon for unread count"
echo "5. Navigate to /notifications page to see full list"
echo ""
echo "🔗 Key Endpoints:"
echo "   - GET  /notifications/my → Get user's notifications"
echo "   - GET  /notifications/my/unread-count → Get unread count"
echo "   - POST /notifications/:id/read → Mark as read"
echo "   - POST /notifications/my/read-all → Mark all as read"
echo "   - POST /notifications/:id/delete → Delete notification"
echo "   - POST /notifications/send → Send custom notification (Admin)"
echo ""
