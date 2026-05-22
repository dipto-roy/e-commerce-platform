'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { sellerAPI } from '@/utils/api';
import { Plus, Package, Edit2, Trash2, X, Save } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  isActive: boolean;
  images: string[];
  createdAt: string;
}

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const filename = imagePath.includes('/') ? imagePath.split('/').pop()! : imagePath;
  return `http://localhost:4002/api/v1/products/serve-image/${encodeURIComponent(filename)}`;
};

export default function SellerProducts() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const [products, setProducts]         = useState<Product[]>([]);
  const [loadingData, setLoadingData]   = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: 0, stock: 0, category: '', isActive: true });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAuthorized && user?.id) fetchProducts();
  }, [isAuthorized, user]);

  const fetchProducts = async () => {
    try {
      setLoadingData(true); setError(null);
      const response = await sellerAPI.getMyProducts();
      setProducts(response.data as Product[]);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to fetch products'); }
    finally { setLoadingData(false); }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, category: product.category, isActive: product.isActive });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const payload: Record<string, any> = {};
    ['name', 'description', 'price', 'stock', 'category', 'isActive'].forEach(k => { payload[k] = (editForm as any)[k]; });
    try {
      setUpdating(true);
      await sellerAPI.updateProduct(editingProduct.id, payload);
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
      setEditingProduct(null);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to update product'); }
    finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await sellerAPI.deleteProduct(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to delete product'); }
    finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">My Products</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {products.length} product{products.length !== 1 ? 's' : ''} listed
              </p>
            </div>
            <Link href="/seller/products/new" className="btn btn-primary btn-sm self-start sm:self-auto">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {error && (
          <div className="alert alert-error mb-6">
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
          </div>
        )}

        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton h-48" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No products yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Start by listing your first product.</p>
            <Link href="/seller/products/new" className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <div key={product.id} className="card overflow-hidden card-interactive">
                <div className="h-48 bg-[var(--bg-secondary)] relative">
                  {product.images?.[0] ? (
                    <img src={getImageUrl(product.images[0])} alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={product.isActive ? 'badge badge-green' : 'badge badge-red'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => openEditModal(product)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md hover:bg-[var(--bg-secondary)] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-600)' }} />
                    </button>
                    <button onClick={() => setProductToDelete(product)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-md hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ color: 'var(--accent-600)' }}>${product.price}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Stock: {product.stock}</span>
                  </div>
                  <div className="mt-2">
                    <span className="badge badge-gray">{product.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="btn btn-icon btn-ghost"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="input-group">
                <label className="label">Product Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="input" required />
              </div>
              <div className="input-group">
                <label className="label">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                  className="input" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="label">Price ($)</label>
                  <input type="number" step="0.01" value={editForm.price}
                    onChange={(e) => setEditForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="input" required />
                </div>
                <div className="input-group">
                  <label className="label">Stock</label>
                  <input type="number" value={editForm.stock}
                    onChange={(e) => setEditForm(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))}
                    className="input" required />
                </div>
              </div>
              <div className="input-group">
                <label className="label">Category</label>
                <input type="text" value={editForm.category}
                  onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))}
                  className="input" required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.isActive}
                  onChange={(e) => setEditForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded" style={{ accentColor: 'var(--accent-500)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Product is active</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingProduct(null)} disabled={updating} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={updating} className="btn btn-primary">
                  {updating ? <><span className="spinner" /> Updating…</> : <><Save className="w-4 h-4" /> Update</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Delete Product</h2>
              <button onClick={() => setProductToDelete(null)} className="btn btn-icon btn-ghost"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Delete this product?</p>
            <div className="p-3 rounded-xl mb-4" style={{ background: 'var(--bg-secondary)' }}>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{productToDelete.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{productToDelete.category} · ${productToDelete.price}</p>
            </div>
            <p className="text-xs text-red-500 mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setProductToDelete(null)} disabled={deleting} className="btn btn-outline">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                {deleting ? <><span className="spinner" /> Deleting…</> : <><Trash2 className="w-4 h-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
