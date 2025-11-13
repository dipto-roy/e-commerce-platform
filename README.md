# 🛒 E-Commerce Platform

A full-stack, production-ready e-commerce platform built with **Next.js 15**, **NestJS**, **PostgreSQL**, and **TypeScript**. Features real-time notifications, secure payments, admin dashboard, seller management, and comprehensive load testing.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

> **⚠️ Note**: This is a learning/portfolio project. Some features use test API keys and are not production-ready without proper configuration.

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication--security)
- [Payments](#-payment-integration)
- [Notifications](#-notification-system)
- [Admin Features](#-admin-dashboard)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Environment Setup](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🛍️ **For Buyers**
- Browse products with advanced search and filtering
- Add items to cart with real-time updates
- Secure checkout with Stripe payment processing
- Track orders with real-time status updates
- Receive instant notifications for order updates
- Google OAuth and email/password authentication
- Password recovery with OTP verification

### 🏪 **For Sellers**
- Complete product management (CRUD operations)
- Multi-image upload for products
- View and manage customer orders
- Track revenue and earnings
- Low-stock alerts and inventory management
- Financial dashboard with payout history
- Sales analytics and performance metrics

### 👨‍💼 **For Administrators**
- Comprehensive platform dashboard
- User management (buyers, sellers, admins)
- Seller verification system
- Order monitoring and management
- Payment tracking and refund processing
- Generate sales and financial reports
- Send platform-wide notifications
- Interactive charts and analytics

### 🔔 **Real-Time Features**
- WebSocket-based notifications via Pusher
- Notification bell with unread count badge
- In-app notification panel
- Email notifications for critical events
- Auto-refresh on order/payment updates

### 💳 **Payment & Financial**
- Stripe integration for secure payments
- Support for cards and digital wallets
- Automated invoice generation
- Refund processing system
- Financial records and transaction logs
- Platform fee calculations
- Payout tracking for sellers

---

## 🎬 Demo

### Screenshots

**Customer Dashboard**
![Customer Dashboard](docs/images/customer-dashboard.png)

**Admin Panel**
![Admin Panel](docs/images/admin-dashboard.png)

**Product Management**
![Product Management](docs/images/product-management.png)

### Live Demo
- **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app) *(Coming Soon)*
- **API Docs**: [https://your-api.render.com/api-docs](https://your-api.render.com/api-docs) *(Coming Soon)*

### Test Accounts
```
Admin:
Email: admin@example.com
Password: Admin123!

Seller:
Email: seller@example.com
Password: Seller123!

Buyer:
Email: buyer@example.com
Password: Buyer123!
```

---

## 🚀 Tech Stack

### Frontend Stack
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP client |
| **Pusher Client** | Real-time notifications |
| **React Context** | State management |

### Backend Stack
| Technology | Purpose |
|------------|---------|
| **NestJS 10** | Node.js framework |
| **TypeScript** | Type-safe development |
| **PostgreSQL** | Relational database |
| **TypeORM** | Database ORM |
| **JWT + Passport** | Authentication |
| **Stripe SDK** | Payment processing |
| **Nodemailer** | Email service |
| **Pusher** | WebSocket server |
| **Swagger** | API documentation |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| **k6** | Load testing |
| **Git** | Version control |
| **Render** | Backend hosting |
| **Vercel** | Frontend hosting |
| **Neon** | Database hosting |
| **GitHub Actions** | CI/CD (planned) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           CLIENT LAYER                   │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Buyer UI │  │Seller UI │  │Admin UI││
│  └────┬─────┘  └────┬─────┘  └───┬────┘│
│       └──────────────┴────────────┘     │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────▼──────────┐
         │   Next.js App      │
         │   (Frontend)       │
         └─────────┬──────────┘
                   │ HTTPS/REST
         ┌─────────▼──────────┐
         │   NestJS API       │
         │   (Backend)        │
         └─────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐  ┌─────▼──────┐  ┌───▼────┐
│Postgres│  │   Stripe   │  │ Pusher │
│Database│  │  Payments  │  │WebSocks│
└────────┘  └────────────┘  └────────┘
```

**Flow**:
1. **Client** makes request to Next.js frontend
2. **Frontend** calls NestJS backend API via REST
3. **Backend** processes business logic
4. **Database** stores/retrieves data
5. **Stripe** handles payment processing
6. **Pusher** delivers real-time notifications
7. **Response** sent back through chain

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **npm** or **yarn**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/dipto-roy/e-commerce-platform.git
cd e-commerce-platform
```

### 2. Backend Setup

```bash
cd e-commerce_backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration (see Environment Variables section)

# Run migrations
npm run migration:run

# Start server
npm run start:dev
```

✅ Backend running at `http://localhost:4002`

### 3. Frontend Setup

```bash
cd ../e-commerce-frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start server
npm run dev
```

✅ Frontend running at `http://localhost:3000`

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4002/api/v1
- **API Docs**: http://localhost:4002/api-docs

---

## 📁 Project Structure

```
e-commerce-platform/
│
├── e-commerce_backend/          # NestJS Backend
│   ├── src/
│   │   ├── auth/               # Authentication & JWT
│   │   ├── users/              # User management
│   │   ├── products/           # Product CRUD
│   │   ├── cart/               # Shopping cart
│   │   ├── orders/             # Order processing
│   │   ├── payment/            # Stripe integration
│   │   ├── notification/       # Pusher notifications
│   │   ├── admin/              # Admin operations
│   │   ├── seller/             # Seller dashboard
│   │   ├── financial/          # Financial records
│   │   ├── mailer/             # Email service
│   │   └── main.ts             # Entry point
│   ├── migrations/             # Database migrations
│   ├── test/                   # Tests
│   └── uploads/                # File uploads
│
├── e-commerce-frontend/         # Next.js Frontend
│   ├── src/
│   │   ├── app/                # Pages (App Router)
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── seller/         # Seller pages
│   │   │   ├── products/       # Product pages
│   │   │   ├── cart/           # Cart page
│   │   │   ├── orders/         # Orders page
│   │   │   └── login/          # Auth pages
│   │   ├── components/         # React components
│   │   ├── contexts/           # Context providers
│   │   ├── hooks/              # Custom hooks
│   │   ├── config/             # Configuration
│   │   └── utils/              # Utilities
│   └── public/                 # Static files
│
├── k6-tests/                    # Load tests
│   ├── config.js               # Test config
│   ├── helpers.js              # API helpers
│   ├── smoke-test.js           # Smoke test
│   ├── load-test.js            # Load test
│   ├── stress-test.js          # Stress test
│   └── spike-test.js           # Spike test
│
├── run-k6-tests.sh             # Test runner
├── K6_LOAD_TESTING_GUIDE.md    # Testing docs
├── DEPLOYMENT_GUIDE.md         # Deployment guide
├── PRE_DEPLOYMENT_CHECKLIST.md # Checklist
└── README.md                   # This file
```

---

## 🔌 API Endpoints

### Base URL
```
Local: http://localhost:4002/api/v1
Production: https://your-api-url.com/api/v1
```

### Authentication
```http
POST   /auth/register          # Register new user
POST   /auth/login             # Login
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # Logout
GET    /auth/profile           # Get profile
POST   /auth/forgot-password   # Request OTP
POST   /auth/verify-otp        # Verify OTP
POST   /auth/reset-password    # Reset password
GET    /auth/google            # Google OAuth
```

### Products
```http
GET    /products               # List products
GET    /products/:id           # Get product
GET    /products/search        # Search
POST   /products/create        # Create (seller)
PUT    /products/:id           # Update (seller)
DELETE /products/:id           # Delete (seller)
```

### Shopping Cart
```http
POST   /cart/add               # Add item
GET    /cart/items             # Get items
PUT    /cart/items/:id         # Update quantity
DELETE /cart/items/:id         # Remove item
DELETE /cart/clear             # Clear cart
```

### Orders
```http
POST   /orders                 # Create order
POST   /orders/from-cart       # Order from cart
GET    /orders                 # List orders
GET    /orders/:id             # Get order
PATCH  /orders/:id/status      # Update status
POST   /orders/:id/cancel      # Cancel order
```

### Payments
```http
GET    /payments               # List payments
POST   /orders/:id/create-payment-intent  # Create payment
GET    /payments/:orderId/status          # Get status
POST   /payments/stripe/webhook           # Webhook
```

### Admin
```http
GET    /admin/sellers/pending  # Pending sellers
POST   /admin/sellers/:id/verify         # Verify seller
GET    /admin/orders           # All orders
GET    /admin/dashboard/trends           # Analytics
GET    /admin/reports/generate           # Generate report
```

### Notifications
```http
GET    /notifications/my       # My notifications
GET    /notifications/my/unread-count    # Unread count
POST   /notifications/:id/read           # Mark read
POST   /notifications/my/read-all        # Mark all read
```

**📚 Full API Documentation**: Visit `/api-docs` when running backend

---

## 🔐 Authentication & Security

### Authentication Flow
1. **User logs in** with email/password or OAuth
2. **Backend generates** access token (15 min) + refresh token (7 days)
3. **Access token stored** in memory (frontend)
4. **Refresh token stored** in httpOnly cookie
5. **Auto-refresh** before token expiry
6. **Logout** clears tokens

### Security Features
- ✅ **Bcrypt password hashing** with salt rounds
- ✅ **JWT token authentication** with refresh tokens
- ✅ **Role-based access control** (USER, SELLER, ADMIN)
- ✅ **CORS protection** with origin whitelist
- ✅ **Rate limiting** (100 requests/minute per IP)
- ✅ **Input validation** using class-validator
- ✅ **SQL injection protection** via TypeORM
- ✅ **XSS prevention** with input sanitization
- ✅ **Environment variable encryption**

### Role Permissions

| Feature | USER | SELLER | ADMIN |
|---------|------|--------|-------|
| Browse products | ✅ | ✅ | ✅ |
| Place orders | ✅ | ❌ | ✅ |
| Manage own products | ❌ | ✅ | ✅ |
| View all orders | ❌ | ✅ (own) | ✅ (all) |
| Manage users | ❌ | ❌ | ✅ |
| Process refunds | ❌ | ❌ | ✅ |
| Generate reports | ❌ | ✅ (own) | ✅ (all) |

---

## 💳 Payment Integration

### Stripe Setup
1. **Create Stripe account** at https://stripe.com
2. **Get API keys** from Dashboard → Developers → API keys
3. **Configure webhook** endpoint for payment events
4. **Add keys** to environment variables

### Payment Flow
```mermaid
sequenceDiagram
    User->>Frontend: Place Order
    Frontend->>Backend: POST /orders/:id/create-payment-intent
    Backend->>Stripe: Create Payment Intent
    Stripe-->>Backend: client_secret
    Backend-->>Frontend: Payment details
    Frontend->>Stripe: Submit card details
    Stripe-->>Backend: Webhook: payment_intent.succeeded
    Backend->>Database: Update order status
    Backend->>User: Send confirmation email
    Backend->>Pusher: Send real-time notification
```

### Supported Payment Methods
- 💳 Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
- 📱 Digital Wallets (Apple Pay, Google Pay)
- 🏦 Bank Transfers (ACH)

### Features
- ✅ **Payment Intents API** for SCA compliance
- ✅ **Webhook handling** for real-time updates
- ✅ **Automated invoice** generation (PDF)
- ✅ **Refund processing** by admin
- ✅ **Transaction logging** in database

---

## 🔔 Notification System

### Real-Time Notifications with Pusher

**Setup**:
1. Create account at https://pusher.com
2. Get app credentials (App ID, Key, Secret, Cluster)
3. Add to environment variables
4. Notifications work automatically!

### Notification Types

| Event | Trigger | Recipients | Channel |
|-------|---------|------------|---------|
| Order Placed | User creates order | Seller | `user-{sellerId}` |
| Order Status Update | Seller updates status | Buyer | `user-{buyerId}` |
| Payment Processed | Payment successful | Buyer, Seller | Individual channels |
| Payment Failed | Payment failed | Buyer | `user-{userId}` |
| Seller Verification | Admin approves/rejects | Seller | `user-{sellerId}` |
| Payout Processed | Payout completed | Seller | `user-{sellerId}` |
| Low Stock Alert | Stock < threshold | Seller | `user-{sellerId}` |
| System Announcement | Admin broadcast | All Users | `broadcast` |

### Frontend Integration
```typescript
// Using NotificationContext
const { 
  notifications,      // All notifications
  unreadCount,        // Unread count
  markAsRead,         // Mark as read
  markAllAsRead,      // Mark all read
} = useNotifications();

// Display notification bell
<NotificationBell 
  count={unreadCount} 
  onClick={togglePanel} 
/>
```

### Features
- ✅ **Real-time delivery** via WebSocket
- ✅ **Persistent storage** in database
- ✅ **Unread count badge** on notification bell
- ✅ **Popup notification panel** with history
- ✅ **Mark as read** functionality
- ✅ **Email fallback** for offline users
- ✅ **Role-based** targeting

---

## 👨‍💼 Admin Dashboard

### Platform Overview
- **Revenue Metrics**: Total, monthly, daily revenue
- **Order Statistics**: Total, pending, completed orders
- **User Counts**: Total users, sellers, buyers
- **Product Stats**: Total products, active listings

### Admin Features

#### 📊 **Analytics Dashboard**
- Revenue trends (line chart)
- Order status distribution (pie chart)
- Top products (bar chart)
- User growth over time (area chart)

#### 👥 **User Management**
- View all users (buyers, sellers, admins)
- Edit user details
- Activate/deactivate accounts
- Change user roles
- View user activity

#### 🏪 **Seller Verification**
- Review pending seller applications
- Approve or reject with reason
- Send notification email
- Track verification status

#### 📦 **Order Management**
- View all platform orders
- Filter by status, date, user
- Update order statuses
- View order details and history
- Export order reports

#### 💰 **Payment Management**
- View all transactions
- Track payment statuses
- Process refunds
- View payment analytics
- Generate financial reports

#### 📄 **Report Generation**
- Sales reports (daily, weekly, monthly)
- Revenue reports by period
- User activity reports
- Product performance reports
- Export as PDF, CSV, or Excel

### Admin Routes
```
/admin                      # Dashboard
/admin/users                # User management
/admin/orders               # Order management
/admin/payments             # Payment tracking
/admin/sellers/pending      # Seller verification
/admin/reports              # Reports
/admin/products             # Product management
```

---

## 🧪 Testing

### k6 Load Testing

We use **k6** for comprehensive API load testing.

#### Test Scenarios

| Test | Duration | VUs | Purpose | Pass Criteria |
|------|----------|-----|---------|---------------|
| **Smoke** | 1 min | 1 | Verify basic functionality | All checks pass |
| **Load** | 9 min | 10 | Normal traffic simulation | p95 < 500ms, errors < 10% |
| **Stress** | 11 min | 50 | Find breaking point | p95 < 1000ms, errors < 20% |
| **Spike** | 2 min | 100 | Sudden traffic surge | System recovers |

#### Running Tests

```bash
# Install k6
# Ubuntu/Debian
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS
brew install k6

# Run tests - Interactive menu
./run-k6-tests.sh

# Run tests - CLI
./run-k6-tests.sh smoke      # Quick test
./run-k6-tests.sh load       # Load test
./run-k6-tests.sh stress     # Stress test
./run-k6-tests.sh spike      # Spike test
./run-k6-tests.sh all        # All tests
./run-k6-tests.sh health     # Health check
```

#### Test Coverage
- ✅ Authentication (login, refresh token, profile)
- ✅ Products (list, search, get details)
- ✅ Cart operations (add, update, get)
- ✅ Orders (create, list, get status)
- ✅ Payments (methods, create intent)
- ✅ Admin operations (dashboard, reports)

#### Performance Thresholds
```javascript
{
  // Response time
  http_req_duration: ['p(95)<500ms', 'p(99)<1000ms'],
  
  // Error rate
  http_req_failed: ['rate<0.1'],  // < 10%
  
  // Throughput
  http_reqs: ['rate>10']          // > 10 req/s
}
```

#### Test Results
Results saved to `results/` directory:
```
results/
├── smoke-test-20251113-070000.json
├── load-test-20251113-071500.json
├── stress-test-20251113-073000.json
└── spike-test-20251113-080000.json
```

**📚 Full Testing Guide**: See [K6_LOAD_TESTING_GUIDE.md](./K6_LOAD_TESTING_GUIDE.md)

---

## 🚀 Deployment

### Deployment Stack

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Vercel    │◄────►│   Render    │◄────►│   Neon DB   │
│  (Frontend) │      │  (Backend)  │      │(PostgreSQL) │
│             │      │             │      │             │
│ Next.js App │      │ NestJS API  │      │  Database   │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                     │
       └────────────────────┴─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ External APIs  │
                    │ Stripe, Pusher │
                    │    SMTP        │
                    └────────────────┘
```

### Quick Deployment Steps

#### 1. Database (Neon) - 5 minutes
```bash
# 1. Go to https://neon.tech
# 2. Create new project
# 3. Copy connection string
# 4. Save for backend deployment
```

#### 2. Backend (Render) - 10 minutes
```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to https://render.com
# 3. New → Web Service
# 4. Connect GitHub repository
# 5. Configure:
   - Name: e-commerce-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm run start:prod
   - Add Environment Variables (see below)
# 6. Deploy!
```

#### 3. Frontend (Vercel) - 5 minutes
```bash
# 1. Go to https://vercel.com
# 2. Import Git Repository
# 3. Select e-commerce-frontend folder
# 4. Configure:
   - Framework: Next.js
   - Root Directory: e-commerce-frontend
   - Add Environment Variables (see below)
# 5. Deploy!
```

### Production Environment Variables

**Backend (Render)**
```env
NODE_ENV=production
DATABASE_URL=postgresql://neon-connection-string
JWT_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
STRIPE_SECRET_KEY=sk_live_...
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**Frontend (Vercel)**
```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Post-Deployment Checklist

- ✅ Backend health check: `https://your-api.onrender.com/api/v1/health`
- ✅ Frontend loads: `https://your-app.vercel.app`
- ✅ Database connected (check backend logs)
- ✅ API endpoints responding
- ✅ Authentication working
- ✅ Stripe webhooks configured
- ✅ Pusher notifications active
- ✅ Email sending working
- ✅ CORS properly configured

**📚 Detailed Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) and [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)

---

## 🔧 Environment Variables

### Backend (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=4002

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=ecommerce_db
# Or use connection string:
# DATABASE_URL=postgresql://user:pass@host:port/db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4050

# Email (Nodemailer - Gmail example)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM="E-Commerce Platform" <your-email@gmail.com>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pusher
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=ap2

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4002/api/v1/auth/google/callback

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=uploads
```

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4002/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4002

# Pusher (Real-time Notifications)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2

# Stripe (Payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application
NEXT_PUBLIC_APP_NAME=E-Commerce Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys

**Stripe**:
1. Visit https://stripe.com
2. Create account → Dashboard
3. Developers → API keys
4. Copy Publishable and Secret keys

**Pusher**:
1. Visit https://pusher.com
2. Create account → Channels
3. Create new app
4. Copy App ID, Key, Secret, Cluster

**Gmail (Nodemailer)**:
1. Enable 2FA on Gmail account
2. Generate App Password: Account → Security → App passwords
3. Use generated password in `MAIL_PASSWORD`

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the project

### Development Setup

1. **Fork & Clone**
```bash
git clone https://github.com/your-username/e-commerce-platform.git
cd e-commerce-platform
```

2. **Create Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Changes**
- Write clean, documented code
- Follow existing code style
- Add tests if applicable

4. **Test Changes**
```bash
# Backend tests
cd e-commerce_backend
npm run test

# Load tests
./run-k6-tests.sh smoke
```

5. **Commit & Push**
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

6. **Create Pull Request**
- Go to GitHub
- Click "New Pull Request"
- Describe your changes
- Submit for review

### Code Style
- Use TypeScript for type safety
- Follow ESLint rules
- Use meaningful variable/function names
- Comment complex logic
- Use conventional commits (feat, fix, docs, etc.)

### Areas for Improvement
- 🔍 Add more search filters
- ⭐ Product reviews and ratings
- ❤️ Wishlist functionality
- 📱 Mobile app (React Native)
- 🌐 Internationalization (i18n)
- 📊 More analytics and charts
- 🤖 AI-powered recommendations
- 📸 Better image optimization

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Dipto Roy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Support & Contact

### 📖 Documentation
- [Complete API Documentation](./COMPLETE_API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Load Testing Guide](./K6_LOAD_TESTING_GUIDE.md)
- [Notification System Guide](./COMPLETE_NOTIFICATION_SYSTEM_GUIDE.md)
- [Security Implementation](./e-commerce_backend/SECURITY_IMPLEMENTATION_SUMMARY.md)

### 🐛 Issues & Bugs
Found a bug? Please [open an issue](https://github.com/dipto-roy/e-commerce-platform/issues) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### 💬 Get Help
- **GitHub Discussions**: Ask questions and share ideas
- **Email**: dipto.roy@example.com
- **Twitter**: [@dipto_roy](https://twitter.com/dipto_roy)

### 🔗 Links
- **Repository**: https://github.com/dipto-roy/e-commerce-platform
- **Live Demo**: *Coming Soon*
- **API Docs**: *Coming Soon*

---

## 🎯 Roadmap

### ✅ **Version 1.0 (Completed)**
- ✅ Core e-commerce functionality
- ✅ Multi-role authentication (USER, SELLER, ADMIN)
- ✅ Payment integration with Stripe
- ✅ Real-time notifications with Pusher
- ✅ Admin dashboard with analytics
- ✅ Seller dashboard with reports
- ✅ Load testing infrastructure with k6
- ✅ Comprehensive documentation

### 🔄 **Version 1.1 (In Progress)**
- 🔄 Product reviews and ratings
- 🔄 Wishlist functionality
- 🔄 Advanced search and filters
- 🔄 Product recommendations
- 🔄 Social media sharing
- 🔄 Email marketing integration

### 📅 **Version 2.0 (Planned)**
- 📅 Mobile app (React Native)
- 📅 AI-powered recommendations
- 📅 Multi-language support (i18n)
- 📅 Multi-currency support
- 📅 Advanced analytics dashboard
- 📅 Subscription-based products
- 📅 Loyalty program
- 📅 Chat support system

### 💡 **Future Ideas**
- Live video shopping
- AR product preview
- Voice search
- Progressive Web App (PWA)
- Blockchain integration for supply chain
- NFT marketplace

---

## 🙏 Acknowledgments

### Built With
- [Next.js](https://nextjs.org/) - The React Framework
- [NestJS](https://nestjs.com/) - A progressive Node.js framework
- [PostgreSQL](https://www.postgresql.org/) - The World's Most Advanced Open Source Database
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Stripe](https://stripe.com/) - Online payment processing
- [Pusher](https://pusher.com/) - APIs for building real-time features
- [k6](https://k6.io/) - Open-source load testing tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

### Inspiration
This project was built to demonstrate:
- Modern full-stack development practices
- Secure authentication and authorization
- Real-time features with WebSockets
- Payment processing integration
- Role-based access control
- Load testing and performance optimization
- Production-ready deployment strategies

### Special Thanks
- To the open-source community for amazing tools and libraries
- To everyone who provided feedback and suggestions
- To you for checking out this project! ⭐

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/dipto-roy/e-commerce-platform?style=social)
![GitHub forks](https://img.shields.io/github/forks/dipto-roy/e-commerce-platform?style=social)
![GitHub issues](https://img.shields.io/github/issues/dipto-roy/e-commerce-platform)
![GitHub pull requests](https://img.shields.io/github/issues-pr/dipto-roy/e-commerce-platform)
![GitHub last commit](https://img.shields.io/github/last-commit/dipto-roy/e-commerce-platform)
![GitHub repo size](https://img.shields.io/github/repo-size/dipto-roy/e-commerce-platform)
![Lines of code](https://img.shields.io/tokei/lines/github/dipto-roy/e-commerce-platform)

---

<div align="center">

### ⭐ If you find this project helpful, please give it a star! ⭐

**Built with ❤️ by [Dipto Roy](https://github.com/dipto-roy)**

[Report Bug](https://github.com/dipto-roy/e-commerce-platform/issues) · [Request Feature](https://github.com/dipto-roy/e-commerce-platform/issues) · [Documentation](./docs)

</div>
