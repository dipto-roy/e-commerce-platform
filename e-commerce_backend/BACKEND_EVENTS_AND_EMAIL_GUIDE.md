# Backend Events and Email System - Complete Guide

## 🎯 Overview

Your e-commerce backend has a comprehensive notification and email system that triggers various events and sends different types of emails. Here's a complete breakdown:

---

## 📧 **EMAIL TYPES SENT BY MAILER SERVICE**

### 1. **Order-Related Emails**

#### **Order Confirmation Email** (to Customer)
- **Triggered**: When order is successfully placed
- **Recipient**: Customer who placed the order
- **Content**: Order details, items, total amount, shipping address
- **Method**: `sendOrderConfirmationEmail()`

#### **New Order Notification** (to Seller)
- **Triggered**: When order contains seller's products
- **Recipient**: Each seller involved in the order
- **Content**: New order alert, seller's items, seller's earnings
- **Method**: `sendNewOrderNotificationToSeller()`

#### **Order Status Update Email**
- **Triggered**: When order status changes (pending → processing → shipped → delivered)
- **Recipient**: Customer
- **Content**: Status change notification, next steps, tracking info
- **Method**: `sendOrderStatusUpdateEmail()`

### 2. **User Management Emails**

#### **Welcome Email**
- **Triggered**: After successful user registration
- **Recipient**: New user
- **Content**: Welcome message, platform introduction
- **Method**: `sendWelcomeEmail()`

#### **Password Reset Email**
- **Triggered**: When user requests password reset
- **Recipient**: User requesting reset
- **Content**: Reset link, security instructions
- **Method**: `sendPasswordResetEmail()`

### 3. **Seller-Specific Emails**

#### **Seller Verification Email**
- **Triggered**: When seller verification status changes
- **Recipient**: Seller
- **Content**: Verification status, next steps if rejected
- **Method**: `sendSellerVerificationEmail()`

#### **Payout Notification Email**
- **Triggered**: When seller payout is processed
- **Recipient**: Seller
- **Content**: Payout amount, transaction details, bank info
- **Method**: `sendPayoutNotificationEmail()`

### 4. **Communication Emails**

#### **Seller to Buyer Message**
- **Triggered**: When seller sends message to buyer
- **Recipient**: Buyer
- **Content**: Message content, order context, reply instructions
- **Method**: `sendSellerToBuyerMessage()`

#### **Buyer to Seller Message**
- **Triggered**: When buyer sends message to seller
- **Recipient**: Seller
- **Content**: Message content, order context, reply instructions
- **Method**: `sendBuyerToSellerMessage()`

### 5. **Utility Emails**

#### **Simple Email**
- **Triggered**: For custom notifications
- **Recipient**: Any user
- **Content**: Custom subject and message
- **Method**: `sendSimpleEmail()`

#### **Test Email**
- **Triggered**: For system testing
- **Recipient**: Test email address
- **Content**: System test confirmation
- **Method**: `sendTestEmail()`

---

## 🔔 **NOTIFICATION EVENTS (Pusher + Database)**

### 1. **Order Events**

#### **Order Placed Notification**
- **Triggered**: When new order is created
- **Recipients**: 
  - Customer (order confirmation)
  - Sellers (new order alert)
  - Admins (order monitoring)
- **Pusher Channel**: `user-{userId}`
- **Event**: `new-notification`
- **Method**: `notifyOrderPlaced()`

#### **Order Status Update Notification**
- **Triggered**: When order status changes
- **Recipients**: 
  - Customer (status update)
  - Admins (status tracking)
  - Seller (if delivered)
- **Method**: `notifyOrderStatusUpdate()`

### 2. **Payment Events**

#### **Payment Processed Notification**
- **Triggered**: When payment is successfully processed
- **Recipients**: Customer, Admins
- **Method**: `notifyPaymentProcessed()`

#### **Payment Failed Notification**
- **Triggered**: When payment fails
- **Recipients**: Customer, Admins
- **Method**: `notifyPaymentFailed()`

### 3. **Seller Events**

#### **Seller Verification Update**
- **Triggered**: When seller verification status changes
- **Recipients**: Seller, Admins
- **Method**: `notifySellerVerificationUpdate()`

#### **Payout Processed Notification**
- **Triggered**: When seller payout is processed
- **Recipients**: Seller, Admins
- **Method**: `notifyPayoutProcessed()`

### 4. **Inventory Events**

#### **Low Stock Notification**
- **Triggered**: When product stock is low
- **Recipients**: Seller, Admins
- **Method**: `notifyLowStock()`

#### **Out of Stock Notification**
- **Triggered**: When product goes out of stock
- **Recipients**: Seller, Admins
- **Method**: `notifyProductOutOfStock()`

### 5. **System Events**

#### **System Maintenance Notification**
- **Triggered**: Before system maintenance
- **Recipients**: All users or specific roles
- **Method**: `notifySystemMaintenance()`

---

## ⚡ **EVENT FLOW WHEN ORDER IS PLACED**

### **Step 1: Order Creation**
```typescript
// In order.service.ts
const savedOrder = await this.orderRepository.save(order);
const completeOrder = await this.findOne(savedOrder.id);
```

### **Step 2: Notification Events Triggered**
```typescript
await this.notificationService.notifyOrderPlaced(completeOrder);
```

**This triggers multiple notifications:**
- **Customer**: "Order Placed Successfully" 
- **Sellers**: "New Order Received" (for each seller)
- **Admins**: "New Order Placed"

### **Step 3: Email Events Triggered**
```typescript
await this.sendOrderEmails(completeOrder);
```

**This sends multiple emails:**
- **Customer**: Order confirmation email
- **Sellers**: New order notification emails

### **Step 4: Real-time Events**
- **Pusher Events**: Sent to `user-{userId}` channels
- **Database Storage**: Notifications saved for future reference
- **Frontend Popups**: Triggered via Pusher WebSocket

---

## 🎯 **EVENT TRIGGERS IN DIFFERENT SCENARIOS**

### **User Registration**
1. ✅ **Welcome Email** sent to new user
2. ✅ **Notification** for successful registration

### **Order Placement**
1. ✅ **Order Confirmation Email** to customer
2. ✅ **New Order Email** to sellers
3. ✅ **Order Placed Notification** to customer
4. ✅ **New Order Notification** to sellers
5. ✅ **Admin Notification** about new order

### **Order Status Change**
1. ✅ **Order Status Email** to customer
2. ✅ **Order Status Notification** to customer
3. ✅ **Admin Notification** about status change

### **Seller Verification**
1. ✅ **Verification Email** to seller
2. ✅ **Verification Notification** to seller

### **Payment Processing**
1. ✅ **Payment Confirmation Notification**
2. ✅ **Payment Failed Notification** (if fails)

### **Seller Payout**
1. ✅ **Payout Email** to seller
2. ✅ **Payout Notification** to seller

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Email System**
- **Service**: `MaillerService` (NestJS)
- **Transport**: SMTP (configured in environment)
- **Templates**: HTML + Text versions
- **Error Handling**: Try-catch blocks, doesn't fail main operations

### **Notification System**
- **Service**: `NotificationService` (NestJS)
- **Database**: PostgreSQL (notifications table)
- **Real-time**: Pusher WebSocket
- **Channels**: `user-{userId}` for user-specific notifications

### **Event Flow**
1. **Business Logic** → Triggers event
2. **Notification Service** → Saves to database + Pusher
3. **Mailer Service** → Sends email
4. **Frontend** → Receives Pusher event → Shows popup

---

## 🎭 **TESTING EVENTS**

### **Manual Testing Endpoints**
- `POST /notifications/test` - Test notification system
- `POST /notifications/order-placed` - Test order notifications
- `POST /mailer/test` - Test email system

### **Real Testing**
- **Place Order**: Triggers full flow
- **Change Status**: Triggers status updates
- **Verify Seller**: Triggers verification events

---

## 📊 **MONITORING & DEBUGGING**

### **Backend Logs**
- Email sending attempts and results
- Pusher event triggers
- Notification creation and delivery
- Error handling and warnings

### **Database**
- Notifications table for history
- Order status tracking
- User verification status

### **Frontend**
- Pusher connection status
- Popup display system
- Notification bell updates

---

**Summary**: Your backend has a comprehensive event system with 11+ email types and 10+ notification events, all triggered automatically based on user actions and system events!