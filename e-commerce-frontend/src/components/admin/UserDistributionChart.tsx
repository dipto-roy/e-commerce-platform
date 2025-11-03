'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface UserDistributionChartProps {
  totalUsers: number;
  totalSellers: number;
  pendingSellers: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

export default function UserDistributionChart({ 
  totalUsers, 
  totalSellers, 
  pendingSellers 
}: UserDistributionChartProps) {
  const regularUsers = totalUsers - totalSellers;
  
  const data = [
    { name: 'Regular Users', value: regularUsers, color: COLORS[0] },
    { name: 'Verified Sellers', value: totalSellers - pendingSellers, color: COLORS[1] },
    { name: 'Pending Sellers', value: pendingSellers, color: COLORS[2] }
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Stats Summary */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div 
              className="w-3 h-3 rounded-full mx-auto mb-1" 
              style={{ backgroundColor: item.color }}
            />
            <div className="text-xs text-gray-500">{item.name}</div>
            <div className="text-lg font-semibold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
