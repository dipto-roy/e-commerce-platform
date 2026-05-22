'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, RefreshCw, Package, Leaf, Star } from 'lucide-react';
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

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton w-full h-48" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-9 w-full mt-2" />
      </div>
    </div>
  );
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

  const getImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const activeImage = product.images.find(img => img.isActive) || product.images[0];
      return activeImage.imageUrl;
    }
    return '/images/placeholder.jpg';
  };

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await generalAPI.getPaginatedProducts(page, 12);
      const data = response.data as PaginationData;
      setProducts(data.products);
      setPagination(data);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      setAddingToCart(productId);
      await cartAPI.addToCart(productId, 1);
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) {
        (window as any).refreshCartCount();
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setAddingToCart(null);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    const refreshInterval = setInterval(() => fetchProducts(currentPage), 30000);
    return () => clearInterval(refreshInterval);
  }, [currentPage]);

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
          onClick={() => fetchProducts(i)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            i === currentPage
              ? 'bg-[var(--accent-500)] text-white'
              : 'bg-white border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent-300)] hover:text-[var(--accent-600)]'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section
        style={{ background: 'linear-gradient(135deg, var(--accent-50) 0%, #ffffff 60%)' }}
        className="border-b border-[var(--border)]"
      >
        <div className="container-app py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="chip mb-6 mx-auto w-fit">
              <Leaf className="w-3.5 h-3.5" />
              Free shipping on orders over $50
            </div>
            <h1 className="section-title mb-4">
              Discover Amazing<br />
              <span style={{ color: 'var(--accent-600)' }}>Products</span>
            </h1>
            <p className="section-subtitle mb-8 max-w-md mx-auto">
              Shop thousands of curated items from verified sellers at unbeatable prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products" className="btn btn-primary btn-lg">
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/Singup" className="btn btn-outline btn-lg">
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="container-app">
          <div className="grid grid-cols-3 divide-x divide-[var(--border)] py-4 text-center">
            {[
              { label: 'Products', value: pagination ? `${pagination.totalCount}+` : '…' },
              { label: 'Verified Sellers', value: '200+' },
              { label: 'Happy Customers', value: '10k+' },
            ].map(stat => (
              <div key={stat.label} className="px-4 py-2">
                <p className="text-xl font-bold" style={{ color: 'var(--accent-600)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products section */}
      <div className="container-app py-10">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="section-title">Featured Products</h2>
            {pagination && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {products.length} of {pagination.totalCount} products · Page {currentPage}/{pagination.totalPages}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchProducts(currentPage)}
            disabled={loading}
            className="btn btn-outline btn-sm self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="alert alert-error mb-6">
            <Package className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
                <div key={product.id} className="card card-interactive overflow-hidden flex flex-col">
                  <Link href={`/products/${product.id}`} className="block overflow-hidden bg-[var(--bg-tertiary)]">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }}
                    />
                  </Link>
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${product.id}`}>
                        <h3 className="text-sm font-semibold line-clamp-2 leading-snug hover:text-[var(--accent-600)] transition-colors"
                          style={{ color: 'var(--text-primary)' }}>
                          {product.name}
                        </h3>
                      </Link>
                      {!product.isActive && (
                        <span className="badge badge-red shrink-0 text-[10px]">OOS</span>
                      )}
                    </div>

                    <span className="badge badge-gray w-fit text-xs">{product.category}</span>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-lg font-bold" style={{ color: 'var(--accent-600)' }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        by {product.seller?.username}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart === product.id || !product.isActive}
                      className="btn btn-primary btn-full btn-sm mt-1"
                    >
                      {addingToCart === product.id ? (
                        <><span className="spinner" style={{ width: '0.9rem', height: '0.9rem' }} /> Adding…</>
                      ) : !product.isActive ? (
                        'Out of Stock'
                      ) : !isAuthenticated ? (
                        <><ShoppingCart className="w-3.5 h-3.5" /> Login to Order</>
                      ) : (
                        <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </div>
              ))
          }
        </div>

        {/* Empty state */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-20">
            <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No products yet</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Check back soon for new arrivals.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            <button
              onClick={() => fetchProducts(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn btn-outline btn-sm"
            >
              ← Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => fetchProducts(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn btn-outline btn-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
