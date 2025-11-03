'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerGuard } from '@/hooks/useAuthGuard';

interface FinancialRecord {
  id: number;
  amount: number;
  status: string;
  type: string;
  description: string;
  createdAt: string;
  clearedAt?: string;
  orderId?: number;
  orderItemId?: number;
}

interface FinancialSummary {
  totalEarnings: number;
  pendingAmount: number;
  availableForPayout: number;
  totalPaidOut: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface PayoutHistory {
  id: number;
  amount: number;
  status: string;
  processedAt: string;
  paymentMethod: string;
}

export default function SellerFinancial() {
  const { user, loading, isAuthorized } = useSellerGuard();
  const router = useRouter();
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<PayoutHistory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'payouts'>('overview');
  const [requestingPayout, setRequestingPayout] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    cleared: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    if (user && isAuthorized) {
      fetchFinancialData();
    }
  }, [user, isAuthorized]);

  const fetchFinancialData = async () => {
    setLoadingData(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch financial summary
      const summaryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial/seller/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setFinancialSummary(summaryData);
      }

      // Fetch financial records
      const recordsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial/seller/records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setFinancialRecords(recordsData);
      }

      // Fetch payout history
      const payoutsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial/seller/payouts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (payoutsResponse.ok) {
        const payoutsData = await payoutsResponse.json();
        setPayoutHistory(payoutsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch financial data');
    } finally {
      setLoadingData(false);
    }
  };

  const requestPayout = async () => {
    if (!financialSummary || financialSummary.availableForPayout < 10) {
      alert('Minimum payout amount is $10.00');
      return;
    }

    setRequestingPayout(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financial/seller/request-payout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: financialSummary.availableForPayout
        })
      });

      if (!response.ok) {
        throw new Error('Failed to request payout');
      }

      alert('Payout request submitted successfully! You will receive an email confirmation.');
      fetchFinancialData(); // Refresh data
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to request payout');
    } finally {
      setRequestingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
              <p className="text-gray-400">Track your earnings and manage payouts</p>
            </div>
            <button
              onClick={() => router.push('/seller/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-lg mb-6">
          <div className="flex border-b border-gray-700">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'records', label: 'Financial Records' },
              { key: 'payouts', label: 'Payout History' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loadingData ? (
          <div className="text-center py-8">
            <div className="text-white">Loading financial data...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchFinancialData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && financialSummary && (
              <div className="space-y-6">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-600 rounded-md">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Total Earnings</p>
                        <p className="text-2xl font-bold text-white">${financialSummary.totalEarnings.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-600 rounded-md">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Pending Amount</p>
                        <p className="text-2xl font-bold text-white">${financialSummary.pendingAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-600 rounded-md">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Available for Payout</p>
                        <p className="text-2xl font-bold text-white">${financialSummary.availableForPayout.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-600 rounded-md">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Total Orders</p>
                        <p className="text-2xl font-bold text-white">{financialSummary.totalOrders}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-600 rounded-md">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Average Order Value</p>
                        <p className="text-2xl font-bold text-white">${financialSummary.averageOrderValue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-600 rounded-md">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-400">Total Paid Out</p>
                        <p className="text-2xl font-bold text-white">${financialSummary.totalPaidOut.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payout Request */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Request Payout</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300">Available for payout</p>
                      <p className="text-xl font-bold text-green-400">${financialSummary.availableForPayout.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 mt-1">Minimum payout: $10.00</p>
                    </div>
                    <button
                      onClick={requestPayout}
                      disabled={financialSummary.availableForPayout < 10 || requestingPayout}
                      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {requestingPayout ? 'Processing...' : 'Request Payout'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Records Tab */}
            {activeTab === 'records' && (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Financial Records</h3>
                </div>
                {financialRecords.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    No financial records found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {financialRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {record.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              ${record.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusColors[record.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Payout History Tab */}
            {activeTab === 'payouts' && (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Payout History</h3>
                </div>
                {payoutHistory.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    No payout history found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {payoutHistory.map((payout) => (
                          <tr key={payout.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(payout.processedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              ${payout.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {payout.paymentMethod}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                statusColors[payout.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                              </span>
                            </td>
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
      </main>
    </div>
  );
}