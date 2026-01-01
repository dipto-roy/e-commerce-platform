import { sleep } from 'k6';
import config from './config.js';
import * as helpers from './helpers.js';

// Test configuration
export const options = {
  stages: config.stages.smoke,
  thresholds: config.thresholds,
};

// Setup: Runs once before test
export function setup() {
  console.log('🔥 Starting smoke test...');
  
  // Health check before starting
  const health = helpers.healthCheck();
  console.log(`✅ Health check: ${health.status}`);
  
  return {
    startTime: new Date().toISOString()
  };
}

// Main test function
export default function(data) {
  // 1. Health check
  helpers.healthCheck();
  sleep(1);
  
  // 2. Browse products (public)
  helpers.getProducts(1, 10);
  sleep(1);
  
  // 3. Search products
  helpers.searchProducts('laptop');
  sleep(1);
  
  // 4. Login as buyer
  const buyerToken = helpers.login(
    config.buyerUser.email,
    config.buyerUser.password
  );
  sleep(1);
  
  if (buyerToken) {
    // 5. Get user profile
    helpers.getUserProfile(buyerToken);
    sleep(1);
    
    // 6. Get cart
    helpers.getCart(buyerToken);
    sleep(1);
    
    // 7. Get orders
    helpers.getOrders(buyerToken);
    sleep(2);
  }
}

// Teardown: Runs once after test
export function teardown(data) {
  console.log('✅ Smoke test completed');
  console.log(`Started at: ${data.startTime}`);
  console.log(`Ended at: ${new Date().toISOString()}`);
}
