'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  price: string;
  isActive: boolean;
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    isActive: boolean;
    stockQuantity: number;
    images?: Array<{ id: number; imageUrl: string; altText?: string; isActive: boolean; sortOrder: number }>;
    seller?: { id: number; username: string; phone?: string };
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
    fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'USA',
  });

  useEffect(() => { loadCartFromDatabase(); }, []);

  const loadCartFromDatabase = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCartItems();
      setCart(response.data || []);
      setError(null);
    } catch (error: any) {
      if (error.response?.status !== 401) setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity <= 0) { await removeFromCart(cartId); return; }
    try {
      await cartAPI.updateCartItem(cartId, newQuantity);
      await loadCartFromDatabase();
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) (window as any).refreshCartCount();
    } catch { setError('Failed to update item'); }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      await cartAPI.removeFromCart(cartId);
      await loadCartFromDatabase();
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) (window as any).refreshCartCount();
    } catch { setError('Failed to remove item'); }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart([]);
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) (window as any).refreshCartCount();
    } catch { setError('Failed to clear cart'); }
  };

  const getTotalItems = () => cart.reduce((t, i) => t + i.quantity, 0);
  const getTotalPrice = () => cart.reduce((t, i) => t + parseFloat(i.price) * i.quantity, 0);
  const getShippingCost = () => getTotalPrice() >= 100 ? 0 : 9.99;
  const getFinalTotal = () => getTotalPrice() + getShippingCost();

  const handleCheckout = async () => {
    const { fullName, phone, street, city, state, zipCode } = shippingAddress;
    if (!fullName || !phone || !street || !city || !state || !zipCode) {
      setError('Please fill in all shipping address fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await orderAPI.createOrderFromCart({
        shippingAddress: { fullName, phone, line1: street, city, state, postalCode: zipCode, country: shippingAddress.country },
        paymentMethod,
      });
      const order = response.data as { id: number };
      if (typeof window !== 'undefined' && (window as any).refreshCartCount) (window as any).refreshCartCount();
      if (paymentMethod === 'cod') {
        router.push(`/orders/${order.id}/confirmation`);
      } else {
        setCreatedOrderId(order.id);
        setShowStripePayment(true);
      }
    } catch (err: any) {
      if (err.response?.status === 401) { setError('Please log in'); router.push('/login'); }
      else setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const addr = (field: keyof typeof shippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShippingAddress(prev => ({ ...prev, [field]: e.target.value }));

  // Auth loading
  if (authLoading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <div className="text-center">
          <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px', margin: '0 auto' }} />
          <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--accent-100)] flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7" style={{ color: 'var(--accent-600)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Login Required</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Please sign in to view your cart and place orders.
          </p>
          <button onClick={() => router.push('/login')} className="btn btn-primary btn-full mb-3">
            <LogIn className="w-4 h-4" /> Go to Login
          </button>
          <button onClick={() => router.push('/products')} className="btn btn-outline btn-full">
            Continue Browsing
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!loading && cart.length === 0) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            You haven't added any items yet. Start shopping!
          </p>
          <Link href="/products" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Page header */}
      <div className="page-header">
        <div className="container-app">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/products')} className="btn btn-ghost btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="section-title">Shopping Cart</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cart Items</h2>
                <button onClick={clearCart} disabled={loading}
                  className="text-xs font-medium hover:underline" style={{ color: 'var(--color-error)' }}>
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-5">
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-secondary)] shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product.images[0].imageUrl)}
                          alt={item.product.images[0].altText || item.product.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {item.product.name}
                      </h3>
                      {item.product.seller && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>by {item.product.seller.username}</p>
                      )}
                      <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent-600)' }}>
                        ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>

                    {/* Qty */}
                    <div className="flex items-center gap-2 border border-[var(--border)] rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-secondary)] transition-colors">
                        <Minus className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading || item.quantity >= item.product.stockQuantity}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-secondary)] transition-colors">
                        <Plus className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                    </div>

                    {/* Total + remove */}
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity >= item.product.stockQuantity && (
                        <p className="text-xs" style={{ color: 'var(--color-error)' }}>Max stock</p>
                      )}
                    </div>

                    <button onClick={() => removeFromCart(item.id)} disabled={loading}
                      className="btn btn-ghost btn-icon text-xs"
                      style={{ color: 'var(--text-muted)' }}>
                      <Trash2 className="w-4 h-4 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/products" className="btn btn-outline btn-sm inline-flex">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
          </div>

          {/* Order summary / Checkout */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Order Summary</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                  <span className="font-medium" style={{ color: getShippingCost() === 0 ? 'var(--accent-600)' : 'var(--text-primary)' }}>
                    {getShippingCost() === 0 ? 'Free' : `$${getShippingCost().toFixed(2)}`}
                  </span>
                </div>
                {getShippingCost() === 0 && (
                  <p className="text-xs badge badge-green w-full text-center py-1.5">🎉 Free shipping applied!</p>
                )}
                <div className="divider" />
                <div className="flex justify-between font-bold">
                  <span style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ color: 'var(--accent-600)' }}>${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              {!showCheckout && !showStripePayment && (
                <button onClick={() => setShowCheckout(true)} disabled={loading}
                  className="btn btn-primary btn-full btn-lg">
                  <CreditCard className="w-4 h-4" /> Proceed to Checkout
                </button>
              )}

              {showStripePayment && createdOrderId && (
                <div className="space-y-4">
                  <div className="alert alert-info">
                    <span className="text-xs">Order #{createdOrderId} created — complete payment below.</span>
                  </div>
                  <StripeCheckout
                    orderId={createdOrderId}
                    amount={getFinalTotal()}
                    onSuccess={() => router.push(`/orders/${createdOrderId}/confirmation`)}
                    onCancel={() => { setShowStripePayment(false); setCreatedOrderId(null); }}
                  />
                </div>
              )}

              {showCheckout && !showStripePayment && (
                <div className="space-y-5">
                  {/* Payment method */}
                  <div>
                    <p className="label mb-2">Payment Method</p>
                    <div className="space-y-2">
                      {([
                        { value: 'cod', icon: Wallet, title: 'Cash on Delivery', desc: 'Pay when you receive' },
                        { value: 'stripe', icon: CreditCard, title: 'Credit / Debit Card', desc: 'Secured by Stripe' },
                      ] as const).map(({ value, icon: Icon, title, desc }) => (
                        <button key={value} onClick={() => setPaymentMethod(value)}
                          className={`w-full p-3 border-2 rounded-xl flex items-center gap-3 transition-all text-left ${
                            paymentMethod === value
                              ? 'border-[var(--accent-500)] bg-[var(--accent-50)]'
                              : 'border-[var(--border)] hover:border-[var(--accent-200)]'
                          }`}>
                          <Icon className="w-5 h-5 shrink-0" style={{ color: paymentMethod === value ? 'var(--accent-600)' : 'var(--text-muted)' }} />
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div>
                    <p className="label mb-2">Shipping Address</p>
                    <div className="space-y-2">
                      {[
                        { ph: 'Full Name', field: 'fullName' as const },
                        { ph: 'Phone Number', field: 'phone' as const },
                        { ph: 'Street Address', field: 'street' as const },
                      ].map(({ ph, field }) => (
                        <input key={field} type="text" placeholder={ph}
                          value={shippingAddress[field]} onChange={addr(field)} className="input" />
                      ))}
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="City" value={shippingAddress.city} onChange={addr('city')} className="input" />
                        <input type="text" placeholder="State" value={shippingAddress.state} onChange={addr('state')} className="input" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="ZIP Code" value={shippingAddress.zipCode} onChange={addr('zipCode')} className="input" />
                        <input type="text" placeholder="Country" value={shippingAddress.country} onChange={addr('country')} className="input" />
                      </div>
                    </div>
                  </div>

                  {error && <div className="alert alert-error"><span className="text-xs">{error}</span></div>}

                  <button onClick={handleCheckout} disabled={loading} className="btn btn-primary btn-full">
                    {loading ? (
                      <><span className="spinner" /> Processing…</>
                    ) : paymentMethod === 'cod' ? (
                      <><CheckCircle className="w-4 h-4" /> Place Order (COD)</>
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Continue to Payment</>
                    )}
                  </button>

                  <button onClick={() => { setShowCheckout(false); setError(null); }}
                    disabled={loading} className="btn btn-outline btn-full btn-sm">
                    ← Back to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
