#!/bin/bash

echo "Testing authentication endpoints..."

# Test 1: Check if backend is responding
echo "1. Testing backend health..."
curl -s -o /dev/null -w "Backend Status: %{http_code}\n" http://localhost:4002/auth/profile

# Test 2: Test login endpoint
echo "2. Testing login endpoint..."
curl -X POST http://localhost:4002/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:7000" \
  -d '{"email":"Mridul@example.com","password":"Test123!"}' \
  -c cookies.txt \
  -v 2>&1 | grep -E "(HTTP|Set-Cookie|Access-Control)"

# Test 3: Test profile endpoint with cookies
echo "3. Testing profile endpoint with cookies..."
curl -X GET http://localhost:4002/auth/profile \
  -H "Origin: http://localhost:7000" \
  -b cookies.txt \
  -v 2>&1 | grep -E "(HTTP|Access-Control)"

# Clean up
rm -f cookies.txt

echo "Test complete!"
