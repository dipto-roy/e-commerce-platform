#!/bin/bash

echo "=========================================="
echo "Admin Dashboard Fixes - Test Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the API base URL
API_URL="http://localhost:4002/api/v1"
FRONTEND_URL="http://localhost:3000"

echo "Testing Admin Dashboard Fixes..."
echo ""

# Test 1: Check if email endpoints exist
echo "1. Testing Email Endpoints Availability..."
echo "   Checking POST /admin/emails/send endpoint..."

# Note: These will return 401 without auth, but that proves the endpoint exists
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/admin/emails/send" \
  -H "Content-Type: application/json" \
  -d '{"subject":"test","message":"test","recipients":["test@test.com"]}')

if [ "$response" = "401" ]; then
  echo -e "   ${GREEN}✓${NC} Email send endpoint exists (returns 401 without auth - expected)"
elif [ "$response" = "404" ]; then
  echo -e "   ${RED}✗${NC} Email send endpoint NOT FOUND"
else
  echo -e "   ${YELLOW}?${NC} Unexpected response: $response"
fi

echo "   Checking POST /admin/emails/send-bulk endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/admin/emails/send-bulk" \
  -H "Content-Type: application/json" \
  -d '{"subject":"test","message":"test","recipientType":"all"}')

if [ "$response" = "401" ]; then
  echo -e "   ${GREEN}✓${NC} Bulk email endpoint exists (returns 401 without auth - expected)"
elif [ "$response" = "404" ]; then
  echo -e "   ${RED}✗${NC} Bulk email endpoint NOT FOUND"
else
  echo -e "   ${YELLOW}?${NC} Unexpected response: $response"
fi

echo "   Checking GET /admin/emails/history endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/admin/emails/history")

if [ "$response" = "401" ]; then
  echo -e "   ${GREEN}✓${NC} Email history endpoint exists (returns 401 without auth - expected)"
elif [ "$response" = "404" ]; then
  echo -e "   ${RED}✗${NC} Email history endpoint NOT FOUND"
else
  echo -e "   ${YELLOW}?${NC} Unexpected response: $response"
fi

echo ""

# Test 2: Check logout endpoint
echo "2. Testing Logout Endpoint..."
response=$(curl -s -X POST "$API_URL/auth/logout" -c /tmp/logout_cookies.txt -b /tmp/logout_cookies.txt)
echo "   Response: $response"

if echo "$response" | grep -q "Logged out successfully"; then
  echo -e "   ${GREEN}✓${NC} Logout endpoint working"
else
  echo -e "   ${RED}✗${NC} Logout endpoint returned unexpected response"
fi

# Check if cookies are cleared (should be empty after logout)
if [ -f /tmp/logout_cookies.txt ]; then
  cookie_count=$(grep -c "access_token\|refresh_token" /tmp/logout_cookies.txt 2>/dev/null || echo "0")
  if [ "$cookie_count" = "0" ]; then
    echo -e "   ${GREEN}✓${NC} Cookies properly cleared after logout"
  else
    echo -e "   ${YELLOW}?${NC} Cookies may not be fully cleared (check manually)"
  fi
fi

echo ""

# Test 3: Check frontend route
echo "3. Testing Frontend Email Route..."
if command -v curl &> /dev/null; then
  # Check if Next.js dev server is running
  if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200\|301\|302"; then
    echo -e "   ${GREEN}✓${NC} Frontend server is running"
    
    # Try to access the emails page (will redirect to login if not authenticated)
    response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/dashboard/admin/emails")
    
    if [ "$response" = "200" ] || [ "$response" = "307" ] || [ "$response" = "302" ]; then
      echo -e "   ${GREEN}✓${NC} Email page route exists (status: $response)"
    elif [ "$response" = "404" ]; then
      echo -e "   ${RED}✗${NC} Email page NOT FOUND (404)"
    else
      echo -e "   ${YELLOW}?${NC} Email page returned status: $response"
    fi
  else
    echo -e "   ${YELLOW}⚠${NC} Frontend server not running. Start with: cd e-commerce-frontend && npm run dev"
  fi
else
  echo -e "   ${YELLOW}⚠${NC} curl not available, skipping frontend test"
fi

echo ""

# Test 4: Check file structure
echo "4. Verifying File Structure..."

# Check if old email directory exists
if [ ! -d "/home/dip-roy/e-commerce_project/e-commerce-frontend/src/app/dashboard/admin/email" ]; then
  echo -e "   ${GREEN}✓${NC} Old 'email' directory removed"
else
  echo -e "   ${RED}✗${NC} Old 'email' directory still exists"
fi

# Check if new emails directory and page exists
if [ -f "/home/dip-roy/e-commerce_project/e-commerce-frontend/src/app/dashboard/admin/emails/page.tsx" ]; then
  echo -e "   ${GREEN}✓${NC} New 'emails/page.tsx' exists"
else
  echo -e "   ${RED}✗${NC} New 'emails/page.tsx' NOT FOUND"
fi

# Check backend DTO file
if [ -f "/home/dip-roy/e-commerce_project/e-commerce_backend/src/admin/dto/send-email.dto.ts" ]; then
  echo -e "   ${GREEN}✓${NC} Email DTO file exists"
else
  echo -e "   ${RED}✗${NC} Email DTO file NOT FOUND"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "Manual Testing Required:"
echo "1. Login as admin user"
echo "2. Navigate to Email System in sidebar"
echo "3. Verify page loads without 404"
echo "4. Send a test email"
echo "5. Logout and refresh browser"
echo "6. Verify you stay logged out"
echo ""
echo -e "${YELLOW}Note:${NC} Some tests require the backend and frontend servers to be running."
echo "Backend: cd e-commerce_backend && npm run start:dev"
echo "Frontend: cd e-commerce-frontend && npm run dev"
echo ""
echo "=========================================="
