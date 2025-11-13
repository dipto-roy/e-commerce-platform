#!/bin/bash

# Test script for automatic token refresh functionality
# This script tests the token refresh implementation

echo "🧪 Testing Automatic Token Refresh Implementation"
echo "=================================================="
echo ""

API_URL="${API_URL:-http://localhost:4002/api/v1}"
COOKIES_FILE="token_test_cookies.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Login and get initial tokens
echo "📝 Test 1: Login and obtain tokens"
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' \
  -c "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Login successful (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    echo ""
    
    # Check if cookies were set
    if [ -f "$COOKIES_FILE" ]; then
        echo "🍪 Cookies saved:"
        cat "$COOKIES_FILE" | grep -E "access_token|refresh_token" || echo "No tokens found in cookies"
    fi
else
    echo -e "${RED}❌ Login failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi

echo ""
echo "=================================================="
echo ""

# Test 2: Access protected endpoint with valid token
echo "📝 Test 2: Access protected endpoint (valid token)"
echo "---------------------------------------------------"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/profile" \
  -b "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$PROFILE_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$PROFILE_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Profile access successful (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Profile access failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "=================================================="
echo ""

# Test 3: Manually call refresh endpoint
echo "📝 Test 3: Manual token refresh"
echo "--------------------------------"
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -b "$COOKIES_FILE" \
  -c "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$REFRESH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Token refresh successful (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    echo ""
    echo "🍪 Updated cookies:"
    cat "$COOKIES_FILE" | grep -E "access_token|refresh_token" || echo "No tokens found in cookies"
else
    echo -e "${RED}❌ Token refresh failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "=================================================="
echo ""

# Test 4: Access protected endpoint after refresh
echo "📝 Test 4: Access protected endpoint (after refresh)"
echo "-----------------------------------------------------"
PROFILE_RESPONSE2=$(curl -s -X GET "$API_URL/auth/profile" \
  -b "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$PROFILE_RESPONSE2" | tail -n 1)
RESPONSE_BODY=$(echo "$PROFILE_RESPONSE2" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Profile access successful after refresh (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${RED}❌ Profile access failed after refresh (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "=================================================="
echo ""

# Test 5: Test with invalid/missing refresh token
echo "📝 Test 5: Refresh with invalid token"
echo "--------------------------------------"
# Create empty cookies file to simulate missing token
rm -f "$COOKIES_FILE"
echo "" > "$COOKIES_FILE"

INVALID_REFRESH=$(curl -s -X POST "$API_URL/auth/refresh" \
  -b "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$INVALID_REFRESH" | tail -n 1)
RESPONSE_BODY=$(echo "$INVALID_REFRESH" | head -n -1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Correctly rejected invalid token (HTTP $HTTP_CODE)${NC}"
    echo "Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo -e "${YELLOW}⚠️ Unexpected response (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "=================================================="
echo ""

# Test 6: Test logout
echo "📝 Test 6: Logout and revoke tokens"
echo "------------------------------------"
# First login again
LOGIN_RESPONSE2=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' \
  -c "$COOKIES_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE2" | tail -n 1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "Re-logged in successfully"
    
    # Now logout
    LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
      -b "$COOKIES_FILE" \
      -c "$COOKIES_FILE" \
      -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n 1)
    RESPONSE_BODY=$(echo "$LOGOUT_RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Logout successful (HTTP $HTTP_CODE)${NC}"
        echo "Response: $RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
        
        # Try to access profile after logout (should fail)
        PROFILE_AFTER_LOGOUT=$(curl -s -X GET "$API_URL/auth/profile" \
          -b "$COOKIES_FILE" \
          -w "\n%{http_code}")
        
        HTTP_CODE=$(echo "$PROFILE_AFTER_LOGOUT" | tail -n 1)
        if [ "$HTTP_CODE" = "401" ]; then
            echo -e "${GREEN}✅ Profile correctly inaccessible after logout (HTTP $HTTP_CODE)${NC}"
        else
            echo -e "${RED}❌ Profile still accessible after logout (HTTP $HTTP_CODE)${NC}"
        fi
    else
        echo -e "${RED}❌ Logout failed (HTTP $HTTP_CODE)${NC}"
        echo "$RESPONSE_BODY"
    fi
else
    echo -e "${RED}❌ Re-login failed${NC}"
fi

echo ""
echo "=================================================="
echo ""

# Cleanup
rm -f "$COOKIES_FILE"

echo "🎉 Test suite completed!"
echo ""
echo "📋 Summary:"
echo "  - Test 1: Login and obtain tokens"
echo "  - Test 2: Access protected endpoint with valid token"
echo "  - Test 3: Manual token refresh"
echo "  - Test 4: Access after refresh"
echo "  - Test 5: Invalid token rejection"
echo "  - Test 6: Logout and token revocation"
echo ""
echo "💡 Frontend Automatic Refresh:"
echo "  The frontend automatically refreshes expired tokens"
echo "  when a 401 error is detected. Test this by:"
echo "  1. Login to the frontend application"
echo "  2. Wait 15+ minutes (or set JWT_ACCESS_EXPIRES_IN=30s)"
echo "  3. Perform any action (click a page, load data)"
echo "  4. Check browser console for automatic refresh logs"
echo ""
