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

export default function StatsLineChart({ 
  totalUsers, 
  totalSellers, 
  totalProducts 
}: StatsLineChartProps) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7days');

  // Fetch real trend data from API
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminAPI.getDashboardTrends(selectedPeriod);
        
        // Format data for the chart
        const formattedData = response.data.map(point => ({
          ...point,
          // Format date to be more readable
          date: formatDateLabel(point.date, selectedPeriod),
        }));
        
        setTrendData(formattedData);
      } catch (err: any) {
        console.error('Error fetching trends:', err);
        setError('Failed to load trend data');
        // Fallback to sample data
        setTrendData(generateSampleData());
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [selectedPeriod, totalUsers, totalSellers, totalProducts]);

  // Format date label based on period
  const formatDateLabel = (dateStr: string, period: Period): string => {
    const date = new Date(dateStr);
    
    switch (period) {
      case '7days':
        // Show day name (Mon, Tue, etc.)
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '30days':
        // Show month and day (Nov 1)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '3months':
      case '1year':
        // Show month and year (Nov 2025)
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return dateStr;
    }
  };

  // Fallback: Generate sample data if API fails
  const generateSampleData = (): TrendDataPoint[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: TrendDataPoint[] = [];
    
    for (let i = 0; i < 7; i++) {
      const ratio = (i + 1) / 7;
      data.push({
        date: days[i],
        users: Math.floor(totalUsers * (0.3 + ratio * 0.7)),
        sellers: Math.floor(totalSellers * (0.3 + ratio * 0.7)),
        products: Math.floor(totalProducts * (0.3 + ratio * 0.7)),
      });
    }
    
    return data;
  };

  // Period options
  const periodOptions: { value: Period; label: string }[] = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '1year', label: 'Last Year' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-gray-900">📈 Growth Trends</h3>
        
        {/* Period Selector Buttons */}
        <div className="flex gap-2 flex-wrap">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                selectedPeriod === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm">Loading trend data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>⚠️</span>
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-xs text-yellow-700 mt-1">Showing sample data as fallback</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart - Show when not loading */}
      {!loading && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Users"
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="sellers" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Sellers"
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="products" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Products"
              dot={{ fill: '#8B5CF6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Info Footer */}
      {!loading && !error && (
        <div className="mt-4 text-center text-xs text-green-600">
          ✅ Real-time data from backend API
        </div>
      )}
    </div>
  );
}
