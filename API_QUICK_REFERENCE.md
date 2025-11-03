# E-Commerce API Quick Reference

## 📚 API Documentation URLs

### Interactive Documentation (Swagger UI)
**URL**: http://localhost:4002/api-docs
- Interactive API testing interface
- Try endpoints directly from browser
- JWT authentication support
- Request/response examples

### OpenAPI Specification (JSON)
**URL**: http://localhost:4002/api-docs-json
**File**: `openapi-spec.json` (saved in backend root)
- Machine-readable API specification
- Use for code generation
- Import into API clients (Postman, Insomnia)

---

## 📊 API Overview

- **Total Endpoints**: 170
- **API Modules**: 9
- **Base URL**: http://localhost:4002/api/v1
- **Authentication**: JWT Bearer Token
- **Response Format**: JSON

---

## 🔐 Authentication

### Get Access Token
```bash
# Login
curl -X POST "http://localhost:4002/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER"
  }
}
```

**Tokens**: Stored in HTTP-only cookies (`access_token`, `refresh_token`)

### Using Token in Requests
```bash
# Get token from cookie or localStorage
TOKEN="your-access-token"

# Use in Authorization header
curl -X GET "http://localhost:4002/api/v1/orders" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 API Modules

### 1. Authentication (`/auth`)
**Tag**: `Authentication`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/profile` | Get current user profile | Required |
| POST | `/auth/logout` | Logout and clear tokens | Public |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/verify-otp` | Verify OTP code | Public |
| POST | `/auth/reset-password` | Reset password with OTP | Public |
| POST | `/auth/refresh-token` | Refresh access token | Required |
| GET | `/auth/google` | Google OAuth login | Public |
| GET | `/auth/google/callback` | Google OAuth callback | Public |

---

### 2. Products (`/products`)
**Tag**: `Products`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/products` | Get all products | Public | - |
| GET | `/products/:id` | Get single product | Public | - |
| POST | `/products` | Create new product | Required | Seller/Admin |
| PUT | `/products/:id` | Update product | Required | Seller/Admin |
| DELETE | `/products/:id` | Delete product | Required | Seller/Admin |
| GET | `/products/seller/:sellerId` | Get products by seller | Public | - |
| GET | `/products/category/:category` | Get products by category | Public | - |
| GET | `/products/search` | Search products | Public | - |

**Example - Get All Products**:
```bash
curl http://localhost:4002/api/v1/products
```

**Example - Create Product** (Seller/Admin):
```bash
curl -X POST "http://localhost:4002/api/v1/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "stock": 100,
    "category": "Electronics"
  }'
```

---

### 3. Orders (`/orders`)
**Tag**: `Orders`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/orders` | Create new order | Required | User |
| POST | `/orders/from-cart` | Create order from cart | Required | User |
| GET | `/orders` | Get all orders (filtered by role) | Required | All |
| GET | `/orders/:id` | Get specific order | Required | All |
| PATCH | `/orders/:id/status` | Update order status | Required | Seller/Admin |

**Example - Create Order**:
```bash
curl -X POST "http://localhost:4002/api/v1/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 99.99
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "1234567890",
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "totalAmount": 199.98
  }'
```

**Example - Get My Orders**:
```bash
curl -X GET "http://localhost:4002/api/v1/orders?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Cart (`/cart`)
**Tag**: `Cart`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/cart/add` | Add item to cart | Required |
| GET | `/cart/items` | Get all cart items | Required |
| PUT | `/cart/items/:id` | Update cart item quantity | Required |
| DELETE | `/cart/items/:id` | Remove item from cart | Required |
| DELETE | `/cart/clear` | Clear entire cart | Required |

**Example - Add to Cart**:
```bash
curl -X POST "http://localhost:4002/api/v1/cart/add" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2
  }'
```

**Example - Get Cart Items**:
```bash
curl -X GET "http://localhost:4002/api/v1/cart/items" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. Sellers (`/sellers`)
**Tag**: `Sellers`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/sellers` | Get seller info | Public | - |
| POST | `/sellers/create` | Create new seller | Required | Seller/Admin |
| GET | `/sellers/all` | Get all sellers | Public | - |
| GET | `/sellers/:id` | Get seller details | Public | - |
| PATCH | `/sellers/:id/verify` | Verify seller | Required | Admin |
| GET | `/sellers/:id/products` | Get seller's products | Public | - |
| POST | `/sellers/:id/products` | Add product to seller | Required | Seller/Admin |
| GET | `/sellers/stats/dashboard` | Get seller dashboard stats | Required | Seller |

**Example - Get Seller Products**:
```bash
curl http://localhost:4002/api/v1/sellers/1/products
```

---

### 6. Admin (`/admin`)
**Tag**: `Admin`

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/admin/dashboard/stats` | Dashboard statistics | Admin |
| GET | `/admin/dashboard/trends` | Growth trends data | Admin |
| GET | `/admin/users` | Get all users | Admin |
| GET | `/admin/sellers` | Get all sellers | Admin |
| PATCH | `/admin/sellers/:id/verify` | Verify seller | Admin |
| GET | `/admin/orders` | Get all orders | Admin |
| PATCH | `/admin/orders/:id/status` | Update order status | Admin |
| POST | `/admin/emails/send` | Send email | Admin |
| POST | `/admin/emails/bulk` | Send bulk emails | Admin |

**Example - Get Dashboard Stats**:
```bash
curl -X GET "http://localhost:4002/api/v1/admin/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"
```

**Example - Get Trends Data**:
```bash
curl -X GET "http://localhost:4002/api/v1/admin/dashboard/trends?days=30" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Users (`/users`)
**Tag**: `Users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | Get all users | Public |
| POST | `/users/create` | Create new user | Public |
| POST | `/users/register-seller` | Register as seller | Public |
| GET | `/users/:id` | Get user by ID | Public |
| PUT | `/users/:id` | Update user | Required |
| DELETE | `/users/:id` | Delete user | Required |
| POST | `/users/login` | User login | Public |

---

### 8. Notifications (`/notifications`)
**Tag**: `Notifications`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/notifications/test-public` | Send public test notification | Public | - |
| POST | `/notifications/test` | Send test notification | Required | - |
| GET | `/notifications` | Get user notifications | Required | User |
| GET | `/notifications/unread` | Get unread notifications | Required | User |
| PATCH | `/notifications/:id/read` | Mark notification as read | Required | User |
| PATCH | `/notifications/mark-all-read` | Mark all as read | Required | User |
| POST | `/notifications/broadcast` | Send broadcast notification | Required | Admin |
| POST | `/notifications/seller/:sellerId` | Send to specific seller | Required | Admin |

**Real-time**: Uses Pusher for live notifications

**Example - Get Notifications**:
```bash
curl -X GET "http://localhost:4002/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. Financial (`/financial`)
**Tag**: `Financial`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/financial/platform/overview` | Platform financial overview | Required | Admin |
| GET | `/financial/platform/analytics` | Revenue analytics | Required | Admin |
| GET | `/financial/seller/dashboard` | Seller financial dashboard | Required | Seller |
| GET | `/financial/seller/records` | Seller financial records | Required | Seller |
| GET | `/financial/seller/withdrawals` | Seller withdrawals | Required | Seller |
| POST | `/financial/seller/withdraw` | Request withdrawal | Required | Seller |

---

### 10. Image Upload (`/image-upload`)
**Tag**: `Image Upload`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/image-upload/uploads` | Upload product image |
| GET | `/image-upload/pic/:imagename` | Get uploaded image |

**Example - Upload Image**:
```bash
curl -X POST "http://localhost:4002/api/v1/image-upload/uploads" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg"
```

---

## 🔒 Role-Based Access Control

### Roles
1. **USER** - Regular customers
2. **SELLER** - Product sellers
3. **ADMIN** - Platform administrators

### Permission Matrix

| Endpoint | USER | SELLER | ADMIN |
|----------|------|--------|-------|
| View Products | ✅ | ✅ | ✅ |
| Create Products | ❌ | ✅ | ✅ |
| View Own Orders | ✅ | ✅ | ✅ |
| View All Orders | ❌ | ⚠️ (own products) | ✅ |
| Verify Sellers | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Financial | ❌ | ⚠️ (own data) | ✅ |
| Send Notifications | ❌ | ❌ | ✅ |

---

## 🧪 Testing Workflow

### 1. Setup
```bash
# Start backend
cd e-commerce_backend
npm run start:dev
```

### 2. Register & Login
```bash
# Register new user
curl -X POST "http://localhost:4002/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "USER"
  }'

# Login
curl -X POST "http://localhost:4002/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Test Protected Endpoints
```bash
# Save token
TOKEN="your-access-token-from-login"

# Browse products
curl http://localhost:4002/api/v1/products

# Add to cart
curl -X POST "http://localhost:4002/api/v1/cart/add" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'

# View cart
curl http://localhost:4002/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN"

# Create order from cart
curl -X POST "http://localhost:4002/api/v1/orders/from-cart" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "fullName": "Test User",
      "phone": "1234567890",
      "line1": "123 Test St",
      "city": "Test City",
      "state": "TS",
      "postalCode": "12345",
      "country": "USA"
    }
  }'

# View orders
curl http://localhost:4002/api/v1/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📥 Export & Import

### Export OpenAPI Spec
```bash
# JSON format
curl http://localhost:4002/api-docs-json > api-spec.json

# YAML format (if supported)
curl http://localhost:4002/api-docs-yaml > api-spec.yaml
```

### Import to Postman
1. Open Postman
2. File → Import
3. Select `openapi-spec.json`
4. All endpoints will be imported

### Import to Insomnia
1. Open Insomnia
2. Create → Import from File
3. Select `openapi-spec.json`
4. All endpoints ready to test

---

## 🛠️ Common Response Formats

### Success Response
```json
{
  "id": 1,
  "name": "Product Name",
  "price": 99.99,
  "createdAt": "2025-11-03T10:00:00Z"
}
```

### Paginated Response
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Validation Error
```json
{
  "message": [
    "email must be a valid email",
    "password must be at least 8 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## 📊 HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |

---

## 🔍 Query Parameters

### Pagination
```
GET /products?page=1&limit=10
```

### Filtering
```
GET /orders?status=PENDING
GET /products?category=Electronics
```

### Sorting
```
GET /products?sort=price&order=asc
```

### Search
```
GET /products?search=laptop
```

---

## 📝 Request Headers

### Required Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Optional Headers
```
Accept: application/json
User-Agent: MyApp/1.0
```

---

## 🚀 Quick Links

- **Swagger UI**: http://localhost:4002/api-docs
- **OpenAPI JSON**: http://localhost:4002/api-docs-json
- **Base API URL**: http://localhost:4002/api/v1
- **Backend Repository**: e-commerce_backend/

---

## 📞 Support

### Test API
```bash
./test-swagger-api.sh
```

### View Logs
```bash
cd e-commerce_backend
npm run start:dev
# View console output
```

### Common Issues

**401 Unauthorized**:
- Solution: Login first, get token, add to Authorization header

**404 Not Found**:
- Solution: Check endpoint URL includes `/api/v1` prefix

**CORS Error**:
- Solution: Backend already configured for localhost:3000

---

**Last Updated**: November 3, 2025  
**API Version**: 1.0  
**Total Endpoints**: 170
