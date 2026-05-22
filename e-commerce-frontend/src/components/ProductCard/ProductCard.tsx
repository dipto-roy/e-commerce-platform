import React from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  images: Array<{
    id: number;
    imageUrl: string;
    altText: string;
    isActive: boolean;
    sortOrder: number;
  }>;
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage = product.images?.find((img) => img.isActive) || product.images?.[0];
  const imageUrl = primaryImage?.imageUrl || '/images/placeholder.jpg';

  return (
    <div
      className="card card-interactive bg-[var(--bg-primary)] rounded-xl p-4 flex flex-col items-center gap-3 group"
      style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block shrink-0">
        <div className="w-[200px] h-[200px] rounded-lg overflow-hidden bg-[var(--bg-tertiary)] flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={primaryImage?.altText || product.name}
            width={200}
            height={200}
            className="object-cover w-full h-full"
          />
        </div>
      </Link>

      {/* Name */}
      <h3
        className="w-full text-base font-semibold text-[var(--text-primary)] line-clamp-1 text-center"
        title={product.name}
      >
        <Link href={`/products/${product.id}`} className="hover:text-[var(--accent-600)] transition-colors">
          {product.name}
        </Link>
      </h3>

      {/* Price */}
      <p className="text-lg font-bold text-[var(--accent-600)]">
        ${product.price}
      </p>

      {/* CTA */}
      <Link
        href={`/products/${product.id}`}
        className="btn btn-primary btn-full mt-auto"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;
