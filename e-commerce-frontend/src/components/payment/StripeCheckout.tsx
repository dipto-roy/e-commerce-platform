'use client';
import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

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
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Test Card Information */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 text-sm mb-2">✅ Use Test Card for Development:</p>
            <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Card Number:</span>
                <span className="font-semibold text-blue-900">4242 4242 4242 4242</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry:</span>
                <span className="font-semibold text-blue-900">12/34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CVC:</span>
                <span className="font-semibold text-blue-900">123</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ZIP:</span>
                <span className="font-semibold text-blue-900">12345</span>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              💡 This is Stripe's test card that always succeeds. Other cards will be declined in test mode.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Payment Error</p>
            <p className="text-sm">{error}</p>
            {error.toLowerCase().includes('declined') && (
              <p className="text-sm mt-2 bg-red-100 p-2 rounded">
                ⚠️ <strong>Tip:</strong> Use the test card shown above. Other cards are intentionally declined in test mode.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        🔒 Secured by Stripe • Your payment information is encrypted
      </p>
    </form>
  );
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch payment intent from backend
    const createPaymentIntent = async () => {
      try {
        const response = await orderAPI.createPaymentIntent(props.orderId);
        const data = response.data as { clientSecret: string };
        setClientSecret(data.clientSecret);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to create payment intent:', err);
        setError(err.response?.data?.message || 'Failed to initialize payment');
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Initializing secure payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Payment Initialization Failed</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={props.onCancel}
          className="mt-3 text-sm underline hover:no-underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>Unable to initialize payment. Please try again.</p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#2563eb',
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
