#!/bin/bash

echo "=========================================="
echo "Admin API 404 Errors - Fix Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:4002/api/v1"

echo "Testing API Endpoints Availability..."
echo ""

# Test endpoints that were giving 404 errors
endpoints=(
  "GET /users"
  "GET /sellers/all"
  "GET /products"
  "GET /admin/sellers/pending"
)

for endpoint in "${endpoints[@]}"; do
  method=$(echo $endpoint | cut -d' ' -f1)
  path=$(echo $endpoint | cut -d' ' -f2)
  
  echo "Testing: $endpoint"
  
  response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$API_URL$path" 2>/dev/null)
  
  if [ "$response" = "200" ]; then
    echo -e "   ${GREEN}✓${NC} Endpoint working (200 OK)"
  elif [ "$response" = "401" ]; then
    echo -e "   ${GREEN}✓${NC} Endpoint exists (401 - auth required)"
  elif [ "$response" = "404" ]; then
    echo -e "   ${RED}✗${NC} Endpoint NOT FOUND (404)"
  elif [ "$response" = "000" ]; then
    echo -e "   ${YELLOW}⚠${NC} Backend not running"
    break
  else
    echo -e "   ${YELLOW}?${NC} Status: $response"
  fi
done

echo ""
echo "=========================================="
echo "Additional Endpoint Tests"
echo "=========================================="
echo ""

# Test email endpoints
echo "Testing: POST /admin/emails/send"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/admin/emails/send" \
  -H "Content-Type: application/json" \
  -d '{"subject":"test","message":"test","recipients":["test@test.com"]}' 2>/dev/null)

if [ "$response" = "401" ]; then
  echo -e "   ${GREEN}✓${NC} Email endpoint exists (401 - auth required)"
elif [ "$response" = "404" ]; then
  echo -e "   ${RED}✗${NC} Email endpoint NOT FOUND (404)"
else
  echo -e "   ${YELLOW}?${NC} Status: $response"
fi

echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "If all endpoints show ✓ (either 200 or 401), the fix is working!"
echo "404 errors mean the endpoint doesn't exist - check backend routing"
echo "⚠ means the backend server is not running"
echo ""
echo "To start backend: cd e-commerce_backend && npm run start:dev"
echo ""
