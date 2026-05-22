import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const products = [
    { id: 1, name: 'Wireless Headphones', price: 99, image: '/images/wireless_head_phone.jpg', description: 'High-quality wireless headphones' },
    { id: 2, name: 'Smart Watch',         price: 149, image: '/images/smart_watch.jpg',         description: 'Smart watch with multiple features' },
    { id: 3, name: 'Gaming Mouse',        price: 59,  image: '/images/Gaming-Mouse.jpg',        description: 'Precision gaming mouse' },
    { id: 4, name: 'Mechanical Keyboard', price: 129, image: '/images/Mechanical-Keyboard.jpeg', description: 'Durable mechanical keyboard' },
  ];

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-10 max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Product Not Found
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            This product does not exist or has been removed.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container-app py-8 max-w-4xl">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80"
          style={{ color: 'var(--accent-600)' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="card overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-96 shrink-0 bg-[var(--bg-secondary)]" style={{ minHeight: '320px' }}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col gap-5 flex-1">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {product.name}
                </h1>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--accent-600)' }}>
                  ${product.price}
                </p>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {product.description}
              </p>

              <button className="btn btn-primary w-fit">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
