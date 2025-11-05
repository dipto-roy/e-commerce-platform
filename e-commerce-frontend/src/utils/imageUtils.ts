// Image URL utilities for the e-commerce frontend
// Handles different backend image URL formats and ensures proper image display

export const getImageUrl = (imageUrl: string | undefined, fallbackUrl: string = '/images/placeholder.svg'): string => {
  if (!imageUrl) {
    return fallbackUrl;
  }

  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Build URL based on environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';
  
  // Handle different path formats
  if (imageUrl.startsWith('/api/v1/uploads/')) {
    return `http://localhost:4002${imageUrl}`;
  }
  
  if (imageUrl.startsWith('/api/v1/products/serve-image/')) {
    return `http://localhost:4002${imageUrl}`;
  }
  
  if (imageUrl.startsWith('/uploads/')) {
    return `${apiUrl}${imageUrl}`;
  }
  
  if (imageUrl.startsWith('/products/serve-image/')) {
    return `${apiUrl}${imageUrl}`;
  }
  
  if (imageUrl.startsWith('api/v1/uploads/')) {
    return `http://localhost:4002/${imageUrl}`;
  }
  
  if (imageUrl.startsWith('api/v1/products/serve-image/')) {
    return `http://localhost:4002/${imageUrl}`;
  }
  
  if (imageUrl.startsWith('uploads/')) {
    return `${apiUrl}/${imageUrl}`;
  }
  
  if (imageUrl.startsWith('products/serve-image/')) {
    return `${apiUrl}/${imageUrl}`;
  }
  
  // Default to uploads path
  return `${apiUrl}/uploads/${imageUrl.replace(/^\/+/, '')}`;
};

// Get the best image from a product's images array
export const getProductImageUrl = (product: {
  images?: Array<{
    imageUrl: string;
    isActive?: boolean;
    sortOrder?: number;
  }>;
}): string => {
  if (!product.images || product.images.length === 0) {
    return '/images/placeholder.svg';
  }

  // Find the best image (active and lowest sort order)
  const activeImages = product.images.filter(img => img.isActive !== false);
  const bestImage = activeImages.length > 0 ? activeImages[0] : product.images[0];
  
  return getImageUrl(bestImage.imageUrl);
};

// Handle image loading errors
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  if (!target.src.includes('placeholder.svg')) {
    target.src = '/images/placeholder.svg';
  }
};