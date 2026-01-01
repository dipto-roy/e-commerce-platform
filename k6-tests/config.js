// k6 Test Configuration
export const config = {
  // Base URL configuration
  baseUrl: __ENV.API_URL || 'http://localhost:4002/api/v1',
  
  // Test user credentials
  adminUser: {
    email: __ENV.ADMIN_EMAIL || 'Mridul@example.com',
    password: __ENV.ADMIN_PASSWORD || 'password123'
  },
  
  sellerUser: {
    email: __ENV.SELLER_EMAIL || 'seller@example.com',
    password: __ENV.SELLER_PASSWORD || 'password123'
  },
  
  buyerUser: {
    email: __ENV.BUYER_EMAIL || 'buyer@example.com',
    password: __ENV.BUYER_PASSWORD || 'password123'
  },
  
  // Test thresholds
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],                   // Error rate should be less than 10%
    http_reqs: ['rate>10'],                          // Should handle more than 10 req/s
  },
  
  // Load test stages
  stages: {
    smoke: [
      { duration: '1m', target: 1 }  // 1 VU for 1 minute
    ],
    load: [
      { duration: '2m', target: 10 },  // Ramp up to 10 VUs
      { duration: '5m', target: 10 },  // Stay at 10 VUs
      { duration: '2m', target: 0 }    // Ramp down
    ],
    stress: [
      { duration: '2m', target: 20 },  // Ramp up to 20 VUs
      { duration: '5m', target: 20 },  // Stay at 20 VUs
      { duration: '2m', target: 50 },  // Spike to 50 VUs
      { duration: '2m', target: 20 },  // Drop back
      { duration: '2m', target: 0 }    // Ramp down
    ],
    spike: [
      { duration: '10s', target: 5 },   // Normal load
      { duration: '30s', target: 100 }, // Sudden spike
      { duration: '1m', target: 5 },    // Back to normal
      { duration: '10s', target: 0 }    // Cool down
    ],
    soak: [
      { duration: '5m', target: 10 },   // Ramp up
      { duration: '3h', target: 10 },   // Stay for 3 hours
      { duration: '5m', target: 0 }     // Ramp down
    ]
  }
};

export default config;
