import axios from 'axios';

/**
 * API Client for E-Commerce Backend
 */
class ApiClient {
  private client: any;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      withCredentials: true, // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config: any) => {
        // Note: Origin header is automatically set by the browser for CORS requests
        // Do not manually set it as it causes "unsafe header" warnings
        
        if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
          console.log('API Request:', config);
        }
        
        return config;
      },
      (error: any) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => {
        if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
          console.log('API Response:', response);
        }
        return response;
      },
      async (error: any) => {
        console.error('API Response Error:', error);
        
        // Handle common errors
        if (error.response) {
          const { status, data } = error.response;
          
          // Handle 401 - Try to refresh token
          if (status === 401) {
            try {
              // Try to refresh the token
              await this.client.post('/auth/refresh');
              
              // Retry the original request
              return this.client.request(error.config);
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              // Redirect to login if refresh fails
              if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
              }
              return Promise.reject(refreshError);
            }
          }
          
          switch (status) {
            case 400:
              console.error('Bad Request:', data);
              break;
            case 403:
              console.error('Forbidden:', data);
              break;
            case 404:
              console.error('Not Found:', data);
              break;
            case 500:
              console.error('Internal Server Error:', data);
              break;
            default:
              console.error('API Error:', data);
          }
        } else if (error.request) {
          console.error('Network Error: Cannot connect to server');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get(url: string, config?: any): Promise<any> {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: any): Promise<any> {
    return this.client.post(url, data, config);
  }

  async put(url: string, data?: any, config?: any): Promise<any> {
    return this.client.put(url, data, config);
  }

  async patch(url: string, data?: any, config?: any): Promise<any> {
    return this.client.patch(url, data, config);
  }

  async delete(url: string, config?: any): Promise<any> {
    return this.client.delete(url, config);
  }
}

// User API methods
export class UserAPI {
  constructor(private client: ApiClient) {}

  async createUser(userData: {
    username: string;
    fullName?: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
  }) {
    return this.client.post('/users/create', userData);
  }

  async loginUser(credentials: { email: string; password: string }) {
    return this.client.post('/users/login', credentials);
  }

  async getUserById(id: string) {
    return this.client.get(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.client.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return this.client.delete(`/users/${id}`);
  }
}

// Product API methods
export class ProductAPI {
  constructor(private client: ApiClient) {}

  async getAllProducts() {
    return this.client.get('/products/with-images');
  }

  async getProductById(id: string) {
    return this.client.get(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.client.post('/products/create', productData);
  }

  async updateProduct(id: string, productData: any) {
    return this.client.put(`/products/${id}`, productData);
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/products/${id}`);
  }
}

// Auth API methods
export class AuthAPI {
  constructor(private client: ApiClient) {}

  async register(userData: any) {
    return this.client.post('/auth/register', userData);
  }

  async login(credentials: { email: string; password: string }) {
    return this.client.post('/auth/login', credentials);
  }
}

// Cart API methods
export class CartAPI {
  constructor(private client: ApiClient) {}

  async getCartItems() {
    return this.client.get('/cart/items');
  }

  async addToCart(productId: number, quantity: number = 1) {
    return this.client.post('/cart/add', { productId, quantity });
  }

  async updateCartItem(cartId: number, quantity: number) {
    return this.client.put(`/cart/items/${cartId}`, { quantity });
  }

  async removeFromCart(cartId: number) {
    return this.client.delete(`/cart/items/${cartId}`);
  }

  async clearCart() {
    return this.client.delete('/cart/clear');
  }

  async getCartTotal() {
    return this.client.get('/cart/total');
  }

  async getCartCount() {
    try {
      const response = await this.getCartItems();
      const cartItems = response.data || [];
      return cartItems.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    } catch (error) {
      console.error('Failed to get cart count:', error);
      return 0;
    }
  }
}

// Create singleton instances
const apiClient = new ApiClient();
export const userAPI = new UserAPI(apiClient);
export const productAPI = new ProductAPI(apiClient);
export const authAPI = new AuthAPI(apiClient);
export const cartAPI = new CartAPI(apiClient);

// Simple helper functions using only environment variables
export const getApiUrl = (endpoint: string) => {
  return `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
};

export const getUsersApiUrl = () => {
  return getApiUrl(process.env.NEXT_PUBLIC_USERS_ENDPOINT || '/users');
};

export const getProductsApiUrl = () => {
  return getApiUrl(process.env.NEXT_PUBLIC_PRODUCTS_ENDPOINT || '/products');
};

export const getAuthApiUrl = () => {
  return getApiUrl(process.env.NEXT_PUBLIC_AUTH_ENDPOINT || '/auth');
};

export default apiClient;
