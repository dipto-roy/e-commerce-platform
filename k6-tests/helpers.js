import { check, sleep } from 'k6';
import http from 'k6/http';
import config from './config.js';

// Helper function to create headers with auth token
export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Login function
export function login(email, password) {
  const url = `${config.baseUrl}/auth/login`;
  const payload = JSON.stringify({ email, password });
  
  const response = http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'Login' }
  });
  
  check(response, {
    'login successful': (r) => r.status === 200 || r.status === 201,
    'has access token': (r) => r.json('accessToken') !== undefined,
  });
  
  return response.json('accessToken');
}

// Refresh token function
export function refreshToken(refreshToken) {
  const url = `${config.baseUrl}/auth/refresh`;
  const payload = JSON.stringify({ refreshToken });
  
  const response = http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'RefreshToken' }
  });
  
  check(response, {
    'refresh successful': (r) => r.status === 200,
    'has new access token': (r) => r.json('accessToken') !== undefined,
  });
  
  return response.json('accessToken');
}

// Get user profile
export function getUserProfile(token) {
  const url = `${config.baseUrl}/users/profile`;
  
  const response = http.get(url, {
    headers: getAuthHeaders(token),
    tags: { name: 'GetProfile' }
  });
  
  check(response, {
    'profile retrieved': (r) => r.status === 200,
    'has user data': (r) => r.json('id') !== undefined,
  });
  
  return response.json();
}

// Get products list
export function getProducts(page = 1, limit = 20) {
  const url = `${config.baseUrl}/products?page=${page}&limit=${limit}`;
  
  const response = http.get(url, {
    tags: { name: 'GetProducts' }
  });
  
  check(response, {
    'products retrieved': (r) => r.status === 200,
    'has products array': (r) => Array.isArray(r.json('data')),
  });
  
  return response.json();
}

// Get single product
export function getProduct(productId) {
  const url = `${config.baseUrl}/products/${productId}`;
  
  const response = http.get(url, {
    tags: { name: 'GetProduct' }
  });
  
  check(response, {
    'product retrieved': (r) => r.status === 200,
    'has product data': (r) => r.json('id') !== undefined,
  });
  
  return response.json();
}

// Search products
export function searchProducts(query) {
  const url = `${config.baseUrl}/products/search?query=${encodeURIComponent(query)}`;
  
  const response = http.get(url, {
    tags: { name: 'SearchProducts' }
  });
  
  check(response, {
    'search successful': (r) => r.status === 200,
    'has results': (r) => Array.isArray(r.json('data')),
  });
  
  return response.json();
}

// Get cart
export function getCart(token) {
  const url = `${config.baseUrl}/cart`;
  
  const response = http.get(url, {
    headers: getAuthHeaders(token),
    tags: { name: 'GetCart' }
  });
  
  check(response, {
    'cart retrieved': (r) => r.status === 200,
  });
  
  return response.json();
}

// Add to cart
export function addToCart(token, productId, quantity = 1) {
  const url = `${config.baseUrl}/cart/add`;
  const payload = JSON.stringify({ productId, quantity });
  
  const response = http.post(url, payload, {
    headers: getAuthHeaders(token),
    tags: { name: 'AddToCart' }
  });
  
  check(response, {
    'item added to cart': (r) => r.status === 200 || r.status === 201,
  });
  
  return response.json();
}

// Create order
export function createOrder(token, orderData) {
  const url = `${config.baseUrl}/orders`;
  const payload = JSON.stringify(orderData);
  
  const response = http.post(url, payload, {
    headers: getAuthHeaders(token),
    tags: { name: 'CreateOrder' }
  });
  
  check(response, {
    'order created': (r) => r.status === 200 || r.status === 201,
    'has order id': (r) => r.json('id') !== undefined,
  });
  
  return response.json();
}

// Get orders
export function getOrders(token, page = 1, limit = 10) {
  const url = `${config.baseUrl}/orders?page=${page}&limit=${limit}`;
  
  const response = http.get(url, {
    headers: getAuthHeaders(token),
    tags: { name: 'GetOrders' }
  });
  
  check(response, {
    'orders retrieved': (r) => r.status === 200,
  });
  
  return response.json();
}

// Get payment methods
export function getPaymentMethods(token) {
  const url = `${config.baseUrl}/payment/methods`;
  
  const response = http.get(url, {
    headers: getAuthHeaders(token),
    tags: { name: 'GetPaymentMethods' }
  });
  
  check(response, {
    'payment methods retrieved': (r) => r.status === 200,
  });
  
  return response.json();
}

// Create payment intent
export function createPaymentIntent(token, orderId, amount) {
  const url = `${config.baseUrl}/payment/create-intent`;
  const payload = JSON.stringify({ orderId, amount });
  
  const response = http.post(url, payload, {
    headers: getAuthHeaders(token),
    tags: { name: 'CreatePaymentIntent' }
  });
  
  check(response, {
    'payment intent created': (r) => r.status === 200 || r.status === 201,
    'has client secret': (r) => r.json('clientSecret') !== undefined,
  });
  
  return response.json();
}

// Admin: Get platform overview
export function getPlatformOverview(token) {
  const url = `${config.baseUrl}/financial/platform/simple-overview`;
  
  const response = http.get(url, {
    headers: getAuthHeaders(token),
    tags: { name: 'GetPlatformOverview' }
  });
  
  check(response, {
    'overview retrieved': (r) => r.status === 200,
    'has metrics': (r) => r.json('totalRevenue') !== undefined,
  });
  
  return response.json();
}

// Admin: Get all payments
export function getAllPayments(token, page = 1, limit = 20) {
  const url = `${config.baseUrl}/payment/admin/payments?page=${page}&limit=${limit}`;
  
  const response = http.get(url, {
    headers: getAuthHeaders(token),
    tags: { name: 'GetAllPayments' }
  });
  
  check(response, {
    'payments retrieved': (r) => r.status === 200,
  });
  
  return response.json();
}

// Admin: Generate report
export function generateReport(token, reportType, startDate, endDate, format = 'pdf') {
  const url = `${config.baseUrl}/admin/reports/generate`;
  const payload = JSON.stringify({ reportType, startDate, endDate, format });
  
  const response = http.post(url, payload, {
    headers: getAuthHeaders(token),
    tags: { name: 'GenerateReport' }
  });
  
  check(response, {
    'report generated': (r) => r.status === 200 || r.status === 201,
  });
  
  return response;
}

// Health check
export function healthCheck() {
  const response = http.get(`${config.baseUrl}/notifications/health`);
  
  check(response, {
    'health check passed': (r) => r.status === 200,
  });
  
  return response;
}

// Random sleep helper
export function randomSleep(min = 1, max = 3) {
  const duration = Math.random() * (max - min) + min;
  sleep(duration);
}
