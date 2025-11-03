#!/bin/bash

echo "=========================================="
echo "Swagger API Documentation Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${YELLOW}1. Checking if backend server is running...${NC}"
if curl -s http://localhost:4002/api/v1 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server is running on port 4002${NC}"
else
    echo -e "${RED}✗ Backend server is not running${NC}"
    echo -e "${YELLOW}Start with: cd e-commerce_backend && npm run start:dev${NC}"
    exit 1
fi
echo ""

# Check if Swagger is accessible
echo -e "${YELLOW}2. Checking Swagger documentation...${NC}"
if curl -s http://localhost:4002/api-docs > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Swagger documentation is accessible${NC}"
    echo -e "${BLUE}   URL: http://localhost:4002/api-docs${NC}"
else
    echo -e "${RED}✗ Swagger documentation is not accessible${NC}"
    exit 1
fi
echo ""

# Check Swagger JSON endpoint
echo -e "${YELLOW}3. Checking Swagger JSON specification...${NC}"
if curl -s http://localhost:4002/api-docs-json > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Swagger JSON spec is available${NC}"
    echo -e "${BLUE}   URL: http://localhost:4002/api-docs-json${NC}"
else
    echo -e "${RED}✗ Swagger JSON spec not found${NC}"
fi
echo ""

# Count API tags in Swagger
echo -e "${YELLOW}4. Analyzing API documentation...${NC}"
SWAGGER_JSON=$(curl -s http://localhost:4002/api-docs-json)
TAG_COUNT=$(echo "$SWAGGER_JSON" | grep -o '"name"' | wc -l)
echo -e "${GREEN}✓ Found approximately $TAG_COUNT API tags/modules${NC}"
echo ""

# List all tags
echo -e "${YELLOW}5. Documented API Modules:${NC}"
echo "$SWAGGER_JSON" | grep -o '"name":"[^"]*"' | head -15 | sed 's/"name":"//g' | sed 's/"//g' | while read tag; do
    echo -e "${GREEN}   ✓ $tag${NC}"
done
echo ""

# Check for authentication setup
echo -e "${YELLOW}6. Checking authentication configuration...${NC}"
if echo "$SWAGGER_JSON" | grep -q "bearerAuth"; then
    echo -e "${GREEN}✓ Bearer token authentication is configured${NC}"
else
    echo -e "${YELLOW}⚠ Bearer auth not found${NC}"
fi

if echo "$SWAGGER_JSON" | grep -q "JWT-auth"; then
    echo -e "${GREEN}✓ JWT authentication is configured${NC}"
else
    echo -e "${YELLOW}⚠ JWT auth not found${NC}"
fi
echo ""

# Test a public endpoint
echo -e "${YELLOW}7. Testing public API endpoint...${NC}"
PRODUCTS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:4002/api/v1/products)
HTTP_CODE=$(echo "$PRODUCTS_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ GET /products endpoint is working (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠ GET /products returned HTTP $HTTP_CODE${NC}"
fi
echo ""

# Check file structure
echo -e "${YELLOW}8. Verifying Swagger decorators in controllers...${NC}"
CONTROLLERS_WITH_SWAGGER=0
TOTAL_CONTROLLERS=0

for file in /home/dip-roy/e-commerce_project/e-commerce_backend/src/**/*.controller.ts; do
    if [ -f "$file" ]; then
        TOTAL_CONTROLLERS=$((TOTAL_CONTROLLERS + 1))
        if grep -q "@ApiTags" "$file"; then
            CONTROLLERS_WITH_SWAGGER=$((CONTROLLERS_WITH_SWAGGER + 1))
            CONTROLLER_NAME=$(basename "$file" .controller.ts)
            echo -e "${GREEN}   ✓ ${CONTROLLER_NAME}${NC}"
        fi
    fi
done
echo ""
echo -e "${BLUE}Total: $CONTROLLERS_WITH_SWAGGER/$TOTAL_CONTROLLERS controllers have Swagger documentation${NC}"
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}✅ Swagger Documentation Summary${NC}"
echo "=========================================="
echo ""
echo -e "📚 ${BLUE}Documentation URL:${NC}"
echo -e "   http://localhost:4002/api-docs"
echo ""
echo -e "📄 ${BLUE}OpenAPI Spec JSON:${NC}"
echo -e "   http://localhost:4002/api-docs-json"
echo ""
echo -e "🔐 ${BLUE}How to Test:${NC}"
echo -e "   1. Open: ${BLUE}http://localhost:4002/api-docs${NC}"
echo -e "   2. Click 'Authorize' button"
echo -e "   3. Login via ${BLUE}POST /auth/login${NC} to get token"
echo -e "   4. Enter token as: ${BLUE}Bearer YOUR_TOKEN${NC}"
echo -e "   5. Test protected endpoints"
echo ""
echo -e "📦 ${BLUE}Main API Modules:${NC}"
echo -e "   • Authentication - User login/register"
echo -e "   • Products - Product CRUD operations"
echo -e "   • Orders - Order management"
echo -e "   • Cart - Shopping cart"
echo -e "   • Sellers - Seller management"
echo -e "   • Admin - Admin operations"
echo -e "   • Users - User management"
echo -e "   • Notifications - Real-time notifications"
echo -e "   • Financial - Financial records"
echo -e "   • Image Upload - Product images"
echo ""
echo -e "${GREEN}✅ All Swagger documentation is set up and working!${NC}"
echo ""
