'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserGuard } from '@/hooks/useAuthGuard';
import { orderAPI } from '@/utils/api';
import {
  Package, Eye, Calendar, DollarSign, Truck, ArrowLeft,
  Clock, CheckCircle, XCircle, RefreshCw,
} from 'lucide-react';

interface OrderItem {
  id: number; productNameSnapshot: string; productDescriptionSnapshot: string;
  unitPriceSnapshot: string; quantity: number; subtotal: string;
  seller: { username: string; fullName: string };
}

interface Order {
  id: number; userId: number; status: string; totalAmount: string;
  shippingCost: string; taxAmount: string;
  shippingAddress: { fullName: string; line1: string; city: string; state: string; postalCode: string; phone: string; country: string };
  placedAt: string; updatedAt: string; orderItems: OrderItem[];
  payment: { status: string; provider: string; amount: string };
}

interface OrdersResponse { orders: Order[]; total: number; totalPages: number; }

const STATUS_BADGE: Record<string, string> = {
  pending:   'badge badge-yellow',
  confirmed: 'badge badge-blue',
  shipped:   'badge badge-blue',
  delivered: 'badge badge-green',
  cancelled: 'badge badge-red',
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function UserOrders() {
  const { user, loading, isAuthorized } = useUserGuard();
  const router = useRouter();
  const [orders, setOrders]           = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);

  const fetchOrders = async (page = 1) => {
    if (!user) return;
    try {
      setOrdersLoading(true);
      const res = await orderAPI.getUserOrders(page, 10);
      const data = res.data as OrdersResponse;
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch { /* swallow */ }
    finally { setOrdersLoading(false); }
  };

  useEffect(() => { if (user && isAuthorized) fetchOrders(); }, [user, isAuthorized]);

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (!isAuthorized || !user) {
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
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/user/dashboard')} className="btn btn-icon btn-ghost">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="section-title">My Orders</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {total} order{total !== 1 ? 's' : ''} total
                </p>
              </div>
            </div>
            <button onClick={() => fetchOrders(currentPage)} disabled={ordersLoading} className="btn btn-outline btn-sm">
              <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6">
                <div className="skeleton h-5 w-1/3 mb-3" />
                <div className="skeleton h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Orders Yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              You haven't placed any orders yet. Start shopping!
            </p>
            <button onClick={() => router.push('/products')} className="btn btn-primary">Browse Products</button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map(order => (
              <div key={order.id} className="card overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Order #{order.id}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Calendar className="w-3 h-3" /> {fmtDate(order.placedAt)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--accent-600)' }}>
                        <DollarSign className="w-3 h-3" /> {order.totalAmount}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={STATUS_BADGE[order.status.toLowerCase()] || 'badge badge-gray'}>
                      {order.status}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="btn btn-outline btn-sm">
                      <Eye className="w-3.5 h-3.5" />
                      {selectedOrder?.id === order.id ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.orderItems.slice(0, 3).map(item => (
                      <div key={item.id} className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {item.productNameSnapshot}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          Qty: {item.quantity}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-bold" style={{ color: 'var(--accent-600)' }}>
                            ${item.subtotal}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {item.seller.username}
                          </span>
                        </div>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="flex items-center justify-center rounded-xl p-3 text-sm"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        +{order.orderItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {selectedOrder?.id === order.id && (
                  <div className="border-t border-[var(--border)] p-5" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Shipping */}
                      <div className="card p-4">
                        <h4 className="font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
                          <Truck className="w-4 h-4" style={{ color: 'var(--accent-600)' }} /> Shipping Address
                        </h4>
                        <div className="text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.line1}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                          <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="card p-4">
                        <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Payment</h4>
                        <div className="space-y-2 text-sm">
                          {[
                            ['Subtotal', `$${(parseFloat(order.totalAmount) - parseFloat(order.shippingCost) - parseFloat(order.taxAmount)).toFixed(2)}`],
                            ['Shipping', `$${order.shippingCost}`],
                            ['Tax', `$${order.taxAmount}`],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                              <span>{k}</span><span>{v}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-2 border-t border-[var(--border)] font-semibold"
                            style={{ color: 'var(--text-primary)' }}>
                            <span>Total</span><span>${order.totalAmount}</span>
                          </div>
                          <div className="pt-2 text-xs space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                            <p>Method: {order.payment.provider.toUpperCase()}</p>
                            <p>Status: <span className={STATUS_BADGE[order.payment.status.toLowerCase()] || 'badge badge-gray'}>
                              {order.payment.status}
                            </span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* All items */}
                    <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>All Items</h4>
                    <div className="space-y-3">
                      {order.orderItems.map(item => (
                        <div key={item.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {item.productNameSnapshot}
                            </p>
                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                              {item.productDescriptionSnapshot}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <span>Qty: {item.quantity}</span>
                              <span>Unit: ${item.unitPriceSnapshot}</span>
                              <span>Seller: {item.seller.fullName || item.seller.username}</span>
                            </div>
                          </div>
                          <span className="text-lg font-bold shrink-0" style={{ color: 'var(--accent-600)' }}>
                            ${item.subtotal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => fetchOrders(currentPage - 1)} disabled={currentPage <= 1}
                  className="btn btn-outline btn-sm">← Previous</button>
                <span className="text-sm px-3" style={{ color: 'var(--text-secondary)' }}>
                  {currentPage} / {totalPages}
                </span>
                <button onClick={() => fetchOrders(currentPage + 1)} disabled={currentPage >= totalPages}
                  className="btn btn-outline btn-sm">Next →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
