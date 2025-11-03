'use client';
import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/adminAPI';
import { useToast } from '@/contexts/ToastContext';
import ProductForm from '@/components/admin/ProductForm';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Image from 'next/image';

interface Product {
  id: number;
  title: string;
  description: string;
  price: string; // Backend returns price as string from PostgreSQL decimal
  stock: number;
  category: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  seller?: {
    id: number;
    username: string;
    businessName?: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]); // Paginated products for display
  const [allProducts, setAllProducts] = useState<Product[]>([]); // All products for stats
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { addToast } = useToast();

  // Helper function to get valid image URL
  const getValidImageUrl = (images: string[] | undefined): string | null => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null;
    }
    
    const firstImage = images[0];
    if (!firstImage || typeof firstImage !== 'string' || firstImage.trim() === '') {
      return null;
    }
    
    // If it's already a full URL, return it
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
      return firstImage;
    }
    
    // If it's a relative path, construct the full URL
    return `http://localhost:4002/${firstImage.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch ALL products for stats (no pagination)
      const allResponse = await adminAPI.getAllProducts(1, 10000, ''); // Large limit to get all
      const allResponseData = allResponse.data as any;
      const allProductsData = allResponseData.products || allResponseData || [];
      setAllProducts(allProductsData); // Store all products for stats
      
      // Fetch paginated products for display
      const response = await adminAPI.getAllProducts(currentPage, 10, searchTerm);
      const responseData = response.data as any;
      setProducts(responseData.products || responseData || []);
      setTotalPages(Math.ceil((responseData.total || allProductsData.length) / 10));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: number) => {
    try {
      await adminAPI.toggleProductStatus(productId);
      addToast('Product status updated successfully', 'success');
      fetchProducts();
    } catch (error) {
      console.error('Failed to toggle product status:', error);
      addToast('Failed to update product status', 'error');
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      setActionLoading(true);
      await adminAPI.deleteProduct(productId);
      addToast('Product deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      addToast('Failed to delete product', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateProduct = async (productData: FormData) => {
    try {
      setActionLoading(true);
      await adminAPI.createProduct(productData);
      addToast('Product created successfully', 'success');
      setShowProductForm(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to create product:', error);
      addToast('Failed to create product', 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProduct = async (productData: FormData) => {
    if (!editingProduct) return;
    
    try {
      setActionLoading(true);
      // Convert FormData to regular object for update with proper type conversions
      const updateData: any = {};
      for (const [key, value] of productData.entries()) {
        if (key !== 'images') {
          // Convert string values to proper types for backend validation
          if (key === 'price' || key === 'stock') {
            updateData[key] = Number(value);
          } else if (key === 'isActive') {
            updateData[key] = value === 'true';
          } else {
            updateData[key] = value;
          }
        }
      }
      
      await adminAPI.updateProduct(editingProduct.id!, updateData);
      addToast('Product updated successfully', 'success');
      setShowProductForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to update product:', error);
      addToast('Failed to update product', 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleProductFormSubmit = async (productData: FormData) => {
    if (editingProduct) {
      await handleUpdateProduct(productData);
    } else {
      await handleCreateProduct(productData);
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter(product => {
    if (statusFilter === 'active' && !product.isActive) return false;
    if (statusFilter === 'inactive' && product.isActive) return false;
    if (categoryFilter && product.category !== categoryFilter) return false;
    return true;
  });

  // Calculate stats from ALL products, not just filtered/paginated ones
  const totalProducts = allProducts.length;
  const activeProducts = allProducts.filter(p => p.isActive).length;
  const lowStockProducts = allProducts.filter(p => (p.stock || 0) < 10).length;
  // Count all unique categories (including products that defaulted to "Uncategorized")
  const allCategories = [...new Set(allProducts.map(p => p.category))];
  // For stats display, count non-empty categories only
  const categories = [...new Set(allProducts.map(p => p.category).filter(c => c && c !== 'Uncategorized' && c !== ''))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage product inventory, pricing, and availability
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </button>
          
          <button
            onClick={fetchProducts}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search products by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {allCategories.map((category, index) => (
                <option key={`${category}-${index}`} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900">
                {activeProducts}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">
                {lowStockProducts}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Products List</h3>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4">
                  <div className="rounded bg-gray-300 h-16 w-16"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const imageUrl = getValidImageUrl(product.images);
                    return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.title || 'Product image'}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded object-cover"
                                unoptimized
                                onError={(e) => {
                                  // Replace with placeholder on error
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className="h-16 w-16 rounded bg-gray-200 flex items-center justify-center"
                              style={{ display: imageUrl ? 'none' : 'flex' }}
                            >
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${product.stock < 10 ? 'bg-red-100 text-red-800' : 
                            product.stock < 50 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}
                        `}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.seller ? (
                          <div>
                            <div className="font-medium">{product.seller.businessName || product.seller.username}</div>
                          </div>
                        ) : (
                          'No seller'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => openProductModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditForm(product)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className={`${
                            product.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {product.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
                <button
                  onClick={closeProductModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {(() => {
                  const modalImageUrl = getValidImageUrl(selectedProduct.images);
                  return modalImageUrl ? (
                    <div className="flex justify-center">
                      <Image
                        src={modalImageUrl}
                        alt={selectedProduct.title || 'Product image'}
                        width={200}
                        height={200}
                        className="h-32 w-32 rounded object-cover"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null;
                })()}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <p className="mt-1 text-sm text-gray-900">${parseFloat(selectedProduct.price).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedProduct.stock}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seller</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedProduct.seller ? 
                      (selectedProduct.seller.businessName || selectedProduct.seller.username) : 
                      'No seller assigned'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedProduct.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedProduct.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeProductModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={() => selectedProduct && deleteProduct(selectedProduct.id)}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductFormSubmit}
          onCancel={closeProductForm}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
