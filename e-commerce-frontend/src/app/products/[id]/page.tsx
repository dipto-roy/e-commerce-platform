import React from "react";
import Image from "next/image";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  // Example: Products array (simulate database)
  const products = [
    { id: 1, name: "Wireless Headphones", price: 99, image: "/images/wireless_head_phone.jpg", description: "High-quality wireless headphones" },
    { id: 2, name: "Smart Watch", price: 149, image: "/images/smart_watch.jpg", description: "Smart watch with multiple features" },
    { id: 3, name: "Gaming Mouse", price: 59, image: "/images/Gaming-Mouse.jpg", description: "Precision gaming mouse" },
    { id: 4, name: "Mechanical Keyboard", price: 129, image: "/images/Mechanical-Keyboard.jpeg", description: "Durable mechanical keyboard" },
  ];

  // Find the product by ID
  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="text-center text-white mt-20">
        <h1 className="text-3xl font-bold">Product Not Found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="rounded-lg shadow-lg object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          <p className="text-purple-400 text-xl mt-2">${product.price}</p>
          <p className="text-gray-300 mt-4">{product.description}</p>
          <button className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
