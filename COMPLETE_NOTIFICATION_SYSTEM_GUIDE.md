# 🔔 Complete Real-Time Notification System Implementation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Setup](#database-setup)
5. [API Endpoints](#api-endpoints)
6. [Testing Guide](#testing-guide)
7. [Deployment Checklist](#deployment-checklist)

---

## 🎯 System Overview

### Architecture
```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│   Frontend  │◄─────►│   Backend    │◄─────►│   Database   │
│  (NextJS)   │       │   (NestJS)   │       │ (PostgreSQL) │
│             │       │              │       │              │
│  Pusher JS  │◄──────┤  Pusher      │       │notifications │
│  Client     │       │  Server      │       │   table      │
└─────────────┘       └──────────────┘       └──────────────┘
```

### Features Implemented ✅
- [x] **Real-time notifications** via Pusher JS
- [x] **Database persistence** for notification history
- [x] **Bell icon** with unread count badge
- [x] **Notification dropdown** with recent notifications
- [x] **Dedicated notifications page** with pagination
- [x] **Mark as read** functionality
- [x] **Mark all as read** feature
- [x] **Delete notifications** capability
- [x] **Private user channels** for targeted delivery
- [x] **Role-based notifications** (Admin, Seller, User)
- [x] **Event-driven notifications** for:
  - Order placed
  - Order status updates
  - Seller verification status
  - Payment processing
  - Low stock alerts
  - System announcements

---

## 🖥️ Backend Implementation

### 1. Notification Entity

**File**: `src/notification/entities/notification.entity.ts`

```typescript
export enum NotificationType {
  ORDER = 'order',
  SELLER = 'seller',
  SYSTEM = 'system',
  PAYMENT = 'payment',
  PRODUCT = 'product',
  VERIFICATION = 'verification',
  PAYOUT = 'payout',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'boolean', default: false })
  urgent: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actionUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;
}
```

### 2. Notification Service

**Key Methods**:

#### Database Operations
```typescript
// Create and save notification
async createNotification(userId: number, data: NotificationData): Promise<Notification>

// Get user notifications with pagination
async getUserNotifications(userId: number, page: number, limit: number)

// Get unread count
async getUnreadCount(userId: number): Promise<number>

// Mark as read
async markAsRead(notificationId: number, userId: number): Promise<Notification>

// Mark all as read
async markAllAsRead(userId: number): Promise<{ affected: number }>

// Delete notification
async deleteNotification(notificationId: number, userId: number): Promise<void>
```

#### Real-time Pusher Operations
```typescript
// Send to specific user (saves to DB + sends via Pusher)
async sendToUser(userId: number, notification: NotificationData)

// Send to multiple users
async sendToUsers(userIds: number[], notification: NotificationData)

// Send to role (Admin, Seller, User)
async sendToRole(role: Role, notification: NotificationData)

// Broadcast to all users
async sendBroadcast(notification: NotificationData)
```

#### E-commerce Specific Notifications
```typescript
// Order notifications
async notifyOrderPlaced(order: any)
async notifyOrderStatusUpdate(order: any, oldStatus: string, newStatus: string)

// Seller verification
async notifySellerVerificationUpdate(sellerId: number, isVerified: boolean)

// Payment notifications
async notifyPaymentProcessed(payment: any)
async notifyPaymentFailed(payment: any, reason: string)

// Product notifications
async notifyLowStock(sellerId: number, products: any[])
async notifyProductOutOfStock(sellerId: number, product: any)

// Payout notifications
async notifyPayoutProcessed(sellerId: number, payoutData: any)
```

### 3. API Endpoints

**Base URL**: `http://localhost:4002/notifications`

#### User Notification Management
```bash
# Get my notifications (with pagination)
GET /notifications/my
Query: { page?: number, limit?: number }
Response: {
  notifications: Notification[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}

# Get unread count
GET /notifications/my/unread-count
Response: { unreadCount: number }

# Mark notification as read
POST /notifications/:id/read
Response: { success: boolean, notification: Notification }

# Mark all as read
POST /notifications/my/read-all
Response: { success: boolean, affected: number }

# Delete notification
POST /notifications/:id/delete
Response: { success: boolean, message: string }

# Delete all read notifications
POST /notifications/my/delete-read
Response: { success: boolean, affected: number }
```

#### Admin Notification Management
```bash
# Send custom notification (Admin only)
POST /notifications/send
Body: { userId: number, notification: NotificationData }

# Send to specific user (Admin/Seller)
POST /notifications/send-to-user/:userId
Body: NotificationData

# Send to multiple users (Admin only)
POST /notifications/send-to-users
Body: { userIds: number[], notification: NotificationData }

# Send to role (Admin only)
POST /notifications/send-to-role/:role
Body: NotificationData

# Broadcast notification (Admin only)
POST /notifications/broadcast
Body: NotificationData
```

#### Event-Driven Notifications
```bash
# Order placed notification
POST /notifications/order/placed
Body: { order: Order }

# Order status update
POST /notifications/order/status-update
Body: { order: Order, oldStatus: string, newStatus: string }

# Seller verification update (Admin only)
POST /notifications/seller/verification-update
Body: { sellerId: number, isVerified: boolean }

# Payment processed (Admin only)
POST /notifications/payment/processed
Body: { payment: Payment }

# Low stock alert
POST /notifications/product/low-stock
Body: { sellerId?: number, products: Product[] }
```

---

## 💻 Frontend Implementation

### 1. Notification Context

**File**: `src/contexts/NotificationContext.tsx`

Provides:
- Real-time Pusher connection management
- Notification state management
- Automatic reconnection handling
- Browser notification support

**Usage**:
```tsx
import { useNotifications } from '@/contexts/NotificationContext';

function MyComponent() {
  const { 
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    isConnected 
  } = useNotifications();

  // Use in component...
}
```

### 2. Notification Bell Component

**File**: `src/components/NotificationBell.tsx`

Features:
- Bell icon with unread count badge
- Real-time connection status indicator
- Dropdown with recent 10 notifications
- Click to mark as read
- Navigate to action URL
- "View All" link to notifications page

**Usage**:
```tsx
import NotificationBell from '@/components/NotificationBell';

function Navbar() {
  return (
    <nav>
      <NotificationBell showDropdown={true} />
    </nav>
  );
}
```

### 3. Notifications Page

**File**: `src/app/notifications/page.tsx`

Features:
- Complete list of all notifications
- Pagination support
- Filter by: All / Unread / Read
- Mark as read functionality
- Mark all as read button
- Delete individual notifications
- Delete all read notifications
- Responsive design
- Click to navigate to action URL

**Route**: `/notifications`

### 4. Pusher Channel Configuration

**Private User Channels**:
```typescript
// Channel naming: private-user-{userId}
// Example: private-user-123

// Events:
- 'new-notification' → Any new notification
- 'order-created' → Order placed
- 'seller-status' → Seller verification update
```

---

## 🗄️ Database Setup

### 1. Run Migration

```bash
# Navigate to backend directory
cd e-commerce_backend

# Run the SQL migration
psql -U your_db_user -d your_db_name -f create-notifications-table.sql

# Or using TypeORM migration
npm run typeorm migration:run
```

### 2. Database Schema

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  type notification_type DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,
  "actionUrl" VARCHAR(500),
  data JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_notifications_userId ON notifications("userId");
CREATE INDEX idx_notifications_userId_read ON notifications("userId", read);
CREATE INDEX idx_notifications_userId_createdAt ON notifications("userId", "createdAt" DESC);
```

---

## 🧪 Testing Guide

### 1. Backend Testing

```bash
# Test notification health
curl http://localhost:4002/notification-test/health

# Test sending notification to specific user
curl -X POST http://localhost:4002/notifications/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "userId": 1,
    "notification": {
      "type": "order",
      "title": "Test Notification",
      "message": "This is a test",
      "urgent": false
    }
  }'

# Test order notification
curl -X POST http://localhost:4002/notification-test/demo-seller-order-notification \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": 2,
    "customerName": "John Doe",
    "orderTotal": 99.99,
    "orderId": 123
  }'

# Get user notifications
curl http://localhost:4002/notifications/my \
  -H "Cookie: your-auth-cookie"

# Get unread count
curl http://localhost:4002/notifications/my/unread-count \
  -H "Cookie: your-auth-cookie"

# Mark as read
curl -X POST http://localhost:4002/notifications/1/read \
  -H "Cookie: your-auth-cookie"

# Mark all as read
curl -X POST http://localhost:4002/notifications/my/read-all \
  -H "Cookie: your-auth-cookie"
```

### 2. Frontend Testing

1. **Open Browser Console** → Check Pusher connection logs
2. **Place an Order** → Verify seller receives notification
3. **Admin Verifies Seller** → Verify seller receives notification
4. **Click Bell Icon** → Check dropdown appears
5. **Navigate to `/notifications`** → Verify full page works
6. **Test Mark as Read** → Verify badge updates
7. **Test Delete** → Verify notification removed

### 3. End-to-End Flow

```
1. Customer places order
   ↓
2. Order service calls notifyOrderPlaced()
   ↓
3. Notification saved to database
   ↓
4. Pusher sends to private-user-{sellerId}
   ↓
5. Frontend receives event
   ↓
6. Bell badge updates
   ↓
7. Notification appears in dropdown
   ↓
8. Click notification → Navigate to order page
```

---

## 📦 Environment Variables

### Backend (.env)
```bash
# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=ap2

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4002

# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

---

## 🚀 Deployment Checklist

### Backend
- [ ] Database migration executed
- [ ] Pusher credentials configured
- [ ] Notification entity added to TypeORM
- [ ] Notification module imported in AppModule
- [ ] JWT authentication working for notification endpoints
- [ ] CORS configured for frontend domain

### Frontend
- [ ] Pusher key configured in environment
- [ ] NotificationContext wrapped around app
- [ ] NotificationBell added to Navbar
- [ ] `/notifications` route accessible
- [ ] Authentication cookies/tokens working

### Testing
- [ ] Real-time notifications working
- [ ] Database persistence verified
- [ ] Pagination working
- [ ] Mark as read functionality working
- [ ] Delete notifications working
- [ ] Bell icon updating correctly
- [ ] Browser notifications (optional) working

---

## 🎯 Usage Examples

### Send Notification When Order is Placed

```typescript
// In order.service.ts
async createOrder(orderData: CreateOrderDto, userId: number) {
  // Create order...
  const order = await this.orderRepository.save(newOrder);
  
  // Send notifications
  await this.notificationService.notifyOrderPlaced(order);
  
  return order;
}
```

### Send Notification When Seller is Verified

```typescript
// In admin.controller.ts
async verifySeller(sellerId: number) {
  // Update seller status...
  await this.sellerService.updateVerificationStatus(sellerId, true);
  
  // Notify seller
  await this.notificationService.notifySellerVerificationUpdate(sellerId, true);
  
  return { success: true };
}
```

### Custom Notification

```typescript
// Send custom notification
await this.notificationService.sendToUser(userId, {
  type: 'system',
  title: 'Welcome!',
  message: 'Thanks for joining our platform',
  urgent: false,
  actionUrl: '/dashboard',
  data: { welcomeBonus: 10 }
});
```

---

## 🎉 Success Indicators

✅ **Real-time delivery**: Notifications appear instantly  
✅ **Database persistence**: Notifications saved and retrievable  
✅ **Bell icon**: Shows unread count  
✅ **Dropdown**: Displays recent notifications  
✅ **Full page**: Complete notification history with pagination  
✅ **Mark as read**: Badge updates correctly  
✅ **Delete**: Notifications can be removed  
✅ **Role-based**: Admins, sellers, and users receive appropriate notifications  

---

## 📚 Additional Resources

- [Pusher Documentation](https://pusher.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io)

---

## 🆘 Troubleshooting

### Notifications not appearing?
1. Check Pusher credentials in `.env`
2. Verify Pusher connection in browser console
3. Check backend logs for errors
4. Ensure notification service is injected properly

### Database errors?
1. Run the migration script
2. Check database connection
3. Verify entity is added to TypeOrmModule.forFeature([])

### Auth issues?
1. Ensure JWT token is valid
2. Check cookies are being sent
3. Verify guards are properly applied

---

**🎉 Your complete real-time notification system is now ready!**
