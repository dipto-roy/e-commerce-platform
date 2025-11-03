'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SellerStatusChartProps {
  totalSellers: number;
  pendingSellers: number;
}

export default function SellerStatusChart({ 
  totalSellers, 
  pendingSellers 
}: SellerStatusChartProps) {
  const verifiedSellers = totalSellers - pendingSellers;
  
  const data = [
    { name: 'Verified', value: verifiedSellers },
    { name: 'Pending', value: pendingSellers }
  ];

  const COLORS = ['#10B981', '#F59E0B'];
  
  const verificationRate = totalSellers > 0 
    ? ((verifiedSellers / totalSellers) * 100).toFixed(1) 
    : '0';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Verification Status</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-3xl font-bold text-gray-900">{verificationRate}%</div>
          <div className="text-xs text-gray-500">Verified</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <div>
            <div className="text-xs text-gray-500">Verified</div>
            <div className="text-lg font-semibold text-gray-900">{verifiedSellers}</div>
          </div>
        </div>
        <div className="flex items-center justify-center p-3 bg-yellow-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
          <div>
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-lg font-semibold text-gray-900">{pendingSellers}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
