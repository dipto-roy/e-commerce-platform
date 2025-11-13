import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1',
  timeout: 30000, // Increased to 30 seconds for order creation
  withCredentials: true, // Include cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to log requests - cookies will be handled automatically
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📋 Request headers:', Object.keys(config.headers || {}));
    console.log('🍪 Cookies will be included automatically with withCredentials: true');
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    console.error('❌ Request URL:', error.config?.url);
    
    if (error.config?.headers && Object.keys(error.config.headers).length === 0) {
      console.warn('⚠️ Request headers are empty. This is normal for cookie-based authentication. Cookies are sent automatically.');
    } else {
      console.error('❌ Request Headers:', error.config?.headers);
    }
    
    if (error.response?.status === 400) {
      console.error('🚨 400 Bad Request - likely validation error. Check backend DTOs and request payload.');
      console.error('- Request Data:', error.config?.data);
      console.error('- Response Data:', error.response?.data);
    }
    
    // Log detailed 403 error information
    if (error.response?.status === 403) {
      console.error('🚨 403 Forbidden Error Details:');
      console.error('- URL:', error.config?.url);
      console.error('- Method:', error.config?.method?.toUpperCase());
      console.error('- Response Data:', error.response?.data);
      console.error('- Response Headers:', error.response?.headers);
    }
    
    // Handle 401 errors with automatic token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh or logout endpoints
      if (originalRequest.url?.includes('/auth/refresh') || 
          originalRequest.url?.includes('/auth/logout') ||
          originalRequest.url?.includes('/auth/login')) {
        console.log('🔐 Auth endpoint failed - not retrying');
        
        // Dispatch token expired event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('token-expired'));
        }
        
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        console.log('⏳ Token refresh in progress, queuing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            console.log('✅ Retrying queued request after token refresh');
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Access token expired, attempting to refresh...');
        
        // Dispatch token refreshing event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('token-refreshing'));
        }
        
        // Call refresh endpoint
        await api.post('/auth/refresh');
        
        console.log('✅ Token refresh successful, retrying original request');
        
        // Dispatch token refreshed event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('token-refreshed'));
        }
        
        processQueue(null);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error('❌ Token refresh failed:', refreshError.response?.status);
        
        // Dispatch token expired event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('token-expired'));
        }
        
        processQueue(refreshError);
        
        // Only redirect to login if we're in browser and not already on login page
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/signup')) {
          console.log('🔐 Redirecting to login...');
          window.location.href = '/login?expired=true';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Specific API functions for seller operations
export const sellerAPI = {
  // Get seller's products
  getMyProducts: () => api.get('/products/my-products'),
  
  // Create product with image
  createProductWithImage: (formData: FormData) => {
    return api.post('/products/create-with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update product
  updateProduct: (id: number, data: any) => {
    if (data instanceof FormData) {
      return api.put(`/products/my-product/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.put(`/products/my-product/${id}`, data);
    }
  },
  
  // Delete product
  deleteProduct: (id: number) => api.delete(`/products/my-product/${id}`),
  
  // Get product by ID
  getProduct: (id: number) => api.get(`/products/${id}`),
  
  // Get product with images
  getProductWithImages: (id: number) => api.get(`/products/${id}/with-images`),
};

// General API functions
export const generalAPI = {
  // Get all products
  getAllProducts: () => api.get('/products'),
  
  // Get paginated products with images
  getPaginatedProducts: (page: number = 1, limit: number = 12) => 
    api.get(`/products/paginated?page=${page}&limit=${limit}`),
  
  // Search products
  searchProducts: (query: string) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
  
  // Get product image
  getProductImage: (id: number) => api.get(`/products/product-image/${id}`),
  
  // Serve image file
  getImageFile: (filename: string) => `http://localhost:4002/api/v1/products/serve-image/${filename}`,
  
  // Static image URL
  getStaticImage: (filename: string) => `http://localhost:4002/api/v1/products/static/${filename}`,
};

// Cart API functions
export const cartAPI = {
  // Add product to cart
  addToCart: (productId: number, quantity: number = 1) => 
    api.post('/cart/add', { productId, quantity }),
  
  // Get cart items
  getCartItems: () => api.get('/cart/items'),
  
  // Update cart item quantity
  updateCartItem: (cartId: number, quantity: number) => 
    api.put(`/cart/items/${cartId}`, { quantity }),
  
  // Remove item from cart
  removeFromCart: (cartId: number) => api.delete(`/cart/items/${cartId}`),
  
  // Clear entire cart
  clearCart: () => api.delete('/cart/clear'),
  
  // Get cart total
  getCartTotal: () => api.get('/cart/total'),
};

// Order API functions
export const orderAPI = {
  // Create order from cart
  createOrderFromCart: (orderData: {
    shippingAddress: {
      fullName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    paymentMethod?: string; // 'cod' or 'stripe'
    notes?: string;
  }) => api.post('/orders/from-cart', orderData),
  
  // Get user's orders
  getUserOrders: (page: number = 1, limit: number = 10) => 
    api.get(`/orders?page=${page}&limit=${limit}`),
  
  // Get order by ID
  getOrder: (orderId: number) => api.get(`/orders/${orderId}`),
  
  // Cancel order
  cancelOrder: (orderId: number) => api.post(`/orders/${orderId}/cancel`),
  
  // Get user order statistics
  getUserOrderStats: () => api.get('/orders/stats'),
  
  // Create payment intent for Stripe
  createPaymentIntent: (orderId: number) => api.post(`/orders/${orderId}/create-payment-intent`),
};

// Payment API functions
export const paymentAPI = {
  // Get payment status
  getPaymentStatus: (orderId: number) => api.get(`/payments/${orderId}/status`),
  
  // Download invoice
  downloadInvoice: (orderId: number) => api.get(`/payments/${orderId}/invoice`, { responseType: 'blob' }),
  
  // Request refund (Admin)
  requestRefund: (orderId: number, data: { amount?: number; reason?: string }) => 
    api.post(`/payments/${orderId}/refund`, data),
  
  // Get all payments (Admin)
  getAllPayments: (page: number = 1, limit: number = 20, filters?: { status?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return api.get(`/payments?${params.toString()}`);
  },
};

// Financial API functions
export const financialAPI = {
  // Platform (Admin only)
  getPlatformOverview: () => api.get('/financial/platform/simple-overview'),
  getFullPlatformOverview: () => api.get('/financial/platform/overview'),
  getRevenueAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/financial/platform/analytics?${params.toString()}`);
  },
  getSellerComparison: (period?: 'month' | 'quarter' | 'year') => 
    api.get(`/financial/platform/seller-comparison${period ? `?period=${period}` : ''}`),
  
  // Seller endpoints
  getMySummary: () => api.get('/financial/my-summary'),
  getMyPayouts: (page: number = 1, limit: number = 20) => 
    api.get(`/financial/my-payouts?page=${page}&limit=${limit}`),
  
  // Shared endpoints
  getSummary: (sellerId?: number) => 
    api.get(`/financial/summary${sellerId ? `?sellerId=${sellerId}` : ''}`),
  getPayouts: (sellerId?: number, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (sellerId) params.append('sellerId', sellerId.toString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return api.get(`/financial/payouts?${params.toString()}`);
  },
};

// User Dashboard API functions
export const userDashboardAPI = {
  // Get user dashboard statistics
  getDashboardStats: () => api.get('/orders/stats'),
  
  // Get recent orders for dashboard
  getRecentOrders: (limit: number = 5) => 
    api.get(`/orders?page=1&limit=${limit}`),
};

// Seller order API functions
export const sellerOrderAPI = {
  // Get seller's orders
  getSellerOrders: (page: number = 1, limit: number = 10) => 
    api.get(`/orders/seller/orders?page=${page}&limit=${limit}`),
  
  // Update order status
  updateOrderStatus: (orderId: number, status: string) => 
    api.patch(`/orders/${orderId}/status`, { status }),
  
  // Get seller financials
  getSellerFinancials: () => api.get('/orders/seller/financials'),
};

// Seller Dashboard API functions
export const sellerDashboardAPI = {
  // Get dashboard overview with stats
  getDashboardOverview: () => api.get('/sellers/dashboard/overview'),
  
  // Get dashboard orders
  getDashboardOrders: (page: number = 1, limit: number = 10) => 
    api.get(`/sellers/dashboard/orders?page=${page}&limit=${limit}`),
  
  // Get recent orders
  getRecentOrders: (limit: number = 5) => 
    api.get(`/sellers/dashboard/recent-orders?limit=${limit}`),
  
  // Get financial records
  getFinancialRecords: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/sellers/dashboard/financial-records?${params.toString()}`);
  },
  
  // Get dashboard report
  getDashboardReport: () => api.get('/sellers/dashboard/report'),
};

// Mail API functions for seller communication
export const mailAPI = {
  // Send seller-to-buyer message
  sendSellerToBuyer: (messageData: {
    fromName: string;
    fromEmail: string;
    toName: string;
    toEmail: string;
    subject: string;
    message: string;
    productName?: string;
    orderId?: string;
  }) => api.post('/mailer/seller-to-buyer', messageData),

  // Test email functionality
  sendTestEmail: (email: string) => api.post('/mailer/test', { email }),

  // Send order confirmation email
  sendOrderConfirmation: (orderData: any) => api.post('/mailer/order-confirmation', orderData),

  // Send order status update
  sendOrderStatusUpdate: (updateData: {
    email: string;
    customerName: string;
    orderId: string;
    status: string;
    trackingNumber?: string;
  }) => api.post('/mailer/order-status-update', updateData),
};

export default api;