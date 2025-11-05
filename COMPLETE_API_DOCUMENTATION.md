# Complete E-Commerce Platform API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:4002/api/v1`  
**Documentation:** `http://localhost:4002/api-docs`

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Orders](#orders)
5. [Cart](#cart)
6. [Sellers](#sellers)
7. [Admin](#admin)
8. [Notifications](#notifications)
9. [Financial](#financial)
10. [Image Upload](#image-upload)

---

## Authentication Schemes

### Bearer Token (JWT)
```
Authorization: Bearer <token>
```

### Cookie Authentication
```
Cookie: access_token=<token>; refresh_token=<token>
```

---

## 1. Authentication

### 1.1 Register User

**Endpoint:** `POST /auth/register`  
**Description:** Create a new user account  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "USER"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "isActive": true
  }
}
```

### 1.2 Login

**Endpoint:** `POST /auth/login`  
**Description:** Authenticate user and receive JWT tokens in cookies  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER",
    "isActive": true
  }
}
```

**Cookies Set:**
- `access_token` (15 minutes, HTTP-only)
- `refresh_token` (7 days, HTTP-only)

### 1.3 Get Profile

**Endpoint:** `GET /auth/profile`  
**Description:** Get current user profile  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "USER",
    "isActive": true
  }
}
```

### 1.4 Logout

**Endpoint:** `POST /auth/logout`  
**Description:** Clear authentication cookies  
**Auth Required:** No

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### 1.5 Refresh Token

**Endpoint:** `POST /auth/refresh`  
**Description:** Refresh access token using refresh token  
**Auth Required:** Refresh token in cookie

**Response:** `200 OK`
```json
{
  "message": "Tokens refreshed successfully"
}
```

### 1.6 Forgot Password

**Endpoint:** `POST /auth/forgot-password`  
**Description:** Request OTP for password reset  
**Rate Limit:** 3 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP sent to email",
  "expiresIn": "10 minutes"
}
```

### 1.7 Verify OTP

**Endpoint:** `POST /auth/verify-otp`  
**Description:** Verify OTP code  
**Rate Limit:** 5 attempts per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP verified",
  "resetToken": "abc123xyz..."
}
```

### 1.8 Reset Password

**Endpoint:** `POST /auth/reset-password`  
**Description:** Reset password with verified token

**Request Body:**
```json
{
  "email": "john@example.com",
  "resetToken": "abc123xyz...",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

### 1.9 Google OAuth

**Endpoint:** `GET /auth/google`  
**Description:** Initiate Google OAuth flow

**Endpoint:** `GET /auth/google/callback`  
**Description:** Google OAuth callback (handles authentication)

---

## 2. Users

### 2.1 Get All Users

**Endpoint:** `GET /users`  
**Description:** Get all users (Admin only)  
**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

### 2.2 Get User by ID

**Endpoint:** `GET /users/:id`  
**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "USER",
  "isActive": true
}
```

### 2.3 Create User

**Endpoint:** `POST /users`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "fullName": "Jane Doe",
  "role": "SELLER"
}
```

### 2.4 Update User

**Endpoint:** `PUT /users/:id`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "isActive": true
}
```

### 2.5 Delete User

**Endpoint:** `DELETE /users/:id`  
**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

---

## 3. Products

### 3.1 Get All Products

**Endpoint:** `GET /products`  
**Description:** Get all products with pagination  
**Auth Required:** No

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with A17 Pro chip",
      "price": 999.99,
      "stockQuantity": 50,
      "category": "Electronics",
      "isActive": true,
      "images": [
        {
          "id": 1,
          "imageUrl": "http://localhost:4002/uploads/images/iphone15.jpg",
          "altText": "iPhone 15 Pro",
          "sortOrder": 0
        }
      ],
      "seller": {
        "id": 2,
        "username": "tech_seller",
        "fullName": "Tech Store"
      },
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "totalCount": 50,
  "totalPages": 5,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### 3.2 Get Product by ID

**Endpoint:** `GET /products/:id`  
**Auth Required:** No

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with A17 Pro chip",
  "price": 999.99,
  "stockQuantity": 50,
  "category": "Electronics",
  "isActive": true,
  "images": [...],
  "seller": {...}
}
```

### 3.3 Create Product with Image

**Endpoint:** `POST /products/create-with-image`  
**Auth Required:** Yes (Admin, Seller)  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
name: iPhone 15 Pro
description: Latest iPhone
price: 999.99
stockQuantity: 50
category: Electronics
isActive: true
file: <image file>
```

**Response:** `201 Created`
```json
{
  "message": "Product created successfully",
  "product": {
    "id": 1,
    "name": "iPhone 15 Pro",
    "images": [
      {
        "imageUrl": "http://localhost:4002/uploads/images/iphone15.jpg"
      }
    ]
  }
}
```

### 3.4 Get My Products

**Endpoint:** `GET /products/my-products`  
**Description:** Get products for authenticated seller  
**Auth Required:** Yes (Seller, Admin)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "iPhone 15 Pro",
    "price": 999.99,
    "stock": 50,
    "category": "Electronics",
    "isActive": true,
    "images": ["http://localhost:4002/uploads/images/iphone15.jpg"]
  }
]
```

### 3.5 Update Product

**Endpoint:** `PUT /products/my-product/:id`  
**Auth Required:** Yes (Seller, Admin)

**Request Body:**
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 1099.99,
  "stockQuantity": 30
}
```

### 3.6 Delete Product

**Endpoint:** `DELETE /products/my-product/:id`  
**Auth Required:** Yes (Seller, Admin)

**Response:** `200 OK`
```json
{
  "message": "Product deleted successfully"
}
```

### 3.7 Get Paginated Products

**Endpoint:** `GET /products/paginated`  
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)

### 3.8 Search Products

**Endpoint:** `GET /products/search?name=<query>`  
**Auth Required:** Yes (Admin, Seller)

### 3.9 Get Products by Seller

**Endpoint:** `GET /products/seller/:sellerId`  
**Auth Required:** Yes (Admin, Seller)

### 3.10 Seller Dashboard Analytics

**Endpoint:** `GET /products/dashboard/analytics`  
**Auth Required:** Yes (Seller, Admin)

**Response:** `200 OK`
```json
{
  "totalProducts": 25,
  "activeProducts": 20,
  "inactiveProducts": 5,
  "totalValue": 25000.00,
  "lowStockProducts": 3,
  "categories": ["Electronics", "Clothing", "Books"]
}
```

### 3.11 Get Top Products

**Endpoint:** `GET /products/dashboard/top-products?limit=10`  
**Auth Required:** Yes (Seller, Admin)

### 3.12 Get Low Stock Products

**Endpoint:** `GET /products/dashboard/low-stock?threshold=10`  
**Auth Required:** Yes (Seller, Admin)

### 3.13 Bulk Update Products

**Endpoint:** `PUT /products/dashboard/bulk-update`  
**Auth Required:** Yes (Seller, Admin)

**Request Body:**
```json
{
  "productIds": [1, 2, 3],
  "updateData": {
    "isActive": true
  }
}
```

### 3.14 Add Product Images

**Endpoint:** `POST /products/:id/images`  
**Auth Required:** Yes (Seller, Admin)

**Request Body:**
```json
[
  {
    "imageUrl": "http://localhost:4002/uploads/images/image1.jpg",
    "altText": "Product Image 1",
    "sortOrder": 0
  }
]
```

### 3.15 Update Product Stock

**Endpoint:** `PUT /products/:id/stock`  
**Auth Required:** Yes (Seller, Admin)

**Request Body:**
```json
{
  "stockQuantity": 100
}
```

---

## 4. Orders

### 4.1 Create Order

**Endpoint:** `POST /orders`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 999.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

**Response:** `201 Created`
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-2024-001",
    "totalAmount": 1999.98,
    "status": "pending",
    "items": [...],
    "createdAt": "2024-11-01T10:00:00Z"
  }
}
```

### 4.2 Create Order from Cart

**Endpoint:** `POST /orders/from-cart`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

### 4.3 Get User Orders

**Endpoint:** `GET /orders?page=1&limit=10`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": 1,
      "orderNumber": "ORD-2024-001",
      "totalAmount": 1999.98,
      "status": "shipped",
      "items": [
        {
          "id": 1,
          "productName": "iPhone 15 Pro",
          "quantity": 2,
          "price": 999.99
        }
      ],
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "totalCount": 10,
  "currentPage": 1,
  "totalPages": 1
}
```

### 4.4 Get Order by ID

**Endpoint:** `GET /orders/:id`  
**Auth Required:** Yes

### 4.5 Update Order Status

**Endpoint:** `PATCH /orders/:id/status`  
**Auth Required:** Yes (Seller, Admin)

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

### 4.6 Cancel Order

**Endpoint:** `POST /orders/:id/cancel`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": 1,
    "status": "cancelled"
  }
}
```

### 4.7 Get User Order Stats

**Endpoint:** `GET /orders/stats`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "totalOrders": 15,
  "completedOrders": 10,
  "pendingOrders": 3,
  "cancelledOrders": 2,
  "totalSpent": 5000.00
}
```

### 4.8 Get Seller Orders

**Endpoint:** `GET /orders/seller/orders?page=1&limit=10`  
**Auth Required:** Yes (Seller)

### 4.9 Get Seller Financials

**Endpoint:** `GET /orders/seller/financials`  
**Auth Required:** Yes (Seller)

**Response:** `200 OK`
```json
{
  "totalRevenue": 25000.00,
  "pendingPayments": 5000.00,
  "completedPayments": 20000.00,
  "totalOrders": 100,
  "averageOrderValue": 250.00
}
```

---

## 5. Cart

### 5.1 Add to Cart

**Endpoint:** `POST /cart/add`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "message": "Item added to cart",
  "cartItem": {
    "id": 1,
    "productId": 1,
    "quantity": 2,
    "product": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 999.99
    }
  }
}
```

### 5.2 Get Cart Items

**Endpoint:** `GET /cart/items`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "price": 999.99,
        "images": [...]
      }
    }
  ],
  "totalItems": 2,
  "subtotal": 1999.98
}
```

### 5.3 Update Cart Item

**Endpoint:** `PUT /cart/items/:id`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "quantity": 3
}
```

### 5.4 Remove from Cart

**Endpoint:** `DELETE /cart/items/:id`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "message": "Item removed from cart successfully"
}
```

### 5.5 Clear Cart

**Endpoint:** `DELETE /cart/clear`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "message": "Cart cleared successfully"
}
```

### 5.6 Get Cart Total

**Endpoint:** `GET /cart/total`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "total": 1999.98
}
```

---

## 6. Sellers

### 6.1 Get All Sellers

**Endpoint:** `GET /sellers/all`  
**Auth Required:** No

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "username": "tech_seller",
    "fullName": "Tech Store",
    "email": "tech@store.com",
    "isVerified": true,
    "totalProducts": 25
  }
]
```

### 6.2 Create Seller

**Endpoint:** `POST /sellers/create`  
**Auth Required:** Yes (Admin, Seller)

**Request Body:**
```json
{
  "username": "new_seller",
  "email": "seller@example.com",
  "password": "SecurePassword123!",
  "fullName": "New Seller Store",
  "phone": "+1234567890"
}
```

### 6.3 Get Seller by ID

**Endpoint:** `GET /sellers/id/:id`  
**Auth Required:** Yes (Admin)

### 6.4 Get Seller with Products

**Endpoint:** `GET /sellers/:id/products`  
**Auth Required:** Yes (Admin, Seller)

**Response:** `200 OK`
```json
{
  "seller": {
    "id": 1,
    "username": "tech_seller",
    "fullName": "Tech Store"
  },
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "price": 999.99
    }
  ],
  "totalProducts": 25
}
```

### 6.5 Seller Dashboard Overview

**Endpoint:** `GET /sellers/dashboard/overview`  
**Auth Required:** Yes (Seller, Admin)

**Response:** `200 OK`
```json
{
  "seller": {
    "id": 1,
    "username": "tech_seller",
    "isVerified": true
  },
  "statistics": {
    "totalProducts": 25,
    "activeProducts": 20,
    "totalOrders": 100,
    "revenue": 25000.00,
    "pendingOrders": 5
  },
  "recentOrders": [...],
  "topProducts": [...]
}
```

### 6.6 Get Seller Orders

**Endpoint:** `GET /sellers/dashboard/orders?status=pending&page=1&limit=20`  
**Auth Required:** Yes (Seller, Admin)

### 6.7 Get Recent Orders

**Endpoint:** `GET /sellers/dashboard/recent-orders?limit=10`  
**Auth Required:** Yes (Seller, Admin)

### 6.8 Get Financial Records

**Endpoint:** `GET /sellers/dashboard/financial-records?page=1&limit=20`  
**Auth Required:** Yes (Seller, Admin)

### 6.9 Generate Performance Report

**Endpoint:** `GET /sellers/dashboard/report?startDate=2024-01-01&endDate=2024-12-31`  
**Auth Required:** Yes (Seller, Admin)

**Response:** `200 OK`
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "summary": {
    "totalRevenue": 100000.00,
    "totalOrders": 500,
    "averageOrderValue": 200.00,
    "topProducts": [...]
  },
  "monthlyBreakdown": [...]
}
```

### 6.10 Update Seller Verification (Admin)

**Endpoint:** `PUT /sellers/:id/verification`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "isVerified": true
}
```

---

## 7. Admin

### 7.1 Get Pending Sellers

**Endpoint:** `GET /admin/sellers/pending`  
**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "sellers": [
    {
      "id": 5,
      "username": "new_seller",
      "fullName": "New Seller Store",
      "email": "new@seller.com",
      "isVerified": false,
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "total": 3
}
```

### 7.2 Verify Seller

**Endpoint:** `POST /admin/sellers/:id/verify`  
**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "message": "Seller verified successfully",
  "seller": {
    "id": 5,
    "username": "new_seller",
    "isVerified": true
  }
}
```

### 7.3 Reject Seller

**Endpoint:** `POST /admin/sellers/:id/reject`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "deleteAccount": false
}
```

### 7.4 Get All Orders (Admin)

**Endpoint:** `GET /admin/orders?page=1&limit=10&status=pending`  
**Auth Required:** Yes (Admin)

### 7.5 Update Order Status (Admin)

**Endpoint:** `PATCH /admin/orders/:id/status`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "completed"
}
```

### 7.6 Send Email to Users

**Endpoint:** `POST /admin/emails/send`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "subject": "Important Update",
  "message": "This is an important message to all users.",
  "recipients": ["user1@example.com", "user2@example.com"]
}
```

### 7.7 Send Bulk Email

**Endpoint:** `POST /admin/emails/send-bulk`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "subject": "Platform Update",
  "message": "Important platform update message",
  "recipientType": "all"
}
```

**Recipient Types:**
- `all` - All users
- `sellers` - Only sellers
- `users` - Only regular users
- `verified_sellers` - Only verified sellers

### 7.8 Get Email History

**Endpoint:** `GET /admin/emails/history`  
**Auth Required:** Yes (Admin)

### 7.9 Get Dashboard Trends

**Endpoint:** `GET /admin/dashboard/trends?period=7days`  
**Auth Required:** Yes (Admin)

**Query Parameters:**
- `period`: `7days`, `30days`, `3months`, `1year`

**Response:** `200 OK`
```json
{
  "success": true,
  "period": "7days",
  "trends": {
    "users": [
      {
        "date": "2024-11-01",
        "count": 100
      }
    ],
    "sellers": [
      {
        "date": "2024-11-01",
        "count": 10
      }
    ],
    "products": [
      {
        "date": "2024-11-01",
        "count": 250
      }
    ]
  },
  "summary": {
    "totalUsers": 500,
    "totalSellers": 50,
    "totalProducts": 1500,
    "userGrowth": 5.2,
    "sellerGrowth": 3.8,
    "productGrowth": 8.1
  }
}
```

---

## 8. Notifications

### 8.1 Get User Notifications

**Endpoint:** `GET /notifications`  
**Auth Required:** Yes

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `unreadOnly`: `true` | `false`

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "order_update",
      "title": "Order Shipped",
      "message": "Your order #ORD-2024-001 has been shipped",
      "isRead": false,
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ],
  "total": 10,
  "unreadCount": 3
}
```

### 8.2 Mark Notification as Read

**Endpoint:** `PATCH /notifications/:id/read`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "message": "Notification marked as read"
}
```

### 8.3 Mark All as Read

**Endpoint:** `PATCH /notifications/mark-all-read`  
**Auth Required:** Yes

### 8.4 Delete Notification

**Endpoint:** `DELETE /notifications/:id`  
**Auth Required:** Yes

### 8.5 Send Notification (Admin)

**Endpoint:** `POST /notifications/send`  
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "userId": 1,
  "type": "announcement",
  "title": "Platform Update",
  "message": "We have released new features"
}
```

---

## 9. Financial

### 9.1 Get Platform Overview

**Endpoint:** `GET /financial/platform/overview`  
**Auth Required:** Yes (Admin)

**Response:** `200 OK`
```json
{
  "totalRevenue": 500000.00,
  "totalOrders": 2500,
  "averageOrderValue": 200.00,
  "topSellers": [
    {
      "sellerId": 1,
      "sellerName": "Tech Store",
      "revenue": 100000.00,
      "orders": 500
    }
  ],
  "monthlyRevenue": [
    {
      "month": "2024-11",
      "revenue": 50000.00
    }
  ]
}
```

### 9.2 Get Seller Financial Summary

**Endpoint:** `GET /financial/seller/:id/summary`  
**Auth Required:** Yes (Seller, Admin)

### 9.3 Get Transaction History

**Endpoint:** `GET /financial/transactions?page=1&limit=20`  
**Auth Required:** Yes (Admin)

---

## 10. Image Upload

### 10.1 Upload Product Image

**Endpoint:** `POST /image-upload/product`  
**Auth Required:** Yes (Seller, Admin)  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: <image file>
productId: 1
altText: Product Image
sortOrder: 0
```

**Response:** `201 Created`
```json
{
  "message": "Image uploaded successfully",
  "image": {
    "id": 1,
    "imageUrl": "http://localhost:4002/uploads/images/product-image.jpg",
    "altText": "Product Image",
    "sortOrder": 0
  }
}
```

### 10.2 Delete Image

**Endpoint:** `DELETE /image-upload/:id`  
**Auth Required:** Yes (Seller, Admin)

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Not Found",
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Forgot Password:** 3 requests per 15 minutes
- **Verify OTP:** 5 attempts per 15 minutes
- **Login:** 10 requests per minute
- **General API:** 100 requests per minute

---

## Roles and Permissions

### USER
- Create orders
- Manage cart
- View own profile and orders
- Receive notifications

### SELLER
- All USER permissions
- Create and manage products
- View seller dashboard
- Manage seller orders
- Must be verified to create products

### ADMIN
- All permissions
- Manage users
- Verify sellers
- View all orders
- Send emails
- Access platform analytics

---

## WebSocket Events (Pusher)

### Channel: `user-{userId}`
**Events:**
- `order-update`: Order status changed
- `new-message`: New message received
- `notification`: General notification

### Channel: `seller-{sellerId}`
**Events:**
- `new-order`: New order received
- `order-cancelled`: Order cancelled
- `verification-status`: Verification status changed

### Channel: `admin`
**Events:**
- `new-seller-registration`: New seller registered
- `platform-alert`: Platform-wide alert

---

## Rate Limits and Pagination

### Default Pagination
- Default page size: 10-20 items
- Maximum page size: 100 items
- Page numbering starts at 1

### Response Headers
```
X-Total-Count: 100
X-Page-Count: 10
X-Current-Page: 1
X-Per-Page: 10
```

---

## Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:4002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:4002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}' \
  -c cookies.txt

# Get Products (with auth)
curl http://localhost:4002/api/v1/products \
  -b cookies.txt
```

### Using JavaScript (Fetch)
```javascript
// Login
const response = await fetch('http://localhost:4002/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    username: 'test',
    password: 'Test123!'
  })
});

// Get Products
const products = await fetch('http://localhost:4002/api/v1/products', {
  credentials: 'include'
});
```

---

## Support and Resources

- **Swagger UI:** http://localhost:4002/api-docs
- **Base URL:** http://localhost:4002/api/v1
- **WebSocket:** Pusher integration for real-time updates

---

**Last Updated:** November 3, 2024  
**API Version:** 1.0
