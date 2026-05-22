'use client';
import React, { useEffect, useState } from 'react';
import { ShoppingBag, Clock, RefreshCw, Truck, CheckCircle, X, Package } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { useToast } from '@/contexts/ToastContext';

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product: { id: number; title: string; images?: string[] };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
  user: { id: number; username: string; email: string };
  items: OrderItem[];
  shippingAddress?: { address: string; city: string; postalCode: string; country: string };
}

const STATUS_MAP: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    badgeClass: 'badge badge-yellow', icon: <Clock className="w-3 h-3" /> },
  processing: { label: 'Processing', badgeClass: 'badge badge-blue',   icon: <Package className="w-3 h-3" /> },
  shipped:    { label: 'Shipped',    badgeClass: 'badge badge-blue',   icon: <Truck className="w-3 h-3" /> },
  delivered:  { label: 'Delivered',  badgeClass: 'badge badge-green',  icon: <CheckCircle className="w-3 h-3" /> },
  cancelled:  { label: 'Cancelled',  badgeClass: 'badge badge-red',    icon: <X className="w-3 h-3" /> },
};

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STAT_CARDS = [
  { key: 'total',      label: 'Total Orders', icon: ShoppingBag,   color: 'var(--accent-500)' },
  { key: 'pending',    label: 'Pending',      icon: Clock,         color: '#f59e0b' },
  { key: 'processing', label: 'Processing',   icon: Package,       color: '#3b82f6' },
  { key: 'delivered',  label: 'Delivered',    icon: CheckCircle,   color: '#10b981' },
] as const;

export default function OrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter]   = useState('');
  const { addToast } = useToast();

  useEffect(() => { fetchOrders(); }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders(currentPage, 10, statusFilter);
      const data = response.data as any;
      setOrders(data.orders || data || []);
      setTotalPages(Math.ceil((data.total || (data.orders || data || []).length) / 10));
    } catch { addToast('Failed to load orders', 'error'); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      addToast('Order status updated', 'success');
      fetchOrders();
    } catch { addToast('Failed to update order status', 'error'); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered:  orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Orders Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            View and manage all customer orders
          </p>
        </div>
        <button onClick={fetchOrders} disabled={loading} className="btn btn-outline btn-sm self-start sm:self-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
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

      {/* Status filter */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
            className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline'}`}>
            All Orders
          </button>
          {STATUS_OPTIONS.map((s) => {
            const info = STATUS_MAP[s];
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}>
                {info.icon} {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No orders found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status] || { label: order.status, badgeClass: 'badge badge-gray', icon: null };
                  return (
                    <tr key={order.id}>
                      <td>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          #{order.orderNumber || order.id}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {(order.items?.length || 0)} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </td>
                      <td>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {order.user?.username || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.user?.email || '—'}</p>
                      </td>
                      <td>
                        <span className={statusInfo.badgeClass}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </td>
                      <td className="font-semibold" style={{ color: 'var(--accent-600)' }}>
                        ${parseFloat(order.totalAmount || '0').toFixed(2)}
                      </td>
                      <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {order.createdAt ? fmt(order.createdAt) : '—'}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedOrder(order)} className="btn btn-outline btn-sm">
                            View
                          </button>
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="input text-xs py-1 pl-2 pr-6 h-auto"
                            style={{ fontSize: '0.75rem' }}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
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

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                Order #{selectedOrder.orderNumber || selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-icon btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Customer</p>
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{selectedOrder.user?.username || '—'}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedOrder.user?.email || '—'}</p>
                </div>
              </div>

              {/* Info */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Order Info</p>
                <div className="p-4 rounded-xl space-y-1.5" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span className={(STATUS_MAP[selectedOrder.status] || STATUS_MAP.pending).badgeClass}>
                      {(STATUS_MAP[selectedOrder.status] || { label: selectedOrder.status }).label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                    <span className="font-bold" style={{ color: 'var(--accent-600)' }}>
                      ${parseFloat(selectedOrder.totalAmount || '0').toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Placed</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedOrder.createdAt ? fmt(selectedOrder.createdAt) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              {selectedOrder.shippingAddress && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Shipping</p>
                  <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Items</p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.product?.title || '—'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: 'var(--accent-600)' }}>
                          ${(parseFloat(item.price || '0') * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>${parseFloat(item.price || '0').toFixed(2)} ea</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
