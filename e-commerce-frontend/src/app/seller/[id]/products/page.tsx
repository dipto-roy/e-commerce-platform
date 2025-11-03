import React from "react";
import Link from "next/link";
import Image from "next/image";

interface SellerProductsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerProductsPage({ params }: SellerProductsPageProps) {
  const { id } = await params;

  // Mock seller and products data
  const sellersData = {
    1: {
      name: "TechWorld Store",
      products: [
        { id: 101, name: "Wireless Headphones", price: 99, image: "/images/wireless_head_phone.jpg", stock: 25, category: "Audio" },
        { id: 102, name: "Smart Watch", price: 149, image: "/images/smart_watch.jpg", stock: 15, category: "Wearables" },
        { id: 103, name: "Bluetooth Speaker", price: 79, image: "/images/wireless_head_phone.jpg", stock: 30, category: "Audio" },
        { id: 104, name: "Tablet Stand", price: 29, image: "/images/smart_watch.jpg", stock: 50, category: "Accessories" },
      ]
    },
    2: {
      name: "Gaming Hub",
      products: [
        { id: 201, name: "Gaming Mouse", price: 59, image: "/images/Gaming-Mouse.jpg", stock: 40, category: "Gaming" },
        { id: 202, name: "Mechanical Keyboard", price: 129, image: "/images/Mechanical-Keyboard.jpeg", stock: 20, category: "Gaming" },
        { id: 203, name: "Gaming Headset", price: 89, image: "/images/wireless_head_phone.jpg", stock: 35, category: "Gaming" },
        { id: 204, name: "Mouse Pad", price: 19, image: "/images/Gaming-Mouse.jpg", stock: 100, category: "Gaming" },
      ]
    },
    3: {
      name: "Electronics Plus",
      products: [
        { id: 301, name: "Wireless Earbuds", price: 69, image: "/images/wireless_head_phone.jpg", stock: 60, category: "Audio" },
        { id: 302, name: "Phone Charger", price: 25, image: "/images/smart_watch.jpg", stock: 80, category: "Accessories" },
        { id: 303, name: "Power Bank", price: 45, image: "/images/Gaming-Mouse.jpg", stock: 45, category: "Power" },
        { id: 304, name: "USB Cable", price: 15, image: "/images/Mechanical-Keyboard.jpeg", stock: 120, category: "Accessories" },
      ]
    },
    4: {
      name: "Smart Devices Co",
      products: [
        { id: 401, name: "Smart Home Hub", price: 199, image: "/images/smart_watch.jpg", stock: 12, category: "Smart Home" },
        { id: 402, name: "Security Camera", price: 89, image: "/images/Gaming-Mouse.jpg", stock: 25, category: "Security" },
        { id: 403, name: "Smart Light Bulb", price: 35, image: "/images/wireless_head_phone.jpg", stock: 75, category: "Smart Home" },
        { id: 404, name: "Door Sensor", price: 29, image: "/images/Mechanical-Keyboard.jpeg", stock: 40, category: "Security" },
      ]
    }
  };

  const sellerData = sellersData[Number(id) as keyof typeof sellersData];

  if (!sellerData) {
    return (
      <div className="text-center text-white mt-20">
        <h1 className="text-3xl font-bold">Seller Not Found</h1>
        <Link href="/seller" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Back to Sellers
        </Link>
      </div>
    );
  }

  const categories = [...new Set(sellerData.products.map(p => p.category))];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{sellerData.name} - Products</h1>
          <p className="text-gray-400">Manage your product inventory</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Link href={`/seller/${id}`} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
            Back to Store
          </Link>
          <Link href={`/seller/${id}/products/add`} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
            Add New Product
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
            All
          </button>
          {categories.map((category) => (
            <button key={category} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellerData.products.map((product) => (
          <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                  {product.category}
                </span>
              </div>
              <p className="text-purple-400 text-xl font-bold mb-2">${product.price}</p>
              <p className="text-gray-400 text-sm mb-4">
                Stock: <span className={product.stock > 20 ? "text-green-400" : product.stock > 5 ? "text-yellow-400" : "text-red-400"}>
                  {product.stock} units
                </span>
              </p>
              <div className="flex space-x-2">
                <Link href={`/seller/${id}/products/${product.id}/edit`} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-center hover:bg-blue-700 transition">
                  Edit
                </Link>
                <Link href={`/products/${product.id}`} className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-center hover:bg-purple-700 transition">
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-purple-400 mb-2">{sellerData.products.length}</h3>
          <p className="text-gray-300">Total Products</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-2">
            {sellerData.products.reduce((sum, p) => sum + p.stock, 0)}
          </h3>
          <p className="text-gray-300">Total Stock</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-blue-400 mb-2">{categories.length}</h3>
          <p className="text-gray-300">Categories</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-yellow-400 mb-2">
            ${(sellerData.products.reduce((sum, p) => sum + (p.price * p.stock), 0)).toLocaleString()}
          </h3>
          <p className="text-gray-300">Inventory Value</p>
        </div>
      </div>
    </div>
  );
}
