'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, Package, Truck, CreditCard, MapPin, Calendar, ArrowLeft, Download } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface Order {
  id: number;
  status: string;
  totalAmount: string | number; // API might return as string
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: number;
    quantity: number;
    unitPriceSnapshot: string | number; // API might return as string
    product: {
      id: number;
      name: string;
      images: (string | { imageUrl: string; altText?: string; isActive: boolean })[];
    };
    seller: {
      id: number;
      sellerId?: string;
      username: string;
      fullName?: string;
      role: string;
    };
  }>;
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Calendar className="h-5 w-5" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <Package className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const downloadInvoice = () => {
    // This would typically generate and download a PDF invoice
    const invoiceData = {
      orderId: order?.id,
      date: new Date(order?.createdAt || '').toLocaleDateString(),
      items: order?.orderItems,
      total: order?.totalAmount,
      shippingAddress: order?.shippingAddress
    };
    
    console.log('Downloading invoice for order:', invoiceData);
    // In a real implementation, you would call an API endpoint to generate the PDF
    alert('Invoice download would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The order you are looking for could not be found.'}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/products')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Confirmation</h1>
              <p className="text-gray-600 mt-1">Order #{order.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-green-900">Order Placed Successfully!</h2>
              <p className="text-green-700 mt-1">
                Thank you for your order. We've sent you a confirmation email with the details.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                {order.trackingNumber && (
                  <span className="text-sm text-gray-600">
                    Tracking: {order.trackingNumber}
                  </span>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Order placed: {new Date(order.createdAt).toLocaleString()}</p>
                <p>Last updated: {new Date(order.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {order.orderItems && order.orderItems.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(
                            typeof item.product.images[0] === 'string' 
                              ? item.product.images[0]
                              : item.product.images[0].imageUrl
                          )}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={handleImageError}
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        by {item.seller?.fullName || item.seller?.sellerId || item.seller?.username || 'Unknown Seller'}
                      </p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(Number(item.unitPriceSnapshot) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${Number(item.unitPriceSnapshot).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h3>
              <div className="text-gray-700">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${(Number(order.totalAmount) - 9.99).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {Number(order.totalAmount) >= 100 ? 'Free' : '$9.99'}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={downloadInvoice}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </button>
                
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View All Orders
                </button>
                
                <button
                  onClick={() => router.push('/products')}
                  className="w-full text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Estimated Delivery</h4>
                <p className="text-sm text-gray-600">
                  {order.status === 'delivered' 
                    ? 'Delivered'
                    : order.status === 'shipped'
                    ? '2-3 business days'
                    : '5-7 business days'
                  }
                </p>
              </div>

              {/* Order Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Order placed</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${order.status !== 'pending' ? 'text-gray-900' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${order.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Order confirmed</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${['shipped', 'delivered'].includes(order.status) ? 'text-gray-900' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Order shipped</span>
                  </div>
                  <div className={`flex items-center gap-3 text-sm ${order.status === 'delivered' ? 'text-gray-900' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span>Order delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}