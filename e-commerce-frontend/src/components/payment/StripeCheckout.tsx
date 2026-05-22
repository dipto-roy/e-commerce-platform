'use client';
import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { orderAPI } from '@/utils/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripeCheckoutProps {
  orderId: number;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ orderId, amount, onSuccess, onCancel }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Test card info */}
      <div className="rounded-lg p-4 border" style={{ background: 'var(--accent-50)', borderColor: '#a7f3d0' }}>
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-600)' }} />
          <div className="flex-1">
            <p className="font-medium text-sm mb-2" style={{ color: 'var(--accent-600)' }}>
              ✅ Use Test Card for Development:
            </p>
            <div className="card p-3 font-mono text-sm space-y-1">
              {[
                ['Card Number', '4242 4242 4242 4242'],
                ['Expiry', '12/34'],
                ['CVC', '123'],
                ['ZIP', '12345'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
                  <span className="font-semibold" style={{ color: 'var(--accent-600)' }}>{val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              💡 This is Stripe's test card that always succeeds.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)' }}>
        <PaymentElement />
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Payment Error</p>
            <p className="text-sm">{error}</p>
            {error.toLowerCase().includes('declined') && (
              <p className="text-xs mt-1 p-2 rounded" style={{ background: 'rgba(239,68,68,0.1)' }}>
                ⚠️ <strong>Tip:</strong> Use the test card shown above.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} disabled={processing} className="btn btn-outline flex-1">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            <><CreditCard className="h-4 w-4" /> Pay ${amount.toFixed(2)}</>
          )}
        </button>
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        🔒 Secured by Stripe • Your payment information is encrypted
      </p>
    </form>
  );
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await orderAPI.createPaymentIntent(props.orderId);
        const data = response.data as { clientSecret: string };
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    };
    createPaymentIntent();
  }, [props.orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: 'var(--accent-600)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Initializing secure payment…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <p className="font-medium">Payment Initialization Failed</p>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={props.onCancel} className="text-sm underline hover:no-underline mt-2">
          Go back
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="alert alert-warning">
        <p>Unable to initialize payment. Please try again.</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#10b981',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
