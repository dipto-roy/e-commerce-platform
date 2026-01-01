#!/bin/bash

# Backend Database Monitoring - Troubleshooting Script

echo "🔧 E-Commerce Backend Database Monitoring - Troubleshooter"
echo "=========================================================="
echo ""

# Check PostgreSQL
echo "1️⃣  Checking PostgreSQL..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL is running"
else
    echo "   ❌ PostgreSQL is NOT running"
    echo "   Fix: sudo systemctl start postgresql"
    exit 1
fi

# Check database connection
echo ""
echo "2️⃣  Checking database connection..."
if PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d e_commerce -c "SELECT 1" > /dev/null 2>&1; then
    echo "   ✅ Database 'e_commerce' is accessible"
else
    echo "   ❌ Cannot connect to database 'e_commerce'"
    echo "   Fix: Check your .env file DB credentials"
    exit 1
fi

# Check if backend is running
echo ""
echo "3️⃣  Checking backend status..."
BACKEND_PID=$(lsof -t -i:4002 2>/dev/null)
if [ -n "$BACKEND_PID" ]; then
    echo "   ✅ Backend is running (PID: $BACKEND_PID)"
else
    echo "   ❌ Backend is NOT running on port 4002"
    echo "   Fix: cd /home/dip-roy/e-commerce_project/e-commerce_backend && npm run start:dev"
    exit 1
fi

# Check monitoring endpoints
echo ""
echo "4️⃣  Checking monitoring endpoints..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4002/api/v1/monitoring/health 2>/dev/null)

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Monitoring endpoints are working!"
    echo ""
    echo "=========================================================="
    echo "✅ ALL CHECKS PASSED!"
    echo "=========================================================="
    echo ""
    echo "You can now use:"
    echo "  ./monitor-db-live.sh      - Live monitoring dashboard"
    echo "  ./test-db-load.sh         - Load testing"
    echo ""
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ⚠️  Backend is running but monitoring endpoints not found (404)"
    echo ""
    echo "=========================================================="
    echo "🔄 ACTION REQUIRED: Restart Backend"
    echo "=========================================================="
    echo ""
    echo "The monitoring module needs the backend to restart."
    echo ""
    echo "Steps to fix:"
    echo "  1. Stop the backend (Ctrl+C in the terminal running it)"
    echo "  2. cd /home/dip-roy/e-commerce_project/e-commerce_backend"
    echo "  3. npm run start:dev"
    echo "  4. Wait 10 seconds for it to fully start"
    echo "  5. Run this script again: ./troubleshoot-monitoring.sh"
    echo ""
    exit 1
else
    echo "   ❌ Backend returned unexpected status: $HTTP_CODE"
    echo "   The backend might be starting up or having issues"
    exit 1
fi
