#!/bin/bash

# k6 API Load Testing Runner
# This script helps you run different types of load tests on your e-commerce API

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:4002/api/v1}"
ADMIN_EMAIL="${ADMIN_EMAIL:-Mridul@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
SELLER_EMAIL="${SELLER_EMAIL:-seller@example.com}"
SELLER_PASSWORD="${SELLER_PASSWORD:-password123}"
BUYER_EMAIL="${BUYER_EMAIL:-buyer@example.com}"
BUYER_PASSWORD="${BUYER_PASSWORD:-password123}"

# Export for k6
export API_URL
export ADMIN_EMAIL
export ADMIN_PASSWORD
export SELLER_EMAIL
export SELLER_PASSWORD
export BUYER_EMAIL
export BUYER_PASSWORD

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  E-Commerce API Load Testing with k6  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 is not installed${NC}"
    echo ""
    echo "Install k6:"
    echo "  macOS:   brew install k6"
    echo "  Ubuntu:  sudo gpg -k"
    echo "           sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69"
    echo "           echo \"deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main\" | sudo tee /etc/apt/sources.list.d/k6.list"
    echo "           sudo apt-get update"
    echo "           sudo apt-get install k6"
    echo "  Windows: choco install k6"
    echo "  Docker:  docker pull grafana/k6"
    echo ""
    echo "Or download from: https://k6.io/docs/get-started/installation/"
    exit 1
fi

echo -e "${GREEN}✅ k6 found: $(k6 version)${NC}"
echo ""

# Function to run test
run_test() {
    local test_file=$1
    local test_name=$2
    local output_file="results/${test_name}-$(date +%Y%m%d-%H%M%S).json"
    
    echo -e "${YELLOW}▶ Running ${test_name}...${NC}"
    echo -e "${BLUE}API URL: ${API_URL}${NC}"
    echo -e "${BLUE}Output: ${output_file}${NC}"
    echo ""
    
    mkdir -p results
    
    if k6 run --out json="${output_file}" "k6-tests/${test_file}"; then
        echo ""
        echo -e "${GREEN}✅ ${test_name} completed successfully${NC}"
        echo -e "${BLUE}Results saved to: ${output_file}${NC}"
        
        # Generate summary
        if command -v jq &> /dev/null; then
            echo ""
            echo -e "${YELLOW}📊 Quick Summary:${NC}"
            jq -r '.metrics | to_entries[] | select(.key | contains("http_")) | "\(.key): \(.value.values)"' "${output_file}" | head -10
        fi
    else
        echo ""
        echo -e "${RED}❌ ${test_name} failed${NC}"
        return 1
    fi
    
    echo ""
}

# Function to check API health
check_health() {
    echo -e "${YELLOW}🔍 Checking API health...${NC}"
    
    if curl -sf "${API_URL}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding${NC}"
        return 0
    else
        echo -e "${RED}❌ API is not responding at ${API_URL}${NC}"
        echo ""
        echo "Make sure your backend is running:"
        echo "  cd e-commerce_backend"
        echo "  npm run start:dev"
        return 1
    fi
}

# Show menu
show_menu() {
    echo -e "${BLUE}Select test type:${NC}"
    echo "  1) Smoke Test    - Quick test with 1 user (1 min)"
    echo "  2) Load Test     - Normal load with 10 users (9 min)"
    echo "  3) Stress Test   - High load up to 50 users (11 min)"
    echo "  4) Spike Test    - Sudden traffic spike (2 min)"
    echo "  5) All Tests     - Run all tests sequentially"
    echo "  6) Custom Test   - Run specific test file"
    echo "  7) Health Check  - Check API availability"
    echo "  8) Exit"
    echo ""
}

# Main menu loop
main() {
    while true; do
        show_menu
        read -p "Enter choice [1-8]: " choice
        echo ""
        
        case $choice in
            1)
                check_health && run_test "smoke-test.js" "smoke-test"
                ;;
            2)
                check_health && run_test "load-test.js" "load-test"
                ;;
            3)
                check_health && run_test "stress-test.js" "stress-test"
                ;;
            4)
                check_health && run_test "spike-test.js" "spike-test"
                ;;
            5)
                if check_health; then
                    echo -e "${YELLOW}Running all tests sequentially...${NC}"
                    echo ""
                    run_test "smoke-test.js" "smoke-test"
                    sleep 5
                    run_test "load-test.js" "load-test"
                    sleep 5
                    run_test "stress-test.js" "stress-test"
                    sleep 5
                    run_test "spike-test.js" "spike-test"
                    echo ""
                    echo -e "${GREEN}✅ All tests completed${NC}"
                fi
                ;;
            6)
                read -p "Enter test file name (e.g., smoke-test.js): " test_file
                read -p "Enter test name: " test_name
                check_health && run_test "${test_file}" "${test_name}"
                ;;
            7)
                check_health
                ;;
            8)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid choice. Please try again.${NC}"
                echo ""
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        clear
    done
}

# Quick run mode (non-interactive)
if [ $# -gt 0 ]; then
    case $1 in
        smoke)
            check_health && run_test "smoke-test.js" "smoke-test"
            ;;
        load)
            check_health && run_test "load-test.js" "load-test"
            ;;
        stress)
            check_health && run_test "stress-test.js" "stress-test"
            ;;
        spike)
            check_health && run_test "spike-test.js" "spike-test"
            ;;
        all)
            if check_health; then
                run_test "smoke-test.js" "smoke-test"
                sleep 5
                run_test "load-test.js" "load-test"
                sleep 5
                run_test "stress-test.js" "stress-test"
                sleep 5
                run_test "spike-test.js" "spike-test"
            fi
            ;;
        health)
            check_health
            ;;
        *)
            echo -e "${RED}Unknown test type: $1${NC}"
            echo "Usage: $0 [smoke|load|stress|spike|all|health]"
            exit 1
            ;;
    esac
else
    # Interactive mode
    clear
    main
fi
