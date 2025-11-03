#!/bin/bash

echo "🧪 Testing New Authentication System"
echo "==================================="

BASE_URL="http://localhost:4002"
FRONTEND_URL="http://localhost:7000"

# Test 1: Register a new user
echo "📝 Test 1: Register new user..."
register_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2025",
    "email": "testuser2025@example.com",
    "password": "Password123!",
    "fullName": "Test User 2025",
    "role": "customer"
  }' \
  -c cookies.txt \
  "$BASE_URL/auth/register")

http_code=$(echo $register_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
response_body=$(echo $register_response | sed -e 's/HTTPSTATUS:.*$//')

echo "Status: $http_code"
echo "Response: $response_body"
echo ""

# Test 2: Login with the new user
echo "🔐 Test 2: Login with new authentication system..."
login_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2025",
    "password": "Password123!"
  }' \
  -c cookies.txt \
  "$BASE_URL/auth/login")

http_code=$(echo $login_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
response_body=$(echo $login_response | sed -e 's/HTTPSTATUS:.*$//')

echo "Status: $http_code"
echo "Response: $response_body"
echo ""

# Test 3: Access protected profile endpoint
echo "👤 Test 3: Access profile with httpOnly cookies..."
profile_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X GET \
  -b cookies.txt \
  "$BASE_URL/auth/profile")

http_code=$(echo $profile_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
response_body=$(echo $profile_response | sed -e 's/HTTPSTATUS:.*$//')

echo "Status: $http_code"
echo "Response: $response_body"
echo ""

# Test 4: Test refresh token endpoint
echo "🔄 Test 4: Test refresh token functionality..."
refresh_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  -b cookies.txt \
  -c cookies.txt \
  "$BASE_URL/auth/refresh")

http_code=$(echo $refresh_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
response_body=$(echo $refresh_response | sed -e 's/HTTPSTATUS:.*$//')

echo "Status: $http_code"
echo "Response: $response_body"
echo ""

# Test 5: Test logout
echo "🚪 Test 5: Test logout functionality..."
logout_response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  -b cookies.txt \
  -c cookies.txt \
  "$BASE_URL/auth/logout")

http_code=$(echo $logout_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
response_body=$(echo $logout_response | sed -e 's/HTTPSTATUS:.*$//')

echo "Status: $http_code"
echo "Response: $response_body"
echo ""

# Test 6: Try to access profile after logout (should fail)
echo "❌ Test 6: Try to access profile after logout (should fail)..."
profile_after_logout=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X GET \
  -b cookies.txt \
  "$BASE_URL/auth/profile")

http_code=$(echo $profile_after_logout | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
response_body=$(echo $profile_after_logout | sed -e 's/HTTPSTATUS:.*$//')

echo "Status: $http_code"
echo "Response: $response_body"
echo ""

# Cleanup
rm -f cookies.txt

echo "✅ Authentication system test completed!"
echo ""
echo "📋 Summary:"
echo "- Frontend running on: $FRONTEND_URL"
echo "- Backend running on: $BASE_URL"
echo "- New auth endpoints: /auth/login, /auth/refresh, /auth/logout"
echo "- Cookies: httpOnly, secure token storage"
echo "- Tokens: 15min access + 7day refresh"
