'use client';
import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Package, CheckCircle, AlertTriangle, Tag, Search, X, Eye, Edit } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { useToast } from '@/contexts/ToastContext';
import ProductForm from '@/components/admin/ProductForm';
import ConfirmModal from '@/components/admin/ConfirmModal';
import Image from 'next/image';

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  seller?: { id: number; username: string; businessName?: string };
}

const getImageUrl = (images?: string[]): string | null => {
  if (!images?.length) return null;
  const img = images[0];
  if (!img?.trim()) return null;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return `http://localhost:4002/${img.replace(/^\/+/, '')}`;
};

const STAT_CARDS = [
  { key: 'total',    label: 'Total Products',  icon: Package,       color: 'var(--accent-500)' },
  { key: 'active',   label: 'Active',          icon: CheckCircle,   color: '#10b981' },
  { key: 'lowStock', label: 'Low Stock',        icon: AlertTriangle, color: '#f59e0b' },
  { key: 'cats',     label: 'Categories',      icon: Tag,           color: '#8b5cf6' },
] as const;

export default function ProductsPage() {
  const [products, setProducts]           = useState<Product[]>([]);
  const [allProducts, setAllProducts]     = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct]   = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter]   = useState<'all' | 'active' | 'inactive'>('all');
  const { addToast } = useToast();

  useEffect(() => { fetchProducts(); }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [allRes, pageRes] = await Promise.all([
        adminAPI.getAllProducts(1, 10000, ''),
        adminAPI.getAllProducts(currentPage, 10, searchTerm),
      ]);
      const allData = (allRes.data as any).products || allRes.data || [];
      const pageData = (pageRes.data as any).products || pageRes.data || [];
      setAllProducts(allData);
      setProducts(pageData);
      setTotalPages(Math.ceil(((pageRes.data as any).total || allData.length) / 10));
    } catch { addToast('Failed to load products', 'error'); }
    finally { setLoading(false); }
  };

  const toggleProductStatus = async (productId: number) => {
    try {
      await adminAPI.toggleProductStatus(productId);
      addToast('Product status updated', 'success');
      fetchProducts();
    } catch { addToast('Failed to update product status', 'error'); }
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      setActionLoading(true);
      await adminAPI.deleteProduct(selectedProduct.id);
      addToast('Product deleted', 'success');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch { addToast('Failed to delete product', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleProductFormSubmit = async (productData: FormData) => {
    try {
      setActionLoading(true);
      if (editingProduct) {
        const updateData: any = {};
        for (const [key, value] of productData.entries()) {
          if (key !== 'images') {
            updateData[key] = (key === 'price' || key === 'stock') ? Number(value)
              : key === 'isActive' ? value === 'true' : value;
          }
        }
        await adminAPI.updateProduct(editingProduct.id, updateData);
        addToast('Product updated', 'success');
      } else {
        await adminAPI.createProduct(productData);
        addToast('Product created', 'success');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      addToast(editingProduct ? 'Failed to update product' : 'Failed to create product', 'error');
      throw err;
    } finally { setActionLoading(false); }
  };

  const allCategories = [...new Set(allProducts.map(p => p.category))];
  const categories    = [...new Set(allProducts.map(p => p.category).filter(c => c && c !== 'Uncategorized' && c !== ''))];

  const filteredProducts = products.filter(p => {
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'inactive' && p.isActive) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  const stats = {
    total:    allProducts.length,
    active:   allProducts.filter(p => p.isActive).length,
    lowStock: allProducts.filter(p => p.stock < 10).length,
    cats:     categories.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Products Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage inventory, pricing, and availability
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
            className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
          <button onClick={fetchProducts} disabled={loading} className="btn btn-outline btn-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}1a` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input">
            <option value="">All Categories</option>
            {allCategories.map((cat, i) => <option key={`${cat}-${i}`} value={cat}>{cat}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="input">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No products found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const imgUrl = getImageUrl(product.images);
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-secondary)]">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={product.title} width={48} height={48}
                                className="w-full h-full object-cover" unoptimized
                                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            ) : (
                              <Package className="w-5 h-5 m-auto mt-3.5" style={{ color: 'var(--text-muted)' }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{product.title}</p>
                            <p className="text-xs truncate max-w-[160px]" style={{ color: 'var(--text-muted)' }}>{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-gray">{product.category}</span></td>
                      <td className="font-semibold text-sm" style={{ color: 'var(--accent-600)' }}>
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${product.stock < 10 ? 'badge-red' : product.stock < 50 ? 'badge-yellow' : 'badge-green'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {product.seller ? (product.seller.businessName || product.seller.username) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${product.isActive ? 'badge-green' : 'badge-red'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedProduct(product); setShowModal(true); }}
                            className="btn btn-icon btn-outline" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setEditingProduct(product); setShowProductForm(true); }}
                            className="btn btn-icon btn-outline" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleProductStatus(product.id)}
                            className={`btn btn-sm ${product.isActive ? 'btn-danger' : 'btn-outline'}`}>
                            {product.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}
                            className="btn btn-icon btn-danger" title="Delete">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="btn btn-outline btn-sm">← Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="btn btn-outline btn-sm">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Product Details</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-icon btn-ghost"><X className="w-4 h-4" /></button>
            </div>
            {getImageUrl(selectedProduct.images) && (
              <div className="flex justify-center mb-4">
                <Image src={getImageUrl(selectedProduct.images)!} alt={selectedProduct.title}
                  width={160} height={160} className="rounded-xl object-cover" unoptimized />
              </div>
            )}
            <div className="space-y-3">
              {[
                ['Title', selectedProduct.title],
                ['Description', selectedProduct.description],
                ['Category', selectedProduct.category],
                ['Price', `$${parseFloat(selectedProduct.price).toFixed(2)}`],
                ['Stock', selectedProduct.stock],
                ['Seller', selectedProduct.seller ? (selectedProduct.seller.businessName || selectedProduct.seller.username) : '—'],
                ['Status', selectedProduct.isActive ? 'Active' : 'Inactive'],
                ['Created', new Date(selectedProduct.createdAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between text-sm gap-4">
                  <span className="font-medium shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className="text-right" style={{ color: 'var(--text-primary)' }}>{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowModal(false)} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedProduct(null); }}
        onConfirm={deleteProduct}
        title="Delete Product"
        message={`Delete "${selectedProduct?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />

      {/* Product form */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductFormSubmit}
          onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
