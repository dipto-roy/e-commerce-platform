# Frontend Developer Documentation

This document explains the structure, setup, important files, and code contracts for the frontend (`/e-commerce-frontend`). It is written for developers who need to understand, run, and extend the Next.js frontend.

## Quick summary
- Framework: Next.js (App Router)
- React version: 19.x
- Directory: `/e-commerce-frontend` (root of the frontend app)
- TypeScript-based project

## Setup & run
1. Copy environment variables (example):
   - cp .env.example .env
   - Edit `.env` or `.env.local` with API URL and keys (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_KEY, etc.)

2. Install dependencies:

```bash
cd e-commerce-frontend
npm ci
# or
npm install
```

3. Local development:

```bash
npm run dev
# Default dev port: 3000 (see package.json)
```

4. Production build / preview:

```bash
npm run build
npm run start
```

## Project layout (high level)
- `src/app/` - Next.js App Router pages and routes
  - `page.tsx` - Home page
  - `admin/` - Admin app routes
  - `user/` - User dashboard pages
  - `seller/` - Seller dashboard
  - `products/` - Product listing and details pages
- `src/components/` - Reusable React components
  - `admin/` - admin UI components (AdminPayments etc.)
  - `payment/` - Stripe checkout and payment components
  - `ProductCard/` - product card UI
  - `Notification*` - notification UI components
- `src/utils/` or `src/config/` - API client and environment helpers
  - `src/utils/api.ts` - central api client (`api` axios wrapper) and helper objects: `paymentAPI`, `financialAPI`, `generalAPI`, etc.
- `public/` - static assets
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs` - project config

## Important files and components
- `src/utils/api.ts`
  - Contains `api` axios instance and client objects like `paymentAPI.getAllPayments()` and `financialAPI.getPlatformOverview()`.
  - Keep this as single source of truth for HTTP calls; update query param builders here.

- `src/app/page.tsx` (Home)
  - Client-side page (`'use client'`) that fetches paginated products using `generalAPI.getPaginatedProducts()` and implements auto-refresh + manual refresh.
  - Pagination and `isActive` handling is delegated to backend; avoid client side filtering that changes pagination counts.

- `src/components/admin/AdminPayments.tsx`
  - Admin UI for payments; important functions:
    - fetchPayments() — calls `paymentAPI.getAllPayments(page, limit, filters)` and stores payments + pagination
    - fetchPlatformOverview() — calls `financialAPI.getPlatformOverview()` for summary cards
  - Table rendering uses nested `payment.order.buyer` fields; update the `Payment` interface to match backend model.

- `src/components/payment/StripeCheckout.tsx`
  - Stripe integration UI; includes development test card display (4242...) and helpful error messages.

- Authentication/Guard hooks
  - `src/hooks/useAdminAuth.ts` and `src/hooks/useAuthGuard.ts` — use these for guarding routes.
  - `src/contexts/AuthContextNew.tsx` — auth context provider.

## Key API client contracts (frontend)
- paymentAPI.getAllPayments(page=1, limit=20, filters?) => GET `/payments` response
  - Expected response shape (HTTP 200):
    ```json
    { "success": true, "data": { "payments": [...], "total": 123, "page": 1, "totalPages": 7 } }
    ```
- generalAPI.getPaginatedProducts(page, limit) => GET `/products/paginated` response
  - Returns `{ products: Product[], totalCount, totalPages, currentPage, hasNextPage }`
- financialAPI.getPlatformOverview() => GET `/financial/platform/overview`
  - Returns platform-level metrics used for admin summary cards

When adding or changing API requests, update `src/utils/api.ts` and adjust components to read `response.data.data` if endpoint wraps data with `success` and `data`.

## Data models (frontend view)
- Product (used in UI): id, name, description, price, category, stockQuantity, isActive, images[], seller
- Payment (Admin UI): id, orderId, amount (number), currency, status, provider, paidAt, createdAt, order?: { id, orderNumber, totalAmount, paymentMethod, buyer?: { id, username, email } }

## Code documentation — Key functions & contracts (explain)

1. AdminPayments.fetchPayments
- Purpose: Load a paginated list of payments for the admin panel.
- Inputs: page (number), filters:{status,startDate,endDate}
- Calls: `paymentAPI.getAllPayments(page, limit, filters)`
- Output: sets `payments` state array, `totalPages` and `loading` state
- Edge cases: Empty pages — show "No payments found"; API errors — fallback to `[]` and show logs
- Notes: Ensure admin JWT is available in `api` axios instance headers.

2. StripeCheckout.createPayment
- Purpose: Create a Stripe Payment Intent (frontend triggers backend which then calls Stripe)
- Inputs: cart/order details
- Output: UI presentation of Stripe card input and handles the confirm flow
- Edge cases: Test card usage (displayed), network failure, declined card (show user-friendly message)

3. Home.fetchProducts
- Purpose: Fetch paginated products for home listing
- Inputs: page number
- Output: products[] and pagination metadata
- Important: Do not filter out items client-side in a way that changes pagination count. Keep filtering server-side.

## Testing
- Frontend has scripts in `package.json` (see root of `e-commerce-frontend`)
- Manual testing checklist:
  - AdminPayments: login admin → /admin/payments → filters/pagination
  - Home: fetch pages, delete product as admin and verify auto-refresh hides it
  - Payments: try test card (4242...) in StripeCheckout

## Linting / TypeScript
- Use `npm run lint` if present. TypeScript config is in `tsconfig.json`.

## Troubleshooting
- If components show empty data but backend has data:
  - Check network tab for failed requests
  - Ensure Authorization header is present (token)
  - Confirm endpoint paths in `src/utils/api.ts` match backend routes
- If images are missing: check that backend returns full `imageUrl` and `product.images` has `isActive` image

## Development tips
- Keep API clients small and centralized in `src/utils/api.ts`
- When changing backend response shape, update frontend models/interfaces first and add defensive checks
- Keep UI optimistic but show clear loading/error states

---

If you want, I can also generate JSDoc-style comments for specific frontend files (e.g. `AdminPayments.tsx`, `StripeCheckout.tsx`) — tell me which files and I'll add inline documentation and small unit tests where applicable.
