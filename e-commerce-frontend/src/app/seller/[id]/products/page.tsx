import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, Package, BarChart3, Tag, DollarSign } from 'lucide-react';

interface Props { params: Promise<{ id: string }>; }

const SELLERS_DATA: Record<number, { name: string; products: Array<{ id: number; name: string; price: number; image: string; stock: number; category: string }> }> = {
  1: { name: 'TechWorld Store', products: [
    { id: 101, name: 'Wireless Headphones', price: 99,  image: '/images/wireless_head_phone.jpg', stock: 25,  category: 'Audio' },
    { id: 102, name: 'Smart Watch',         price: 149, image: '/images/smart_watch.jpg',         stock: 15,  category: 'Wearables' },
    { id: 103, name: 'Bluetooth Speaker',   price: 79,  image: '/images/wireless_head_phone.jpg', stock: 30,  category: 'Audio' },
    { id: 104, name: 'Tablet Stand',        price: 29,  image: '/images/smart_watch.jpg',         stock: 50,  category: 'Accessories' },
  ]},
  2: { name: 'Gaming Hub', products: [
    { id: 201, name: 'Gaming Mouse',       price: 59,  image: '/images/Gaming-Mouse.jpg',         stock: 40,  category: 'Gaming' },
    { id: 202, name: 'Mechanical Keyboard',price: 129, image: '/images/Mechanical-Keyboard.jpeg', stock: 20,  category: 'Gaming' },
    { id: 203, name: 'Gaming Headset',     price: 89,  image: '/images/wireless_head_phone.jpg',  stock: 35,  category: 'Gaming' },
    { id: 204, name: 'Mouse Pad',          price: 19,  image: '/images/Gaming-Mouse.jpg',         stock: 100, category: 'Gaming' },
  ]},
  3: { name: 'Electronics Plus', products: [
    { id: 301, name: 'Wireless Earbuds',  price: 69, image: '/images/wireless_head_phone.jpg',  stock: 60,  category: 'Audio' },
    { id: 302, name: 'Phone Charger',     price: 25, image: '/images/smart_watch.jpg',           stock: 80,  category: 'Accessories' },
    { id: 303, name: 'Power Bank',        price: 45, image: '/images/Gaming-Mouse.jpg',          stock: 45,  category: 'Power' },
    { id: 304, name: 'USB Cable',         price: 15, image: '/images/Mechanical-Keyboard.jpeg',  stock: 120, category: 'Accessories' },
  ]},
  4: { name: 'Smart Devices Co', products: [
    { id: 401, name: 'Smart Home Hub',   price: 199, image: '/images/smart_watch.jpg',          stock: 12, category: 'Smart Home' },
    { id: 402, name: 'Security Camera',  price: 89,  image: '/images/Gaming-Mouse.jpg',         stock: 25, category: 'Security' },
    { id: 403, name: 'Smart Light Bulb', price: 35,  image: '/images/wireless_head_phone.jpg',  stock: 75, category: 'Smart Home' },
    { id: 404, name: 'Door Sensor',      price: 29,  image: '/images/Mechanical-Keyboard.jpeg', stock: 40, category: 'Security' },
  ]},
};

export default async function SellerProductsPage({ params }: Props) {
  const { id } = await params;
  const seller = SELLERS_DATA[Number(id)];

  if (!seller) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-10 max-w-sm text-center">
          <Store className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Seller Not Found</h1>
          <Link href="/sellers" className="btn btn-primary mt-4 inline-flex">Browse Sellers</Link>
        </div>
      </div>
    );
  }

  const categories = [...new Set(seller.products.map(p => p.category))];
  const totalStock = seller.products.reduce((s, p) => s + p.stock, 0);
  const inventoryValue = seller.products.reduce((s, p) => s + p.price * p.stock, 0);

  const STATS = [
    { label: 'Total Products',   value: seller.products.length, icon: Package,    color: '#10b981' },
    { label: 'Total Stock',      value: totalStock,              icon: BarChart3,  color: '#3b82f6' },
    { label: 'Categories',       value: categories.length,       icon: Tag,        color: '#8b5cf6' },
    { label: 'Inventory Value',  value: `$${inventoryValue.toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">{seller.name}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Product inventory</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/seller/${id}`} className="btn btn-outline btn-sm">← Back to Store</Link>
              <Link href={`/seller/${id}/products/add`} className="btn btn-primary btn-sm">+ Add Product</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="btn btn-primary btn-sm">All</span>
            {categories.map(cat => (
              <span key={cat} className="btn btn-outline btn-sm">{cat}</span>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {seller.products.map(product => {
            const stockColor = product.stock > 20 ? '#10b981' : product.stock > 5 ? '#f59e0b' : '#ef4444';
            return (
              <div key={product.id} className="card overflow-hidden">
                <div className="relative h-48 bg-[var(--bg-secondary)]">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </h3>
                    <span className="badge badge-green shrink-0">{product.category}</span>
                  </div>
                  <p className="text-lg font-bold mb-2" style={{ color: 'var(--accent-600)' }}>
                    ${product.price}
                  </p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Stock:{' '}
                    <span style={{ color: stockColor, fontWeight: 600 }}>{product.stock} units</span>
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/seller/${id}/products/${product.id}/edit`}
                      className="btn btn-outline btn-sm flex-1 justify-center">Edit</Link>
                    <Link href={`/products/${product.id}`}
                      className="btn btn-primary btn-sm flex-1 justify-center">View</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
