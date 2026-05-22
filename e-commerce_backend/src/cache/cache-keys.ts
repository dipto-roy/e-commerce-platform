/**
 * Central registry of cache key prefixes and factories.
 * Use these constants everywhere — never write raw strings inline.
 */

// ─── TTL constants (seconds) ────────────────────────────────────────────────
export const TTL = {
  /** Short-lived: list pages, search results */
  SHORT: 30,
  /** Standard: single entity, frequently read */
  MEDIUM: 120,
  /** Long: rarely mutated data (categories, seller profiles) */
  LONG: 300,
  /** Very long: static-ish data (platform settings) */
  VERY_LONG: 600,
} as const;

// ─── Prefix constants ────────────────────────────────────────────────────────
export const CACHE_KEYS = {
  // Products
  PRODUCT_LIST: 'products:list',
  PRODUCT_DETAIL: (id: number | string) => `products:detail:${id}`,
  PRODUCT_SELLER: (sellerId: number | string) => `products:seller:${sellerId}`,
  PRODUCT_SEARCH: (query: string) => `products:search:${query}`,

  // Categories
  CATEGORY_LIST: 'categories:list',
  CATEGORY_DETAIL: (id: number | string) => `categories:detail:${id}`,

  // Admin
  ADMIN_SELLERS: 'admin:sellers',
  ADMIN_SELLER_DETAIL: (id: number | string) => `admin:sellers:${id}`,
  ADMIN_STATS: 'admin:stats',
  ADMIN_ORDERS: 'admin:orders',

  // Notifications
  NOTIFICATION_STATS: 'notifications:stats',
  NOTIFICATION_USER: (userId: number | string) => `notifications:user:${userId}`,
  NOTIFICATION_UNREAD: (userId: number | string) => `notifications:unread:${userId}`,

  // Orders
  ORDER_LIST: 'orders:list',
  ORDER_DETAIL: (id: number | string) => `orders:detail:${id}`,
  ORDER_USER: (userId: number | string) => `orders:user:${userId}`,
} as const;

// ─── Prefix groups for bulk invalidation ────────────────────────────────────
export const CACHE_PREFIXES = {
  PRODUCTS: 'products:',
  CATEGORIES: 'categories:',
  ADMIN: 'admin:',
  NOTIFICATIONS: 'notifications:',
  ORDERS: 'orders:',
} as const;
