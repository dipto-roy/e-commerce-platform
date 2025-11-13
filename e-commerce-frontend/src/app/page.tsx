'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CursorTrail from "@/components/CursorTrail/CursorTrail";
import ProductCard from "@/components/ProductCard/ProductCard";
import { generalAPI, cartAPI } from "@/utils/api";
import { useAuth } from '@/contexts/AuthContextNew';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  isActive: boolean;
  images: Array<{
    id: number;
    imageUrl: string;
    altText: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  seller: {
    id: number;
    username: string;
    phone: string;
  };
}

interface PaginationData {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Function to get image URL
  const getImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const activeImage = product.images.find(img => img.isActive) || product.images[0];
      // Backend already returns complete URLs, use them directly
      return activeImage.imageUrl;
    }
    return '/images/placeholder.jpg'; // Fallback image
  };

  // Fetch products with pagination
  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await generalAPI.getPaginatedProducts(page, 12);
      const data = response.data as PaginationData;
      
      console.log(`📊 Products fetched: ${data.products.length}, page: ${page}`);
      
      // Don't filter here - backend should return only valid products
      // If a product has no images, it's a data issue that should be fixed in backend
      setProducts(data.products);
      setPagination(data);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId: number) => {
    console.log('🛒 Add to cart clicked:', { productId, isAuthenticated, user: user?.username });
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login');
      alert('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      setAddingToCart(productId);
      console.log('🚀 Making cart API call...');
      const response = await cartAPI.addToCart(productId, 1);
      console.log('✅ Cart API response:', response);
      alert('Product added to cart successfully!');
    } catch (err: any) {
      console.error('❌ Error adding to cart:', err);
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      });
      
      if (err.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        router.push('/login');
      } else {
        alert(err.response?.data?.message || 'Failed to add product to cart. Please try again.');
      }
    } finally {
      setAddingToCart(null);
    }
  };

  // Load products on component mount and set up auto-refresh
  useEffect(() => {
    fetchProducts(1);
    
    // Auto-refresh every 30 seconds to catch product deletions/updates
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing product list...');
      fetchProducts(currentPage);
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [currentPage]);

  // Pagination handlers
  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      fetchProducts(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      fetchProducts(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    fetchProducts(page);
  };

  // Generate page numbers for pagination
  const renderPageNumbers = () => {
    if (!pagination) return null;
    
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  if (loading) {
    return (
      <>
        <CursorTrail />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-white text-xl">Loading products...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CursorTrail />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-500 text-xl">Error: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <CursorTrail />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-10 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-6xl font-semibold animate-pulse">Welcome to Our E-Commerce Store</h1>
        <p>Discover a wide range of products at unbeatable prices.</p>
      </div>
      
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-4xl font-bold text-white">Featured Products</h2>
          <button
            onClick={() => fetchProducts(currentPage)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="Refresh product list"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        <p className="text-gray-400">Explore our top picks just for you</p>
        {pagination && (
          <p className="text-gray-500 mt-2">
            Showing {products.length} of {pagination.totalCount} products (Page {currentPage} of {pagination.totalPages})
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-1 aspect-h-1 w-full">
              <img
                src={getImageUrl(product)}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-blue-600">${product.price}</span>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                Sold by: {product.seller.username}
              </div>
              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={addingToCart === product.id || !product.isActive}
                className={`w-full py-2 px-4 rounded font-semibold ${
                  product.isActive
                    ? addingToCart === product.id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addingToCart === product.id ? 'Adding...' : 
                 !product.isActive ? 'Out of Stock' : 
                 !isAuthenticated ? 'Login to Order' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mb-16 space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={!pagination.hasPrevPage}
            className={`px-4 py-2 rounded ${
              pagination.hasPrevPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          {renderPageNumbers()}
          
          <button
            onClick={handleNextPage}
            disabled={!pagination.hasNextPage}
            className={`px-4 py-2 rounded ${
              pagination.hasNextPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
