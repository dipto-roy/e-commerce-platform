import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:4002/api/v1',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage if available
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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

  getUsers: (page = 1, limit = 10, search = '') => {
    // Backend doesn't support pagination yet, so we'll fetch all and handle client-side
    return api.get('/users').then(response => {
      const users = Array.isArray(response.data) ? response.data : [];
      const filteredUsers = search 
        ? users.filter((user: any) => 
            user.username?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase()) ||
            user.fullName?.toLowerCase().includes(search.toLowerCase())
          )
        : users;
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      return {
        ...response,
        data: {
          users: paginatedUsers,
          total: filteredUsers.length,
          page: page,
          totalPages: Math.ceil(filteredUsers.length / limit)
        }
      };
    });
  },

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
    const currentStatus = (seller.data as any).isActive;
    return api.patch(`/sellers/update/${id}`, { isActive: !currentStatus });
  },

  // Search sellers
  searchSellers: (substring: string) => 
    api.get(`/sellers/search/${substring}`),

  // Product management operations
  getAllProducts: async (currentPage: number, limit: number, searchTerm: string) => {
    const response = await api.get('/products');
    // Transform backend response to match frontend expectations
    const products = Array.isArray(response.data) ? response.data : [];
    const transformedProducts = products.map((product: any) => ({
      ...product,
      title: product.name || product.title || 'Untitled Product', // Map 'name' to 'title'
      stock: product.stockQuantity !== null && product.stockQuantity !== undefined 
        ? product.stockQuantity 
        : (product.stock !== null && product.stock !== undefined ? product.stock : 0), // Map 'stockQuantity' to 'stock'
      category: product.category || 'Uncategorized', // Default category if null
      images: product.images?.map((img: any) => img.imageUrl || img) || [], // Extract imageUrl from image objects
    }));
    
    // Client-side filtering
    const filteredProducts = searchTerm 
      ? transformedProducts.filter((p: any) => 
          p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : transformedProducts;
    
    // Client-side pagination
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      ...response,
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
        page: currentPage,
        totalPages: Math.ceil(filteredProducts.length / limit)
      }
    };
  },

  getProductById: (id: number) => 
    api.get(`/products/${id}`).then(response => {
      const product = response.data as any;
      return {
        ...response,
        data: {
          ...product,
          title: product.name || product.title || 'Untitled Product',
          stock: product.stockQuantity !== null && product.stockQuantity !== undefined 
            ? product.stockQuantity 
            : (product.stock !== null && product.stock !== undefined ? product.stock : 0),
          category: product.category || 'Uncategorized',
          images: product.images?.map((img: any) => img.imageUrl || img) || [],
        }
      };
    }),

  createProduct: async (data: FormData) => {
    // Transform FormData: title->name, stock->stockQuantity, images->file
    const transformedData = new FormData();
    
    // Get values from frontend format
    const title = data.get('title');
    const stock = data.get('stock');
    const images = data.getAll('images');
    
    // Map to backend format
    if (title) transformedData.append('name', title as string);
    if (stock) transformedData.append('stockQuantity', stock as string);
    
    // Copy other fields
    const otherFields = ['description', 'price', 'category', 'isActive', 'sellerId'];
    otherFields.forEach(field => {
      const value = data.get(field);
      if (value !== null) transformedData.append(field, value as string);
    });
    
    // Backend expects 'file' (singular) for main image
    if (images && images.length > 0) {
      transformedData.append('file', images[0] as File);
    }
    
    return api.post('/products/create-with-image', transformedData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateProduct: async (id: number, data: any) => {
    // Transform: title->name, keep stock as 'stock' (UpdateProductDto expects 'stock')
    const transformedData: any = {};
    
    if (data.title !== undefined) transformedData.name = data.title;
    if (data.stock !== undefined) transformedData.stock = data.stock; // UpdateProductDto accepts 'stock'
    
    // Copy other fields
    const otherFields = ['description', 'price', 'category', 'isActive'];
    otherFields.forEach(field => {
      if (data[field] !== undefined) transformedData[field] = data[field];
    });
    
    return api.put(`/products/${id}`, transformedData);
  },

  deleteProduct: (id: number) => 
    api.delete(`/products/${id}`),

  toggleProductStatus: async (id: number) => {
    // Backend doesn't have toggle-status endpoint, so get product first then update
    const response = await api.get(`/products/${id}`);
    const product = response.data as any;
    const newStatus = !product.isActive;
    
    return api.put(`/products/${id}`, { isActive: newStatus });
  },

  // Orders - Admin endpoints
  getOrders: async (page = 1, limit = 10, status = '') => {
    const response = await api.get(`/admin/orders?page=${page}&limit=${limit}&status=${status}`);
    const data = response.data as any;
    
    // Transform backend response to match frontend expectations
    const orders = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []);
    const transformedOrders = orders.map((order: any) => ({
      ...order,
      orderNumber: order.orderNumber || `ORD-${order.id}`, // Generate order number if missing
      user: order.buyer || order.user, // Map 'buyer' to 'user'
      items: (order.orderItems || order.items || []).map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          title: item.product?.name || item.product?.title,
          images: item.product?.images?.map((img: any) => img.imageUrl || img) || []
        }
      })),
      shippingAddress: order.shippingAddress || {
        address: order.shippingAddress?.line1 || '',
        city: order.shippingAddress?.city || '',
        postalCode: order.shippingAddress?.postalCode || '',
        country: order.shippingAddress?.country || ''
      },
      createdAt: order.placedAt || order.createdAt,
    }));
    
    return {
      ...response,
      data: {
        orders: transformedOrders,
        total: data.total || transformedOrders.length,
        totalPages: data.totalPages || Math.ceil(transformedOrders.length / limit)
      }
    };
  },

  updateOrderStatus: (id: number, status: string) => 
    api.patch(`/admin/orders/${id}/status`, { status: status.toUpperCase() }),

  // Email Management
  sendEmail: (data: { subject: string; message: string; recipients: string[] }) => 
    api.post('/admin/emails/send', data),

  sendBulkEmail: (data: { subject: string; message: string; recipientType: 'all' | 'users' | 'sellers' }) => 
    api.post('/admin/emails/send-bulk', data),

  getEmailHistory: () => 
    api.get('/admin/emails/history'),

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

  // Notifications - Using the correct notification endpoints
  getNotifications: (page = 1, limit = 10) => 
    api.get(`/notifications/my?page=${page}&limit=${limit}`),

  markNotificationAsRead: (id: number) => 
    api.post(`/notifications/${id}/read`),

  markAllNotificationsAsRead: () => 
    api.post('/notifications/my/read-all'),

  deleteNotification: (id: number) => 
    api.post(`/notifications/${id}/delete`),

  createNotification: (data: any) => 
    api.post('/notifications/send', data),

  // Dashboard Trends
  getDashboardTrends: async (
    period: '7days' | '30days' | '3months' | '1year' = '7days'
  ): Promise<{
    success: boolean;
    data: Array<{
      date: string;
      users: number;
      sellers: number;
      products: number;
    }>;
    period: string;
    startDate: string;
    endDate: string;
  }> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: Array<{
          date: string;
          users: number;
          sellers: number;
          products: number;
        }>;
        period: string;
        startDate: string;
        endDate: string;
      }>(`/admin/dashboard/trends`, {
        params: { period },
      });
      console.log('📈 Dashboard trends fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard trends:', error);
      throw error;
    }
  },
};

export default api;