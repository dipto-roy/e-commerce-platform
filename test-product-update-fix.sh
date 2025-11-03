#!/bin/bash

# Test Product Update Fix
# This script verifies that product updates work correctly

echo "================================================"
echo "Testing Product Update Fix"
echo "================================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:4002/api/v1"

echo ""
echo "${BLUE}Step 1: Login as admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "${RED}✗ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo "${GREEN}✓ Login successful${NC}"

echo ""
echo "${BLUE}Step 2: Get first product for testing${NC}"
PRODUCTS_RESPONSE=$(curl -s -X GET "$BACKEND_URL/products" \
  -H "Authorization: Bearer $TOKEN")

PRODUCT_ID=$(echo $PRODUCTS_RESPONSE | jq -r '.[0].id')
PRODUCT_NAME=$(echo $PRODUCTS_RESPONSE | jq -r '.[0].name')
PRODUCT_CATEGORY=$(echo $PRODUCTS_RESPONSE | jq -r '.[0].category')
PRODUCT_STOCK=$(echo $PRODUCTS_RESPONSE | jq -r '.[0].stockQuantity')

echo "Product ID: $PRODUCT_ID"
echo "Current Name: $PRODUCT_NAME"
echo "Current Category: $PRODUCT_CATEGORY"
echo "Current Stock: $PRODUCT_STOCK"

echo ""
echo "${BLUE}Step 3: Test update with 'stock' field (UpdateProductDto format)${NC}"
UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BACKEND_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Product",
    "description": "This is an updated test product",
    "price": 99.99,
    "stock": 25,
    "category": "Electronics",
    "isActive": true
  }')

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo "${GREEN}✓ Update successful (HTTP $HTTP_CODE)${NC}"
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.'
else
  echo "${RED}✗ Update failed (HTTP $HTTP_CODE)${NC}"
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.'
  exit 1
fi

echo ""
echo "${BLUE}Step 4: Verify the update${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$BACKEND_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN")

UPDATED_NAME=$(echo $VERIFY_RESPONSE | jq -r '.name')
UPDATED_CATEGORY=$(echo $VERIFY_RESPONSE | jq -r '.category')
UPDATED_STOCK=$(echo $VERIFY_RESPONSE | jq -r '.stockQuantity')

echo "Updated Name: $UPDATED_NAME"
echo "Updated Category: $UPDATED_CATEGORY"
echo "Updated Stock: $UPDATED_STOCK"

if [ "$UPDATED_NAME" == "Updated Test Product" ] && [ "$UPDATED_CATEGORY" == "Electronics" ] && [ "$UPDATED_STOCK" == "25" ]; then
  echo "${GREEN}✓ All fields updated correctly${NC}"
else
  echo "${RED}✗ Some fields not updated correctly${NC}"
  exit 1
fi

echo ""
echo "${BLUE}Step 5: Test update with only category and stock${NC}"
PARTIAL_UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BACKEND_URL/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Home & Garden",
    "stock": 50
  }')

HTTP_CODE=$(echo "$PARTIAL_UPDATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$PARTIAL_UPDATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  echo "${GREEN}✓ Partial update successful (HTTP $HTTP_CODE)${NC}"
  
  # Verify partial update
  VERIFY_PARTIAL=$(curl -s -X GET "$BACKEND_URL/products/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  FINAL_CATEGORY=$(echo $VERIFY_PARTIAL | jq -r '.category')
  FINAL_STOCK=$(echo $VERIFY_PARTIAL | jq -r '.stockQuantity')
  
  echo "Final Category: $FINAL_CATEGORY"
  echo "Final Stock: $FINAL_STOCK"
  
  if [ "$FINAL_CATEGORY" == "Home & Garden" ] && [ "$FINAL_STOCK" == "50" ]; then
    echo "${GREEN}✓ Partial update verified${NC}"
  else
    echo "${RED}✗ Partial update verification failed${NC}"
  fi
else
  echo "${RED}✗ Partial update failed (HTTP $HTTP_CODE)${NC}"
  echo "Response:"
  echo "$RESPONSE_BODY" | jq '.'
fi

echo ""
echo "${BLUE}Step 6: Check all products for null categories and stocks${NC}"
NULL_CATEGORIES=$(echo $PRODUCTS_RESPONSE | jq '[.[] | select(.category == null)] | length')
NULL_STOCKS=$(echo $PRODUCTS_RESPONSE | jq '[.[] | select(.stockQuantity == null)] | length')

echo "Products with null category: $NULL_CATEGORIES"
echo "Products with null stock: $NULL_STOCKS"

if [ "$NULL_CATEGORIES" -gt 0 ] || [ "$NULL_STOCKS" -gt 0 ]; then
  echo "${RED}⚠ Warning: Some products have null values${NC}"
  echo "${BLUE}Showing first 3 products with null values:${NC}"
  echo $PRODUCTS_RESPONSE | jq '[.[] | select(.category == null or .stockQuantity == null)] | .[0:3] | .[] | {id, name, category, stockQuantity}'
else
  echo "${GREEN}✓ No products with null values${NC}"
fi

echo ""
echo "================================================"
echo "${GREEN}Product Update Test Complete!${NC}"
echo "================================================"
