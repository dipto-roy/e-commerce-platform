# 🔔 SELLER NOTIFICATION SYSTEM TESTING GUIDE
*Step-by-Step Guide to Test Seller Dashboard Notifications*

---

## 🎯 **OVERVIEW**

This guide will help you test the seller notification system where:
1. **Customer places an order** → **Seller receives notification**
2. **Admin updates order status** → **Seller receives notification** 
3. **Admin verifies seller account** → **Seller receives notification**

---

## 🚀 **STEP 1: SETUP REQUIREMENTS**

### Backend Setup
```bash
cd /home/dip-roy/e-commerce_project/e-commerce_backend
npm run start:dev
# Ensure backend is running on http://localhost:4002
```

### Frontend Setup
```bash
cd /home/dip-roy/e-commerce_project/e-commerce-frontend
npm run dev
# Ensure frontend is running on http://localhost:3000
```

### Environment Variables
Ensure these are set in your frontend `.env.local`:
```env
NEXT_PUBLIC_PUSHER_KEY=15b1c61ffa0f4d470c2b
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
NEXT_PUBLIC_API_URL=http://localhost:4002
```

---

## 🧪 **STEP 2: VERIFICATION TESTS**

### Test 1: Check Notification System Health
```bash
curl http://localhost:4002/notification-test/health
# Expected Response: {"status":"ok","service":"notification-test",...}
```

### Test 2: Test Backend Seller Notifications
```bash
curl -X POST http://localhost:4002/notification-test/demo-seller-order-notification
# Expected Response: {"success":true,"message":"Demo seller order notifications sent successfully",...}
```

---

## 👤 **STEP 3: CREATE TEST SELLER ACCOUNT**

### 3.1 Register a New Seller
1. Go to: `http://localhost:3000/signup`
2. Fill out seller registration form
3. Note the **Seller ID** from the response (you'll need this)

### 3.2 Login as Seller
1. Go to: `http://localhost:3000/login`
2. Login with seller credentials
3. Navigate to: `http://localhost:3000/seller/dashboard`

### 3.3 Verify Debug Panel
On the seller dashboard, you should see a **yellow debug panel** showing:
- **User ID**: Your seller ID
- **Role**: Should be "SELLER"
- **Connection**: Should show "✅ Connected"
- **Notifications**: Current count

---

## 📦 **STEP 4: CREATE TEST PRODUCTS**

### 4.1 Add Products as Seller
1. Go to seller dashboard
2. Navigate to product management
3. Add at least one product (note the product ID)

### 4.2 Verify Product Creation
```bash
# Check if products exist
curl http://localhost:4002/products
```

---

## 🛒 **STEP 5: TEST ORDER NOTIFICATIONS**

### 5.1 Method A: Backend Direct Test
```bash
# Replace sellerId=2 with your actual seller ID
curl -X POST http://localhost:4002/notification-test/demo-seller-order-notification \
  -H "Content-Type: application/json" \
  -d '{"sellerId": 2}'
```

### 5.2 Method B: Frontend Order Flow
1. **Open TWO browser windows/tabs:**
   - **Window 1**: Seller dashboard (`http://localhost:3000/seller/dashboard`)
   - **Window 2**: Customer shopping (`http://localhost:3000/products`)

2. **In Window 2 (Customer):**
   - Browse products
   - Add seller's product to cart
   - Complete order checkout

3. **In Window 1 (Seller):**
   - Watch for notification bell to light up
   - Check debug panel for new notifications
   - Click notification bell to see order details

---

## 🔍 **STEP 6: DEBUGGING NOTIFICATIONS**

### 6.1 Check Browser Console
**In Seller Dashboard**, open DevTools Console and look for:
```javascript
// Successful connection logs:
🔧 Initializing Pusher connection...
✅ Pusher connected successfully
📡 User channel subscription initiated: user-{sellerId}
📡 Role channel subscription initiated: role-seller

// Notification reception logs:
📨 Received notification on user-{sellerId} channel
🔔 Processing notification: {notification details}
✅ Notification created: {notification object}
```

### 6.2 Common Issues & Solutions

#### Issue: "❌ Disconnected" in Debug Panel
**Solution:**
```bash
# Check if Pusher credentials are correct
echo $NEXT_PUBLIC_PUSHER_KEY
echo $NEXT_PUBLIC_PUSHER_CLUSTER

# Restart frontend if needed
npm run dev
```

#### Issue: "User ID: Not set"
**Solution:**
1. Clear browser cookies/localStorage
2. Login again as seller
3. Verify seller account exists in database

#### Issue: No notifications received
**Solution:**
1. Check if seller is verified (only verified sellers receive notifications)
2. Verify user role is "SELLER" not "USER"
3. Check backend logs for notification sending errors

---

## 🧪 **STEP 7: ADMIN NOTIFICATION TESTS**

### 7.1 Test Admin to Seller Communication
```bash
# Test seller verification notification
curl -X POST http://localhost:4002/notification-test/demo-seller-verification

# Test order status update
curl -X POST http://localhost:4002/notification-test/demo-order-status
```

### 7.2 Admin Dashboard Workflow
1. **Login as Admin** (`http://localhost:3000/admin`)
2. **Verify Seller Account**:
   - Go to seller management
   - Approve/reject seller verification
   - **Seller should receive notification immediately**

---

## 📊 **STEP 8: REAL-WORLD TEST SCENARIO**

### Complete End-to-End Flow:

1. **Setup (1 minute):**
   - Seller logged in to dashboard
   - Debug panel showing "Connected"

2. **Customer Order (2 minutes):**
   - Customer browses products
   - Adds seller's product to cart
   - Completes checkout

3. **Expected Results (Immediate):**
   - 🔔 Seller notification bell shows new notification
   - Debug panel increments notification count
   - Notification contains order details
   - Browser notification (if permissions granted)

4. **Admin Actions (3 minutes):**
   - Admin marks order as "shipped"
   - Admin processes seller verification

5. **Expected Results (Immediate):**
   - 🔔 Additional notifications for status updates
   - Seller can see all notifications in panel

---

## 🔧 **TROUBLESHOOTING CHECKLIST**

### ✅ **Backend Verification**
- [ ] Backend running on port 4002
- [ ] No compilation errors in backend logs
- [ ] Notification test endpoints returning success
- [ ] Database has seller and product records

### ✅ **Frontend Verification**
- [ ] Frontend running on port 3000
- [ ] Seller successfully logged in
- [ ] Debug panel shows User ID and "SELLER" role
- [ ] Pusher connection shows "Connected"
- [ ] No console errors in browser DevTools

### ✅ **Notification Flow**
- [ ] Seller account is verified (isVerified: true)
- [ ] Products exist and belong to seller
- [ ] Order creation triggers notifications
- [ ] Notifications appear in seller dashboard
- [ ] Notification bell updates with unread count

---

## 📝 **EXPECTED NOTIFICATION TYPES**

| **Trigger** | **Notification Title** | **Recipient** | **Channel** |
|-------------|------------------------|---------------|-------------|
| New Order | "New Order Received" | Specific Seller | `user-{sellerId}` |
| Order Status Update | "Order Status Updated" | Seller + Customer | `user-{userId}` |
| Seller Verification | "Seller Account Verified" | Specific Seller | `user-{sellerId}` |
| Payment Update | "Payment Processed" | Seller | `user-{sellerId}` |

---

## 🎯 **SUCCESS CRITERIA**

### ✅ **Test Passes When:**
1. Seller receives notification within 2 seconds of order placement
2. Notification bell shows unread count
3. Notification panel displays correct order details
4. Debug panel shows "Connected" status
5. Browser console shows successful Pusher events

### ❌ **Test Fails When:**
1. No notification received after 10 seconds
2. Debug panel shows "Disconnected"
3. Console shows Pusher connection errors
4. Notification count doesn't increment
5. User ID shows "Not set" in debug panel

---

*Generated: October 5, 2025*
*Backend: NestJS + Pusher.js + PostgreSQL*
*Frontend: Next.js + React + TypeScript*