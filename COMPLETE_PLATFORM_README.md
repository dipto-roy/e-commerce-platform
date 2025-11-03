# 🛍️ Complete E-Commerce Platform

A full-stack e-commerce platform built with **NestJS** (backend) and **Next.js 15** (frontend), featuring comprehensive order management, seller dashboard, financial tracking, real-time notifications, and admin controls.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access & refresh tokens
- **Role-based access control** (USER, SELLER, ADMIN)
- **Protected routes** with authentication guards
- **Email verification** and password reset
- **httpOnly cookies** for secure token storage

### 🛒 Order Management System
- **Complete order lifecycle** (pending → confirmed → shipped → delivered)
- **Automatic email notifications** for order events
- **Real-time order updates** via Pusher.js WebSockets
- **Order tracking** with tracking numbers
- **Order history** for customers and sellers
- **Order cancellation** support

### 👥 Multi-Role Dashboard System

#### 🏪 Seller Dashboard
- **Product Management**: CRUD operations with image upload
- **Order Management**: View, update status, track orders
- **Financial Dashboard**: Earnings, payouts, financial records
- **Analytics**: Performance metrics, top products, monthly stats
- **Real-time notifications** for new orders and updates

#### 👤 Customer Interface
- **Product Browsing**: Search, filter, sort by price/rating
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products
- **Order Placement**: Secure checkout with shipping address
- **Order Tracking**: Real-time status updates

#### 🛡️ Admin Panel
- **User Management**: View, activate/deactivate users
- **Seller Verification**: Approve/reject seller applications
- **Platform Analytics**: Revenue, growth metrics, user stats
- **Order Oversight**: Monitor all platform orders
- **System Management**: Platform-wide controls

### 💰 Financial Management
- **Automated earnings tracking** for sellers
- **Payout request system** with approval workflow
- **Financial records** with detailed transaction history
- **Revenue analytics** with period-based reporting
- **Platform commission** handling

### 📧 Professional Email System
- **10+ email templates** for all e-commerce scenarios:
  - Order confirmations
  - Seller notifications
  - Status updates
  - Messaging between users
  - Verification emails
  - Password reset
  - Payout notifications
- **Automatic email integration** with order events
- **Professional HTML templates** with responsive design
- **Role-based email endpoints** with validation

### 🔔 Real-time Notification System
- **Pusher.js WebSocket integration** for live updates
- **Multi-channel notifications**:
  - User-specific notifications
  - Role-based announcements
  - System-wide broadcasts
- **Browser notifications** with permission handling
- **Notification panel** with read/unread status
- **Connection status indicators**

### 🎨 Responsive UI/UX
- **Tailwind CSS** for modern, responsive design
- **Mobile-first approach** with adaptive layouts
- **Role-based navigation** with dynamic menu items
- **Interactive components** with loading states
- **Accessibility features** and keyboard navigation

## 🏗️ Architecture

### Backend (NestJS)
```
src/
├── auth/                 # JWT authentication & guards
├── users/               # User management
├── seller/              # Seller operations
├── product/             # Product CRUD & image handling
├── order/               # Order management system
├── financial/           # Financial tracking & payouts
├── notification/        # Pusher.js real-time notifications
├── mailler/            # Professional email system
├── admin/              # Admin operations
└── migration/          # Database migrations
```

### Frontend (Next.js 15)
```
src/
├── app/
│   ├── products/       # Product browsing & details
│   ├── cart/           # Shopping cart management
│   ├── orders/         # Order tracking & history
│   ├── seller/         # Seller dashboard pages
│   └── admin/          # Admin panel pages
├── components/
│   ├── Navigation.tsx  # Responsive nav with role-based items
│   └── NotificationPanel.tsx  # Real-time notification UI
├── contexts/
│   ├── AuthContext.tsx # Authentication state management
│   └── NotificationContext.tsx # Pusher.js integration
└── hooks/
    └── useAuthGuard.ts # Role-based route protection
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** database
- **Pusher.js account** for real-time features

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd e-commerce_backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** in `.env`:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database

   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret

   # Email Configuration
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_app_password

   # Pusher Configuration
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=ap2
   ```

4. **Run database migrations**:
   ```bash
   npm run migration:run
   ```

5. **Start the development server**:
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd e-commerce-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4002
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=ap2
   NEXT_PUBLIC_APP_NAME=E-Commerce Platform
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🎯 Key Features Implemented

### ✅ Complete Order System
- Order placement with authentication required
- Comprehensive order management for sellers
- Real-time status updates with email notifications
- Order tracking and history

### ✅ Seller Dashboard
- **Product Management**: Full CRUD with image upload and bulk operations
- **Order Dashboard**: Comprehensive order management with filtering and status updates
- **Financial Dashboard**: Earnings tracking, payout requests, financial records
- **Analytics Dashboard**: Performance metrics with backend API integration

### ✅ Customer Experience
- **Product Browsing**: Advanced search, filtering, and sorting
- **Shopping Cart**: Full cart management with local storage
- **Order Placement**: Secure checkout with shipping address
- **Order Confirmation**: Professional order confirmation pages

### ✅ Real-time Features
- **Pusher.js Integration**: Live notifications across all user types
- **WebSocket Connections**: Real-time order updates and system announcements
- **Notification Panel**: Interactive notification management UI

### ✅ Email Automation
- **Professional Templates**: 10+ responsive email templates
- **Automatic Integration**: Order events trigger relevant emails
- **Role-based Endpoints**: Secure email sending with validation

### ✅ Responsive Design
- **Mobile-first**: Adaptive layouts for all screen sizes
- **Tailwind CSS**: Modern, utility-first styling
- **Role-based Navigation**: Dynamic menu items based on user role

## 📊 Database Schema

### Core Entities
- **Users**: Authentication and profile information
- **Sellers**: Business information and verification status
- **Products**: Product catalog with images and inventory
- **Orders**: Order management with items and shipping
- **Financial Records**: Earnings and payout tracking
- **Notifications**: Real-time notification history

### Key Relationships
- Users ↔ Sellers (one-to-one)
- Sellers ↔ Products (one-to-many)
- Users ↔ Orders (one-to-many)
- Orders ↔ Order Items (one-to-many)
- Sellers ↔ Financial Records (one-to-many)

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - User logout

### Products
- `GET /products` - List all active products
- `GET /products/:id` - Get product details
- `POST /products/create-with-image` - Create product with images
- `PUT /products/my-product/:id` - Update own product
- `DELETE /products/my-product/:id` - Delete own product

### Orders
- `POST /orders` - Create new order (protected)
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status

### Seller Dashboard
- `GET /sellers/dashboard/overview` - Dashboard analytics
- `GET /sellers/dashboard/orders` - Seller's orders
- `GET /sellers/dashboard/financial-records` - Financial data

### Notifications
- `POST /notifications/send-to-user/:userId` - Send user notification
- `POST /notifications/order/placed` - Order placed notification
- `POST /notifications/order/status-update` - Order status notification

### Email System
- `POST /mailer/order-confirmation` - Send order confirmation
- `POST /mailer/new-order-seller` - Notify seller of new order
- `POST /mailer/order-status-update` - Send status update email

## 🛡️ Security Features

- **JWT Authentication** with httpOnly cookies
- **Role-based Access Control** with guards
- **Input Validation** with class-validator
- **SQL Injection Protection** with TypeORM
- **Rate Limiting** on sensitive endpoints
- **CORS Configuration** for frontend access

## 🎨 UI Components

### Navigation
- **Responsive navbar** with role-based menu items
- **Mobile hamburger menu** with smooth transitions
- **User dropdown** with profile and logout options
- **Cart and wishlist indicators** with item counts

### Dashboards
- **Seller Products**: Grid/list view with CRUD operations
- **Seller Orders**: Comprehensive order management
- **Seller Analytics**: Performance metrics and charts
- **Admin Panel**: User and platform management

### Real-time Features
- **Notification Panel**: Live notification management
- **Connection Status**: Visual WebSocket connection indicators
- **Live Updates**: Real-time order status changes

## 📈 Performance Optimizations

- **Server-side Rendering** with Next.js 15
- **Image Optimization** with Next.js Image component
- **Code Splitting** for optimal bundle sizes
- **Local Storage** for cart and wishlist persistence
- **API Caching** with proper headers
- **Database Indexing** for query optimization

## 🧪 Testing Strategy

- **Unit Tests** for business logic
- **Integration Tests** for API endpoints
- **E2E Tests** for critical user flows
- **Authentication Flow Testing**
- **Real-time Feature Testing**

## 🚀 Deployment Guide

### Backend Deployment
1. Set up PostgreSQL database
2. Configure production environment variables
3. Run migrations: `npm run migration:run`
4. Start production server: `npm run start:prod`

### Frontend Deployment
1. Build the application: `npm run build`
2. Configure production environment variables
3. Deploy to Vercel/Netlify or serve with: `npm start`

### Environment Setup
- Configure Pusher.js for production
- Set up email service (Gmail/SendGrid)
- Configure database connection
- Set up SSL certificates

## 📚 Documentation

### Email System Guide
See `EMAIL_SYSTEM_GUIDE.md` for comprehensive email template documentation and usage examples.

### API Documentation
All endpoints are documented with Swagger/OpenAPI specifications available at `/api/docs` when running the backend.

### Real-time Features
Pusher.js integration documentation covers WebSocket events, channels, and notification handling.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Conclusion

This e-commerce platform demonstrates a complete, production-ready application with:

- **Authentication & Authorization** with JWT and role-based access
- **Complete Order Management** with real-time updates
- **Professional Email System** with automated integration
- **Real-time Notifications** via WebSockets
- **Multi-role Dashboard System** for sellers, customers, and admins
- **Responsive Design** with modern UI/UX
- **Financial Management** with payout tracking
- **Comprehensive API** with proper security measures

The platform is built with modern technologies and best practices, making it suitable for production deployment and further customization for specific business needs.

---

**Built with ❤️ using NestJS, Next.js 15, TypeORM, PostgreSQL, Pusher.js, and Tailwind CSS**