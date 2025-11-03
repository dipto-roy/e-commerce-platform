# E-Commerce Platform

Full-stack e-commerce platform with Next.js frontend and NestJS backend.

## 🚀 Features

- **User Authentication** - JWT-based authentication with OAuth support
- **Product Management** - Complete CRUD operations for products
- **Shopping Cart** - Real-time cart management
- **Order Processing** - Complete order lifecycle management
- **Seller Dashboard** - Seller verification and product management
- **Admin Panel** - Platform administration and analytics
- **Real-time Notifications** - Pusher-based notification system
- **Secure Payments** - Payment processing integration
- **Image Upload** - Product image management
- **API Documentation** - Complete Swagger/OpenAPI documentation

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
