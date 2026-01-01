import { sleep, group } from 'k6';
import config from './config.js';
import * as helpers from './helpers.js';

// Stress test configuration - pushes limits
export const options = {
  stages: config.stages.stress,
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // More lenient for stress
    http_req_failed: ['rate<0.2'],                    // Allow 20% error rate
    http_reqs: ['rate>5'],
  },
};

export function setup() {
  console.log('💪 Starting stress test...');
  
  const health = helpers.healthCheck();
  console.log(`✅ Health check: ${health.status}`);
  
  return {
    startTime: new Date().toISOString(),
    adminToken: helpers.login(config.adminUser.email, config.adminUser.password),
    buyerToken: helpers.login(config.buyerUser.email, config.buyerUser.password)
  };
}

export default function(data) {
  // High-intensity mixed scenarios
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% - Rapid browsing
    rapidBrowsing();
  } else if (scenario < 0.7) {
    // 30% - Heavy buyer activity
    heavyBuyerActivity(data.buyerToken);
  } else if (scenario < 0.9) {
    // 20% - Search intensive
    searchIntensive();
  } else {
    // 10% - Admin heavy operations
    adminHeavyOps(data.adminToken);
  }
}

function rapidBrowsing() {
  group('Rapid Browsing', function() {
    // Multiple rapid requests
    for (let i = 0; i < 5; i++) {
      helpers.getProducts(Math.floor(Math.random() * 10) + 1, 20);
      sleep(0.5);
    }
    
    // Rapid product views
    for (let i = 0; i < 3; i++) {
      const productId = Math.floor(Math.random() * 100) + 1;
      helpers.getProduct(productId);
      sleep(0.3);
    }
  });
}

function heavyBuyerActivity(token) {
  if (!token) {
    token = helpers.login(config.buyerUser.email, config.buyerUser.password);
  }
  
  group('Heavy Buyer Activity', function() {
    helpers.getUserProfile(token);
    sleep(0.5);
    
    helpers.getCart(token);
    sleep(0.5);
    
    helpers.getOrders(token, 1, 50);
    sleep(0.5);
    
    // Multiple cart operations
    for (let i = 0; i < 3; i++) {
      const productId = Math.floor(Math.random() * 50) + 1;
      helpers.addToCart(token, productId, Math.floor(Math.random() * 3) + 1);
      sleep(0.5);
    }
  });
}

function searchIntensive() {
  group('Search Intensive', function() {
    const queries = [
      'laptop', 'phone', 'tablet', 'camera', 'headphones',
      'keyboard', 'mouse', 'monitor', 'printer', 'speaker'
    ];
    
    // Rapid fire searches
    for (let i = 0; i < 5; i++) {
      const query = queries[Math.floor(Math.random() * queries.length)];
      helpers.searchProducts(query);
      sleep(0.3);
    }
  });
}

function adminHeavyOps(token) {
  if (!token) {
    token = helpers.login(config.adminUser.email, config.adminUser.password);
  }
  
  group('Admin Heavy Operations', function() {
    helpers.getPlatformOverview(token);
    sleep(0.5);
    
    helpers.getAllPayments(token, 1, 100);
    sleep(0.5);
    
    helpers.getProducts(1, 100);
    sleep(0.5);
  });
}

export function teardown(data) {
  console.log('✅ Stress test completed');
  console.log(`Duration: ${data.startTime} to ${new Date().toISOString()}`);
}
