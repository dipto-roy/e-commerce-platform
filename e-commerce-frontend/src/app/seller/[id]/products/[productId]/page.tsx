import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, BarChart3, TrendingUp, DollarSign, Tag, Package } from 'lucide-react';

interface ProductEditPageProps {
  params: Promise<{ id: string; productId: string }>;
}

const ALL_PRODUCTS = [
  { id: 101, sellerId: 1, name: 'Wireless Headphones',  price: 99,  image: '/images/wireless_head_phone.jpg',  stock: 25, category: 'Audio',    description: 'High-quality wireless headphones with noise cancellation' },
  { id: 102, sellerId: 1, name: 'Smart Watch',           price: 149, image: '/images/smart_watch.jpg',          stock: 15, category: 'Wearables', description: 'Feature-rich smartwatch with health tracking' },
  { id: 201, sellerId: 2, name: 'Gaming Mouse',          price: 59,  image: '/images/Gaming-Mouse.jpg',         stock: 40, category: 'Gaming',    description: 'Precision gaming mouse with RGB lighting' },
  { id: 202, sellerId: 2, name: 'Mechanical Keyboard',   price: 129, image: '/images/Mechanical-Keyboard.jpeg', stock: 20, category: 'Gaming',    description: 'Mechanical keyboard with tactile switches' },
];

const ANALYTICS = [
  { label: 'Views This Month',   value: '156',   color: '#3b82f6',         icon: Eye },
  { label: 'Sales This Month',   value: '23',    color: 'var(--accent-500)', icon: TrendingUp },
  { label: 'Average Rating',     value: '4.6⭐',  color: '#f59e0b',         icon: BarChart3 },
  { label: 'Revenue This Month', value: '$2,277', color: '#8b5cf6',         icon: DollarSign },
];

const CATEGORIES = ['Audio', 'Gaming', 'Wearables', 'Accessories', 'Smart Home', 'Security', 'Power'];

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id, productId } = await params;
  const product = ALL_PRODUCTS.find(p => p.id === Number(productId) && p.sellerId === Number(id));

  if (!product) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-10 max-w-sm text-center">
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Product Not Found</h1>
          <Link href={`/seller/${id}/products`} className="btn btn-primary mt-4 inline-flex">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href={`/seller/${id}/products`} className="btn btn-icon btn-ghost">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="section-title">Edit Product</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {product.name}
                </p>
              </div>
            </div>
            <Link href={`/products/${product.id}`} className="btn btn-outline btn-sm self-start sm:self-auto">
              <Eye className="w-3.5 h-3.5" /> View Live
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Preview */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Product Preview</h2>
            </div>
            <div className="relative h-64 bg-[var(--bg-secondary)]">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{product.name}</h3>
                <span className="badge badge-green shrink-0"><Tag className="w-3 h-3" /> {product.category}</span>
              </div>
              <p className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-600)' }}>
                ${product.price}
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Stock: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{product.stock} units</span>
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="card p-6">
            <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Edit Details</h2>
            <form className="space-y-4">
              <div className="input-group">
                <label className="label">Product Name</label>
                <input type="text" defaultValue={product.name} className="input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="label">Price ($)</label>
                  <input type="number" defaultValue={product.price} className="input" />
                </div>
                <div className="input-group">
                  <label className="label">Stock Quantity</label>
                  <input type="number" defaultValue={product.stock} className="input" />
                </div>
              </div>

              <div className="input-group">
                <label className="label">Category</label>
                <select defaultValue={product.category} className="input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="label">Description</label>
                <textarea rows={3} defaultValue={product.description} className="input" />
              </div>

              <div className="input-group">
                <label className="label">Product Image</label>
                <input type="file" accept="image/*" className="input" style={{ paddingTop: '0.5rem' }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                <button type="button" className="btn btn-danger flex-1">Delete Product</button>
              </div>
            </form>
          </div>
        </div>

        {/* Product Analytics */}
        <div className="card p-6">
          <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Product Analytics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ANALYTICS.map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="card p-4 text-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-xl font-bold mb-1" style={{ color }}>{value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
