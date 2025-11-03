'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface StatsOverviewChartProps {
  totalUsers: number;
  totalSellers: number;
  pendingSellers: number;
  totalProducts: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function StatsOverviewChart({ 
  totalUsers, 
  totalSellers, 
  pendingSellers, 
  totalProducts 
}: StatsOverviewChartProps) {
  const data = [
    {
      name: 'Total Users',
      value: totalUsers,
      color: COLORS[0]
    },
    {
      name: 'Total Sellers',
      value: totalSellers,
      color: COLORS[1]
    },
    {
      name: 'Pending Sellers',
      value: pendingSellers,
      color: COLORS[2]
    },
    {
      name: 'Total Products',
      value: totalProducts,
      color: COLORS[3]
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
