'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserGuard } from '@/hooks/useAuthGuard';
import { orderAPI } from '@/utils/api';
import { Package, Eye, Calendar, DollarSign, Truck, ArrowLeft } from 'lucide-react';

interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: string;
  shippingCost: string;
  taxAmount: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    country: string;
  };
  placedAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: number;
    productNameSnapshot: string;
    productDescriptionSnapshot: string;
    unitPriceSnapshot: string;
    quantity: number;
    subtotal: string;
    seller: {
      username: string;
      fullName: string;
    };
  }>;
  payment: {
    status: string;
    provider: string;
    amount: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  totalPages: number;
}

export default function UserOrders() {
  const { user, loading, isAuthorized } = useUserGuard();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch user orders
  const fetchOrders = async (page: number = 1) => {
    if (!user) return;
    
    try {
      setOrdersLoading(true);
      const response = await orderAPI.getUserOrders(page, 10);
      const ordersData = response.data as OrdersResponse;
      setOrders(ordersData.orders);
      setTotal(ordersData.total);
      setTotalPages(ordersData.totalPages);
      setCurrentPage(page);
      console.log('📦 User orders loaded:', ordersData);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAuthorized) {
      fetchOrders();
    }
  }, [user, isAuthorized]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'confirmed':
        return 'text-blue-400 bg-blue-400/10';
      case 'shipped':
        return 'text-purple-400 bg-purple-400/10';
      case 'delivered':
        return 'text-green-400 bg-green-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/user/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">My Orders</h1>
                <p className="text-gray-400">Track your order history and status</p>
              </div>
            </div>
            <div className="text-gray-400">
              Total Orders: {total}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ordersLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
            <p className="text-gray-400 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm space-x-6">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(order.placedAt)}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${order.totalAmount}
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.orderItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-1">{item.productNameSnapshot}</h4>
                        <p className="text-gray-400 text-sm mb-2">Qty: {item.quantity}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-400 font-medium">${item.subtotal}</span>
                          <span className="text-gray-400 text-sm">by {item.seller.username}</span>
                        </div>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                        <span className="text-gray-400">+{order.orderItems.length - 3} more items</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="border-t border-gray-700 p-6 bg-gray-750">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Shipping Address */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Truck className="w-5 h-5 mr-2" />
                          Shipping Address
                        </h4>
                        <div className="bg-gray-800 rounded-lg p-4">
                          <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
                          <p className="text-gray-400">{order.shippingAddress.line1}</p>
                          <p className="text-gray-400">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          </p>
                          <p className="text-gray-400">{order.shippingAddress.country}</p>
                          <p className="text-gray-400 mt-2">Phone: {order.shippingAddress.phone}</p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Payment Information</h4>
                        <div className="bg-gray-800 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Subtotal:</span>
                            <span className="text-white">${(parseFloat(order.totalAmount) - parseFloat(order.shippingCost) - parseFloat(order.taxAmount)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Shipping:</span>
                            <span className="text-white">${order.shippingCost}</span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Tax:</span>
                            <span className="text-white">${order.taxAmount}</span>
                          </div>
                          <div className="border-t border-gray-600 pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-semibold">Total:</span>
                              <span className="text-white font-semibold">${order.totalAmount}</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-gray-400 text-sm">
                              Payment Method: {order.payment.provider.toUpperCase()}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Payment Status: <span className={getStatusColor(order.payment.status)}>{order.payment.status}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* All Order Items */}
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-white mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-white mb-1">{item.productNameSnapshot}</h5>
                                <p className="text-gray-400 text-sm mb-2">{item.productDescriptionSnapshot}</p>
                                <div className="flex items-center text-sm text-gray-400 space-x-4">
                                  <span>Qty: {item.quantity}</span>
                                  <span>Unit Price: ${item.unitPriceSnapshot}</span>
                                  <span>Seller: {item.seller.fullName || item.seller.username}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-semibold text-blue-400">${item.subtotal}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  onClick={() => fetchOrders(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchOrders(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}