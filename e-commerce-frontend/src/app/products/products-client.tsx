'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, Heart, ShoppingCart, Star, Eye,
  Package, Grid, List, ChevronDown,
} from 'lucide-react';
import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';

interface Product {
  id: number; name: string; description: string; price: string;
  stockQuantity: number; category: string; isActive: boolean;
  images?: Array<{
    id: number; imageUrl: string; altText: string; isActive: boolean;
    sortOrder: number; createdAt: string; updatedAt: string; productId: number;
  }>;
  createdAt: string; userId: number;
  user?: { id: number; username: string; fullName?: string };
  views?: number; rating?: number; reviewCount?: number;
}

interface CartItem {
  productId: number; quantity: number; price: number; name: string; image?: string;
}

interface ProductsClientProps { initialProducts: Product[]; }

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const router = useRouter();
  const [products] = useState<Product[]>(initialProducts);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const saveWishlistToStorage = (newWishlist: number[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setWishlist(newWishlist);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      const cartItem: CartItem = {
        productId: product.id, quantity: 1,
        price: parseFloat(product.price), name: product.name,
        image: getProductImageUrl(product),
      };
      console.log('Adding to cart:', cartItem);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const toggleWishlist = (productId: number) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    saveWishlistToStorage(newWishlist);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice =
      parseFloat(product.price) >= priceRange[0] &&
      parseFloat(product.price) <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice && product.isActive;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':  return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high': return parseFloat(b.price) - parseFloat(a.price);
      case 'name':       return a.name.localeCompare(b.name);
      default:           return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="section-title">Products</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Discover amazing products from verified sellers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {sortedProducts.length} products found
              </span>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="btn btn-icon btn-ghost"
                title={viewMode === 'grid' ? 'List view' : 'Grid view'}
              >
                {viewMode === 'grid'
                  ? <List className="w-4 h-4" />
                  : <Grid className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Search & Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9"
              />
            </div>

            {/* Category */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pr-9 appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input pr-9 appearance-none"
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* Filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="card p-5 mb-4">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Price Range
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="range" min="0" max="1000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-1" style={{ accentColor: 'var(--accent-500)' }}
                />
                <span className="text-sm w-14 text-right" style={{ color: 'var(--text-secondary)' }}>
                  ${priceRange[0]}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>–</span>
                <input
                  type="range" min="0" max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1" style={{ accentColor: 'var(--accent-500)' }}
                />
                <span className="text-sm w-14 text-right" style={{ color: 'var(--text-secondary)' }}>
                  ${priceRange[1]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
          </div>
        )}

        {/* Empty */}
        {!loading && sortedProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No products found
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Products */}
        {!loading && sortedProducts.length > 0 && (
          <div className={`grid gap-5 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className={`card overflow-hidden group transition-all duration-200 hover:shadow-md ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-44 shrink-0' : 'aspect-square'
                }`}>
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors"
                      style={{ background: 'var(--accent-500)' }}
                      title="View product"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors ${
                        wishlist.includes(product.id) ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                      }`}
                      title="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Stock badge */}
                  {product.stockQuantity <= 5 && (
                    <div className="absolute top-2 left-2">
                      <span className={product.stockQuantity === 0 ? 'badge badge-red' : 'badge badge-yellow'}>
                        {product.stockQuantity === 0 ? 'Out of Stock' : `Only ${product.stockQuantity} left`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className={`p-4 flex flex-col gap-2 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {product.description}
                    </p>
                  </div>

                  {/* Seller */}
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Sold by{' '}
                    <span style={{ color: 'var(--accent-600)' }}>
                      {product.user?.fullName || product.user?.username || 'Unknown Seller'}
                    </span>
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${
                        i < (product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : ''
                      }`} style={i < (product.rating || 0) ? {} : { color: 'var(--border)' }} />
                    ))}
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                      ({product.reviewCount || 0})
                    </span>
                  </div>

                  {/* Price & Cart */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-lg font-bold" style={{ color: 'var(--accent-600)' }}>
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stockQuantity === 0}
                      className="btn btn-primary btn-sm"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
