'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, Wallet, CheckCircle, LogIn } from 'lucide-react';
import { cartAPI } from '@/config/api';
import { orderAPI } from '@/utils/api';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import StripeCheckout from '@/components/payment/StripeCheckout';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: string; // Backend returns price as string
  isActive: boolean;
  product: {
    id: number;
    name: string; // Product entity uses 'name' not 'title'
    description: string;
    price: string;
    category: string;
    isActive: boolean;
    stockQuantity: number; // Product entity uses 'stockQuantity' not 'stock'
    images?: Array<{
      id: number;
      imageUrl: string;
      altText?: string;
      isActive: boolean;
      sortOrder: number;
    }>;
    seller?: {
      id: number;
      username: string;
      phone?: string;
    };
  };
}

type PaymentMethod = 'cod' | 'stripe';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuthGuard(['user']);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  useEffect(() => {
    loadCartFromDatabase();
  }, []);

  const loadCartFromDatabase = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCartItems();
      setCart(response.data || []);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to load cart:', error);
      if (error.response?.status === 401) {
        setError('Please log in to view your cart');
        // Don't redirect here, the useAuthGuard will handle it
      } else {
        setError('Failed to load cart items. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartId);
      return;
    }

    try {
      await cartAPI.updateCartItem(cartId, newQuantity);
      await loadCartFromDatabase(); // Reload cart
      // Refresh cart count in navigation
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) {
        (window as any).refreshCartCount();
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      setError('Failed to update cart item');
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      await cartAPI.removeFromCart(cartId);
      await loadCartFromDatabase(); // Reload cart
      // Refresh cart count in navigation
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) {
        (window as any).refreshCartCount();
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      setError('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart([]);
      // Refresh cart count in navigation
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) {
        (window as any).refreshCartCount();
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setError('Failed to clear cart');
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getShippingCost = () => {
    // Simple shipping calculation
    const subtotal = getTotalPrice();
    if (subtotal >= 100) return 0; // Free shipping over $100
    return 9.99;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost();
  };

  const handleCheckout = async () => {
    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      setError('Please fill in all shipping address fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order with payment method
      const orderData = {
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          line1: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zipCode,
          country: shippingAddress.country
        },
        paymentMethod: paymentMethod // 'cod' or 'stripe'
      };

      const response = await orderAPI.createOrderFromCart(orderData);
      const order = response.data as { id: number };
      
      // Refresh cart count
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) {
        (window as any).refreshCartCount();
      }

      // If COD, redirect to confirmation
      if (paymentMethod === 'cod') {
        router.push(`/orders/${order.id}/confirmation`);
      } else {
        // If Stripe, show payment form
        setCreatedOrderId(order.id);
        setShowStripePayment(true);
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      if (err.response?.status === 401) {
        setError('Please log in to place an order');
        router.push('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = () => {
    // Payment successful, redirect to confirmation
    if (createdOrderId) {
      router.push(`/orders/${createdOrderId}/confirmation`);
    }
  };

  const handleStripeCancel = () => {
    // Cancel Stripe payment, return to checkout form
    setShowStripePayment(false);
    setCreatedOrderId(null);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <LogIn className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to view your shopping cart and place orders.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Go to Login
            </button>
            <button
              onClick={() => router.push('/products')}
              className="w-full mt-3 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Browsing Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/products')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product.images[0].imageUrl)}
                          alt={item.product.images[0].altText || item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={handleImageError}
                        />
                      ) : (
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      {item.product.seller && (
                        <p className="text-sm text-gray-600">by {item.product.seller.username}</p>
                      )}
                      <p className="text-lg font-semibold text-blue-600">${parseFloat(item.price).toFixed(2)}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={loading}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={loading || item.quantity >= item.product.stockQuantity}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity >= item.product.stockQuantity && (
                        <p className="text-xs text-red-600">Max stock reached</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear Cart */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                  disabled={loading}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {getShippingCost() === 0 ? 'Free' : `$${getShippingCost().toFixed(2)}`}
                  </span>
                </div>
                
                {getShippingCost() === 0 && getTotalPrice() >= 100 && (
                  <p className="text-sm text-green-600">🎉 You've qualified for free shipping!</p>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${getFinalTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!showCheckout && !showStripePayment ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  disabled={loading}
                >
                  <CreditCard className="h-4 w-4" />
                  Proceed to Checkout
                </button>
              ) : showStripePayment && createdOrderId ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Complete Your Payment</p>
                    <p className="text-xs text-blue-700 mt-1">Order #{createdOrderId} created successfully</p>
                  </div>

                  <StripeCheckout
                    orderId={createdOrderId}
                    amount={getFinalTotal()}
                    onSuccess={handleStripeSuccess}
                    onCancel={handleStripeCancel}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setPaymentMethod('cod')}
                        className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-blue-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'cod' && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <Wallet className="h-5 w-5 text-gray-600" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">Cash on Delivery</p>
                          <p className="text-xs text-gray-600">Pay when you receive</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                          paymentMethod === 'stripe'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'stripe' ? 'border-blue-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'stripe' && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">Credit/Debit Card</p>
                          <p className="text-xs text-gray-600">Secured by Stripe</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                        paymentMethod === 'cod'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          {paymentMethod === 'cod' ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Place Order (COD)
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              Continue to Payment
                            </>
                          )}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowCheckout(false);
                        setError(null);
                      }}
                      className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      disabled={loading}
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}