'use client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminAPI } from '@/lib/adminAPI';

interface StatsLineChartProps {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
}

type Period = '7days' | '30days' | '3months' | '1year';

interface TrendDataPoint {
  date: string;
  users: number;
  sellers: number;
  products: number;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: '7days',   label: 'Last 7 Days' },
  { value: '30days',  label: 'Last 30 Days' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '1year',   label: 'Last Year' },
];

export default function StatsLineChart({ totalUsers, totalSellers, totalProducts }: StatsLineChartProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7days');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getDashboardTrends(selectedPeriod);
        setTrendData(
          response.data.map((point: any) => ({
            ...point,
            date: formatDateLabel(point.date, selectedPeriod),
          }))
        );
      } catch {
        setError('Failed to load trend data');
        setTrendData(generateSampleData());
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [selectedPeriod, totalUsers, totalSellers, totalProducts]);

  const formatDateLabel = (dateStr: string, period: Period): string => {
    const date = new Date(dateStr);
    switch (period) {
      case '7days':   return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '30days':  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  const generateSampleData = (): TrendDataPoint[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((date, i) => {
      const ratio = (i + 1) / 7;
      return {
        date,
        users:    Math.floor(totalUsers    * (0.3 + ratio * 0.7)),
        sellers:  Math.floor(totalSellers  * (0.3 + ratio * 0.7)),
        products: Math.floor(totalProducts * (0.3 + ratio * 0.7)),
      };
    });
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>📈 Growth Trends</h3>

        <div className="flex gap-2 flex-wrap">
          {PERIODS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedPeriod(opt.value)}
              disabled={loading}
              className={`btn btn-sm ${selectedPeriod === opt.value ? 'btn-primary' : 'btn-outline'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <span className="spinner" />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading trend data…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-warning mb-4">
          <span>⚠️</span>
          <div>
            <p className="font-medium">{error}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Showing sample data as fallback</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!loading && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: 12 }} />
            <YAxis stroke="var(--text-muted)" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-primary)',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="users"    stroke="#10b981" strokeWidth={2} name="Users"
              dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="sellers"  stroke="#059669" strokeWidth={2} name="Sellers"
              dot={{ fill: '#059669', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="products" stroke="#6ee7b7" strokeWidth={2} name="Products"
              dot={{ fill: '#6ee7b7', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && (
        <p className="mt-4 text-center text-xs" style={{ color: 'var(--accent-600)' }}>
          ✅ Real-time data from backend API
        </p>
      )}
    </div>
  );
}
