import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ProductEditPageProps {
  params: Promise<{ id: string; productId: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { id, productId } = await params;

  // Mock product data
  const allProducts = [
    { id: 101, sellerId: 1, name: "Wireless Headphones", price: 99, image: "/images/wireless_head_phone.jpg", stock: 25, category: "Audio", description: "High-quality wireless headphones with noise cancellation" },
    { id: 102, sellerId: 1, name: "Smart Watch", price: 149, image: "/images/smart_watch.jpg", stock: 15, category: "Wearables", description: "Feature-rich smartwatch with health tracking" },
    { id: 201, sellerId: 2, name: "Gaming Mouse", price: 59, image: "/images/Gaming-Mouse.jpg", stock: 40, category: "Gaming", description: "Precision gaming mouse with RGB lighting" },
    { id: 202, sellerId: 2, name: "Mechanical Keyboard", price: 129, image: "/images/Mechanical-Keyboard.jpeg", stock: 20, category: "Gaming", description: "Mechanical keyboard with tactile switches" },
  ];

  const product = allProducts.find((p) => p.id === Number(productId) && p.sellerId === Number(id));

  if (!product) {
    return (
      <div className="text-center text-white mt-20">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
        <Link href={`/seller/${id}/products`} className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Product</h1>
        <Link href={`/seller/${id}/products`} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition">
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Preview */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Product Preview</h2>
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={300}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
              <p className="text-purple-400 text-xl font-bold mb-2">${product.price}</p>
              <p className="text-gray-300 text-sm">{product.description}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                  {product.category}
                </span>
                <span className="text-sm text-gray-400">Stock: {product.stock}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Edit Details</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                defaultValue={product.name}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                defaultValue={product.price}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Stock Quantity</label>
              <input
                type="number"
                defaultValue={product.stock}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
              <select
                defaultValue={product.category}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Audio">Audio</option>
                <option value="Gaming">Gaming</option>
                <option value="Wearables">Wearables</option>
                <option value="Accessories">Accessories</option>
                <option value="Smart Home">Smart Home</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea
                rows={4}
                defaultValue={product.description}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Product Image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
              >
                Delete Product
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Product Analytics */}
      <div className="mt-12 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Product Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">156</div>
            <div className="text-gray-400 text-sm">Views This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">23</div>
            <div className="text-gray-400 text-sm">Sales This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">4.6</div>
            <div className="text-gray-400 text-sm">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">$2,277</div>
            <div className="text-gray-400 text-sm">Revenue This Month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
