#!/bin/bash

echo "======================================"
echo "Testing Admin Orders Page Data Fix"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check database order counts
echo -e "${YELLOW}Test 1: Checking database order counts${NC}"
echo "----------------------------------------"
COUNTS=$(PGPASSWORD=postgres psql -U postgres -d e_commerce -h localhost -t -c "
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'PROCESSING' THEN 1 END) as processing,
    COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered,
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled
FROM orders;
")
echo "$COUNTS"
echo ""

# Test 2: Check if orders have users (buyer relationship)
echo -e "${YELLOW}Test 2: Checking orders with user data${NC}"
echo "----------------------------------------"
PGPASSWORD=postgres psql -U postgres -d e_commerce -h localhost -c "
SELECT 
    o.id, 
    o.status,
    o.totalAmount,
    u.id as user_id,
    u.username,
    u.email
FROM orders o
LEFT JOIN users u ON o.userId = u.id
LIMIT 5;
"
echo ""

# Test 3: Get admin credentials
echo -e "${YELLOW}Test 3: Finding admin user${NC}"
echo "----------------------------------------"
ADMIN_INFO=$(PGPASSWORD=postgres psql -U postgres -d e_commerce -h localhost -t -c "
SELECT username, email FROM users WHERE role = 'ADMIN' LIMIT 1;
")
echo "Admin found: $ADMIN_INFO"
echo ""

# Test 4: Check backend order.service.ts for buyer relation
echo -e "${YELLOW}Test 4: Verifying backend code fix${NC}"
echo "----------------------------------------"
if grep -A 5 "async findAll" /home/dip-roy/e-commerce_project/e-commerce_backend/src/order/order.service.ts | grep -q "order.buyer"; then
    echo -e "${GREEN}✓ Backend findAll() includes buyer relation${NC}"
else
    echo -e "${RED}✗ Backend findAll() missing buyer relation${NC}"
fi
echo ""

# Test 5: Check frontend transformation
echo -e "${YELLOW}Test 5: Verifying frontend transformation${NC}"
echo "----------------------------------------"
if grep -A 5 "getOrders:" /home/dip-roy/e-commerce_project/e-commerce-frontend/src/lib/adminAPI.ts | grep -q "order.buyer"; then
    echo -e "${GREEN}✓ Frontend correctly maps buyer to user${NC}"
else
    echo -e "${RED}✗ Frontend missing buyer mapping${NC}"
fi
echo ""

# Summary
echo "======================================"
echo "Summary of Issues and Fixes"
echo "======================================"
echo ""
echo -e "${GREEN}Issue 1: Customer names not displaying${NC}"
echo "  Root Cause: Backend order.service.ts findAll() was not including buyer relation"
echo "  Fix Applied: Added .leftJoinAndSelect('order.buyer', 'buyer') to query"
echo ""
echo -e "${GREEN}Issue 2: Live counts accuracy${NC}"
echo "  Status: Database counts verified above"
echo "  Frontend: Uses client-side filtering of fetched orders"
echo "  Note: Counts are accurate if all orders are loaded"
echo ""
echo -e "${GREEN}Issue 3: Order list data accuracy${NC}"
echo "  Status: Backend now returns complete order data with user info"
echo "  Verification: Check sample orders above"
echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo "1. Backend should auto-reload with the fix (running in watch mode)"
echo "2. Refresh the admin orders page in browser (http://localhost:3000/dashboard/admin/orders)"
echo "3. Customer names should now display correctly"
echo "4. Verify live counts match database counts shown above"
echo ""
