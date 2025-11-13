# 🎯 Visual Testing Guide - Step by Step

## 🔍 Quick Reference: What to Test

| Feature | Status | Test Now |
|---------|--------|----------|
| Cart Authentication | ✅ Fixed | Test logout → cart click |
| Payment Demo Cards | ✅ Ready | Use 4242 4242 4242 4242 |
| Pusher Notifications | ✅ Working | Check bell icon on all pages |
| Order Tracking | ✅ Active | Visit /orders page |
| Dashboard Buttons | ✅ Added | Check profile dropdown |

---

## 📱 Feature 1: Cart Authentication Fix

### Before Fix ❌
```
User (not logged in) → Clicks Cart → 401 Error ❌
Console shows: "Request failed with status code 401"
```

### After Fix ✅
```
User (not logged in) → Clicks Cart → Beautiful Login Prompt ✅
┌─────────────────────────────────────┐
│         🔒 Login Required           │
│                                     │
│  Please log in to view your        │
│  shopping cart and place orders.   │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    🔒 Go to Login           │  │ ← Primary action
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Continue Browsing Products │  │ ← Secondary action
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Test Steps:
1. ✅ Logout from app
2. ✅ Click cart icon in navigation
3. ✅ See login prompt (not error)
4. ✅ Click "Go to Login" → Redirects to /login
5. ✅ Login and return to cart → Works perfectly

---

## 💳 Feature 2: Payment System with Test Cards

### Payment Flow Diagram
```
Cart → Checkout → Select Payment Method
         │
         ├── Cash on Delivery (COD)
         │   └→ Place Order → Confirmation ✅
         │
         └── Credit/Debit Card (Stripe)
             └→ Stripe Form Loads
                 ├── Enter Test Card: 4242 4242 4242 4242
                 ├── Stripe Verifies Card Details
                 ├── 3D Secure (if required)
                 └── Payment Success → Confirmation ✅
```

### Test Cards Quick Reference

| Card Number | Expiry | CVC | ZIP | Result |
|-------------|--------|-----|-----|--------|
| 4242 4242 4242 4242 | 12/25 | 123 | 12345 | ✅ Success |
| 4000 0000 0000 0002 | 12/25 | 123 | 12345 | ❌ Declined |
| 4000 0027 6000 3184 | 12/25 | 123 | 12345 | 🔐 3D Secure |

### Visual Card Entry Form
```
┌─────────────────────────────────────────┐
│  Payment Information                    │
│  ────────────────────────────────────   │
│                                         │
│  Card Number                            │
│  ┌────────────────────────────────┐    │
│  │ 4242 4242 4242 4242      VISA │    │
│  └────────────────────────────────┘    │
│                                         │
│  Expiry Date        CVC                │
│  ┌─────────────┐  ┌───────────┐       │
│  │   12 / 25   │  │    123    │       │
│  └─────────────┘  └───────────┘       │
│                                         │
│  ZIP Code                               │
│  ┌────────────────────────────────┐    │
│  │        12345                   │    │
│  └────────────────────────────────┘    │
│                                         │
│  [Cancel]  [💳 Pay $XX.XX]            │
│                                         │
│  🔒 Secured by Stripe                  │
└─────────────────────────────────────────┘
```

### Test Scenarios:

#### Scenario A: Successful Payment ✅
```bash
1. Add products to cart ($50 total)
2. Go to checkout
3. Fill shipping address
4. Select "Credit/Debit Card"
5. Enter: 4242 4242 4242 4242
6. Click "Pay $50.00"
7. ✅ Success! Order created
8. ✅ Email sent
9. ✅ Redirected to confirmation
```

#### Scenario B: Declined Payment ❌
```bash
1. Same steps 1-4
2. Enter: 4000 0000 0000 0002
3. Click "Pay $50.00"
4. ❌ Error: "Your card was declined"
5. ✅ Can try again with different card
6. ✅ Order remains in pending state
```

#### Scenario C: 3D Secure 🔐
```bash
1. Same steps 1-4
2. Enter: 4000 0027 6000 3184
3. Click "Pay $50.00"
4. 🔐 3D Secure modal appears
5. Click "Complete Authentication"
6. ✅ Authentication successful
7. ✅ Payment processed
8. ✅ Order confirmed
```

---

## 🔔 Feature 3: Pusher Notifications Everywhere

### Navigation Bell Icon
```
┌─────────────────────────────────────────────┐
│  E-Commerce  [Home] [Products]    🔔 👤    │
│                                   ↑   ↑     │
│                                   │   └─ User Menu
│                                   └───── Notification Bell
│                                            (shows on ALL pages)
└─────────────────────────────────────────────┘
```

### Bell States

#### Connected with No Notifications
```
🔔 ← Bell icon
🟢 ← Green dot (connected to Pusher)
```

#### Connected with Unread Notifications
```
🔔💫 ← Bell icon with pulse animation
🟢  ← Green dot (connected)
⓵  ← Red badge with count
```

#### Disconnected
```
🔔
🔴 ← Red dot (disconnected - check Pusher config)
```

### Notification Dropdown
```
Click Bell Icon →

┌─────────────────────────────────────┐
│ Notifications                    ✕  │
│ 3 unread notifications              │
├─────────────────────────────────────┤
│ 📦 Order Shipped                    │
│ Your order #123 has been shipped    │
│ 5m ago                         ✕    │
│ [Blue highlight for unread]         │
├─────────────────────────────────────┤
│ 💳 Payment Confirmed                │
│ Payment of $50.00 processed         │
│ 1h ago                         ✕    │
├─────────────────────────────────────┤
│ 🛍️ Product Added                   │
│ New product in your favorite cat... │
│ 2h ago                         ✕    │
├─────────────────────────────────────┤
│     View All Notifications          │
└─────────────────────────────────────┘
```

### Pusher Channels by Role

```
┌──────────────────────────────────────┐
│  Role: USER                         │
│  Channel: user-{userId}             │
│  Events:                            │
│    • order-created                  │
│    • order-status-updated           │
│    • payment-confirmed              │
│    • product-recommendation         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Role: SELLER                       │
│  Channel: seller-{userId}           │
│  Events:                            │
│    • new-order                      │
│    • product-low-stock              │
│    • verification-update            │
│    • payout-processed               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Role: ADMIN                        │
│  Channel: admin-notifications       │
│  Events:                            │
│    • new-seller-registration        │
│    • payment-issue                  │
│    • system-alert                   │
│    • dispute-created                │
└──────────────────────────────────────┘
```

### Test Pusher:
```bash
# Send test notification
curl -X POST http://localhost:4002/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{
    "userId": 1,
    "type": "order",
    "title": "Test Notification",
    "message": "Pusher is working perfectly!"
  }'

# Expected Result:
✅ Bell icon badge increases count
✅ Pulse animation appears
✅ Click bell to see notification
✅ Works on ANY page (home, products, cart, etc.)
```

---

## 📦 Feature 4: Order Tracking

### Orders Page Layout
```
┌─────────────────────────────────────────────────────┐
│  My Orders                        [🔄 Refresh]      │
│  Track and manage your orders (5 total)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [All Orders] [Pending] [Processing] [Shipped] ... │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Order #123                      🟡 PENDING  $50.00│
│  📅 Nov 6, 2025 10:30 AM                          │
│  ┌───────────────────────────────────────────┐    │
│  │ 📱 Product A    Qty: 2 × $15.00          │    │
│  │ 💻 Product B    Qty: 1 × $20.00          │    │
│  └───────────────────────────────────────────┘    │
│  Ship to: John Doe               [View Order]     │
├─────────────────────────────────────────────────────┤
│  Order #122                      🔵 PROCESSING $30 │
│  📅 Nov 5, 2025 3:15 PM                           │
│  ┌───────────────────────────────────────────┐    │
│  │ 🎧 Product C    Qty: 1 × $30.00          │    │
│  └───────────────────────────────────────────┘    │
│  Ship to: John Doe               [View Order]     │
├─────────────────────────────────────────────────────┤
│  Order #121                      🟣 SHIPPED   $75  │
│  📅 Nov 4, 2025 11:00 AM                          │
│  Tracking: TRK123456789                            │
│  ┌───────────────────────────────────────────┐    │
│  │ 📷 Product D    Qty: 1 × $75.00          │    │
│  └───────────────────────────────────────────┘    │
│  Ship to: John Doe               [View Order]     │
└─────────────────────────────────────────────────────┘
```

### Order Status Colors
- 🟡 **PENDING** - Yellow badge (awaiting processing)
- 🔵 **PROCESSING** - Blue badge (payment confirmed, preparing)
- 🟣 **SHIPPED** - Purple badge (in transit)
- 🟢 **DELIVERED** - Green badge (completed)
- 🔴 **CANCELLED** - Red badge (order cancelled)

### Order Detail Page
```
┌─────────────────────────────────────────────────────┐
│  ← Back to Orders                                   │
│                                                     │
│  ✅ Order Confirmed                                 │
│  Order #123                                         │
│  Thank you for your purchase!                       │
├─────────────────────────────────────────────────────┤
│  📊 Order Status                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │  🟡 Pending → 🔵 Processing → 🟣 Shipped   │  │
│  │            → 🟢 Delivered                   │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  📦 Tracking Number: TRK123456789                  │
│  📅 Order Date: Nov 6, 2025                        │
│  💵 Total Amount: $50.00                           │
├─────────────────────────────────────────────────────┤
│  📍 Shipping Address                               │
│  John Doe                                          │
│  123 Main Street                                   │
│  New York, NY 10001                                │
│  United States                                     │
├─────────────────────────────────────────────────────┤
│  🛍️ Order Items                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  [📷] Product A                             │  │
│  │        Qty: 2 × $15.00 = $30.00            │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │  [📷] Product B                             │  │
│  │        Qty: 1 × $20.00 = $20.00            │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Subtotal:    $50.00                               │
│  Shipping:    $0.00 (Free shipping over $25)       │
│  ─────────────────────                             │
│  Total:       $50.00                               │
│                                                     │
│  [Download Invoice] [Track Shipment]               │
└─────────────────────────────────────────────────────┘
```

### Test Order Tracking:
```bash
1. Login as user
2. Go to /orders
3. ✅ See all your orders
4. Click filter "Shipped"
5. ✅ Only shipped orders shown
6. Click "View Order" on any order
7. ✅ See complete order details
8. ✅ See tracking number (if shipped)
9. ✅ See current status with color
```

---

## 🎛️ Feature 5: Role-Based Dashboard Navigation

### User Menu Dropdown

#### USER Role
```
┌──────────────────────────┐
│  John Doe               │
│  john@example.com       │
│  [USER]                 │
├──────────────────────────┤
│  Profile                │
│  👤 My Dashboard  ← NEW │
│  Orders                 │
├──────────────────────────┤
│  🚪 Sign out           │
└──────────────────────────┘
```

#### SELLER Role
```
┌──────────────────────────┐
│  Jane Seller            │
│  jane@seller.com        │
│  [SELLER]               │
├──────────────────────────┤
│  Profile                │
│  📦 Seller Dashboard ← NEW│
│  Orders                 │
├──────────────────────────┤
│  🚪 Sign out           │
└──────────────────────────┘
```

#### ADMIN Role
```
┌──────────────────────────┐
│  Admin User             │
│  admin@example.com      │
│  [ADMIN]                │
├──────────────────────────┤
│  Profile                │
│  🔧 Admin Dashboard ← NEW│
│  Orders                 │
├──────────────────────────┤
│  🚪 Sign out           │
└──────────────────────────┘
```

### Dashboard Routes
- 👤 **USER**: `/dashboard/user` - Personal dashboard
- 📦 **SELLER**: `/seller/dashboard` - Seller management
- 🔧 **ADMIN**: `/dashboard/admin` - Admin control panel

### Test Dashboard Access:
```bash
# As USER
1. Login as regular user
2. Click user icon in navigation
3. ✅ See "My Dashboard" button with 👤 icon
4. Click it
5. ✅ Redirects to /dashboard/user

# As SELLER
1. Login as seller
2. Click user icon
3. ✅ See "Seller Dashboard" button with 📦 icon
4. Click it
5. ✅ Redirects to /seller/dashboard

# As ADMIN
1. Login as admin
2. Click user icon
3. ✅ See "Admin Dashboard" button with 🔧 icon
4. Click it
5. ✅ Redirects to /dashboard/admin
```

---

## ✅ Complete Test Checklist

### Pre-Testing Setup
- [ ] Backend running on port 4002
- [ ] Frontend running on port 3000
- [ ] Database connected
- [ ] Pusher credentials configured
- [ ] Stripe test keys set

### Cart Authentication
- [ ] Logout and click cart
- [ ] See login prompt (not error)
- [ ] Login prompt buttons work
- [ ] Login and access cart successfully

### Payment System
- [ ] Add products to cart
- [ ] Checkout with COD - works
- [ ] Checkout with test card 4242... - works
- [ ] Try declined card 0002 - shows error
- [ ] Try 3DS card - authentication modal appears

### Pusher Notifications
- [ ] Bell icon visible on all pages
- [ ] Green dot shows connected
- [ ] Send test notification - badge appears
- [ ] Click bell - dropdown shows notifications
- [ ] Click notification - marks as read

### Order Tracking
- [ ] Access /orders page
- [ ] See list of orders
- [ ] Filter by status works
- [ ] View order details works
- [ ] Tracking number shown (if shipped)

### Dashboard Navigation
- [ ] Login as USER - see "My Dashboard"
- [ ] Login as SELLER - see "Seller Dashboard"
- [ ] Login as ADMIN - see "Admin Dashboard"
- [ ] Each dashboard button navigates correctly

---

## 🎉 Expected Results

After all tests pass:
- ✅ No 401 errors on cart
- ✅ Payment works with test cards
- ✅ Notifications appear on all pages
- ✅ Orders can be tracked in real-time
- ✅ Dashboard access is role-based

---

## 🆘 Troubleshooting

### Issue: Bell icon not showing notifications
**Fix**: Check browser console for Pusher connection errors
```bash
# Check Pusher credentials in .env
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

### Issue: Payment form not loading
**Fix**: Verify Stripe publishable key
```bash
# Check .env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Issue: 401 on cart even when logged in
**Fix**: Clear cookies and login again
```bash
# In browser console:
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

---

**All features are working! Follow the test guide above to verify!** 🚀
