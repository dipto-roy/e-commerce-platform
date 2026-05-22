'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';
import { DollarSign, Clock, ArrowDownCircle, ShoppingCart, BarChart3, ArrowRightLeft, RefreshCw, XCircle } from 'lucide-react';

interface FinancialRecord {
  id: number; amount: number; status: string; type: string;
  description: string; createdAt: string; clearedAt?: string;
  orderId?: number; orderItemId?: number;
}

interface FinancialSummary {
  totalEarnings: number; pendingAmount: number; availableForPayout: number;
  totalPaidOut: number; totalOrders: number; averageOrderValue: number;
}

interface PayoutHistory {
  id: number; amount: number; status: string; processedAt: string; paymentMethod: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending:    'badge badge-yellow',
  cleared:    'badge badge-green',
  completed:  'badge badge-green',
  processing: 'badge badge-blue',
  cancelled:  'badge badge-red',
  failed:     'badge badge-red',
};

export default function SellerFinancial() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const router = useRouter();
  const [summary, setSummary]   = useState<FinancialSummary | null>(null);
  const [records, setRecords]   = useState<FinancialRecord[]>([]);
  const [payouts, setPayouts]   = useState<PayoutHistory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'payouts'>('overview');
  const [requestingPayout, setRequestingPayout] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (user && isAuthorized) fetchFinancialData();
  }, [user, isAuthorized]);

  const fetchFinancialData = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      const [summaryRes, recordsRes, payoutsRes] = await Promise.all([
        fetch(`${API_URL}/financial/seller/summary`, { headers }),
        fetch(`${API_URL}/financial/seller/records`,  { headers }),
        fetch(`${API_URL}/financial/seller/payouts`,  { headers }),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (recordsRes.ok) setRecords(await recordsRes.json());
      if (payoutsRes.ok) setPayouts(await payoutsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch financial data');
    } finally {
      setLoadingData(false);
    }
  };

  const requestPayout = async () => {
    if (!summary || summary.availableForPayout < 10) {
      alert('Minimum payout amount is $10.00'); return;
    }
    setRequestingPayout(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/financial/seller/request-payout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: summary.availableForPayout }),
      });
      if (!res.ok) throw new Error('Failed to request payout');
      alert('Payout request submitted! You will receive an email confirmation.');
      fetchFinancialData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to request payout');
    } finally { setRequestingPayout(false); }
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

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'records',  label: 'Records' },
    { key: 'payouts',  label: 'Payout History' },
  ] as const;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="section-title">Financial Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Track your earnings and manage payouts
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchFinancialData} disabled={loadingData} className="btn btn-outline btn-sm">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => router.push('/seller/dashboard')} className="btn btn-outline btn-sm">
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Tab nav */}
        <div className="card mb-6">
          <div className="flex border-b border-[var(--border)]">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'border-b-2 border-[var(--accent-500)]'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
                style={{ color: activeTab === key ? 'var(--accent-600)' : 'var(--text-secondary)' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-16">
            <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
          </div>
        ) : error ? (
          <div className="alert alert-error mb-6">
            <XCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button onClick={fetchFinancialData} className="btn btn-outline btn-sm mt-2">Retry</button>
            </div>
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && summary && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Earnings',       value: `$${summary.totalEarnings.toFixed(2)}`,       icon: DollarSign,       color: '#10b981' },
                    { label: 'Pending Amount',        value: `$${summary.pendingAmount.toFixed(2)}`,       icon: Clock,            color: '#f59e0b' },
                    { label: 'Available for Payout',  value: `$${summary.availableForPayout.toFixed(2)}`, icon: ArrowDownCircle,  color: '#3b82f6' },
                    { label: 'Total Orders',          value: summary.totalOrders,                          icon: ShoppingCart,     color: '#8b5cf6' },
                    { label: 'Avg Order Value',       value: `$${summary.averageOrderValue.toFixed(2)}`,   icon: BarChart3,        color: '#f59e0b' },
                    { label: 'Total Paid Out',        value: `$${summary.totalPaidOut.toFixed(2)}`,        icon: ArrowRightLeft,   color: '#10b981' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}18` }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payout request */}
                <div className="card p-6">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Request Payout</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Available for payout</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--accent-600)' }}>
                        ${summary.availableForPayout.toFixed(2)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Minimum payout: $10.00</p>
                    </div>
                    <button
                      onClick={requestPayout}
                      disabled={summary.availableForPayout < 10 || requestingPayout}
                      className="btn btn-primary">
                      {requestingPayout ? <><span className="spinner" /> Processing…</> : 'Request Payout'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Records */}
            {activeTab === 'records' && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Financial Records</h3>
                </div>
                {records.length === 0 ? (
                  <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                    No financial records found.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead><tr>
                        <th>Date</th><th>Description</th><th>Type</th><th>Amount</th><th>Status</th>
                      </tr></thead>
                      <tbody>
                        {records.map(r => (
                          <tr key={r.id}>
                            <td style={{ color: 'var(--text-secondary)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td style={{ color: 'var(--text-primary)' }}>{r.description}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{r.type.charAt(0).toUpperCase()+r.type.slice(1)}</td>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${r.amount.toFixed(2)}</td>
                            <td><span className={STATUS_BADGE[r.status] || 'badge badge-gray'}>{r.status.charAt(0).toUpperCase()+r.status.slice(1)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Payouts */}
            {activeTab === 'payouts' && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Payout History</h3>
                </div>
                {payouts.length === 0 ? (
                  <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                    No payout history found.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead><tr>
                        <th>Date</th><th>Amount</th><th>Payment Method</th><th>Status</th>
                      </tr></thead>
                      <tbody>
                        {payouts.map(p => (
                          <tr key={p.id}>
                            <td style={{ color: 'var(--text-secondary)' }}>{new Date(p.processedAt).toLocaleDateString()}</td>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${p.amount.toFixed(2)}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{p.paymentMethod}</td>
                            <td><span className={STATUS_BADGE[p.status] || 'badge badge-gray'}>{p.status.charAt(0).toUpperCase()+p.status.slice(1)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
