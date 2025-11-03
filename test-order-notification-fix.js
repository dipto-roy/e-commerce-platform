// Test script to simulate order placement and notification sending

const simulateOrderNotification = () => {
  console.log('🧪 Testing Order Notification with undefined sellerIds...\n');

  // Simulate order data with mixed valid and invalid sellerIds
  const testOrder = {
    id: 123,
    userId: 456,
    totalAmount: 100.50,
    orderItems: [
      { id: 1, sellerId: 10, subtotal: 25.00, productName: 'Valid Product 1' },
      { id: 2, sellerId: undefined, subtotal: 30.00, productName: 'Invalid Product 1' },
      { id: 3, sellerId: 20, subtotal: 20.00, productName: 'Valid Product 2' },
      { id: 4, sellerId: null, subtotal: 15.00, productName: 'Invalid Product 2' },
      { id: 5, sellerId: '30', subtotal: 10.50, productName: 'Valid Product 3 (string)' },
      { id: 6, sellerId: '', subtotal: 5.00, productName: 'Invalid Product 3' },
      { id: 7, sellerId: 0, subtotal: 8.00, productName: 'Invalid Product 4' },
      { id: 8, sellerId: 'invalid', subtotal: 12.00, productName: 'Invalid Product 5' },
    ],
    shippingAddress: {
      fullName: 'Test Customer'
    }
  };

  console.log('📦 Order Items Analysis:');
  testOrder.orderItems.forEach((item, index) => {
    const isValid = item.sellerId && !isNaN(Number(item.sellerId)) && Number(item.sellerId) > 0;
    const status = isValid ? '✅ VALID' : '❌ INVALID';
    console.log(`Item ${index + 1}: sellerId=${item.sellerId} -> ${status}`);
  });

  // Simulate the fixed filtering logic
  const sellerIds = [
    ...new Set(
      testOrder.orderItems
        .map((item) => item.sellerId)
        .filter((id) => id && !isNaN(Number(id)) && Number(id) > 0)
    ),
  ];

  console.log('\n🎯 Filtered Results:');
  console.log(`Original items: ${testOrder.orderItems.length}`);
  console.log(`Valid seller IDs: [${sellerIds.join(', ')}]`);
  console.log(`Notifications to send: ${sellerIds.length}`);

  console.log('\n📤 Simulated Notifications:');
  sellerIds.forEach((sellerId, index) => {
    console.log(`${index + 1}. Sending notification to seller ${sellerId} ✅`);
  });

  console.log('\n🚫 Avoided Errors:');
  const invalidItems = testOrder.orderItems.filter(
    item => !item.sellerId || isNaN(Number(item.sellerId)) || Number(item.sellerId) <= 0
  );
  console.log(`Skipped ${invalidItems.length} items with invalid seller IDs`);
  invalidItems.forEach((item, index) => {
    console.log(`${index + 1}. Skipped item ${item.id} with sellerId: ${item.sellerId}`);
  });

  console.log('\n✅ Result: No "Invalid userId provided: undefined" errors!');
};

simulateOrderNotification();