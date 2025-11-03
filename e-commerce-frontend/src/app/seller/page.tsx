import React from "react";
import Link from "next/link";

export default function SellerDashboard() {
  const sellers = [
    { id: 1, name: "TechWorld Store", products: 25, rating: 4.8, revenue: 15000 },
    { id: 2, name: "Gaming Hub", products: 18, rating: 4.6, revenue: 12000 },
    { id: 3, name: "Electronics Plus", products: 32, rating: 4.9, revenue: 22000 },
    { id: 4, name: "Smart Devices Co", products: 14, rating: 4.5, revenue: 8500 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Seller Dashboard</h1>
        <p className="text-gray-400">Manage your store and track performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sellers.map((seller) => (
          <div key={seller.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition">
            <h3 className="text-xl font-semibold text-white mb-2">{seller.name}</h3>
            <div className="space-y-2 text-gray-300">
              <p>Products: {seller.products}</p>
              <p>Rating: {seller.rating}⭐</p>
              <p>Revenue: ${seller.revenue.toLocaleString()}</p>
            </div>
            <div className="mt-4 space-x-2">
              <Link href={`/seller/${seller.id}`} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition inline-block">
                View Store
              </Link>
              <Link href={`/seller/${seller.id}/products`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-block">
                Manage Products
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/seller/analytics" className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700 transition">
          <h3 className="text-xl font-semibold mb-2">Analytics</h3>
          <p>View detailed sales analytics</p>
        </Link>
        <Link href="/seller/orders" className="bg-orange-600 text-white p-6 rounded-lg text-center hover:bg-orange-700 transition">
          <h3 className="text-xl font-semibold mb-2">Orders</h3>
          <p>Manage customer orders</p>
        </Link>
        <Link href="/seller/inventory" className="bg-red-600 text-white p-6 rounded-lg text-center hover:bg-red-700 transition">
          <h3 className="text-xl font-semibold mb-2">Inventory</h3>
          <p>Track stock levels</p>
        </Link>
      </div>
    </div>
  );
}
