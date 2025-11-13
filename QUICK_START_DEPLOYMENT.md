# 🚀 Quick Start Deployment Guide

## Overview
This is a **step-by-step** guide to deploy your e-commerce platform in under 30 minutes.

---

## Prerequisites ✅

Before starting, ensure you have:
- [ ] GitHub account with this repository pushed
- [ ] Neon account (https://neon.tech)
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] Stripe account (https://stripe.com)
- [ ] Pusher account (https://pusher.com)

---

## Step 1: Database Setup (5 minutes) 🗄️

### 1.1 Create Neon Project

1. Go to: https://console.neon.tech
2. Click **"New Project"**
3. Fill in:
   - **Name**: `ecommerce-production`
   - **Region**: `US East (Ohio)` or closest to you
   - **PostgreSQL Version**: `15` (default)
4. Click **"Create Project"**

### 1.2 Get Connection String

After creation, you'll see a connection string like:
```
postgresql://neondb_owner:abc123xyz@ep-cool-sun-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**📋 Copy this connection string** - you'll need it in Step 2!

---

## Step 2: Backend Deployment (10 minutes) ⚙️

### 2.1 Push Code to GitHub

```bash
cd /home/dip-roy/e-commerce_project
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.2 Deploy to Render

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:

   **Service Details:**
   ```
   Name: ecommerce-backend-prod
   Region: Oregon (US West)
   Branch: main
   Root Directory: e-commerce_backend
   Environment: Node
   ```

   **Build & Start:**
   ```
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

   **Plan:** Starter ($7/month) or Free for testing

5. Click **"Advanced"** and add Environment Variables:

   **Copy and paste these, then fill in YOUR values:**
   ```bash
   NODE_ENV=production
   PORT=4002
   
   # Database (from Step 1.2)
   DB_HOST=your-neon-host.neon.tech
   DB_PORT=5432
   DB_USERNAME=neondb_owner
   DB_PASSWORD=your_neon_password
   DB_DATABASE=neondb
   
   # JWT Secrets (generate random strings)
   JWT_SECRET=your_random_string_min_32_chars_xxxxxxxxxxxxxx
   JWT_REFRESH_SECRET=another_random_string_min_32_chars_xxxxxxxx
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # CORS (temporary, will update after frontend)
   CORS_ORIGIN=http://localhost:3000
   
   # Stripe (from Stripe Dashboard)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
   
   # Pusher (from Pusher Dashboard)
   PUSHER_APP_ID=your_app_id
   PUSHER_KEY=your_key
   PUSHER_SECRET=your_secret
   PUSHER_CLUSTER=ap2
   ```

   **🔑 Generate JWT Secrets:**
   ```bash
   # Run locally:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. Click **"Create Web Service"**
7. Wait for build (5-10 minutes)
8. **📋 Copy your backend URL**: `https://ecommerce-backend-prod.onrender.com`

### 2.3 Verify Backend

Test in browser or terminal:
```bash
curl https://ecommerce-backend-prod.onrender.com/api/v1/auth/login
```

Should return: `{"statusCode":401,...}`

✅ **Backend is live!**

---

## Step 3: Frontend Deployment (10 minutes) 🎨

### 3.1 Update Environment Variables

Edit `e-commerce-frontend/.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://ecommerce-backend-prod.onrender.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
NEXT_PUBLIC_APP_NAME=E-Commerce Platform
```

### 3.2 Commit Changes

```bash
git add .
git commit -m "Add production environment variables"
git push origin main
```

### 3.3 Deploy to Vercel

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:

   **Framework Preset:** `Next.js`
   
   **Root Directory:** `e-commerce-frontend`
   
   **Build Settings:**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

5. **Environment Variables** - Add the same from Step 3.1

6. Click **"Deploy"**
7. Wait for deployment (2-5 minutes)
8. **📋 Copy your frontend URL**: `https://your-app.vercel.app`

### 3.4 Update Backend CORS

1. Go back to Render Dashboard
2. Select your backend service
3. Go to **"Environment"**
4. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-actual-app.vercel.app
   ```
5. Click **"Save Changes"**
6. Service will auto-redeploy

✅ **Frontend is live!**

---

## Step 4: Configure Stripe Webhooks (5 minutes) 💳

### 4.1 Create Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:**
   ```
   https://ecommerce-backend-prod.onrender.com/api/v1/payments/webhook
   ```
4. **Events to send:**
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Click **"Add endpoint"**

### 4.2 Update Webhook Secret

1. Click on your new webhook
2. **📋 Copy the signing secret**: `whsec_xxxxx`
3. Go to Render Dashboard → Backend → Environment
4. Update:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret
   ```
5. Save and wait for redeploy

✅ **Stripe webhooks configured!**

---

## Step 5: Create Admin Account (3 minutes) 👤

### Option A: Via API

```bash
# 1. Sign up via frontend
Open: https://your-app.vercel.app/signup
Create an account

# 2. Update role in database
# Connect to Neon via psql or Neon Console SQL Editor:
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Option B: Direct Database Insert

```sql
-- Via Neon Console SQL Editor:
INSERT INTO users (email, username, password, role, "isActive", "isVerified", "createdAt")
VALUES (
  'admin@yourdomain.com',
  'admin',
  '$2b$10$example_hashed_password', -- Will need to set via app
  'ADMIN',
  true,
  true,
  NOW()
);
```

Then use **Forgot Password** flow to set password.

✅ **Admin account ready!**

---

## Step 6: Test Deployment (5 minutes) 🧪

### 6.1 Run Automated Tests

```bash
cd /home/dip-roy/e-commerce_project
./test-production-deployment.sh https://ecommerce-backend-prod.onrender.com https://your-app.vercel.app
```

### 6.2 Manual Testing

- [ ] Open frontend: `https://your-app.vercel.app`
- [ ] Sign up as new user
- [ ] Browse products
- [ ] Add to cart
- [ ] Test checkout (use Stripe test card: `4242 4242 4242 4242`)
- [ ] Login as admin
- [ ] Check admin dashboard
- [ ] Verify orders appear
- [ ] Test notifications

✅ **All tests passed!**

---

## 🎉 Deployment Complete!

Your e-commerce platform is now **LIVE**:

- **🌐 Frontend**: https://your-app.vercel.app
- **⚙️ Backend API**: https://ecommerce-backend-prod.onrender.com/api/v1
- **📚 API Docs**: https://ecommerce-backend-prod.onrender.com/api-docs

---

## Next Steps (Optional)

### Custom Domains
- **Render**: Add custom domain in service settings
- **Vercel**: Add domain in project settings

### Monitoring
- **Render**: Enable alerts in service settings
- **Vercel**: Enable Analytics in project settings
- **Neon**: Set up query monitoring

### Scaling
- **Upgrade Render plan** for better performance
- **Enable Neon autoscaling** for database
- **Add Redis** for caching (optional)

---

## Quick Reference

### Important URLs

```bash
# Production
Frontend:  https://your-app.vercel.app
Backend:   https://ecommerce-backend-prod.onrender.com
API:       https://ecommerce-backend-prod.onrender.com/api/v1
Docs:      https://ecommerce-backend-prod.onrender.com/api-docs

# Dashboards
Neon:      https://console.neon.tech
Render:    https://dashboard.render.com
Vercel:    https://vercel.com/dashboard
Stripe:    https://dashboard.stripe.com
Pusher:    https://dashboard.pusher.com
```

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
CVC: Any 3 digits
Date: Any future date
ZIP: Any 5 digits
```

### Common Commands

```bash
# View backend logs
# Go to Render Dashboard → Service → Logs

# View frontend logs
# Go to Vercel Dashboard → Project → Deployments → Click deployment → Logs

# Connect to database
psql "postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require"

# Test endpoint
curl https://your-backend.onrender.com/api/v1/products

# Redeploy frontend
# Go to Vercel → Project → Deployments → Click "Redeploy"
```

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Ensure database connection string is correct

### Frontend shows errors
- Check browser console
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration in backend

### Payments failing
- Verify Stripe webhook is configured
- Check webhook signing secret matches
- Test with Stripe test cards

### Database connection fails
- Verify Neon connection string
- Ensure SSL mode is enabled
- Check Neon project is not paused

---

## Support

- **Full Guide**: See `DEPLOYMENT_GUIDE.md`
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs

---

**Need help?** Review the full `DEPLOYMENT_GUIDE.md` for detailed troubleshooting and advanced configuration.

**Estimated Total Time**: ~30-40 minutes

**Monthly Cost**: 
- Free tier: $0/month (with limitations)
- Recommended: ~$7-26/month (Render Starter + Neon Free)
- Production: ~$64/month (all Pro plans)

**🚀 Happy Deploying!**
