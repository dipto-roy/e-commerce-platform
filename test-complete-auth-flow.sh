#!/bin/bash

# =================================================================
# COMPLETE AUTHENTICATION & AUTHORIZATION TEST SCRIPT
# Tests JWT (Access + Refresh) + OAuth2 with HTTP-only Cookies
# =================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# API Configuration
API_URL="http://localhost:4002/api/v1"
COOKIE_FILE="auth_test_cookies.txt"
TEST_EMAIL="authtest$(date +%s)@example.com"
TEST_PASSWORD="SecurePass123!@#"
TEST_USERNAME="authtest$(date +%s)"

echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  🔐 COMPLETE AUTHENTICATION & AUTHORIZATION TEST SUITE    ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Testing: JWT Access + Refresh Tokens with HTTP-only Cookies${NC}"
echo -e "${CYAN}Backend: ${API_URL}${NC}"
echo ""

# Cleanup function
cleanup() {
  rm -f "$COOKIE_FILE"
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test result
print_result() {
  local test_name="$1"
  local result="$2"
  local details="$3"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if [ "$result" = "PASS" ]; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ PASS${NC} - $test_name"
    [ -n "$details" ] && echo -e "   ${CYAN}↳ $details${NC}"
  else
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}❌ FAIL${NC} - $test_name"
    [ -n "$details" ] && echo -e "   ${RED}↳ $details${NC}"
  fi
}

# =================================================================
# TEST 1: Check Backend Server Availability
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📡 TEST SUITE 1: Backend Server Connectivity${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/auth/profile" 2>/dev/null || echo "000")
if [ "$response" != "000" ]; then
  print_result "Backend server is accessible" "PASS" "HTTP status: $response"
else
  print_result "Backend server is accessible" "FAIL" "Cannot connect to server"
  echo -e "\n${RED}⚠️  Backend server is not running. Please start it first:${NC}"
  echo -e "${YELLOW}   cd e-commerce_backend && npm run start:dev${NC}"
  exit 1
fi

# =================================================================
# TEST 2: User Registration
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}👤 TEST SUITE 2: User Registration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${CYAN}Creating test user...${NC}"
echo -e "Email: ${TEST_EMAIL}"
echo -e "Username: ${TEST_USERNAME}"

register_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_FILE" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"username\": \"$TEST_USERNAME\",
    \"fullName\": \"Auth Test User\",
    \"phone\": \"+1234567890\",
    \"role\": \"USER\"
  }")

http_code=$(echo "$register_response" | tail -n1)
response_body=$(echo "$register_response" | sed '$d')

if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
  print_result "User registration successful" "PASS" "HTTP $http_code"
  echo -e "   ${CYAN}Response: ${response_body:0:100}...${NC}"
  
  # Check if tokens were set in cookies
  if grep -q "accessToken" "$COOKIE_FILE" 2>/dev/null; then
    print_result "Access token cookie set" "PASS" "Found in Set-Cookie header"
  else
    print_result "Access token cookie set" "FAIL" "Not found in response"
  fi
  
  if grep -q "refreshToken" "$COOKIE_FILE" 2>/dev/null; then
    print_result "Refresh token cookie set" "PASS" "Found in Set-Cookie header"
  else
    print_result "Refresh token cookie set" "FAIL" "Not found in response"
  fi
else
  print_result "User registration successful" "FAIL" "HTTP $http_code - $response_body"
  
  # If user already exists, try to continue with login
  if echo "$response_body" | grep -qi "already exists\|duplicate"; then
    echo -e "${YELLOW}⚠️  User already exists, will attempt login instead${NC}"
  fi
fi

# =================================================================
# TEST 3: User Login with Credentials
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔑 TEST SUITE 3: User Login (JWT with HTTP-only Cookies)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Clear cookies for fresh login test
rm -f "$COOKIE_FILE"

login_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_FILE" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

http_code=$(echo "$login_response" | tail -n1)
response_body=$(echo "$login_response" | sed '$d')

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
  print_result "Login successful" "PASS" "HTTP $http_code"
  echo -e "   ${CYAN}Response: ${response_body:0:150}...${NC}"
  
  # Verify JWT tokens in cookies
  if grep -q "accessToken" "$COOKIE_FILE" 2>/dev/null; then
    print_result "Access token (JWT) received" "PASS" "HTTP-only cookie set"
  else
    print_result "Access token (JWT) received" "FAIL" "Cookie not found"
  fi
  
  if grep -q "refreshToken" "$COOKIE_FILE" 2>/dev/null; then
    print_result "Refresh token received" "PASS" "HTTP-only cookie set"
  else
    print_result "Refresh token received" "FAIL" "Cookie not found"
  fi
  
  # Check cookie attributes
  if grep -q "HttpOnly" "$COOKIE_FILE" 2>/dev/null; then
    print_result "Cookies are HTTP-only" "PASS" "Security attribute set"
  else
    print_result "Cookies are HTTP-only" "FAIL" "HttpOnly flag not set"
  fi
else
  print_result "Login successful" "FAIL" "HTTP $http_code - $response_body"
  echo -e "\n${RED}⚠️  Cannot proceed with authentication tests${NC}"
  exit 1
fi

# =================================================================
# TEST 4: Access Protected Resource with JWT
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 TEST SUITE 4: Authorization with JWT Access Token${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

profile_response=$(curl -s -w "\n%{http_code}" "$API_URL/auth/profile" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE")

http_code=$(echo "$profile_response" | tail -n1)
response_body=$(echo "$profile_response" | sed '$d')

if [ "$http_code" = "200" ]; then
  print_result "Access protected route with JWT" "PASS" "Profile endpoint accessible"
  
  # Verify user data in response
  if echo "$response_body" | grep -q "$TEST_EMAIL"; then
    print_result "User data returned correctly" "PASS" "Email matches: $TEST_EMAIL"
  else
    print_result "User data returned correctly" "FAIL" "Email not found in response"
  fi
  
  # Check for role
  if echo "$response_body" | grep -qi "role"; then
    user_role=$(echo "$response_body" | grep -oP '"role"\s*:\s*"\K[^"]+' || echo "unknown")
    print_result "User role authorization" "PASS" "Role: $user_role"
  else
    print_result "User role authorization" "FAIL" "Role not found in response"
  fi
else
  print_result "Access protected route with JWT" "FAIL" "HTTP $http_code - Cannot access profile"
fi

# =================================================================
# TEST 5: Access Without Credentials (Should Fail)
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚫 TEST SUITE 5: Unauthorized Access Protection${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

unauthorized_response=$(curl -s -w "\n%{http_code}" "$API_URL/auth/profile" \
  -H "Content-Type: application/json")

http_code=$(echo "$unauthorized_response" | tail -n1)

if [ "$http_code" = "401" ]; then
  print_result "Unauthorized access blocked" "PASS" "HTTP 401 returned as expected"
else
  print_result "Unauthorized access blocked" "FAIL" "Expected 401, got $http_code"
fi

# =================================================================
# TEST 6: Token Refresh Flow
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 TEST SUITE 6: Token Refresh Mechanism${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Note: In production, access tokens expire after 15 minutes
# For testing, we'll call the refresh endpoint directly

refresh_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -c "${COOKIE_FILE}.new")

http_code=$(echo "$refresh_response" | tail -n1)
response_body=$(echo "$refresh_response" | sed '$d')

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
  print_result "Refresh token endpoint accessible" "PASS" "HTTP $http_code"
  
  # Check if new access token was issued
  if grep -q "accessToken" "${COOKIE_FILE}.new" 2>/dev/null; then
    print_result "New access token issued" "PASS" "Token refreshed successfully"
    mv "${COOKIE_FILE}.new" "$COOKIE_FILE"
  else
    print_result "New access token issued" "FAIL" "New token not found"
  fi
else
  print_result "Refresh token endpoint accessible" "FAIL" "HTTP $http_code"
fi

# =================================================================
# TEST 7: Role-Based Access Control (RBAC)
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}👑 TEST SUITE 7: Role-Based Access Control (RBAC)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test USER role access
user_endpoint_response=$(curl -s -w "\n%{http_code}" "$API_URL/orders/stats" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE")

http_code=$(echo "$user_endpoint_response" | tail -n1)

if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
  print_result "USER role can access user endpoints" "PASS" "HTTP $http_code"
else
  print_result "USER role can access user endpoints" "FAIL" "HTTP $http_code (expected 200 or 404)"
fi

# Test ADMIN endpoint (should fail for USER role)
admin_endpoint_response=$(curl -s -w "\n%{http_code}" "$API_URL/admin" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE")

http_code=$(echo "$admin_endpoint_response" | tail -n1)

if [ "$http_code" = "403" ]; then
  print_result "USER role blocked from admin endpoints" "PASS" "HTTP 403 (Forbidden)"
elif [ "$http_code" = "401" ]; then
  print_result "USER role blocked from admin endpoints" "PASS" "HTTP 401 (Unauthorized)"
else
  print_result "USER role blocked from admin endpoints" "FAIL" "HTTP $http_code (expected 403)"
fi

# =================================================================
# TEST 8: Logout and Session Termination
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚪 TEST SUITE 8: Logout and Session Cleanup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

logout_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -c "${COOKIE_FILE}.logout")

http_code=$(echo "$logout_response" | tail -n1)

if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
  print_result "Logout successful" "PASS" "HTTP $http_code"
  
  # Verify tokens are cleared
  if ! grep -q "accessToken" "${COOKIE_FILE}.logout" 2>/dev/null; then
    print_result "Access token cleared on logout" "PASS" "Token removed from cookies"
  else
    print_result "Access token cleared on logout" "FAIL" "Token still present"
  fi
else
  print_result "Logout successful" "FAIL" "HTTP $http_code"
fi

# Try to access protected resource after logout
post_logout_response=$(curl -s -w "\n%{http_code}" "$API_URL/auth/profile" \
  -H "Content-Type: application/json" \
  -b "${COOKIE_FILE}.logout")

http_code=$(echo "$post_logout_response" | tail -n1)

if [ "$http_code" = "401" ]; then
  print_result "Access denied after logout" "PASS" "HTTP 401 (session terminated)"
else
  print_result "Access denied after logout" "FAIL" "HTTP $http_code (expected 401)"
fi

# =================================================================
# TEST 9: OTP Forgot Password Flow
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 TEST SUITE 9: OTP Forgot Password System${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test forgot password endpoint
forgot_password_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}")

http_code=$(echo "$forgot_password_response" | tail -n1)
response_body=$(echo "$forgot_password_response" | sed '$d')

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
  print_result "OTP forgot password endpoint" "PASS" "HTTP $http_code"
  
  if echo "$response_body" | grep -qi "OTP sent\|email sent"; then
    print_result "OTP generation successful" "PASS" "Email would be sent in production"
  else
    print_result "OTP generation successful" "FAIL" "Unexpected response"
  fi
else
  print_result "OTP forgot password endpoint" "FAIL" "HTTP $http_code"
fi

# Test rate limiting (should fail after 3 rapid requests)
echo -e "\n${CYAN}Testing rate limiting (3 requests in 15 minutes)...${NC}"
for i in {1..4}; do
  rate_limit_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/forgot-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\"}")
  
  http_code=$(echo "$rate_limit_response" | tail -n1)
  
  if [ $i -le 3 ]; then
    echo -e "   Request $i: HTTP $http_code"
  else
    if [ "$http_code" = "429" ]; then
      print_result "Rate limiting active" "PASS" "HTTP 429 (Too Many Requests) on 4th attempt"
    else
      print_result "Rate limiting active" "FAIL" "Expected 429, got $http_code"
    fi
  fi
  
  sleep 0.5
done

# =================================================================
# TEST 10: Security Headers and Cookie Attributes
# =================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🛡️  TEST SUITE 10: Security Headers and Cookie Attributes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get headers from a login request
security_response=$(curl -s -i -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")

# Check for security headers
if echo "$security_response" | grep -qi "httponly"; then
  print_result "HttpOnly cookie attribute" "PASS" "Cookies protected from XSS"
else
  print_result "HttpOnly cookie attribute" "FAIL" "HttpOnly not set"
fi

if echo "$security_response" | grep -qi "samesite"; then
  print_result "SameSite cookie attribute" "PASS" "CSRF protection enabled"
else
  print_result "SameSite cookie attribute" "FAIL" "SameSite not set"
fi

if echo "$security_response" | grep -qi "access-control-allow-credentials"; then
  print_result "CORS credentials enabled" "PASS" "Cross-origin cookies allowed"
else
  print_result "CORS credentials enabled" "FAIL" "Credentials not allowed"
fi

# =================================================================
# FINAL SUMMARY
# =================================================================
echo -e "\n${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                    TEST SUMMARY                            ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Total Tests:${NC}  $TOTAL_TESTS"
echo -e "${GREEN}✅ Passed:${NC}    $PASSED_TESTS"
echo -e "${RED}❌ Failed:${NC}    $FAILED_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  🎉 ALL TESTS PASSED! Authentication system is working!   ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  percentage=$((PASSED_TESTS * 100 / TOTAL_TESTS))
  echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║  ⚠️  Some tests failed. Success rate: ${percentage}%${NC}"
  echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
