# 🛒 E-Commerce Platform

A full-stack, production-ready e-commerce platform built with **Next.js 15**, **NestJS**, **PostgreSQL**, and **TypeScript**. Features real-time notifications, secure payments, admin dashboard, seller management, and comprehensive API testing.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)


---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Authentication & Security](#-authentication--security)
- [Payment Integration](#-payment-integration)
- [Notification System](#-notification-system)
- [Admin Dashboard](#-admin-dashboard)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🛍️ Core E-Commerce
- **Product Management**: CRUD operations with multi-image upload
- **Shopping Cart**: Session-based cart with real-time updates
- **Order Management**: Complete order lifecycle (placed → processing → shipped → delivered)
- **Search & Filter**: Advanced product search with category filtering
- **Pagination**: Efficient data loading for large catalogs

### 👥 User Roles & Authentication
- **Multi-Role System**: Admin, Seller, Buyer roles with role-based access control
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **OAuth2 Integration**: Google OAuth login
- **Password Recovery**: OTP-based password reset via email
- **Session Management**: Automatic token refresh and logout

### 💳 Payment Processing
- **Stripe Integration**: Secure payment processing
- **Payment Methods**: Credit/debit cards, digital wallets
- **Payment Intents**: SCA-compliant payment flow
- **Invoice Generation**: Automated invoice creation and delivery
- **Refund System**: Admin-controlled refund processing

### 🔔 Real-Time Notifications
- **Pusher Integration**: WebSocket-based real-time notifications
- **Event-Driven**: Order updates, payment status, seller verification
- **Multi-Channel**: In-app notifications + email notifications
- **Notification Bell**: Unread count badge with popup panel
- **Auto-Refresh**: Real-time notification delivery

### 👨‍💼 Admin Dashboard
- **Platform Overview**: Revenue, orders, users, products analytics
- **User Management**: View, edit, activate/deactivate users
- **Order Management**: Monitor and update order statuses
- **Payment Tracking**: View all transactions and process refunds
- **Seller Verification**: Approve/reject seller applications
- **Report Generation**: Sales, revenue, user activity reports
- **Charts & Analytics**: Interactive charts for business insights

### 🏪 Seller Dashboard
- **Product Management**: Add, edit, delete products
- **Order Management**: View and fulfill customer orders
- **Financial Overview**: Revenue, payouts, transaction history
- **Inventory Tracking**: Stock management with low-stock alerts
- **Performance Metrics**: Sales analytics and top products

### 📊 Advanced Features
- **Image Management**: Multi-image upload with CDN support
- **Email System**: Nodemailer integration for transactional emails
- **API Rate Limiting**: Throttling to prevent abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Error Handling**: Comprehensive error tracking and logging
- **Data Validation**: Input validation with class-validator
- **Database Migrations**: TypeORM migrations for schema management
- **Load Testing**: k6 integration for performance testing

---

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: Pusher Client
- **Forms**: React Hook Form
- **UI Components**: Custom component library

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Payment**: Stripe SDK
- **Email**: Nodemailer
- **WebSockets**: Pusher
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### DevOps & Testing
- **API Testing**: k6 Load Testing
- **Load Testing**: 4 test scenarios (smoke, load, stress, spike)
- **Version Control**: Git
- **CI/CD**: GitHub Actions ready
- **Deployment**: Render (backend), Vercel (frontend), Neon (database)
- **Monitoring**: Built-in logging and error tracking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Buyer UI   │  │  Seller UI   │  │   Admin UI   │         │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (CORS/Auth)    │
                    └────────┬────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│                    ┌───────▼────────┐                            │
│                    │   NestJS API   │                            │
│                    │   Controllers  │                            │
│                    └───────┬────────┘                            │
│                            │                                     │
│         ┌──────────────────┼──────────────────┐                 │
│         │                  │                  │                  │
│    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐           │
│    │  Auth   │      │ Business  │     │  Payment  │           │
│    │ Service │      │  Logic    │     │  Service  │           │
│    └────┬────┘      └─────┬─────┘     └─────┬─────┘           │
│         │                  │                  │                  │
│    ┌────▼────┐      ┌─────▼─────┐     ┌─────▼─────┐           │
│    │  JWT    │      │ TypeORM   │     │  Stripe   │           │
│    │ Guard   │      │Repository │     │    SDK    │           │
│    └─────────┘      └─────┬─────┘     └───────────┘           │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                       DATA LAYER                                  │
│                    ┌───────▼────────┐                            │
│                    │   PostgreSQL   │                            │
│         ┌──────────┤    Database    ├──────────┐                │
│         │          └────────────────┘          │                 │
│    ┌────▼────┐   ┌────────┐   ┌────────┐  ┌──▼──────┐         │
│    │  Users  │   │Products│   │ Orders │  │Payments │         │
│    │  Table  │   │ Table  │   │ Table  │  │  Table  │         │
│    └─────────┘   └────────┘   └────────┘  └─────────┘         │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                              │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│   │  Stripe  │   │  Pusher  │   │   SMTP   │   │  Neon DB │    │
│   │ Payments │   │WebSockets│   │   Email  │   │  Cloud   │    │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
e-commerce-platform/
├── e-commerce_backend/     # NestJS Backend API
├── e-commerce-frontend/    # Next.js Frontend
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Pusher

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Real-time**: Pusher

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd e-commerce_backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
npm run start:dev
```

Backend runs on: http://localhost:4002

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd e-commerce-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:3000

## 📚 Documentation

- **API Documentation**: http://localhost:4002/api-docs
- **OpenAPI Spec**: http://localhost:4002/api-docs-json
- **Frontend Docs**: See `e-commerce-frontend/README.md`
- **Backend Docs**: See `e-commerce_backend/README.md`

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=4002
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=e_commerce
JWT_SECRET=your_jwt_secret
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_cluster
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4002/api/v1
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

## 🔑 Default Admin Credentials

After setting up the database, you can create an admin user or use the default one created by migrations.

## 🌐 API Endpoints

View complete API documentation at: http://localhost:4002/api-docs

Main endpoints:
- `/api/v1/auth/*` - Authentication
- `/api/v1/products/*` - Products
- `/api/v1/orders/*` - Orders
- `/api/v1/cart/*` - Shopping Cart
- `/api/v1/sellers/*` - Sellers
- `/api/v1/admin/*` - Admin

## 🧪 Testing

### Backend Tests
```bash
cd e-commerce_backend
npm run test
```

### Frontend Tests
```bash
cd e-commerce-frontend
npm run test
```

## 📦 Deployment

### Backend Deployment
- Can be deployed to Heroku, AWS, DigitalOcean, etc.
- Requires PostgreSQL database
- Set environment variables in hosting platform

### Frontend Deployment
- Optimized for Vercel deployment
- Can also deploy to Netlify, AWS Amplify
- Set environment variables in hosting platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

Your Name - [@your_github_username](https://github.com/$GITHUB_USERNAME)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Next.js team for the React framework
- All contributors and users

## 📞 Support

For support, email your-email@example.com or open an issue.
