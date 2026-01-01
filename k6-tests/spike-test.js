import { sleep, group } from 'k6';
import config from './config.js';
import * as helpers from './helpers.js';

// Spike test - sudden traffic surge
export const options = {
  stages: config.stages.spike,
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Very lenient for spike
    http_req_failed: ['rate<0.3'],      // Allow 30% error rate during spike
  },
};

export function setup() {
  console.log('⚡ Starting spike test...');
  console.log('This will simulate sudden traffic surge');
  
  const health = helpers.healthCheck();
  console.log(`✅ Health check: ${health.status}`);
  
  return {
    startTime: new Date().toISOString(),
    buyerToken: helpers.login(config.buyerUser.email, config.buyerUser.password)
  };
}

export default function(data) {
  // Simple rapid-fire scenario
  group('Spike Traffic', function() {
    helpers.healthCheck();
    sleep(0.2);
    
    helpers.getProducts(1, 20);
    sleep(0.2);
    
    const productId = Math.floor(Math.random() * 50) + 1;
    helpers.getProduct(productId);
    sleep(0.2);
    
    if (data.buyerToken && Math.random() < 0.5) {
      helpers.getCart(data.buyerToken);
      sleep(0.2);
    }
  });
}

export function teardown(data) {
  console.log('✅ Spike test completed');
  console.log(`Duration: ${data.startTime} to ${new Date().toISOString()}`);
  console.log('Check if the system recovered from the spike');
}
