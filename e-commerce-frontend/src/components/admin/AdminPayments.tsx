'use client';
import React, { useState, useEffect } from 'react';
import { paymentAPI, financialAPI } from '@/utils/api';
import { DollarSign, RefreshCw, Download, Search, Filter, ShoppingBag, CheckCircle } from 'lucide-react';

interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  paidAt: string | null;
  createdAt: string;
  order?: {
    id: number;
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    buyer?: {
      id: number;
      username: string;
      email: string;
    };
  };
}

interface PaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

const STATUS_BADGE: Record<string, string> = {
  COMPLETED: 'badge badge-green',
  PENDING:   'badge badge-yellow',
  FAILED:    'badge badge-red',
  REFUNDED:  'badge badge-blue',
  CANCELLED: 'badge',
};

const OVERVIEW_CARDS = (overview: any) => [
  { label: 'Total Revenue',       value: `$${Number(overview.totalRevenue || 0).toFixed(2)}`,   icon: DollarSign,   color: '#10b981' },
  { label: 'Total Orders',        value: overview.totalOrders || 0,                              icon: ShoppingBag,  color: '#6366f1' },
  { label: 'Platform Fees',       value: `$${Number(overview.platformFees || 0).toFixed(2)}`,   icon: DollarSign,   color: '#f59e0b' },
  { label: 'Completed Payments',  value: overview.completedPayments || 0,                        icon: CheckCircle,  color: '#059669' },
];

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [platformOverview, setPlatformOverview] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchPlatformOverview();
    const interval = setInterval(() => {
      fetchPayments();
      fetchPlatformOverview();
    }, 30000);
    return () => clearInterval(interval);
  }, [page, filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const apiFilters: any = {};
      if (filters.status && filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.startDate) apiFilters.startDate = filters.startDate;
      if (filters.endDate) apiFilters.endDate = filters.endDate;

      const response = await paymentAPI.getAllPayments(page, 20, apiFilters);
      const data = (response.data as any).data;
      setPayments(data.payments || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformOverview = async () => {
    try {
      const response = await financialAPI.getPlatformOverview();
      setPlatformOverview(response.data as any);
    } catch (error) {
      console.error('Failed to fetch platform overview:', error);
    }
  };

  const handleRefund = async () => {
    if (!selectedPayment) return;
    try {
      const amount = refundAmount ? parseFloat(refundAmount) : undefined;
      await paymentAPI.requestRefund(selectedPayment.orderId, { amount, reason: refundReason });
      alert('Refund processed successfully!');
      setShowRefundModal(false);
      setSelectedPayment(null);
      setRefundAmount('');
      setRefundReason('');
      fetchPayments();
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert('Failed to process refund. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Payment Management</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Manage Stripe payments, refunds, and analytics
          </p>
        </div>
        <button onClick={fetchPayments} disabled={loading} className="btn btn-primary btn-sm self-start sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Platform Overview */}
      {platformOverview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {OVERVIEW_CARDS(platformOverview).map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${color}18` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--accent-600)' }}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-[var(--border)]">
            <div className="input-group">
              <label className="label">Status</label>
              <select
                value={filters.status || ''}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="input-group">
              <label className="label">Start Date</label>
              <input type="date" value={filters.startDate || ''}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                className="input" />
            </div>

            <div className="input-group">
              <label className="label">End Date</label>
              <input type="date" value={filters.endDate || ''}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                className="input" />
            </div>

            <div className="input-group">
              <label className="label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Order ID, Customer..."
                  value={filters.searchQuery || ''}
                  onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="input pl-9" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Payment Transactions</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <span className="spinner" style={{ width: 32, height: 32 }} />
            <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading payments…</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No payments found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Payment transactions will appear here once orders are placed
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      #{payment.order?.orderNumber || payment.orderId}
                    </td>
                    <td>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {payment.order?.buyer?.username || 'N/A'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {payment.order?.buyer?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      ${Number(payment.amount || 0).toFixed(2)} {payment.currency}
                    </td>
                    <td className="uppercase text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {payment.order?.paymentMethod || payment.provider}
                    </td>
                    <td>
                      <span className={STATUS_BADGE[payment.status?.toUpperCase()] ?? 'badge'}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedPayment(payment); setShowRefundModal(true); }}
                          disabled={payment.status !== 'COMPLETED'}
                          className="text-xs font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ color: 'var(--accent-600)' }}
                        >
                          Refund
                        </button>
                        <button
                          onClick={() => paymentAPI.downloadInvoice(payment.orderId)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          title="Download invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-[var(--border)] flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm">
              ← Prev
            </button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-outline btn-sm">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Process Refund — Order #{selectedPayment.orderId}
              </h3>

              <div className="space-y-4">
                <div className="input-group">
                  <label className="label">
                    Refund Amount <span style={{ color: 'var(--text-muted)' }}>(leave empty for full refund)</span>
                  </label>
                  <input
                    type="number" step="0.01"
                    placeholder={`Max: $${Number(selectedPayment.amount || 0).toFixed(2)}`}
                    value={refundAmount}
                    onChange={e => setRefundAmount(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="label">Reason for Refund</label>
                  <textarea
                    rows={3} placeholder="Enter reason for refund…"
                    value={refundReason}
                    onChange={e => setRefundReason(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button onClick={() => { setShowRefundModal(false); setSelectedPayment(null); setRefundAmount(''); setRefundReason(''); }}
                className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleRefund} className="btn btn-danger">
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
