'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Clock, CheckCircle, XCircle, Truck,
  Calendar, DollarSign, Eye, Filter, RefreshCw,
} from 'lucide-react';
import { orderAPI } from '@/utils/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';

interface Order {
  id: number;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: number;
    quantity: number;
    unitPriceSnapshot: string | number;
    product: { id: number; name: string; images: string[] };
    seller: { id: number; username: string; fullName?: string };
  }>;
  shippingAddress: { fullName: string; street: string; city: string; state: string; zipCode: string; country: string };
}

interface OrdersResponse { orders: Order[]; total: number; totalPages: number; }

const STATUS_MAP: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    badgeClass: 'badge badge-yellow', icon: <Clock    className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing', badgeClass: 'badge badge-blue',   icon: <Package  className="w-3.5 h-3.5" /> },
  shipped:    { label: 'Shipped',    badgeClass: 'badge badge-blue',   icon: <Truck    className="w-3.5 h-3.5" /> },
  delivered:  { label: 'Delivered',  badgeClass: 'badge badge-green',  icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled:  { label: 'Cancelled',  badgeClass: 'badge badge-red',    icon: <XCircle  className="w-3.5 h-3.5" /> },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthGuard();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (page = 1, status = '') => {
    try {
      setLoading(page === 1 && !refreshing);
      setRefreshing(true);
      const response = await orderAPI.getUserOrders(page, 10);
      const data = response.data as OrdersResponse;
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.total || 0);
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      setError(err.response?.status === 401
        ? 'Please log in to view your orders.'
        : err.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (!authLoading && user) fetchOrders(1, statusFilter); }, [authLoading, user, statusFilter]);

  const formatPrice = (p: string | number) => `$${parseFloat(String(p)).toFixed(2)}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const getItemCount = (order: Order) => order.orderItems.reduce((t, i) => t + i.quantity, 0);

  if (authLoading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Please log in to view your orders.</p>
          <button onClick={() => router.push('/login')} className="btn btn-primary btn-full">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">My Orders</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {totalOrders} order{totalOrders !== 1 ? 's' : ''} total
              </p>
            </div>
            <button onClick={() => fetchOrders(currentPage, statusFilter)}
              disabled={refreshing} className="btn btn-outline btn-sm self-start sm:self-auto">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Status filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[{ value: '', label: 'All Orders' }, ...Object.entries(STATUS_MAP).map(([v, { label }]) => ({ value: v, label }))].map(({ value, label }) => (
              <button key={value} onClick={() => { setStatusFilter(value); setCurrentPage(1); }}
                className={`btn btn-sm ${statusFilter === value ? 'btn-primary' : 'btn-outline'}`}>
                {value === '' && <Filter className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-5 w-1/3 mb-3" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="alert alert-error mb-6">
            <XCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button onClick={() => error.includes('log in') ? router.push('/login') : fetchOrders(currentPage)}
                className="btn btn-sm btn-outline mt-2">
                {error.includes('log in') ? 'Go to Login' : 'Try Again'}
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {statusFilter ? 'Try a different filter.' : "You haven't placed any orders yet."}
            </p>
            <Link href="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || { label: order.status, badgeClass: 'badge badge-gray', icon: null };
              return (
                <div key={order.id} className="card overflow-hidden card-interactive">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Order #{order.id}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={statusInfo.badgeClass}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <span className="font-bold" style={{ color: 'var(--accent-600)' }}>
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        {getItemCount(order)} item{getItemCount(order) !== 1 ? 's' : ''}
                      </p>
                      <button onClick={() => router.push(`/orders/${order.id}/confirmation`)}
                        className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                        style={{ color: 'var(--accent-600)' }}>
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-secondary)]">
                          <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] overflow-hidden shrink-0">
                            {item.product.images?.[0] ? (
                              <img
                                src={getProductImageUrl({ ...item.product, images: item.product.images.map(img => ({ imageUrl: String(img), isActive: true, sortOrder: 0 })) })}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                              />
                            ) : <Package className="w-5 h-5 m-auto mt-2.5" style={{ color: 'var(--text-muted)' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.product.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {item.quantity} × {formatPrice(item.unitPriceSnapshot)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="flex items-center justify-center p-3 rounded-lg bg-[var(--bg-secondary)] text-sm font-medium"
                          style={{ color: 'var(--text-secondary)' }}>
                          +{order.orderItems.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-[var(--bg-secondary)] flex items-center justify-between">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-semibold">Ship to:</span> {order.shippingAddress.fullName}
                    </p>
                    <button onClick={() => router.push(`/orders/${order.id}/confirmation`)}
                      className="btn btn-primary btn-sm">
                      View Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button onClick={() => fetchOrders(currentPage - 1)} disabled={currentPage === 1}
              className="btn btn-outline btn-sm">← Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => fetchOrders(page)}
                className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline'}`}>
                {page}
              </button>
            ))}
            <button onClick={() => fetchOrders(currentPage + 1)} disabled={currentPage === totalPages}
              className="btn btn-outline btn-sm">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
