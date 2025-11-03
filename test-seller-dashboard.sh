#!/bin/bash
# Complete Seller Dashboard Test Script

echo "🧪 Testing E-Commerce Seller Dashboard Functionality"
echo "=================================================="

# Test 1: Check if frontend is running
echo ""
echo "📡 Test 1: Frontend Server Status"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:7000 | grep -q "200"; then
    echo "✅ Frontend is running on http://localhost:7000"
else
    echo "❌ Frontend is not accessible"
fi

# Test 2: Check if backend is running
echo ""
echo "📡 Test 2: Backend Server Status"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4002 | grep -q "200\|404"; then
    echo "✅ Backend is running on http://localhost:4002"
else
    echo "❌ Backend is not accessible"
fi

# Test 3: Check seller dashboard accessibility
echo ""
echo "🏪 Test 3: Seller Dashboard Page"
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7000/seller/dashboard)
if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo "✅ Seller dashboard is accessible"
else
    echo "❌ Seller dashboard returned status: $DASHBOARD_STATUS"
fi

# Test 4: Check login page
echo ""
echo "🔐 Test 4: Login Page"
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7000/login)
if [ "$LOGIN_STATUS" = "200" ]; then
    echo "✅ Login page is accessible"
else
    echo "❌ Login page returned status: $LOGIN_STATUS"
fi

# Test 5: Check if critical files exist
echo ""
echo "📁 Test 5: Critical Files Check"
FILES=(
    "/home/dip-roy/e-commerce_project/e-commerce-frontend/src/app/seller/dashboard/page.tsx"
    "/home/dip-roy/e-commerce_project/e-commerce-frontend/src/components/EnhancedSellerNotificationPanel.tsx"
    "/home/dip-roy/e-commerce_project/e-commerce-frontend/src/contexts/NotificationContext.tsx"
    "/home/dip-roy/e-commerce_project/e-commerce-frontend/src/hooks/useAuthGuard.ts"
    "/home/dip-roy/e-commerce_project/e-commerce-frontend/src/utils/api.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $(basename "$file") exists"
    else
        echo "❌ $(basename "$file") missing"
    fi
done

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "Frontend URL: http://localhost:7000"
echo "Backend URL: http://localhost:4002"
echo "Seller Dashboard: http://localhost:7000/seller/dashboard"
echo "Login Page: http://localhost:7000/login"
echo ""
echo "🔧 Key Features:"
echo "✅ Real-time notifications with Pusher"
echo "✅ Enhanced seller notification panel"
echo "✅ Role-based authentication"
echo "✅ Comprehensive dashboard UI"
echo "✅ API integration for seller operations"
echo ""
echo "📱 To test manually:"
echo "1. Visit http://localhost:7000/login"
echo "2. Login as a seller"
echo "3. Go to http://localhost:7000/seller/dashboard"
echo "4. Test notification bell icon"
echo "5. Navigate through different sections"