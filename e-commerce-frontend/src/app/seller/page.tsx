import React from 'react';
import Link from 'next/link';
import { Store, Package, BarChart3, ShoppingBag } from 'lucide-react';

const SELLERS = [
  { id: 1, name: 'TechWorld Store',  products: 25, rating: 4.8, revenue: 15000 },
  { id: 2, name: 'Gaming Hub',       products: 18, rating: 4.6, revenue: 12000 },
  { id: 3, name: 'Electronics Plus', products: 32, rating: 4.9, revenue: 22000 },
  { id: 4, name: 'Smart Devices Co', products: 14, rating: 4.5, revenue: 8500  },
];

const QUICK_LINKS = [
  { href: '/seller/analytics', icon: BarChart3,  title: 'Analytics',  desc: 'View detailed sales analytics', color: 'var(--accent-500)' },
  { href: '/seller/orders',    icon: ShoppingBag, title: 'Orders',     desc: 'Manage customer orders',       color: '#f59e0b' },
  { href: '/seller/products',  icon: Package,     title: 'Products',   desc: 'Manage your inventory',        color: '#3b82f6' },
];

export default function SellerListPage() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <h1 className="section-title">Seller Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage your store and track performance
          </p>
        </div>
      </div>

      <div className="container-app py-8 space-y-8">
        {/* Seller cards */}
        <div>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Active Stores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SELLERS.map(seller => (
              <div key={seller.id} className="card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-50)' }}>
                    <Store className="w-5 h-5" style={{ color: 'var(--accent-600)' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {seller.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {seller.rating}⭐ rating
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="font-bold" style={{ color: 'var(--accent-600)' }}>{seller.products}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Products</p>
                  </div>
                  <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="font-bold" style={{ color: 'var(--accent-600)' }}>
                      ${seller.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/seller/${seller.id}`} className="btn btn-outline btn-sm flex-1 justify-center">
                    View Store
                  </Link>
                  <Link href={`/seller/${seller.id}/products`} className="btn btn-primary btn-sm flex-1 justify-center">
                    <Package className="w-3.5 h-3.5" /> Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_LINKS.map(({ href, icon: Icon, title, desc, color }) => (
              <Link key={href} href={href}
                className="card p-5 flex items-center gap-4 card-interactive">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
