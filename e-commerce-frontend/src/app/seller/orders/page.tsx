'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Package, ShoppingCart, CheckCircle, Clock, XCircle, Truck, RefreshCw, Filter,
} from 'lucide-react';

interface OrderItem {
  id: number;
  productNameSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  subtotal: string;
}

interface Order {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: string;
  shippingAddress: {
    fullName: string; line1: string; line2?: string;
    city: string; state: string; postalCode: string; phone: string; country: string;
  };
  placedAt: string;
  orderItems: OrderItem[];
  buyer: { id: number; username: string; email: string; fullName: string };
}

const STATUS_MAP: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Pending',   badgeClass: 'badge badge-yellow', icon: <Clock className="w-3 h-3" /> },
  CONFIRMED: { label: 'Confirmed', badgeClass: 'badge badge-blue',   icon: <Package className="w-3 h-3" /> },
  SHIPPED:   { label: 'Shipped',   badgeClass: 'badge badge-blue',   icon: <Truck className="w-3 h-3" /> },
  DELIVERED: { label: 'Delivered', badgeClass: 'badge badge-green',  icon: <CheckCircle className="w-3 h-3" /> },
  CANCELLED: { label: 'Cancelled', badgeClass: 'badge badge-red',    icon: <XCircle className="w-3 h-3" /> },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All Orders' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'SHIPPED',   label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function SellerOrders() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const router = useRouter();
  const { notifications } = useNotifications();
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user && isAuthorized) fetchOrders();
  }, [user, isAuthorized, currentPage, statusFilter]);

  // Refresh when new order notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.type === 'order' && !latest.read) fetchOrders();
    }
  }, [notifications]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '10' });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/seller/orders?${params}`, {
        method: 'GET', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(response.status === 401 ? 'Authentication required.' : 'Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to fetch orders'); }
    finally { setLoadingOrders(false); }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string, trackingNumber?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase(), trackingNumber: trackingNumber || undefined }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      fetchOrders();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to update'); }
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    let trackingNumber: string | undefined;
    if (newStatus === 'SHIPPED') trackingNumber = prompt('Enter tracking number (optional):') || undefined;
    updateOrderStatus(orderId, newStatus, trackingNumber);
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Unauthorized</h2>
          <button onClick={() => router.push('/login')} className="btn btn-primary btn-full mt-4">Go to Login</button>
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
                Manage your orders and fulfillment
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchOrders} disabled={loadingOrders} className="btn btn-outline btn-sm">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={() => router.push('/seller/dashboard')} className="btn btn-outline btn-sm">
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Status filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button key={value} onClick={() => { setStatusFilter(value); setCurrentPage(1); }}
                className={`btn btn-sm ${statusFilter === value ? 'btn-primary' : 'btn-outline'}`}>
                {value === 'all' && <Filter className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loadingOrders && (
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
        {error && !loadingOrders && (
          <div className="alert alert-error mb-6">
            <XCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button onClick={fetchOrders} className="btn btn-sm btn-outline mt-2">Try Again</button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loadingOrders && !error && orders.length === 0 && (
          <div className="text-center py-20">
            <ShoppingCart className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {statusFilter !== 'all' ? `No ${statusFilter.toLowerCase()} orders` : 'No orders yet'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {statusFilter !== 'all' ? 'Try a different filter.' : 'Orders will appear here when customers buy your products.'}
            </p>
          </div>
        )}

        {/* Orders */}
        {!loadingOrders && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] || { label: order.status, badgeClass: 'badge badge-gray', icon: null };
              return (
                <div key={order.id} className="card overflow-hidden">
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Order #{order.id}</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(order.placedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={statusInfo.badgeClass}>{statusInfo.icon} {statusInfo.label}</span>
                      <span className="font-bold" style={{ color: 'var(--accent-600)' }}>
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Buyer & items */}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                      Buyer: {order.buyer?.fullName || order.buyer?.username || '—'}
                    </p>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span style={{ color: 'var(--text-primary)' }}>
                            {item.productNameSnapshot}
                            <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                          </span>
                          <span className="font-medium" style={{ color: 'var(--accent-600)' }}>
                            ${parseFloat(item.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="px-5 py-3 border-t border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Ship to</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {order.shippingAddress.fullName} · {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.country}
                    </p>
                  </div>

                  {/* Actions */}
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <div className="px-5 py-3 border-t border-[var(--border)] flex flex-wrap gap-2">
                      {order.status === 'PENDING' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')} className="btn btn-primary btn-sm">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm Order
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'SHIPPED')} className="btn btn-outline btn-sm">
                          <Truck className="w-3.5 h-3.5" /> Mark Shipped
                        </button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED')} className="btn btn-primary btn-sm">
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(order.status) && (
                        <button onClick={() => {
                          if (confirm('Cancel this order?')) handleStatusUpdate(order.id, 'CANCELLED');
                        }} className="btn btn-danger btn-sm">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="btn btn-outline btn-sm">← Previous</button>
            <span className="text-sm px-3" style={{ color: 'var(--text-secondary)' }}>
              {currentPage} / {totalPages}
            </span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="btn btn-outline btn-sm">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
