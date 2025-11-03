import React from 'react';
import axios from 'axios';
import ProductsClient from './products-client';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stockQuantity: number;
  category: string;
  isActive: boolean;
  images?: Array<{
    id: number;
    imageUrl: string;
    altText: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    productId: number;
  }>;
  createdAt: string;
  userId: number;
  user?: {
    id: number;
    username: string;
    fullName?: string;
  };
  seller?: {
    id: number;
    username: string;
    phone?: string;
    isActive: boolean;
  };
}

interface ProductsResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Server-side data fetching with enhanced PostgreSQL integration
async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';
    
    console.log(`📦 SSR: Fetching products from ${apiUrl}/products/paginated`);
    
    // Use paginated endpoint to get products with images from PostgreSQL
    const response = await axios.get<ProductsResponse>(`${apiUrl}/products/paginated?limit=50`, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'NextJS-SSR'
      },
      // Disable SSL verification for local development
      ...(apiUrl.includes('localhost') && {
        httpsAgent: false
      })
    });

    console.log(`📦 SSR: Successfully fetched ${response.data.products?.length || 0} products with images from PostgreSQL`);
    
    // Process image URLs to ensure they point to the correct uploads folder
    const productsWithImages = response.data.products?.map(product => ({
      ...product,
      images: product.images?.filter(img => img.isActive).map(img => ({
        ...img,
        // Keep original imageUrl as it's already processed by backend
        imageUrl: img.imageUrl
      })) || [],
      user: product.seller || product.user // Handle both seller and user fields
    })) || [];

    console.log(`📸 SSR: Processed ${productsWithImages.reduce((acc, p) => acc + (p.images?.length || 0), 0)} product images`);
    return productsWithImages;
  } catch (error) {
    console.error('❌ SSR: Failed to fetch paginated products:', error);
    
    // Fallback: try the with-images endpoint
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';
      const fallbackResponse = await axios.get<Product[]>(`${apiUrl}/products/with-images`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`📦 SSR Fallback: Fetched ${fallbackResponse.data?.length || 0} products with images`);
      
      // Structure the fallback data properly with correct image URLs
      const structuredProducts = fallbackResponse.data?.map(product => ({
        ...product,
        images: product.images?.filter(img => img.isActive).map(img => ({
          ...img,
          // Keep original imageUrl as it's already processed by backend
          imageUrl: img.imageUrl
        })) || [],
        user: product.seller || product.user
      })) || [];
      
      return structuredProducts;
    } catch (fallbackError) {
      console.error('❌ SSR Fallback: Failed to fetch products with images:', fallbackError);
      
      // Last resort: basic products endpoint
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';
        const basicResponse = await axios.get<Product[]>(`${apiUrl}/products`, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`📦 SSR Basic: Fetched ${basicResponse.data?.length || 0} basic products`);
        return basicResponse.data || [];
      } catch (basicError) {
        console.error('❌ SSR Basic: All endpoints failed:', basicError);
        return [];
      }
    }
  }
}

export default async function ProductsPage() {
  // Fetch products on the server
  const products = await getProducts();

  return (
    <div>
      {/* Pass the server-fetched data to the client component */}
      <ProductsClient initialProducts={products} />
    </div>
  );
}

// Enable static generation for better performance
export const revalidate = 60; // Revalidate every 60 seconds