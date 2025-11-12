# Payment Declined Error - Troubleshooting Guide

## Issue
Getting "Your payment method was declined" error when testing Stripe payments.

## Common Causes & Solutions

### 1. ✅ **Using Wrong Test Card** (Most Common)

Stripe has specific test cards that work in test mode. Make sure you're using one of these:

#### **✅ SUCCESSFUL PAYMENT TEST CARDS:**

**Visa (Basic):**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Visa (3D Secure):**
- Card Number: `4000 0027 6000 3184`
- Requires authentication

**Mastercard:**
- Card Number: `5555 5555 5555 4444`
- Expiry: Any future date
- CVC: Any 3 digits

**American Express:**
- Card Number: `3782 822463 10005`
- Expiry: Any future date
- CVC: Any 4 digits

#### **❌ CARDS THAT WILL BE DECLINED (For testing error handling):**

**Generic Decline:**
- Card Number: `4000 0000 0000 0002`
- Result: Card declined

**Insufficient Funds:**
- Card Number: `4000 0000 0000 9995`
- Result: Card declined (insufficient funds)

**Lost Card:**
- Card Number: `4000 0000 0000 9987`
- Result: Card declined (lost card)

**Stolen Card:**
- Card Number: `4000 0000 0000 9979`
- Result: Card declined (stolen card)

---

### 2. ✅ **Verify Stripe API Keys**

Check that your environment variables are correct:

#### **Backend (.env)**
```env
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
```

#### **Frontend (.env.local)**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

**Important:** 
- Use test mode keys (starting with `sk_` + `test_` and `pk_` + `test_`)
- Use `sk_live_` and `pk_live_` for production
- Never commit live keys to version control

---

### 3. ✅ **Test in Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/test/payments
2. Check if test mode is enabled (toggle in top right)
3. Verify your account is activated
4. Check for any restrictions on your account

---

### 4. ✅ **Check Backend Logs**

The backend might have more details about why the payment failed:

```bash
cd e-commerce_backend
npm run start:dev
```

Look for:
- StripeService initialization
- PaymentIntent creation logs
- Any Stripe API errors
- Webhook processing errors

---

### 5. ✅ **Verify Payment Amount**

Check that the payment amount is valid:
- Must be at least $0.50 USD
- Must be an integer in cents (Stripe automatically converts)
- Check for any currency issues

---

### 6. ✅ **Test Payment Flow Step-by-Step**

1. **Add items to cart**
2. **Go to checkout**
3. **Select "Credit Card (Stripe)" payment method**
4. **Fill in shipping address**
5. **Click "Place Order"**
6. **Wait for Stripe form to load**
7. **Use test card:** `4242 4242 4242 4242`
8. **Enter:** Expiry `12/34`, CVC `123`, ZIP `12345`
9. **Click "Pay $XX.XX"**
10. **Should redirect to confirmation page**

---

## Quick Test

Run this test to verify Stripe is working:

### **Terminal 1 - Backend:**
```bash
cd e-commerce_backend
npm run start:dev
```

### **Terminal 2 - Frontend:**
```bash
cd e-commerce-frontend
npm run dev
```

### **Browser Test:**
1. Go to http://localhost:3001/cart
2. Add a product to cart
3. Proceed to checkout
4. Select "Credit Card (Stripe)"
5. Fill shipping info
6. Click "Place Order"
7. In Stripe form, use:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
8. Click "Pay"

---

## Common Stripe Test Scenarios

### **Scenario 1: Test Successful Payment**
Card: `4242 4242 4242 4242`
Expected: ✅ Payment succeeds, order confirmed

### **Scenario 2: Test Card Declined**
Card: `4000 0000 0000 0002`
Expected: ❌ "Your card was declined"

### **Scenario 3: Test Insufficient Funds**
Card: `4000 0000 0000 9995`
Expected: ❌ "Your card has insufficient funds"

### **Scenario 4: Test 3D Secure**
Card: `4000 0027 6000 3184`
Expected: 🔐 Authentication modal appears

---

## Troubleshooting Checklist

- [ ] Using correct test card (`4242 4242 4242 4242`)
- [ ] Test mode enabled in Stripe Dashboard
- [ ] Backend has correct `STRIPE_SECRET_KEY` (starts with `sk_test_`)
- [ ] Frontend has correct `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
- [ ] Both backend and frontend are running
- [ ] Order is created successfully (check backend logs)
- [ ] PaymentIntent is created (check Stripe Dashboard)
- [ ] No CORS errors in browser console
- [ ] Webhook secret is correct (if using webhooks)

---

## Check Stripe Webhook Configuration

If webhooks are failing:

1. **Local Development:**
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/payments/webhook
   ```
   
2. **Update webhook secret in backend .env:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

3. **Verify webhook in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Check endpoint: `https://your-domain.com/api/v1/payments/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

---

## Debug Mode

To see detailed Stripe logs, add this to your backend:

**File: `e-commerce_backend/src/payment/services/stripe.service.ts`**

```typescript
async createPaymentIntent(amount, currency, metadata) {
  console.log('🔍 Creating PaymentIntent:', {
    amount,
    currency,
    metadata,
    amountInCents: Math.round(amount * 100)
  });
  
  try {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    
    console.log('✅ PaymentIntent created:', paymentIntent.id);
    return paymentIntent;
  } catch (error) {
    console.error('❌ Stripe Error:', error);
    throw error;
  }
}
```

---

## Verify Environment Variables

### **Backend Check:**
```bash
cd e-commerce_backend
cat .env | grep STRIPE
```

Should show:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Frontend Check:**
```bash
cd e-commerce-frontend
cat .env.local | grep STRIPE
```

Should show:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Your card was declined" | Using declined test card | Use `4242 4242 4242 4242` |
| "Your card has insufficient funds" | Using insufficient funds test card | Use `4242 4242 4242 4242` |
| "Failed to initialize payment" | Backend error creating PaymentIntent | Check backend logs |
| "Payment failed" | Generic Stripe error | Check Stripe Dashboard logs |
| "Invalid API key" | Wrong Stripe key | Verify `.env` files |

---

## Get Help from Stripe

1. **Stripe Dashboard Logs:**
   - https://dashboard.stripe.com/test/logs
   - Shows all API requests and responses

2. **Stripe Documentation:**
   - https://stripe.com/docs/testing
   - Complete list of test cards

3. **Stripe Support:**
   - Available in Stripe Dashboard (chat icon)

---

## Quick Fix Summary

**Most Likely Fix:** Use the correct test card

Replace any card number with:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

This is the universal Stripe test card that always succeeds in test mode!

---

## Verify Payment is Working

After applying the fix:

1. ✅ Go to cart page
2. ✅ Proceed to checkout
3. ✅ Select Stripe payment
4. ✅ Use test card `4242 4242 4242 4242`
5. ✅ Payment should succeed
6. ✅ Check Stripe Dashboard: https://dashboard.stripe.com/test/payments
7. ✅ Verify order in database
8. ✅ Check webhook fired (if configured)

---

## Need More Help?

If still getting declined:

1. **Check Stripe Dashboard:** https://dashboard.stripe.com/test/logs
2. **Check backend logs:** Look for Stripe API errors
3. **Check browser console:** Look for JavaScript errors
4. **Verify test mode:** Make sure using test keys (not live)
5. **Try different card:** Use `5555 5555 5555 4444` (Mastercard)

---

**Date Created:** November 6, 2025  
**Status:** Active Troubleshooting Guide  
**Platform:** Stripe Payments v3 with Next.js & NestJS
