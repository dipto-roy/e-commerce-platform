import { sleep, group } from 'k6';
import config from './config.js';
import * as helpers from './helpers.js';

// Test configuration
export const options = {
  stages: config.stages.load,
  thresholds: config.thresholds,
};

// Setup
export function setup() {
  console.log('📊 Starting load test...');
  
  const health = helpers.healthCheck();
  console.log(`✅ Health check: ${health.status}`);
  
  // Pre-create test tokens
  const adminToken = helpers.login(config.adminUser.email, config.adminUser.password);
  const sellerToken = helpers.login(config.sellerUser.email, config.sellerUser.password);
  const buyerToken = helpers.login(config.buyerUser.email, config.buyerUser.password);
  
  return {
    startTime: new Date().toISOString(),
    adminToken,
    sellerToken,
    buyerToken
  };
}

// Main test scenarios
export default function(data) {
  // Simulate different user behaviors
  const scenario = Math.random();
  
  if (scenario < 0.6) {
    // 60% - Browse and search (public users)
    publicUserScenario();
  } else if (scenario < 0.85) {
    // 25% - Shopping flow (authenticated buyers)
    buyerScenario(data.buyerToken);
  } else {
    // 15% - Admin operations
    adminScenario(data.adminToken);
  }
}

// Public user browsing
function publicUserScenario() {
  group('Public Browsing', function() {
    // Browse products
    helpers.getProducts(1, 20);
    helpers.randomSleep(1, 3);
    
    // View random product
    const productId = Math.floor(Math.random() * 50) + 1;
    helpers.getProduct(productId);
    helpers.randomSleep(2, 4);
    
    // Search
    const queries = ['laptop', 'phone', 'tablet', 'camera', 'headphones'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    helpers.searchProducts(query);
    helpers.randomSleep(1, 2);
  });
}

// Authenticated buyer flow
function buyerScenario(token) {
  if (!token) {
    token = helpers.login(config.buyerUser.email, config.buyerUser.password);
  }
  
  group('Buyer Shopping Flow', function() {
    // Get profile
    helpers.getUserProfile(token);
    sleep(1);
    
    // Browse products
    helpers.getProducts(1, 20);
    sleep(2);
    
    // View product
    const productId = Math.floor(Math.random() * 50) + 1;
    helpers.getProduct(productId);
    sleep(2);
    
    // Get cart
    helpers.getCart(token);
    sleep(1);
    
    // Add to cart (simulate)
    helpers.addToCart(token, productId, 1);
    sleep(2);
    
    // View orders
    helpers.getOrders(token);
    sleep(1);
  });
}

// Admin operations
function adminScenario(token) {
  if (!token) {
    token = helpers.login(config.adminUser.email, config.adminUser.password);
  }
  
  group('Admin Operations', function() {
    // Get platform overview
    helpers.getPlatformOverview(token);
    sleep(2);
    
    // Get all payments
    helpers.getAllPayments(token, 1, 20);
    sleep(2);
    
    // Get products
    helpers.getProducts(1, 50);
    sleep(1);
  });
}

// Teardown
export function teardown(data) {
  console.log('✅ Load test completed');
  console.log(`Duration: ${data.startTime} to ${new Date().toISOString()}`);
}
