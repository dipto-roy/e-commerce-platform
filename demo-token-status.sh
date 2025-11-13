#!/bin/bash

# Token Status Component Demo Script
# This script demonstrates the token refresh system visually

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Clear screen
clear

# Print banner
echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    Token Refresh System - Visual Demonstration               ║"
echo "║                                                               ║"
echo "║    This demo shows how automatic token refresh works         ║"
echo "║    with the TokenStatus UI component                         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Function to draw token status UI
draw_token_status() {
    local status=$1
    local time=$2
    local percent=$3
    
    case $status in
        "valid")
            icon="✅"
            color="${GREEN}"
            text="Token Valid"
            ;;
        "refreshing")
            icon="🔄"
            color="${BLUE}"
            text="Refreshing..."
            ;;
        "expired")
            icon="⚠️"
            color="${RED}"
            text="Token Expired"
            ;;
        "warning")
            icon="✅•"
            color="${YELLOW}"
            text="Token Valid (expires soon)"
            ;;
    esac
    
    echo -e "${color}${BOLD}"
    echo "┌────────────────────────────────────────┐"
    echo "│ ${icon} ${text}$(printf '%*s' $((33-${#text})) '')│"
    
    if [ -n "$time" ]; then
        echo "│ Last refresh: $(date +%T)$(printf '%*s' 14 '')│"
        echo "│ Time remaining: ${time}$(printf '%*s' $((20-${#time})) '')│"
    fi
    
    if [ -n "$percent" ]; then
        local bars=$((percent / 5))
        local spaces=$((20 - bars))
        echo -n "│ "
        for ((i=0; i<bars; i++)); do echo -n "█"; done
        for ((i=0; i<spaces; i++)); do echo -n "░"; done
        echo " ${percent}%$(printf '%*s' 3 '')│"
    fi
    
    echo "└────────────────────────────────────────┘"
    echo -e "${NC}"
}

# Function to simulate API request
simulate_api_request() {
    local url=$1
    echo -e "${CYAN}🚀 API Request: ${BOLD}GET ${url}${NC}"
    sleep 0.5
}

# Function to show console log
show_log() {
    local type=$1
    local message=$2
    
    case $type in
        "success")
            echo -e "${GREEN}✅ ${message}${NC}"
            ;;
        "error")
            echo -e "${RED}❌ ${message}${NC}"
            ;;
        "info")
            echo -e "${BLUE}🔄 ${message}${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  ${message}${NC}"
            ;;
    esac
}

# Start demo
echo -e "${BOLD}Demo Scenario: User navigates through the application${NC}"
echo ""
sleep 2

# Step 1: Initial login
echo -e "${MAGENTA}${BOLD}═══ Step 1: User logs in ═══${NC}"
echo ""
show_log "success" "Login successful"
show_log "info" "Access token expires in: 15:00"
show_log "info" "Refresh token expires in: 7 days"
echo ""
draw_token_status "valid" "15:00" "100"
echo ""
read -p "Press Enter to continue..."
clear

# Step 2: Making requests
echo -e "${MAGENTA}${BOLD}═══ Step 2: User browses products (14 minutes later) ═══${NC}"
echo ""
simulate_api_request "/api/v1/products"
show_log "success" "API Response: 200 OK"
echo ""
draw_token_status "valid" "01:00" "7"
echo ""
read -p "Press Enter to continue..."
clear

# Step 3: Warning state
echo -e "${MAGENTA}${BOLD}═══ Step 3: Token expires in 30 seconds ═══${NC}"
echo ""
show_log "warning" "Token expires soon - warning indicator appears"
echo ""
draw_token_status "warning" "00:30" "3"
echo ""
echo -e "${YELLOW}${BOLD}Notice:${NC}"
echo "- Progress bar turns orange"
echo "- Pulsing indicator appears"
echo "- User continues working normally"
echo ""
read -p "Press Enter to continue..."
clear

# Step 4: Token expired, automatic refresh
echo -e "${MAGENTA}${BOLD}═══ Step 4: Token expired - Automatic refresh triggered ═══${NC}"
echo ""
echo -e "${BOLD}User clicks 'Add to Cart' button...${NC}"
echo ""
simulate_api_request "/api/v1/cart/add"
show_log "error" "API Response Error: 401 Unauthorized"
echo ""
show_log "info" "Access token expired, attempting to refresh..."
echo ""
draw_token_status "refreshing" "" ""
echo ""
sleep 2

echo -e "${BOLD}Axios interceptor calls /auth/refresh...${NC}"
echo ""
simulate_api_request "/api/v1/auth/refresh"
sleep 1
show_log "success" "Token refresh successful"
show_log "info" "New access token received (15:00 validity)"
show_log "info" "Old refresh token revoked"
echo ""
draw_token_status "valid" "15:00" "100"
echo ""
sleep 1

echo -e "${BOLD}Retrying original request...${NC}"
echo ""
simulate_api_request "/api/v1/cart/add"
show_log "success" "API Response: 200 OK"
show_log "success" "Product added to cart"
echo ""
read -p "Press Enter to continue..."
clear

# Step 5: Final summary
echo -e "${MAGENTA}${BOLD}═══ Step 5: Summary ═══${NC}"
echo ""
echo -e "${GREEN}${BOLD}✅ What happened:${NC}"
echo ""
echo "1. User tried to add product to cart"
echo "2. Access token had expired (401 error)"
echo "3. Axios interceptor caught the error"
echo "4. TokenStatus showed 'Refreshing...' status"
echo "5. Interceptor called /auth/refresh automatically"
echo "6. Backend issued new token pair"
echo "7. Original request retried successfully"
echo "8. TokenStatus reset to 15:00 countdown"
echo "9. User saw product added successfully"
echo ""
echo -e "${CYAN}${BOLD}Result: Zero user interruption! 🎉${NC}"
echo ""
draw_token_status "valid" "15:00" "100"
echo ""
read -p "Press Enter to see console output comparison..."
clear

# Step 6: Console output comparison
echo -e "${MAGENTA}${BOLD}═══ Console Output Comparison ═══${NC}"
echo ""
echo -e "${RED}${BOLD}WITHOUT automatic refresh:${NC}"
echo -e "${RED}❌ API Response Error: 401 Unauthorized"
echo -e "❌ User sees error message"
echo -e "❌ Must manually log in again"
echo -e "❌ Lost cart data"
echo -e "❌ Poor user experience${NC}"
echo ""
echo -e "${GREEN}${BOLD}WITH automatic refresh:${NC}"
echo -e "${GREEN}❌ API Response Error: 401 Unauthorized"
echo -e "🔄 Access token expired, attempting to refresh..."
echo -e "✅ Token refresh successful, retrying original request"
echo -e "✅ API Response: 200 /api/v1/cart/add"
echo -e "✅ User continues seamlessly${NC}"
echo ""
read -p "Press Enter to see integration examples..."
clear

# Step 7: Integration examples
echo -e "${MAGENTA}${BOLD}═══ How to Use TokenStatus Component ═══${NC}"
echo ""
echo -e "${BOLD}1. Minimal View (Navigation Bar):${NC}"
echo ""
echo -e "${CYAN}"
cat << 'EOF'
import TokenStatus from '@/components/TokenStatus';

<nav>
  <div className="flex items-center gap-4">
    <Logo />
    <Links />
    <TokenStatus />  {/* Just the icon */}
    <Profile />
  </div>
</nav>
EOF
echo -e "${NC}"
echo ""
echo -e "${BOLD}Visual result:${NC}"
echo "┌─────────────────────────────────────┐"
echo "│ Logo  Home  Products  ✅  Profile  │"
echo "└─────────────────────────────────────┘"
echo ""
read -p "Press Enter to see next example..."
clear

echo -e "${MAGENTA}${BOLD}═══ How to Use TokenStatus Component ═══${NC}"
echo ""
echo -e "${BOLD}2. Detailed View (Dashboard):${NC}"
echo ""
echo -e "${CYAN}"
cat << 'EOF'
import TokenStatus from '@/components/TokenStatus';

<div className="dashboard">
  <TokenStatus showDetails={true} />
  <StatsCards />
  <Charts />
</div>
EOF
echo -e "${NC}"
echo ""
echo -e "${BOLD}Visual result:${NC}"
echo ""
draw_token_status "valid" "14:35" "97"
echo ""
read -p "Press Enter to see testing instructions..."
clear

# Step 8: Testing instructions
echo -e "${MAGENTA}${BOLD}═══ Quick Testing Instructions ═══${NC}"
echo ""
echo -e "${BOLD}Option 1: Automated Test (30 seconds)${NC}"
echo -e "${CYAN}"
echo "cd /home/dip-roy/e-commerce_project"
echo "./test-token-refresh.sh"
echo -e "${NC}"
echo ""
echo -e "${BOLD}Option 2: Quick Manual Test (30 seconds)${NC}"
echo -e "${CYAN}"
echo "# 1. Edit backend .env"
echo 'echo "JWT_ACCESS_EXPIRES_IN=30s" >> backend/.env'
echo ""
echo "# 2. Restart backend"
echo "npm run start:dev"
echo ""
echo "# 3. Login to frontend"
echo ""
echo "# 4. Watch TokenStatus countdown from 0:30"
echo ""
echo "# 5. Click any button when it reaches 0:00"
echo ""
echo "# 6. See automatic refresh in action!"
echo -e "${NC}"
echo ""
echo -e "${BOLD}Option 3: Real-World Test (15 minutes)${NC}"
echo -e "${CYAN}"
echo "# 1. Login to application"
echo "# 2. Wait 15 minutes"
echo "# 3. Click any button"
echo "# 4. Check console for automatic refresh logs"
echo "# 5. User experience: no interruption!"
echo -e "${NC}"
echo ""
read -p "Press Enter to see implementation summary..."
clear

# Step 9: Implementation summary
echo -e "${MAGENTA}${BOLD}═══ Implementation Summary ═══${NC}"
echo ""
echo -e "${GREEN}${BOLD}✅ What was built:${NC}"
echo ""
echo "1. Automatic token refresh in axios interceptor"
echo "   - Detects 401 errors"
echo "   - Calls /auth/refresh automatically"
echo "   - Retries original request"
echo "   - Queues concurrent requests"
echo ""
echo "2. TokenStatus UI component"
echo "   - Real-time countdown timer"
echo "   - Progress bar visualization"
echo "   - Color-coded status (green/blue/red)"
echo "   - Warning indicators"
echo "   - Two display modes (minimal/detailed)"
echo ""
echo "3. Event-driven updates"
echo "   - token-refreshing event"
echo "   - token-refreshed event"
echo "   - token-expired event"
echo ""
echo "4. Comprehensive documentation"
echo "   - Technical implementation guide"
echo "   - UI component usage guide"
echo "   - Testing procedures"
echo "   - Integration examples"
echo ""
echo -e "${CYAN}${BOLD}📁 Files created/modified:${NC}"
echo ""
echo "✅ /e-commerce-frontend/src/utils/api.ts (modified)"
echo "✅ /e-commerce-frontend/src/contexts/AuthContextNew.tsx (modified)"
echo "✅ /e-commerce-frontend/src/components/TokenStatus.tsx (new)"
echo "✅ TOKEN_REFRESH_IMPLEMENTATION.md (600+ lines)"
echo "✅ TOKEN_STATUS_UI_GUIDE.md (500+ lines)"
echo "✅ TOKEN_SYSTEM_COMPLETE_SUMMARY.md (400+ lines)"
echo "✅ TOKEN_QUICK_REFERENCE.md (200+ lines)"
echo "✅ test-token-refresh.sh (250+ lines)"
echo ""
echo -e "${GREEN}${BOLD}🎯 Key Benefits:${NC}"
echo ""
echo "✅ Seamless user experience (no interruptions)"
echo "✅ Real-time visual feedback"
echo "✅ Automatic background refresh"
echo "✅ Security maintained (HTTP-only cookies + rotation)"
echo "✅ Easy to integrate (just import component)"
echo "✅ Production ready"
echo ""
echo -e "${MAGENTA}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}Status: ✅ Complete and ready for production!${NC}"
echo -e "${MAGENTA}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Final message
echo -e "${BOLD}Next steps:${NC}"
echo ""
echo "1. Run automated tests: ${CYAN}./test-token-refresh.sh${NC}"
echo "2. Add TokenStatus to your dashboards"
echo "3. Test with 30-second tokens for quick validation"
echo "4. Deploy to production with 15-minute tokens"
echo ""
echo -e "${GREEN}${BOLD}Thank you for watching this demonstration! 🚀${NC}"
echo ""
