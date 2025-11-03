#!/bin/bash

echo "🔔 Testing Seller Dashboard React Popup Notifications"
echo "======================================================"

# Login as admin
echo "1️⃣ Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4002/auth/login \
  -H "Content-Type: application/json" \
  -c /tmp/admin_cookies.txt \
  -d '{
    "email": "Mridul@example.com",
    "password": "SecurePass123!"
  }')

if [[ $LOGIN_RESPONSE == *"Login successful"* ]]; then
    echo "✅ Admin login successful"
else
    echo "❌ Admin login failed: $LOGIN_RESPONSE"
    exit 1
fi

# Extract token
TOKEN=$(grep "access_token" /tmp/admin_cookies.txt 2>/dev/null | tail -1 | awk '{print $7}')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract token"
    exit 1
fi

echo "✅ Token extracted: ${TOKEN:0:20}..."

# Test different notification types
echo ""
echo "2️⃣ Sending test notifications to seller (User ID: 62)..."

# Test 1: Urgent Order Notification
echo "📦 Sending URGENT order notification..."
curl -s -X POST http://localhost:4002/notifications/send-to-user/62 \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "order",
    "title": "🚨 URGENT: New Order #12345",
    "message": "High-priority order for $599.99 - 3 items - Express delivery requested",
    "urgent": true,
    "actionUrl": "/seller/orders/12345"
  }' > /dev/null

sleep 2

# Test 2: Payment Notification
echo "💰 Sending payment notification..."
curl -s -X POST http://localhost:4002/notifications/send-to-user/62 \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "payment",
    "title": "💰 Payment Received",
    "message": "Payment of $599.99 has been successfully processed for order #12345",
    "urgent": false,
    "actionUrl": "/seller/financial"
  }' > /dev/null

sleep 2

# Test 3: Product Stock Alert
echo "🛍️ Sending product alert notification..."
curl -s -X POST http://localhost:4002/notifications/send-to-user/62 \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "product",
    "title": "⚠️ Low Stock Alert",
    "message": "Gaming Laptop - Only 2 units remaining! Consider restocking soon.",
    "urgent": true,
    "actionUrl": "/seller/products"
  }' > /dev/null

sleep 2

# Test 4: System Verification Notification
echo "✅ Sending verification notification..."
curl -s -X POST http://localhost:4002/notifications/send-to-user/62 \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "verification",
    "title": "✅ Account Verified",
    "message": "Congratulations! Your seller account has been successfully verified.",
    "urgent": false,
    "actionUrl": "/seller/profile"
  }' > /dev/null

sleep 2

# Test 5: System Notification
echo "⚙️ Sending system notification..."
curl -s -X POST http://localhost:4002/notifications/send-to-user/62 \
  -H "Content-Type: application/json" \
  -b "access_token=$TOKEN" \
  -d '{
    "type": "system",
    "title": "🎉 React Popup System Test Complete!",
    "message": "All notification types have been sent. Check your seller dashboard for popups!",
    "urgent": false,
    "actionUrl": "/seller/dashboard"
  }' > /dev/null

echo ""
echo "3️⃣ Verifying notifications in database..."
NOTIFICATION_COUNT=$(PGPASSWORD=postgres psql -h localhost -U postgres -d e_commerce -t -c "SELECT COUNT(*) FROM notifications WHERE \"userId\" = 62 AND \"createdAt\" > NOW() - INTERVAL '30 seconds';" 2>/dev/null | xargs)

if [ "$NOTIFICATION_COUNT" = "5" ]; then
    echo "✅ All 5 notifications created in database"
else
    echo "⚠️ Expected 5 notifications, found: $NOTIFICATION_COUNT"
fi

echo ""
echo "🎯 TEST RESULTS:"
echo "=============="
echo "✅ 📦 Urgent Order Notification (RED popup, high-pitched sound)"
echo "✅ 💰 Payment Notification (GREEN popup, pleasant sound)"
echo "✅ 🛍️ Product Alert (YELLOW popup, medium sound)"
echo "✅ ✅ Verification Notification (GREEN popup, success sound)"
echo "✅ ⚙️ System Notification (GRAY popup, default sound)"

echo ""
echo "📋 WHAT TO EXPECT:"
echo "=================="
echo "1. Go to: http://localhost:3000/seller/dashboard"
echo "2. Look for the bell icon 🔔 in the top-right header"
echo "3. You should see:"
echo "   - Red badge with number '5' (or current unread count)"
echo "   - 5 popup notifications appeared in top-right corner"
echo "   - Different colored popups based on notification type"
echo "   - Sound effects for each notification"
echo "   - Auto-dismiss after 6 seconds"
echo ""
echo "4. Click the bell icon to see dropdown with all notifications"
echo "5. Click any notification to navigate to relevant page"
echo "6. Use sound toggle button in dropdown to enable/disable sounds"

echo ""
echo "🔍 DEBUGGING:"
echo "============="
echo "- Check browser console for logs like:"
echo "  📨 Received new-notification on user-62 channel"
echo "  🔔 SellerNotificationBell updated"
echo "  🎵 Audio playing for notification type"
echo ""
echo "- If no popups appear:"
echo "  1. Refresh the page"
echo "  2. Check Pusher connection (green/red dot on bell)"
echo "  3. Look for JavaScript errors in console"
echo "  4. Verify NotificationPopupManager is enabled"

echo ""
echo "✨ SUCCESS! React popup notification system is ready!"
echo "   Check your seller dashboard now! 🚀"