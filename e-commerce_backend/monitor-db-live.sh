#!/bin/bash

# Real-time Database Monitoring Dashboard
# Shows live database metrics

MONITORING_URL="http://localhost:4002/api/v1/monitoring"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

while true; do
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          E-COMMERCE DATABASE MONITORING DASHBOARD              ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 Current Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Fetch metrics
    metrics=$(curl -s "$MONITORING_URL/db-metrics")
    health=$(curl -s "$MONITORING_URL/health")
    connection=$(curl -s "$MONITORING_URL/db-connection")
    
    # Parse metrics (using jq if available, otherwise grep)
    if command -v jq &> /dev/null; then
        total_queries=$(echo "$metrics" | jq -r '.metrics.totalQueries // 0')
        slow_queries=$(echo "$metrics" | jq -r '.metrics.slowQueries // 0')
        avg_time=$(echo "$metrics" | jq -r '.metrics.avgTime // 0')
        max_time=$(echo "$metrics" | jq -r '.metrics.maxTime // 0')
        min_time=$(echo "$metrics" | jq -r '.metrics.minTime // 0')
        total_time=$(echo "$metrics" | jq -r '.metrics.totalTime // 0')
        
        select_count=$(echo "$metrics" | jq -r '.metrics.queriesByType.SELECT // 0')
        insert_count=$(echo "$metrics" | jq -r '.metrics.queriesByType.INSERT // 0')
        update_count=$(echo "$metrics" | jq -r '.metrics.queriesByType.UPDATE // 0')
        delete_count=$(echo "$metrics" | jq -r '.metrics.queriesByType.DELETE // 0')
        
        db_status=$(echo "$health" | jq -r '.status // "unknown"')
        response_time=$(echo "$health" | jq -r '.responseTime // "N/A"')
        
        is_connected=$(echo "$connection" | jq -r '.isConnected // false')
        pool_total=$(echo "$connection" | jq -r '.pool.totalCount // 0')
        pool_idle=$(echo "$connection" | jq -r '.pool.idleCount // 0')
        pool_waiting=$(echo "$connection" | jq -r '.pool.waitingCount // 0')
    else
        echo -e "${RED}⚠️  jq not installed. Install with: sudo apt install jq${NC}"
        total_queries="N/A"
        slow_queries="N/A"
        avg_time="N/A"
        max_time="N/A"
        db_status="N/A"
    fi
    
    # Display Health Status
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  DATABASE HEALTH${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ "$db_status" = "healthy" ]; then
        echo -e "  Status:         ${GREEN}● HEALTHY${NC}"
    else
        echo -e "  Status:         ${RED}● UNHEALTHY${NC}"
    fi
    
    if [ "$is_connected" = "true" ]; then
        echo -e "  Connection:     ${GREEN}✓ Connected${NC}"
    else
        echo -e "  Connection:     ${RED}✗ Disconnected${NC}"
    fi
    
    echo -e "  Response Time:  ${response_time}"
    echo ""
    
    # Display Connection Pool
    if [ "$pool_total" != "0" ] && [ "$pool_total" != "null" ]; then
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}  CONNECTION POOL${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "  Total:          ${pool_total}"
        echo -e "  Idle:           ${GREEN}${pool_idle}${NC}"
        echo -e "  Active:         $((pool_total - pool_idle))"
        echo -e "  Waiting:        ${pool_waiting}"
        echo ""
    fi
    
    # Display Query Metrics
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  QUERY METRICS${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  Total Queries:  ${CYAN}${total_queries}${NC}"
    echo -e "  Total Time:     ${total_time}ms"
    echo -e "  Average Time:   ${avg_time}ms"
    echo -e "  Min Time:       ${GREEN}${min_time}ms${NC}"
    echo -e "  Max Time:       ${RED}${max_time}ms${NC}"
    
    if [ "$slow_queries" -gt 0 ] 2>/dev/null; then
        echo -e "  Slow Queries:   ${RED}${slow_queries}${NC} (>100ms)"
    else
        echo -e "  Slow Queries:   ${GREEN}${slow_queries}${NC} (>100ms)"
    fi
    echo ""
    
    # Display Query Types
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  QUERY TYPES${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  SELECT:         ${CYAN}${select_count}${NC}"
    echo -e "  INSERT:         ${GREEN}${insert_count}${NC}"
    echo -e "  UPDATE:         ${YELLOW}${update_count}${NC}"
    echo -e "  DELETE:         ${RED}${delete_count}${NC}"
    echo ""
    
    # Display controls
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Press Ctrl+C to exit | Updates every 2 seconds${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    sleep 2
done
