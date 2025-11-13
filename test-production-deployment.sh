#!/bin/bash

# ==============================================
# Production Deployment Testing Script
# ==============================================
# Tests all critical endpoints and functionality
# Usage: ./test-production-deployment.sh [BACKEND_URL] [FRONTEND_URL]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URLs (update these or pass as arguments)
BACKEND_URL="${1:-https://ecommerce-backend-prod.onrender.com}"
FRONTEND_URL="${2:-https://your-app.vercel.app}"
API_URL="$BACKEND_URL/api/v1"

# Test results
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

print_test() {
    echo -e "${BLUE}Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

# Start testing
print_header "🧪 Production Deployment Testing"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "API URL: $API_URL"
echo ""

# ==============================================
# TEST 1: Backend Health Check
# ==============================================
print_test "1. Backend Health & Connectivity"

BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$API_URL/auth/login")
if [ "$BACKEND_RESPONSE" = "401" ] || [ "$BACKEND_RESPONSE" = "400" ]; then
    print_success "Backend is UP and responding (HTTP $BACKEND_RESPONSE)"
else
    print_failure "Backend is not responding correctly (HTTP $BACKEND_RESPONSE)"
fi

# ==============================================
# TEST 2: Frontend Health Check
# ==============================================
print_test "2. Frontend Availability"

FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$FRONTEND_URL")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    print_success "Frontend is UP (HTTP $FRONTEND_RESPONSE)"
elif [ "$FRONTEND_RESPONSE" = "301" ] || [ "$FRONTEND_RESPONSE" = "302" ]; then
    print_warning "Frontend redirecting (HTTP $FRONTEND_RESPONSE)"
else
    print_failure "Frontend is not accessible (HTTP $FRONTEND_RESPONSE)"
fi

# ==============================================
# TEST 3: API Documentation
# ==============================================
print_test "3. API Documentation (Swagger)"

SWAGGER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$BACKEND_URL/api-docs")
if [ "$SWAGGER_RESPONSE" = "200" ] || [ "$SWAGGER_RESPONSE" = "301" ]; then
    print_success "API documentation accessible at $BACKEND_URL/api-docs"
else
    print_warning "API documentation not accessible (HTTP $SWAGGER_RESPONSE)"
fi

# ==============================================
# TEST 4: Database Connection
# ==============================================
print_test "4. Database Connection (via Auth)"

LOGIN_TEST=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' \
    -m 10)

if echo "$LOGIN_TEST" | grep -q "Invalid credentials\|User not found"; then
    print_success "Database connection working (auth responding)"
elif echo "$LOGIN_TEST" | grep -q "error\|timeout\|ECONNREFUSED"; then
    print_failure "Database connection failed"
    echo "Response: $LOGIN_TEST"
else
    print_warning "Unexpected auth response"
fi

# ==============================================
# TEST 5: CORS Configuration
# ==============================================
print_test "5. CORS Configuration"

CORS_TEST=$(curl -s -I -X OPTIONS "$API_URL/auth/login" \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: POST" \
    -m 10)

if echo "$CORS_TEST" | grep -qi "Access-Control-Allow-Origin"; then
    print_success "CORS configured correctly for $FRONTEND_URL"
else
    print_failure "CORS not configured or blocking requests"
fi

# ==============================================
# TEST 6: Public Endpoints
# ==============================================
print_test "6. Public Endpoints Accessibility"

# Test products endpoint
PRODUCTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/products?page=1&limit=10" -m 10)
if [ "$PRODUCTS_RESPONSE" = "200" ]; then
    print_success "Products endpoint accessible (HTTP $PRODUCTS_RESPONSE)"
else
    print_warning "Products endpoint issue (HTTP $PRODUCTS_RESPONSE)"
fi

# ==============================================
# TEST 7: SSL/HTTPS
# ==============================================
print_test "7. SSL/HTTPS Configuration"

if echo "$BACKEND_URL" | grep -q "https://"; then
    print_success "Backend using HTTPS"
else
    print_failure "Backend not using HTTPS"
fi

if echo "$FRONTEND_URL" | grep -q "https://"; then
    print_success "Frontend using HTTPS"
else
    print_failure "Frontend not using HTTPS"
fi

# ==============================================
# TEST 8: Response Time
# ==============================================
print_test "8. API Response Time"

START_TIME=$(date +%s%N)
curl -s -o /dev/null "$API_URL/products?page=1&limit=5" -m 10
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( ($END_TIME - $START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 1000 ]; then
    print_success "Response time is good (${RESPONSE_TIME}ms)"
elif [ $RESPONSE_TIME -lt 3000 ]; then
    print_warning "Response time is acceptable (${RESPONSE_TIME}ms)"
else
    print_failure "Response time is slow (${RESPONSE_TIME}ms)"
fi

# ==============================================
# TEST 9: File Upload Endpoint
# ==============================================
print_test "9. File Upload Endpoint"

UPLOAD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/products" -m 10)
if [ "$UPLOAD_RESPONSE" = "401" ] || [ "$UPLOAD_RESPONSE" = "403" ]; then
    print_success "Upload endpoint protected (requires auth)"
elif [ "$UPLOAD_RESPONSE" = "500" ]; then
    print_failure "Upload endpoint error (HTTP 500)"
else
    print_warning "Upload endpoint response: HTTP $UPLOAD_RESPONSE"
fi

# ==============================================
# TEST 10: Environment Variables
# ==============================================
print_test "10. Critical Environment Variables"

# Test if Stripe is configured (webhook endpoint exists)
STRIPE_WEBHOOK=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/payments/webhook" -m 10)
if [ "$STRIPE_WEBHOOK" = "400" ] || [ "$STRIPE_WEBHOOK" = "401" ]; then
    print_success "Stripe webhook endpoint exists"
else
    print_warning "Stripe webhook endpoint may not be configured"
fi

# ==============================================
# TEST 11: Rate Limiting
# ==============================================
print_test "11. Rate Limiting"

# Make multiple rapid requests
for i in {1..5}; do
    curl -s -o /dev/null "$API_URL/products" -m 5 &
done
wait

RATE_LIMIT_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/products" -m 10)
if [ "$RATE_LIMIT_TEST" = "429" ]; then
    print_success "Rate limiting is active"
elif [ "$RATE_LIMIT_TEST" = "200" ]; then
    print_warning "Rate limiting may not be configured"
else
    print_warning "Rate limiting status unclear"
fi

# ==============================================
# TEST 12: Frontend Assets
# ==============================================
print_test "12. Frontend Static Assets"

# Check if CSS loads
CSS_TEST=$(curl -s -L "$FRONTEND_URL" | grep -o '<link.*stylesheet' | head -1)
if [ ! -z "$CSS_TEST" ]; then
    print_success "Frontend CSS assets loading"
else
    print_warning "Frontend CSS may not be loading"
fi

# ==============================================
# TEST 13: API Routes
# ==============================================
print_test "13. Critical API Routes"

# List of critical endpoints to test
endpoints=(
    "/auth/login:POST"
    "/products:GET"
    "/admin/stats:GET"
)

for endpoint_method in "${endpoints[@]}"; do
    IFS=':' read -r endpoint method <<< "$endpoint_method"
    
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint" -m 10)
    else
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_URL$endpoint" -m 10)
    fi
    
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "400" ]; then
        echo "  ✓ $endpoint ($method): HTTP $RESPONSE"
    else
        echo "  ✗ $endpoint ($method): HTTP $RESPONSE"
    fi
done

# ==============================================
# SUMMARY
# ==============================================
print_header "📊 Test Summary"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

# Calculate success rate
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "Success Rate: $SUCCESS_RATE%"
fi

echo ""
echo "=========================================="

# Exit with appropriate code
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "Your deployment is ready for use:"
    echo "  Frontend: $FRONTEND_URL"
    echo "  Backend API: $API_URL"
    echo "  API Docs: $BACKEND_URL/api-docs"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
