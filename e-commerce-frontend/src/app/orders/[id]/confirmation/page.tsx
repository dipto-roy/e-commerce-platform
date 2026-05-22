'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle, Package, Truck, MapPin, Calendar,
  ArrowLeft, Download, Clock, XCircle,
} from 'lucide-react';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';

interface Order {
  id: number;
  status: string;
  totalAmount: string | number;
  shippingAddress: {
    street: string; city: string; state: string; zipCode: string; country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: Array<{
    id: number;
    quantity: number;
    unitPriceSnapshot: string | number;
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

const STATUS_BADGE: Record<string, string> = {
  pending:   'badge badge-yellow',
  confirmed: 'badge badge-blue',
  shipped:   'badge badge-blue',
  delivered: 'badge badge-green',
  cancelled: 'badge badge-red',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:   <Clock    className="w-4 h-4" />,
  confirmed: <CheckCircle className="w-4 h-4" />,
  shipped:   <Truck    className="w-4 h-4" />,
  delivered: <Package  className="w-4 h-4" />,
  cancelled: <XCircle  className="w-4 h-4" />,
};

const TIMELINE_STEPS = [
  { key: 'placed',     label: 'Order placed',     statuses: ['pending', 'confirmed', 'shipped', 'delivered'] },
  { key: 'confirmed',  label: 'Order confirmed',   statuses: ['confirmed', 'shipped', 'delivered'] },
  { key: 'shipped',    label: 'Order shipped',     statuses: ['shipped', 'delivered'] },
  { key: 'delivered',  label: 'Order delivered',   statuses: ['delivered'] },
];

export default function OrderConfirmationPage() {
  const router  = useRouter();
  const params  = useParams();
  const orderId = params.id;

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => { if (orderId) fetchOrder(); }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1';
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch order details');
      setOrder(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper flex items-center justify-center">
        <span className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-wrapper flex items-center justify-center p-6">
        <div className="card p-10 max-w-sm text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Order Not Found</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {error || 'The order could not be found.'}
          </p>
          <button onClick={() => router.push('/products')} className="btn btn-primary btn-full">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const statusKey = order.status.toLowerCase();
  const total     = Number(order.totalAmount);
  const shipping  = total >= 100 ? 0 : 9.99;
  const subtotal  = (total - shipping).toFixed(2);
  const estDelivery =
    statusKey === 'delivered' ? 'Delivered'
    : statusKey === 'shipped' ? '2-3 business days'
    : '5-7 business days';

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-app">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/products')} className="btn btn-icon btn-ghost">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="section-title">Order Confirmation</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Order #{order.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        {/* Success banner */}
        <div className="rounded-2xl p-5 mb-8 flex items-center gap-4"
          style={{ background: 'var(--accent-50)', border: '1px solid var(--accent-200)' }}>
          <CheckCircle className="w-8 h-8 shrink-0" style={{ color: 'var(--accent-600)' }} />
          <div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--accent-800, var(--accent-600))' }}>
              Order Placed Successfully!
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--accent-700, var(--text-secondary))' }}>
              Thank you for your order. A confirmation email has been sent.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order status */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Order Status</h3>
              <div className="flex flex-wrap items-center gap-3">
                <span className={STATUS_BADGE[statusKey] || 'badge badge-gray'}>
                  {STATUS_ICON[statusKey]}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                {order.trackingNumber && (
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Tracking: <strong>{order.trackingNumber}</strong>
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Order items */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Order Items</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {order.orderItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--bg-secondary)] shrink-0">
                      {item.product.images?.length > 0 ? (
                        <img
                          src={getImageUrl(
                            typeof item.product.images[0] === 'string'
                              ? item.product.images[0]
                              : item.product.images[0].imageUrl
                          )}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {item.product.name}
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        by {item.seller?.fullName || item.seller?.username || 'Unknown Seller'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} · ${Number(item.unitPriceSnapshot).toFixed(2)} each
                      </p>
                    </div>
                    <span className="font-bold shrink-0" style={{ color: 'var(--accent-600)' }}>
                      ${(Number(item.unitPriceSnapshot) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="card p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'var(--accent-600)' }} /> Shipping Address
              </h3>
              <div className="text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Right: summary sidebar */}
          <div className="space-y-5">
            {/* Order summary */}
            <div className="card p-6 sticky top-20">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Order Summary</h3>

              <div className="space-y-3 text-sm mb-5">
                {[
                  { label: 'Subtotal', value: `$${subtotal}` },
                  { label: 'Shipping', value: shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ color: shipping === 0 && label === 'Shipping' ? 'var(--accent-600)' : 'var(--text-primary)' }}>
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-[var(--border)]">
                  <span style={{ color: 'var(--text-primary)' }}>Total</span>
                  <span style={{ color: 'var(--accent-600)' }}>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button onClick={() => { console.log('Download invoice'); alert('Invoice download coming soon'); }}
                  className="btn btn-primary btn-full">
                  <Download className="w-4 h-4" /> Download Invoice
                </button>
                <button onClick={() => router.push('/orders')} className="btn btn-outline btn-full">
                  View All Orders
                </button>
                <button onClick={() => router.push('/products')}
                  className="w-full text-sm font-medium py-2 hover:underline"
                  style={{ color: 'var(--accent-600)' }}>
                  Continue Shopping
                </button>
              </div>

              {/* Estimated delivery */}
              <div className="mt-5 pt-5 border-t border-[var(--border)]">
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  ESTIMATED DELIVERY
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{estDelivery}</p>
              </div>

              {/* Timeline */}
              <div className="mt-5 pt-5 border-t border-[var(--border)]">
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                  ORDER TIMELINE
                </p>
                <div className="space-y-2">
                  {TIMELINE_STEPS.map(step => {
                    const done = step.statuses.includes(statusKey);
                    return (
                      <div key={step.key} className="flex items-center gap-2.5 text-sm">
                        <span className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: done ? 'var(--accent-500)' : 'var(--border)' }} />
                        <span style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
