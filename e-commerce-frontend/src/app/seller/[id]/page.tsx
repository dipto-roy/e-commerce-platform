import React from "react";
import Link from "next/link";
import Image from "next/image";

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerPage({ params }: SellerPageProps) {
  const { id } = await params;

  // Mock seller data
  const sellers = [
    { 
      id: 1, 
      name: "TechWorld Store", 
      description: "Your one-stop shop for all technology needs",
      rating: 4.8, 
      reviewCount: 1250,
      location: "New York, USA",
      established: "2018",
      products: [
        { id: 101, name: "Wireless Headphones", price: 99, image: "/images/wireless_head_phone.jpg" },
        { id: 102, name: "Smart Watch", price: 149, image: "/images/smart_watch.jpg" },
      ]
    },
    { 
      id: 2, 
      name: "Gaming Hub", 
      description: "Premium gaming accessories for serious gamers",
      rating: 4.6, 
      reviewCount: 890,
      location: "California, USA",
      established: "2020",
      products: [
        { id: 201, name: "Gaming Mouse", price: 59, image: "/images/Gaming-Mouse.jpg" },
        { id: 202, name: "Mechanical Keyboard", price: 129, image: "/images/Mechanical-Keyboard.jpeg" },
      ]
    },
    { 
      id: 3, 
      name: "Electronics Plus", 
      description: "Quality electronics at affordable prices",
      rating: 4.9, 
      reviewCount: 2100,
      location: "Texas, USA",
      established: "2015",
      products: [
        { id: 301, name: "Wireless Headphones", price: 99, image: "/images/wireless_head_phone.jpg" },
        { id: 302, name: "Gaming Mouse", price: 59, image: "/images/Gaming-Mouse.jpg" },
      ]
    },
    { 
      id: 4, 
      name: "Smart Devices Co", 
      description: "Innovative smart devices for modern living",
      rating: 4.5, 
      reviewCount: 650,
      location: "Florida, USA",
      established: "2021",
      products: [
        { id: 401, name: "Smart Watch", price: 149, image: "/images/smart_watch.jpg" },
        { id: 402, name: "Mechanical Keyboard", price: 129, image: "/images/Mechanical-Keyboard.jpeg" },
      ]
    },
  ];

  const seller = sellers.find((s) => s.id === Number(id));

  if (!seller) {
    return (
      <div className="text-center text-white mt-20">
        <h1 className="text-3xl font-bold">Seller Not Found</h1>
        <Link href="/seller" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          Back to Sellers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Seller Header */}
      <div className="bg-gray-800 rounded-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{seller.name}</h1>
            <p className="text-gray-300 mb-4">{seller.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>📍 {seller.location}</span>
              <span>📅 Est. {seller.established}</span>
              <span>⭐ {seller.rating} ({seller.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <Link href={`/seller/${id}/products`} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
              View All Products
            </Link>
            <Link href={`/seller/${id}/reviews`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Reviews
            </Link>
            <Link href={`/seller/${id}/contact`} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seller.products.map((product) => (
            <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-purple-400 text-xl font-bold">${product.price}</p>
                <Link href={`/products/${product.id}`} className="mt-3 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition inline-block">
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-purple-400 mb-2">{seller.products.length}+</h3>
          <p className="text-gray-300">Products Available</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-2">{seller.rating}⭐</h3>
          <p className="text-gray-300">Average Rating</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-blue-400 mb-2">{seller.reviewCount}</h3>
          <p className="text-gray-300">Customer Reviews</p>
        </div>
      </div>
    </div>
  );
}
