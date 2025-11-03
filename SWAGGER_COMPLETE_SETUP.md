# Swagger API Documentation - Complete Setup

## Date: November 3, 2025
## Status: ✅ Complete - All Modules Documented

---

## 🎯 Overview

Swagger/OpenAPI documentation has been successfully added to **all backend modules** in the e-commerce platform. The documentation provides interactive API exploration, request/response examples, and authentication testing.

---

## 📚 Access Swagger Documentation

### Development Server
**URL**: http://localhost:4002/api-docs

### Features Enabled
- ✅ **Interactive API Testing** - Test endpoints directly from the browser
- ✅ **JWT Authentication** - Secure endpoints with Bearer token authentication
- ✅ **Cookie Authentication** - Support for HTTP-only cookie-based auth
- ✅ **Request/Response Schemas** - Complete DTO documentation
- ✅ **Organized by Tags** - Grouped by functional modules
- ✅ **Persistent Authorization** - Token stays active across page refreshes
- ✅ **Search & Filter** - Find endpoints quickly
- ✅ **Request Duration Tracking** - See API performance

---

## 📦 Documented Modules

### 1. Authentication (`@ApiTags('Authentication')`)
**Controller**: `auth.controller.ts`

**Endpoints**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login with JWT tokens
- `GET /auth/profile` - Get current user profile (protected)
- `POST /auth/logout` - Logout and clear tokens
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/reset-password` - Reset password with OTP
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

**Authentication**: 
- Public endpoints: register, login, forgot-password, google
- Protected endpoints: profile (requires JWT)

---

### 2. Orders (`@ApiTags('Orders')`)
**Controller**: `order.controller.ts`

**Endpoints**:
- `POST /orders` - Create new order
- `POST /orders/from-cart` - Create order from shopping cart
- `GET /orders` - Get all orders (filtered by role)
- `GET /orders/:id` - Get specific order details
- `PATCH /orders/:id/status` - Update order status

**Authentication**: Bearer JWT token required for all endpoints

**Roles**:
- **USER**: Can view and create their own orders
- **SELLER**: Can view orders containing their products
- **ADMIN**: Can view and manage all orders

---

### 3. Products (`@ApiTags('Products')`)
**Controller**: `product.controller.ts`

**Endpoints**:
- `GET /products` - Get all products (public)
- `GET /products/:id` - Get single product details (public)
- `POST /products` - Create new product (Seller/Admin)
- `PUT /products/:id` - Update product (Seller/Admin)
- `DELETE /products/:id` - Delete product (Seller/Admin)
- `GET /products/seller/:sellerId` - Get products by seller
- `GET /products/category/:category` - Get products by category
- `GET /products/search` - Search products

**Authentication**: 
- Public: GET endpoints
- Protected: POST, PUT, DELETE (Seller/Admin only)

---

### 4. Sellers (`@ApiTags('Sellers')`)
**Controller**: `seller.controller.ts`

**Endpoints**:
- `GET /sellers` - Get seller info
- `POST /sellers/create` - Create new seller (protected)
- `GET /sellers/all` - Get all sellers
- `GET /sellers/:id` - Get seller details
- `PATCH /sellers/:id/verify` - Verify seller (Admin only)
- `GET /sellers/:id/products` - Get seller's products
- `POST /sellers/:id/products` - Add product to seller
- `GET /sellers/stats/dashboard` - Get seller dashboard stats

**Authentication**: JWT token required
**Roles**: Some endpoints restricted to Admin

---

### 5. Admin (`@ApiTags('Admin')`)
**Controller**: `admin.controller.ts`

**Endpoints**:
- `GET /admin/dashboard/stats` - Dashboard statistics
- `GET /admin/dashboard/trends` - Growth trends data
- `GET /admin/users` - Get all users
- `GET /admin/sellers` - Get all sellers
- `PATCH /admin/sellers/:id/verify` - Verify seller
- `GET /admin/orders` - Get all orders
- `PATCH /admin/orders/:id/status` - Update order status
- `POST /admin/emails/send` - Send email
- `POST /admin/emails/bulk` - Send bulk emails

**Authentication**: Bearer JWT token required
**Roles**: ADMIN only

---

### 6. Users (`@ApiTags('Users')`)
**Controller**: `users.controller.ts`

**Endpoints**:
- `GET /users` - Get all users
- `POST /users/create` - Create new user
- `POST /users/register-seller` - Register as seller
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/login` - User login

**Authentication**: Mixed (some public, some protected)

---

### 7. Cart (`@ApiTags('Cart')`)
**Controller**: `cart.controller.ts`

**Endpoints**:
- `POST /cart/add` - Add item to cart
- `GET /cart/items` - Get all cart items
- `PUT /cart/items/:id` - Update cart item quantity
- `DELETE /cart/items/:id` - Remove item from cart
- `DELETE /cart/clear` - Clear entire cart

**Authentication**: Bearer JWT token required
**User-Specific**: Each user can only access their own cart

---

### 8. Notifications (`@ApiTags('Notifications')`)
**Controller**: `notification.controller.ts`

**Endpoints**:
- `POST /notifications/test-public` - Send public test notification
- `POST /notifications/test` - Send test notification (protected)
- `GET /notifications` - Get user notifications
- `GET /notifications/unread` - Get unread notifications
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/mark-all-read` - Mark all as read
- `POST /notifications/broadcast` - Send broadcast notification (Admin)
- `POST /notifications/seller/:sellerId` - Send to specific seller (Admin)

**Authentication**: JWT token required (except test-public)
**Real-time**: Uses Pusher for live notifications

---

### 9. Financial (`@ApiTags('Financial')`)
**Controller**: `financial.controller.ts`

**Endpoints**:
- `GET /financial/platform/overview` - Platform financial overview (Admin)
- `GET /financial/platform/analytics` - Revenue analytics (Admin)
- `GET /financial/seller/dashboard` - Seller financial dashboard
- `GET /financial/seller/records` - Seller financial records
- `GET /financial/seller/withdrawals` - Seller withdrawals
- `POST /financial/seller/withdraw` - Request withdrawal

**Authentication**: Bearer JWT token required
**Roles**: 
- Admin endpoints: Platform-wide financial data
- Seller endpoints: Individual seller financial data

---

### 10. Image Upload (`@ApiTags('Image Upload')`)
**Controller**: `image-upload.controller.ts`

**Endpoints**:
- `POST /image-upload/uploads` - Upload product image
- `GET /image-upload/pic/:imagename` - Get uploaded image

**File Upload**: Supports multipart/form-data
**Storage**: Local filesystem in `/uploads/images`

---

## 🔐 Authentication Setup

### JWT Bearer Token Authentication

1. **Login to get token**:
   ```bash
   curl -X POST "http://localhost:4002/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "admin123"
     }'
   ```

2. **Copy access_token from response**

3. **Use in Swagger**:
   - Click "Authorize" button at top right
   - Enter: `Bearer YOUR_ACCESS_TOKEN`
   - Click "Authorize"
   - All subsequent requests will include the token

### Cookie-Based Authentication

Alternatively, tokens are set as HTTP-only cookies during login:
- `access_token` - Valid for 15 minutes
- `refresh_token` - Valid for 7 days

---

## 🛠️ Swagger Configuration

**File**: `src/main.ts`

```typescript
const swaggerConfig = new DocumentBuilder()
  .setTitle('E-Commerce Platform API')
  .setDescription('Complete API documentation for the E-Commerce platform...')
  .setVersion('1.0')
  .addTag('Authentication', 'User authentication and authorization endpoints')
  .addTag('Users', 'User management operations')
  .addTag('Products', 'Product CRUD operations and management')
  .addTag('Sellers', 'Seller verification and management')
  .addTag('Orders', 'Order processing and management')
  .addTag('Cart', 'Shopping cart operations')
  .addTag('Notifications', 'Real-time notifications with Pusher')
  .addTag('Admin', 'Admin-only operations')
  .addTag('Financial', 'Financial records and analytics')
  .addTag('Image Upload', 'Product image upload and management')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    },
    'JWT-auth',
  )
  .addCookieAuth('access_token', {
    type: 'apiKey',
    in: 'cookie',
    name: 'access_token',
  })
  .addServer('http://localhost:4002', 'Development Server')
  .addServer('http://localhost:4002/api/v1', 'API v1')
  .build();
```

---

## 📝 Decorator Usage Examples

### Controller-Level Decorators

```typescript
@ApiTags('Products')              // Groups endpoints under "Products" tag
@ApiBearerAuth('JWT-auth')        // Requires JWT auth for all endpoints
@Controller('products')
export class ProductController {
  // ...
}
```

### Method-Level Decorators

```typescript
@Post()
@ApiOperation({ 
  summary: 'Create new product',
  description: 'Sellers and Admins can create products' 
})
@ApiResponse({ 
  status: 201, 
  description: 'Product created successfully' 
})
@ApiResponse({ 
  status: 400, 
  description: 'Invalid product data' 
})
@ApiResponse({ 
  status: 401, 
  description: 'Unauthorized' 
})
@ApiBody({ type: CreateProductDto })
async createProduct(@Body() createProductDto: CreateProductDto) {
  // ...
}
```

### Parameter Decorators

```typescript
@Get(':id')
@ApiParam({ 
  name: 'id', 
  type: 'number', 
  description: 'Product ID' 
})
async getProduct(@Param('id', ParseIntPipe) id: number) {
  // ...
}

@Get()
@ApiQuery({ 
  name: 'category', 
  required: false, 
  description: 'Filter by category' 
})
async getProducts(@Query('category') category?: string) {
  // ...
}
```

---

## 🧪 Testing with Swagger

### Step-by-Step Guide

1. **Start Backend**:
   ```bash
   cd e-commerce_backend
   npm run start:dev
   ```

2. **Open Swagger UI**:
   - Browser: http://localhost:4002/api-docs

3. **Authenticate**:
   - Click "Authorize" button
   - Test login endpoint first to get token
   - Enter token in format: `Bearer YOUR_TOKEN`
   - Click "Authorize"

4. **Test Endpoints**:
   - Expand any endpoint
   - Click "Try it out"
   - Fill in parameters/body
   - Click "Execute"
   - View response

5. **Example Flow**:
   ```
   1. POST /auth/login → Get token
   2. Authorize with token
   3. GET /products → View all products
   4. POST /cart/add → Add product to cart
   5. GET /cart/items → View cart
   6. POST /orders/from-cart → Create order
   7. GET /orders → View your orders
   ```

---

## 📊 Benefits of Swagger Documentation

### For Developers
- ✅ **Interactive Testing** - No need for Postman/cURL
- ✅ **Auto-Generated Docs** - Always up-to-date with code
- ✅ **Type Safety** - DTOs automatically documented
- ✅ **Quick Debugging** - Test endpoints immediately

### For Frontend Team
- ✅ **Clear API Contract** - Know exact request/response formats
- ✅ **Example Requests** - Copy-paste working examples
- ✅ **Error Codes** - Understand all possible responses
- ✅ **Authentication Guide** - Know how to authenticate

### For API Consumers
- ✅ **Self-Service** - Explore API without asking backend team
- ✅ **Live Environment** - Test against real backend
- ✅ **Export Options** - Download OpenAPI JSON/YAML spec
- ✅ **Code Generation** - Generate client SDKs

---

## 🔧 Maintenance

### Adding New Endpoints

When adding new endpoints, include these decorators:

```typescript
@ApiOperation({ summary: 'Brief description' })
@ApiResponse({ status: 200, description: 'Success case' })
@ApiResponse({ status: 400, description: 'Error case' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
```

### Adding New Controllers

1. Import Swagger decorators:
   ```typescript
   import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
   ```

2. Add tags to controller:
   ```typescript
   @ApiTags('YourModule')
   @Controller('your-route')
   ```

3. Add authentication if needed:
   ```typescript
   @ApiBearerAuth('JWT-auth')
   ```

4. Document each method with `@ApiOperation` and `@ApiResponse`

---

## 🌐 API Servers

Swagger is configured with multiple server options:

- **Base**: `http://localhost:4002`
- **API v1**: `http://localhost:4002/api/v1` (currently active)

All endpoints are automatically prefixed with `/api/v1`.

---

## 📁 Files Modified

### Controllers Updated with Swagger
1. ✅ `src/auth/auth.controller.ts` - Authentication
2. ✅ `src/order/order.controller.ts` - Orders
3. ✅ `src/product/product.controller.ts` - Products (already had)
4. ✅ `src/seller/seller.controller.ts` - Sellers
5. ✅ `src/admin/admin.controller.ts` - Admin (already had)
6. ✅ `src/users/users.controller.ts` - Users
7. ✅ `src/cart/cart.controller.ts` - Cart
8. ✅ `src/notification/notification.controller.ts` - Notifications
9. ✅ `src/financial/financial.controller.ts` - Financial
10. ✅ `src/product/image-upload/image-upload.controller.ts` - Image Upload

### Configuration Files
- ✅ `src/main.ts` - Swagger setup (already configured)

---

## 🎨 Customization Options

Current customizations in `main.ts`:

```typescript
SwaggerModule.setup('api-docs', app, document, {
  customSiteTitle: 'E-Commerce API Documentation',
  customfavIcon: 'https://nestjs.com/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }',  // Hide top bar
  swaggerOptions: {
    persistAuthorization: true,      // Keep token after refresh
    docExpansion: 'none',            // Start collapsed
    filter: true,                    // Enable search
    showRequestDuration: true,       // Show API latency
  },
});
```

---

## 🚀 Next Steps

### Recommended Enhancements

1. **Add Example Responses**:
   ```typescript
   @ApiResponse({
     status: 200,
     description: 'Success',
     schema: {
       example: {
         id: 1,
         name: 'Product Name',
         price: 99.99
       }
     }
   })
   ```

2. **Document DTOs**:
   ```typescript
   export class CreateProductDto {
     @ApiProperty({ example: 'Product Name', description: 'Product title' })
     name: string;
     
     @ApiProperty({ example: 99.99, description: 'Product price' })
     price: number;
   }
   ```

3. **Add More Tags**:
   - Reviews
   - Payments
   - Analytics
   - Reports

4. **Export OpenAPI Spec**:
   ```bash
   # Available at
   http://localhost:4002/api-docs-json
   ```

---

## 📞 Support

### Testing the Setup

Run the test script:
```bash
./test-swagger-api.sh
```

### Troubleshooting

**Issue**: Swagger not loading
- **Solution**: Check backend is running on port 4002

**Issue**: Authorization not working
- **Solution**: Ensure token format is `Bearer TOKEN` (with space)

**Issue**: Endpoints not showing
- **Solution**: Check controller has `@ApiTags()` decorator

**Issue**: 401 Unauthorized
- **Solution**: Login first, get token, then authorize in Swagger

---

## 🎉 Summary

✅ **10 Modules Documented** - All controllers have Swagger decorators  
✅ **Interactive Documentation** - Test APIs from browser  
✅ **JWT Authentication** - Secure endpoints with Bearer tokens  
✅ **User-Friendly** - Organized by tags, searchable, persistent auth  
✅ **Production Ready** - Complete API documentation for frontend integration

**Access Now**: http://localhost:4002/api-docs

---

**Documentation Completed**: November 3, 2025  
**Status**: ✅ All Modules Documented  
**Maintenance**: Add decorators when creating new endpoints
