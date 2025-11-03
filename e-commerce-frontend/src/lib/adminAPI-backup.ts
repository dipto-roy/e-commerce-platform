import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:4002',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging  
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // User management operations
  getAllUsers: () => 
    api.get('/users'),

  getUserById: (id: number) => 
    api.get(`/users/${id}`),

  createUser: (data: any) => 
    api.post('/users/create', data),

  updateUser: (id: number, data: any) => 
    api.put(`/users/${id}`, data),

  deleteUser: (id: number) => 
    api.delete(`/users/${id}`),

  toggleUserStatus: (id: number) => 
    api.put(`/users/${id}/toggle-status`),

  // Seller management operations
  getAllSellers: () => 
    api.get('/sellers/all'),

  getPendingSellers: () => 
    api.get('/admin/sellers/pending'),

  getVerifiedSellers: () => 
    api.get('/admin/sellers/verified'),

  // Seller verification methods (matching backend admin controller - uses POST)
  verifySeller: (id: number) => 
    api.post(`/admin/sellers/${id}/verify`),

  rejectSeller: (id: number, deleteAccount = false) => 
    api.post(`/admin/sellers/${id}/reject`, { deleteAccount }),

  // Seller CRUD operations (PostgreSQL/TypeORM integration)
  createSeller: (data: any) => 
    api.post('/sellers/create', data),

  updateSeller: (id: number, data: any) => 
    api.put(`/sellers/update/${id}`, data),

  deleteSeller: (id: number) => 
    api.delete(`/sellers/delete/${id}`),

  getSellerById: (id: number) => 
    api.get(`/sellers/id/${id}`),

  toggleSellerStatus: async (id: number) => {
    // Since there's no specific toggle endpoint, we'll get the seller first, then update
    const seller = await api.get(`/sellers/id/${id}`);
    const currentStatus = (seller.data as { isActive: boolean }).isActive;
    return api.patch(`/sellers/update/${id}`, { isActive: !currentStatus });
  },

  // Search sellers
  searchSellers: (substring: string) => 
    api.get(`/sellers/search/${substring}`)
};

// Additional API instance for extended functionality
const extendedApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1',
  withCredentials: true, // This ensures httpOnly cookies are sent
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add any additional headers if needed
extendedApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and errors
extendedApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login page on 401 (no auto-refresh since backend doesn't support it)
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

// Extended Admin API functions
export const extendedAdminAPI = {
  // Users - Using actual backend endpoints
  getUsers: (page = 1, limit = 10, search = '') => 
    api.get(`/users?page=${page}&limit=${limit}&search=${search}`),

  getUserById: (id: number) => 
    api.get(`/users/${id}`),

  createUser: (data: any) => 
    api.post('/users/create', data),

  updateUser: (id: number, data: any) => 
    api.put(`/users/${id}`, data),

  deleteUser: (id: number) => 
    api.delete(`/users/${id}`),

  toggleUserStatus: (id: number) => 
    api.put(`/users/${id}/toggle-status`),

  // Sellers - Using actual backend endpoints
  getSellers: (page = 1, limit = 10, search = '', status = '') => 
    api.get(`/sellers?page=${page}&limit=${limit}&search=${search}&status=${status}`),

  getAllSellers: () => 
    api.get('/sellers/all'),

  getSellerById: (id: number) => 
    api.get(`/sellers/id/${id}`),

  createSeller: (data: any) => 
    api.post('/sellers/create', data),

  updateSeller: (id: number, data: any) => 
    api.put(`/sellers/update/${id}`, data),

  deleteSeller: (id: number) => 
    api.delete(`/sellers/delete/${id}`),

  getPendingSellers: (page = 1, limit = 10) => 
    api.get(`/admin/sellers/pending?page=${page}&limit=${limit}`),

  getVerifiedSellers: () => 
    api.get('/admin/sellers/verified'),

  // Seller verification methods (matching backend admin controller - uses POST)
  approveSeller: (id: number) => 
    api.post(`/admin/sellers/${id}/verify`),

  rejectSeller: (id: number, reason?: string, deleteAccount?: boolean) => 
    api.post(`/admin/sellers/${id}/reject`, { reason, deleteAccount }),

  verifySeller: (id: number) => 
    api.post(`/admin/sellers/${id}/verify`),

  toggleSellerStatus: (id: number) => 
    api.put(`/sellers/update/${id}`, { isActive: true }), // Toggle status via update endpoint

  // Products - Using actual backend endpoints
  getProducts: (page = 1, limit = 10, search = '') => 
    api.get(`/products?page=${page}&limit=${limit}&search=${search}`),

  getProductById: (id: number) => 
    api.get(`/products/${id}`),

  createProduct: (data: FormData) => 
    api.post('/products/create-with-image', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  updateProduct: (id: number, data: any) => 
    api.put(`/products/${id}`, data),

  deleteProduct: (id: number) => 
    api.delete(`/products/${id}`),

  toggleProductStatus: (id: number) => 
    api.patch(`/products/${id}/toggle-status`),

  // Orders - Admin endpoints
  getOrders: (page = 1, limit = 10, status = '') => 
    api.get(`/admin/orders?page=${page}&limit=${limit}&status=${status}`),

  updateOrderStatus: (id: number, status: string) => 
    api.patch(`/admin/orders/${id}/status`, { status }),

  // Email Management
  sendEmail: (data: any) => 
    api.post('/mailer/send', data),

  sendBulkEmail: (data: any) => 
    api.post('/mailer/bulk', data),

  // Statistics and Counts - Using actual working endpoints
  getCounts: async () => {
    // Get counts from actual endpoints that exist
    const [users, sellers, products] = await Promise.allSettled([
      api.get('/users'),
      api.get('/sellers/all'), 
      api.get('/products')
    ]);
    
    const usersData = users.status === 'fulfilled' ? users.value.data : [];
    const sellersData = sellers.status === 'fulfilled' ? sellers.value.data : [];
    const productsData = products.status === 'fulfilled' ? products.value.data : [];
    
    return {
      data: {
        users: Array.isArray(usersData) ? usersData.length : 0,
        sellers: Array.isArray(sellersData) ? sellersData.length : 0,
        products: Array.isArray(productsData) ? productsData.length : 0,
        pendingSellers: Array.isArray(sellersData) ? sellersData.filter((s: any) => !s.isVerified).length : 0
      }
    };
  },

  getUserStats: () => 
    api.get('/users'),

  getSellerStats: () => 
    api.get('/sellers/stats/product-counts'),

  getProductStats: () => 
    api.get('/products'),

  getDashboardStats: async () => {
    // Combine multiple endpoints for comprehensive dashboard stats
    const [users, sellers, products, pendingSellers] = await Promise.allSettled([
      api.get('/users'),
      api.get('/sellers/all'),
      api.get('/products'),
      api.get('/admin/sellers/pending')
    ]);
    
    const usersData = users.status === 'fulfilled' ? users.value.data : [];
    const sellersData = sellers.status === 'fulfilled' ? sellers.value.data : [];
    const productsData = products.status === 'fulfilled' ? products.value.data : [];
    const pendingSellersData = pendingSellers.status === 'fulfilled' ? pendingSellers.value.data : [];
    
    return {
      data: {
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalSellers: Array.isArray(sellersData) ? sellersData.length : 0,
        totalProducts: Array.isArray(productsData) ? productsData.length : 0,
        pendingSellers: Array.isArray(pendingSellersData) ? pendingSellersData.length : 0,
        recentOrders: [] // Can be added when order endpoints are available
      }
    };
  },

  // Notifications
  getNotifications: (page = 1, limit = 10) => 
    api.get(`/admin/notifications?page=${page}&limit=${limit}`),

  markNotificationAsRead: (id: number) => 
    api.patch(`/admin/notifications/${id}/read`),

  markAllNotificationsAsRead: () => 
    api.patch('/admin/notifications/mark-all-read'),

  deleteNotification: (id: number) => 
    api.delete(`/admin/notifications/${id}`),

  createNotification: (data: any) => 
    api.post('/admin/notifications', data)
};

export default api;
