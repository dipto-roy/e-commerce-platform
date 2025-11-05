#!/bin/bash

# E2E Test Setup Script
# This script prepares the test database for E2E testing

set -e

echo "🚀 E2E Test Setup"
echo "=================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test database configuration
TEST_DB="e_commerce_test"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}Step 1: Checking PostgreSQL connection...${NC}"
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ Cannot connect to PostgreSQL${NC}"
  echo -e "${YELLOW}Please ensure PostgreSQL is running:${NC}"
  echo "  sudo systemctl start postgresql"
  echo "  sudo systemctl status postgresql"
  exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

echo -e "${BLUE}Step 2: Checking if test database exists...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $TEST_DB; then
  echo -e "${YELLOW}⚠️  Test database '$TEST_DB' already exists${NC}"
  read -p "Do you want to drop and recreate it? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Dropping existing test database...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $TEST_DB;"
    echo -e "${GREEN}✅ Dropped existing database${NC}"
  else
    echo -e "${BLUE}ℹ️  Using existing test database${NC}"
    echo ""
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo ""
    echo -e "${BLUE}Run tests with:${NC}"
    echo "  npm run test:e2e"
    exit 0
  fi
fi

echo -e "${BLUE}Step 3: Creating test database...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $TEST_DB;"; then
  echo -e "${GREEN}✅ Test database created successfully${NC}"
else
  echo -e "${RED}❌ Failed to create test database${NC}"
  exit 1
fi
echo ""

echo -e "${BLUE}Step 4: Granting permissions...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "GRANT ALL PRIVILEGES ON DATABASE $TEST_DB TO $DB_USER;"
echo -e "${GREEN}✅ Permissions granted${NC}"
echo ""

echo -e "${BLUE}Step 5: Verifying test database...${NC}"
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TEST_DB -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Test database is accessible${NC}"
else
  echo -e "${RED}❌ Cannot access test database${NC}"
  exit 1
fi
echo ""

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Test Database Configuration:${NC}"
echo "  Database: $TEST_DB"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Ensure backend is NOT running on port 4002"
echo "  2. Run tests: ${GREEN}npm run test:e2e${NC}"
echo ""
echo -e "${YELLOW}Note:${NC} Schema will be auto-created on first test run (DB_SYNCHRONIZE=true)"
echo ""
echo -e "${GREEN}Happy Testing! 🧪${NC}"
