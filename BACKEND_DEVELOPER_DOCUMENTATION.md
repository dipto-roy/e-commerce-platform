# Backend Developer Documentation

This document explains the backend structure, setup, important modules, API surface, and code contracts for `/e-commerce_backend`.

## Quick summary
- Framework: NestJS (TypeScript)
- ORM: TypeORM (Postgres)
- Main directories:
  - `src/order` — orders and payment entities & services
  - `src/payment` — payment module, Stripe integration, webhook handling
  - `src/product` — product endpoints and image handling
  - `src/users` — user and role management
  - `src/financial` — financial reporting and analytics
  - `src/auth` — JWT auth, guards, roles

## Setup & run
1. Configure environment variables based on `.env.example` (database, stripe keys, admin email)
2. Install dependencies and run:

```bash
cd e-commerce_backend
npm ci
npm run start:dev
```

The server uses NestJS defaults; port may be defined in `.env`.

## Project layout (high level)
- `src/main.ts` — app bootstrap
- `src/app.module.ts` — central module wiring
- `src/*/*.controller.ts` — HTTP controllers
- `src/*/*.service.ts` — business logic
- `src/*/entities/*.ts` — database entities
- `src/*/dtos/*.ts` — DTOs and validation pipes
- `src/auth/*` — authentication and role decorators

## Important modules & files

### Payments
- `src/payment/payment.controller.ts`
  - Existing endpoints include:
    - `POST /payments/stripe/webhook` — webhook handler (signature verification)
    - `GET /payments/:orderId/status` — single payment status
    - `GET /payments/:orderId/invoice` — invoice download
    - `GET /payments` — (admin) paginated list of payments — added recently. This endpoint is protected with `JwtAuthGuard` and `@Roles(Role.ADMIN)`.

- `src/payment/payment.service.ts`
  - Business logic for persisting and querying Payment entity
  - `confirmStripePayment(orderId, paymentIntent)` — called by webhook to update payments
  - `findAllPaginated(filters)` — returns paginated payments with joins to `order` and `buyer` (added)

- `src/payment/services/stripe.service.ts` — stripe integration helpers (create payment intents, refund, etc.)

- `src/order/entities/payment.entity.ts` — Payment entity model: id, orderId, provider, providerPaymentId, amount, currency, status, createdAt, paidAt, stripePaymentIntentId, stripeChargeId, relations

### Orders
- `src/order/order.controller.ts` — order endpoints, and an endpoint for `GET /orders/stats` implemented to serve UX for dashboards
- `src/order/order.service.ts` — business logic; includes `getUserOrderStats()` to compute `totalSpent`/`totalRevenue` depending on role

### Products
- `src/product/product.controller.ts` / `product.service.ts` — includes `getPaginatedProductsWithImages(page, limit)` which filters `isActive: true` and returns images and seller info

### Financials
- `src/financial/financial.service.ts` — analytics queries (platform overview, revenue analytics) used by admin frontend

### Auth & Roles
- `src/auth/jwt-auth/*` — JWT guard
- `src/auth/decorators/roles.decorator.ts` — Roles decorator
- `src/users/entities/role.enum.ts` — Role enum values (ADMIN, SELLER, USER)

## Key API endpoints (summary)
- Auth
  - `POST /auth/login` — login, returns JWT
  - `POST /auth/register` — register user
- Products
  - `GET /products/paginated?page=&limit=` — paginated products (filters isActive=true)
  - `GET /products/:id` — product details
- Orders
  - `POST /orders` — create order
  - `GET /orders/:id` — get order
  - `GET /orders/stats` — get user/seller stats (used by dashboards)
- Payments
  - `POST /payments/stripe/webhook` — stripe webhook
  - `GET /payments` — admin: list payments (pagination + filters)
  - `GET /payments/:orderId/status` — payment status
  - `GET /payments/:orderId/invoice` — download invoice PDF
  - `POST /payments/:orderId/refund` — request refund (admin)
- Financial
  - `GET /financial/platform/overview` — admin platform metrics
  - `GET /financial/revenue?startDate=&endDate=` — revenue analytics

> NOTE: exact route prefixes may be versioned (e.g. `/api/v1`) — check controller `@Controller('payments')` etc.

## Data models (summary)
### Payment (important fields)
- id: number
- orderId: number
- provider: string ('stripe', 'cod')
- providerPaymentId?: string
- amount: number
- currency: string
- status: enum PaymentStatus (PENDING, COMPLETED, FAILED, REFUNDED)
- stripePaymentIntentId?: string
- stripeChargeId?: string
- paidAt?: Date
- createdAt, updatedAt
- relation: OneToOne Order

### Order
- id, orderNumber, totalAmount, placedAt, status, paymentMethod, buyer relation, orderItems

### Product
- id, name, price, stockQuantity, isActive, images[], seller relation

## Code documentation — Key server functions & contracts (explain)

Below are the most relevant functions introduced or recently touched; use these as a contract for callers.

### PaymentController.getAllPayments
- Route: `GET /payments`
- Auth: JWT + `@Roles(Role.ADMIN)`
- Query params: `page` (number, default 1), `limit` (number, default 20), `status`?, `startDate`?, `endDate`?, `search`?
- Behavior: Calls `paymentService.findAllPaginated(filters)` and returns `{ success: true, data: result }`.
- Errors: returns `BadRequestException` with message on failure; logs error stack.

### PaymentService.findAllPaginated
- Signature: `async findAllPaginated({page, limit, status?, startDate?, endDate?, search?})`
- Behavior:
  - Builds a TypeORM query using `paymentRepository.createQueryBuilder('payment')`
  - Left joins `order` and `order.buyer` and selects limited fields to avoid large payloads
  - Applies filters: `payment.status`, `payment.createdAt BETWEEN start AND end`, and search against `order.orderNumber` or `buyer.email` or `buyer.username` (ILIKE)
  - Applies pagination: `skip`, `take`
  - Orders by `payment.createdAt` DESC
  - Returns `{ payments, total, page, totalPages }`
- Edge cases:
  - If `limit` is 0 or negative, normalize to default
  - If `page` is out of bounds, still returns the computed empty `payments` with correct pagination metadata
  - ILIKE search can be slow on large datasets; consider full-text index / materialized views for scale

### OrderService.getUserOrderStats
- Purpose: Provide dashboard stats
- Behavior: Role-aware computation:
  - Role.USER: sums their orders' `totalAmount` to produce `totalSpent`
  - Role.SELLER: sums orders containing seller's products to produce `totalRevenue`
  - ADMIN: returns site-wide stats
- Returns an object with `totalOrders, completedOrders, pendingOrders, cancelledOrders, totalAmount, recentOrders` and nested `stats` with `totalSpent`/`totalRevenue` based on role.

### ProductService.getPaginatedProductsWithImages
- Signature: `async getPaginatedProductsWithImages(page=1, limit=12)`
- Behavior:
  - `findAndCount` with `relations: ['seller', 'images']`
  - `where: { isActive: true }` ensures deleted/inactive products are not returned
  - Selects only fields needed for UI
  - Returns pagination metadata (totalCount, totalPages, currentPage, hasNext/Prev)

## Tests & scripts
- There are multiple helper and test shell scripts at repo root for manual testing (e.g. `test-product-endpoints.sh`, `test-image-fetching.sh`)
- E2E and unit tests are not included by default; add Jest (unit) and supertest (integration) for CI.

## Logging & troubleshooting
- Use Nest's logger (e.g. `this.logger.log/error`) to inspect problems in services
- Common places to check when APIs return empty data:
  - Check guards and `Roles` decorator for authorization issues
  - Confirm DTO validation hasn't rejected query params
  - Confirm the repository query's `where` clause matches the database schema (e.g. `paidAt` vs `payoutDate` bug fixed previously)

## Security & best practices
- Always validate and sanitize query params (pipes/validators)
- Ensure role-based endpoints (like `/payments`) require `@Roles(Role.ADMIN)` and JwtAuthGuard
- Avoid returning sensitive payment details in API responses (card numbers, full stripe tokens)

## Database & migrations
- TypeORM is configured via `ormconfig.ts`
- There are SQL migration helper scripts in repo root (e.g. `fix-*` SQL files). Use those carefully in dev.

## Deployment notes
- Keep `.env` secrets out of source control
- For Stripe webhooks, ensure the public webhook endpoint is reachable and `stripe-signature` header is verified in `payment.controller` webhook handler
- For large datasets, consider adding indexes on `payment.createdAt`, `payment.status`, and text-search fields.

## Example: Adding a new admin-only endpoint (pattern)
1. Add controller method in `src/<module>/<module>.controller.ts` with `@UseGuards(JwtAuthGuard)` and `@Roles(Role.ADMIN)`.
2. Add service method in corresponding `service.ts` that encapsulates DB logic.
3. Add DTO (query/body) and validate via class-validator if needed.
4. Add unit/integration test (recommended).
5. Update API docs and frontend `src/utils/api.ts` to include client method.

## Next improvements (recommendations)
- Add Jest unit tests for `PaymentService.findAllPaginated` and `OrderService.getUserOrderStats`.
- Add integration tests for `GET /payments` with mock DB fixtures.
- Add request/response schema docs (OpenAPI) for `/payments` and `/orders/stats` endpoints.
- Add Redis caching for financial overview and heavy queries.

---

If you'd like, I can:
- Generate JSDoc/TSDoc comments for the new/modified server functions (e.g. `findAllPaginated`), or
- Create minimal unit tests for `PaymentService.findAllPaginated` using an in-memory DB mock.

Tell me which option you prefer and I will implement the inline documentation or tests next.