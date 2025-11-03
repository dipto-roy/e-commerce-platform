#!/usr/bin/env node

/**
 * Test script to verify seller notification system
 * This script will send a test notification directly to a seller
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000'; // Adjust if your backend runs on different port

async function testSellerNotification() {
  try {
    console.log('🧪 Testing Seller Notification System...\n');

    // Test 1: Get seller information
    console.log('📊 Step 1: Getting seller information...');
    
    // You'll need to replace this with actual seller credentials
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'seller1', // Replace with actual seller username
      password: 'password123' // Replace with actual password
    });

    const sellerToken = loginResponse.data.access_token;
    const sellerId = loginResponse.data.user.id;
    
    console.log(`✅ Seller logged in: ID ${sellerId}`);

    // Test 2: Send a test notification to the seller
    console.log('\n📨 Step 2: Sending test notification to seller...');
    
    const notificationResponse = await axios.post(
      `${API_BASE_URL}/notification/send-to-user`,
      {
        userId: sellerId,
        notification: {
          type: 'order',
          title: 'TEST: New Order Received',
          message: `Test notification - You have a new order! Order #TEST-${Date.now()}`,
          data: { 
            orderId: `TEST-${Date.now()}`,
            itemsCount: 2,
            sellerTotal: 150.00,
            customerName: 'Test Customer'
          },
          urgent: true,
          actionUrl: `/seller/orders/TEST-${Date.now()}`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Test notification sent successfully!');
    console.log('📱 Response:', notificationResponse.data);

    console.log('\n🔍 What to check now:');
    console.log('1. Open seller dashboard in browser');
    console.log('2. Check browser console for notification logs');
    console.log('3. Look for the bell icon to show a red badge');
    console.log('4. Click the bell to see the test notification');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure backend is running on port 5000');
    console.log('2. Update seller credentials in this script');
    console.log('3. Check if notification service is properly configured');
  }
}

// Run the test
testSellerNotification();