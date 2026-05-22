import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Store, MapPin, Calendar, Star, Package, MessageCircle } from 'lucide-react';

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

const SELLERS = [
  { id: 1, name: 'TechWorld Store',  description: 'Your one-stop shop for all technology needs', rating: 4.8, reviewCount: 1250, location: 'New York, USA',    established: '2018',
    products: [{ id: 101, name: 'Wireless Headphones', price: 99,  image: '/images/wireless_head_phone.jpg' }, { id: 102, name: 'Smart Watch', price: 149, image: '/images/smart_watch.jpg' }] },
  { id: 2, name: 'Gaming Hub',       description: 'Premium gaming accessories for serious gamers',    rating: 4.6, reviewCount: 890,  location: 'California, USA', established: '2020',
    products: [{ id: 201, name: 'Gaming Mouse', price: 59, image: '/images/Gaming-Mouse.jpg' }, { id: 202, name: 'Mechanical Keyboard', price: 129, image: '/images/Mechanical-Keyboard.jpeg' }] },
  { id: 3, name: 'Electronics Plus', description: 'Quality electronics at affordable prices',         rating: 4.9, reviewCount: 2100, location: 'Texas, USA',       established: '2015',
    products: [{ id: 301, name: 'Wireless Headphones', price: 99, image: '/images/wireless_head_phone.jpg' }, { id: 302, name: 'Gaming Mouse', price: 59, image: '/images/Gaming-Mouse.jpg' }] },
  { id: 4, name: 'Smart Devices Co', description: 'Innovative smart devices for modern living',      rating: 4.5, reviewCount: 650,  location: 'Florida, USA',    established: '2021',
    products: [{ id: 401, name: 'Smart Watch', price: 149, image: '/images/smart_watch.jpg' }, { id: 402, name: 'Mechanical Keyboard', price: 129, image: '/images/Mechanical-Keyboard.jpeg' }] },
];

export default async function SellerPage({ params }: SellerPageProps) {
  const { id } = await params;
  const seller = SELLERS.find(s => s.id === Number(id));

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

  const STATS = [
    { label: 'Products',       value: `${seller.products.length}+`, color: 'var(--accent-600)' },
    { label: 'Rating',         value: `${seller.rating}⭐`,          color: '#f59e0b' },
    { label: 'Reviews',        value: seller.reviewCount,             color: '#3b82f6' },
  ];

  return (
    <div className="page-wrapper">
      {/* Seller header */}
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-50)' }}>
                  <Store className="w-6 h-6" style={{ color: 'var(--accent-600)' }} />
                </div>
                <div>
                  <h1 className="section-title">{seller.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{seller.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Est. {seller.established}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-current" />{seller.rating} ({seller.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{seller.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/seller/${id}/products`} className="btn btn-primary btn-sm">
                <Package className="w-3.5 h-3.5" /> All Products
              </Link>
              <Link href={`/seller/${id}/reviews`} className="btn btn-outline btn-sm">
                <Star className="w-3.5 h-3.5" /> Reviews
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {STATS.map(({ label, value, color }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Featured Products */}
        <div>
          <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {seller.products.map(product => (
              <div key={product.id} className="card card-interactive overflow-hidden group">
                <div className="relative h-48 bg-[var(--bg-secondary)] overflow-hidden">
                  <Image
                    src={product.image} alt={product.name} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold mb-3" style={{ color: 'var(--accent-600)' }}>
                    ${product.price}
                  </p>
                  <Link href={`/products/${product.id}`} className="btn btn-primary btn-sm btn-full justify-center">
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
