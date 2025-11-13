# 🚀 Complete Deployment Guide - E-Commerce Platform

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup (Neon PostgreSQL)](#database-setup-neon-postgresql)
4. [Backend Deployment (Render)](#backend-deployment-render)
5. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Architecture:**
- **Backend**: NestJS (Render)
- **Frontend**: Next.js (Vercel)
- **Database**: PostgreSQL (Neon)

**Services:**
- Payment Processing: Stripe
- Real-time Notifications: Pusher
- File Storage: Render Disk (Backend), Vercel (Frontend)

---

## Prerequisites

### Required Accounts
- [ ] GitHub account (for code repository)
- [ ] Neon account (https://neon.tech)
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] Stripe account (https://stripe.com)
- [ ] Pusher account (https://pusher.com)

### Local Requirements
- [ ] Git installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL client (psql) for testing

---

## Database Setup (Neon PostgreSQL)

### Step 1: Create Neon Project

1. **Sign up / Log in to Neon**
   ```
   https://console.neon.tech
   ```

2. **Create New Project**
   - Click "New Project"
   - Name: `ecommerce-platform-prod`
   - Region: Choose closest to your users (e.g., `US East (Ohio)`)
   - PostgreSQL Version: `15` or latest
   - Click "Create Project"

3. **Get Connection Details**
   
   After creation, you'll see:
   ```
   Host: ep-xxx-xxx.us-east-2.aws.neon.tech
   Database: neondb
   Username: neondb_owner
   Password: [auto-generated]
   ```

4. **Save Connection String**
   
   Copy the connection string (looks like):
   ```
   postgresql://neondb_owner:xxxxx@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Configure Database

1. **Enable Required Extensions** (via Neon Console SQL Editor)
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Verify Connection**
   ```bash
   psql "postgresql://neondb_owner:xxxxx@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

3. **Database is Ready!** ✅
   - Tables will be created automatically by TypeORM migrations on first backend deploy

---

## Backend Deployment (Render)

### Step 1: Prepare Repository

1. **Commit all changes**
   ```bash
   cd /home/dip-roy/e-commerce_project
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify .gitignore**
   - Ensure `.env` files are ignored
   - Test scripts are excluded
   - Documentation files handled properly

### Step 2: Create Render Web Service

1. **Log in to Render**
   ```
   https://dashboard.render.com
   ```

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `dipto-roy/e-commerce-platform`
   - Select the repository

3. **Configure Service**
   
   **Basic Settings:**
   ```
   Name: ecommerce-backend-prod
   Region: Oregon (US West) or closest
   Branch: main
   Root Directory: e-commerce_backend
   Environment: Node
   ```

   **Build Settings:**
   ```
   Build Command: npm install && npm run build
   Start Command: npm run start:prod
   ```

   **Instance Type:**
   ```
   Free (for testing) or Starter ($7/month recommended)
   ```

4. **Environment Variables**
   
   Click "Advanced" → Add Environment Variables:

   ```bash
   # Database
   DB_HOST=ep-xxx-xxx.us-east-2.aws.neon.tech
   DB_PORT=5432
   DB_USERNAME=neondb_owner
   DB_PASSWORD=your_neon_password
   DB_DATABASE=neondb
   
   # Application
   NODE_ENV=production
   PORT=4002
   
   # JWT Secrets (generate strong random strings)
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long_xxxxx
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars_long_xxxxx
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # CORS (will update after frontend deployed)
   CORS_ORIGIN=http://localhost:3000
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Pusher
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=ap2
   
   # OAuth (Optional - for Google login)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/v1/auth/google/callback
   
   # Email (Optional - for notifications)
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   MAIL_FROM=noreply@yourdomain.com
   ```

   **Generate Secure Secrets:**
   ```bash
   # Run locally to generate
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Note your backend URL: `https://ecommerce-backend-prod.onrender.com`

### Step 3: Verify Backend Deployment

1. **Check Health**
   ```bash
   curl https://ecommerce-backend-prod.onrender.com/api/v1/auth/login
   # Should return: {"statusCode":401,"message":"Invalid credentials"}
   ```

2. **Check API Documentation**
   ```
   https://ecommerce-backend-prod.onrender.com/api-docs
   ```

3. **Monitor Logs**
   - Go to Render Dashboard → Your Service → Logs
   - Look for: "🚀 Application is running on"

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update API URL locally**
   
   Edit `e-commerce-frontend/.env.production`:
   ```bash
   # Backend API
   NEXT_PUBLIC_API_URL=https://ecommerce-backend-prod.onrender.com/api/v1
   NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
   
   # Pusher
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=ap2
   
   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   
   # App
   NEXT_PUBLIC_APP_NAME=E-Commerce Platform
   ```

2. **Test Build Locally**
   ```bash
   cd e-commerce-frontend
   npm run build
   # Should complete without errors
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Configure production environment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Log in to Vercel**
   ```
   https://vercel.com/dashboard
   ```

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import Git Repository: `dipto-roy/e-commerce-platform`
   - Select repository

3. **Configure Project**
   
   **Framework Preset:** `Next.js`
   
   **Root Directory:** `e-commerce-frontend`
   
   **Build Settings:**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables**
   
   Add the following (same as .env.production):
   ```
   NEXT_PUBLIC_API_URL=https://ecommerce-backend-prod.onrender.com/api/v1
   NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=ap2
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   NEXT_PUBLIC_APP_NAME=E-Commerce Platform
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Note your URL: `https://your-app.vercel.app`

### Step 3: Update Frontend URL

After deployment, update the environment variable:
```
NEXT_PUBLIC_FRONTEND_URL=https://your-actual-app.vercel.app
```

Then redeploy:
- Go to Vercel Dashboard → Your Project → Deployments
- Click "Redeploy" on latest deployment

---

## Post-Deployment Configuration

### Step 1: Update CORS on Backend

1. **Update Render Environment Variables**
   
   Go to Render Dashboard → Backend Service → Environment
   
   Update:
   ```
   CORS_ORIGIN=https://your-app.vercel.app,https://your-app-git-*.vercel.app
   ```

2. **Redeploy Backend**
   - Click "Manual Deploy" → "Deploy latest commit"

### Step 2: Configure Stripe Webhooks

1. **Get Webhook URL**
   ```
   https://ecommerce-backend-prod.onrender.com/api/v1/payments/webhook
   ```

2. **Create Webhook in Stripe Dashboard**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: (paste webhook URL above)
   - Events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Click "Add endpoint"

3. **Update Webhook Secret**
   - Copy the webhook signing secret: `whsec_xxxxx`
   - Update in Render: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
   - Redeploy backend

### Step 3: Create Admin User

1. **Connect to Neon Database**
   ```bash
   psql "postgresql://neondb_owner:xxxxx@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Create Admin Account**
   ```sql
   -- Check if users table exists
   \dt
   
   -- Insert admin user (password will be hashed on first login via app)
   INSERT INTO users (email, username, role, "isActive", "isVerified", "createdAt")
   VALUES ('admin@yourdomain.com', 'admin', 'ADMIN', true, true, NOW());
   ```

3. **Set Admin Password via API**
   ```bash
   # Use forgot password flow or create via signup and update role
   curl -X POST https://ecommerce-backend-prod.onrender.com/api/v1/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@yourdomain.com",
       "password": "YourSecurePassword123!",
       "username": "admin",
       "phone": "1234567890"
     }'
   
   # Then update role in database
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@yourdomain.com';
   ```

### Step 4: Configure Custom Domain (Optional)

**Backend (Render):**
1. Go to Settings → Custom Domain
2. Add your domain: `api.yourdomain.com`
3. Update DNS records as shown

**Frontend (Vercel):**
1. Go to Settings → Domains
2. Add your domain: `yourdomain.com`
3. Update DNS records as shown

---

## Testing & Verification

### Automated Testing Script

Save as `test-production-deployment.sh`:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://ecommerce-backend-prod.onrender.com"
FRONTEND_URL="https://your-app.vercel.app"
API_URL="$BACKEND_URL/api/v1"

echo "=========================================="
echo "🧪 Testing Production Deployment"
echo "=========================================="
echo ""

# Test 1: Backend Health
echo "1️⃣ Testing Backend Health..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/v1/auth/login")
if [ "$BACKEND_RESPONSE" = "401" ] || [ "$BACKEND_RESPONSE" = "400" ]; then
  echo -e "${GREEN}✅ Backend is UP (HTTP $BACKEND_RESPONSE)${NC}"
else
  echo -e "${RED}❌ Backend is DOWN (HTTP $BACKEND_RESPONSE)${NC}"
fi
echo ""

# Test 2: Frontend Health
echo "2️⃣ Testing Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
  echo -e "${GREEN}✅ Frontend is UP (HTTP $FRONTEND_RESPONSE)${NC}"
else
  echo -e "${RED}❌ Frontend is DOWN (HTTP $FRONTEND_RESPONSE)${NC}"
fi
echo ""

# Test 3: API Documentation
echo "3️⃣ Testing API Documentation..."
SWAGGER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api-docs")
if [ "$SWAGGER_RESPONSE" = "200" ] || [ "$SWAGGER_RESPONSE" = "301" ]; then
  echo -e "${GREEN}✅ API Docs accessible${NC}"
  echo "   URL: $BACKEND_URL/api-docs"
else
  echo -e "${YELLOW}⚠️  API Docs not accessible${NC}"
fi
echo ""

# Test 4: Database Connection
echo "4️⃣ Testing Database Connection..."
LOGIN_TEST=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}')

if echo "$LOGIN_TEST" | grep -q "Invalid credentials"; then
  echo -e "${GREEN}✅ Database connected (auth working)${NC}"
else
  echo -e "${RED}❌ Database connection issue${NC}"
  echo "Response: $LOGIN_TEST"
fi
echo ""

# Test 5: CORS Configuration
echo "5️⃣ Testing CORS..."
CORS_TEST=$(curl -s -I -X OPTIONS "$API_URL/auth/login" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST")

if echo "$CORS_TEST" | grep -q "Access-Control-Allow-Origin"; then
  echo -e "${GREEN}✅ CORS configured correctly${NC}"
else
  echo -e "${RED}❌ CORS not configured${NC}"
fi
echo ""

# Test 6: Environment Variables
echo "6️⃣ Testing Environment Configuration..."

# Test Stripe (if configured)
if curl -s "$API_URL/payments/health" | grep -q "ok"; then
  echo -e "${GREEN}✅ Stripe configuration valid${NC}"
else
  echo -e "${YELLOW}⚠️  Stripe configuration not verified${NC}"
fi
echo ""

echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "API Docs: $BACKEND_URL/api-docs"
echo ""
echo "✅ Tests completed!"
echo ""
```

**Run the test:**
```bash
chmod +x test-production-deployment.sh
./test-production-deployment.sh
```

### Manual Testing Checklist

- [ ] **Frontend loads successfully**
- [ ] **User can sign up**
- [ ] **User can log in**
- [ ] **Admin can access admin dashboard**
- [ ] **Products display correctly**
- [ ] **Images load properly**
- [ ] **Cart functionality works**
- [ ] **Checkout process works**
- [ ] **Stripe payment processes**
- [ ] **Email notifications send**
- [ ] **Real-time notifications work (Pusher)**
- [ ] **Admin can manage orders**
- [ ] **Admin can view reports**

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Symptoms:** Build succeeds but app crashes on start

**Solutions:**
- Check Render logs for error messages
- Verify all environment variables are set
- Ensure `start:prod` script exists in package.json:
  ```json
  "start:prod": "node dist/main"
  ```
- Check database connection string

#### 2. Database Connection Fails

**Symptoms:** "Connection refused" or "Authentication failed"

**Solutions:**
- Verify Neon connection string is correct
- Ensure SSL mode is enabled: `?sslmode=require`
- Check IP whitelist in Neon (should allow all for Render)
- Test connection manually:
  ```bash
  psql "your_connection_string"
  ```

#### 3. CORS Errors on Frontend

**Symptoms:** "Blocked by CORS policy"

**Solutions:**
- Update CORS_ORIGIN in Render to include:
  - Main Vercel URL
  - Preview URLs: `https://*.vercel.app`
- Redeploy backend after updating
- Clear browser cache

#### 4. Images Not Loading

**Symptoms:** 404 errors for images

**Solutions:**
- **Backend:** Check image path in main.ts
- **Frontend:** Verify NEXT_PUBLIC_API_URL
- **Render:** Ensure disk persistence is enabled (Paid plans)
- **Alternative:** Use external storage (AWS S3, Cloudinary)

#### 5. Stripe Webhooks Fail

**Symptoms:** Payments succeed but orders stay pending

**Solutions:**
- Verify webhook URL in Stripe dashboard
- Check webhook signing secret matches environment variable
- Test webhook endpoint:
  ```bash
  curl -X POST https://your-backend.onrender.com/api/v1/payments/webhook
  ```
- Check Render logs for webhook errors

#### 6. Frontend Build Fails

**Symptoms:** Vercel deployment fails during build

**Solutions:**
- Check build logs for specific errors
- Verify all dependencies in package.json
- Test build locally: `npm run build`
- Check TypeScript errors: `npm run type-check`
- Increase Node.js memory:
  ```json
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
  ```

#### 7. Environment Variables Not Working

**Symptoms:** App can't read config values

**Solutions:**
- **Frontend:** Ensure variables start with `NEXT_PUBLIC_`
- **Backend:** Restart service after updating env vars
- Verify no typos in variable names
- Check values are properly escaped (no quotes needed in Render/Vercel)

---

## Performance Optimization

### Backend (Render)

1. **Use Starter Plan or Higher**
   - Free tier sleeps after 15min inactivity
   - Paid plans stay awake

2. **Enable Persistent Disk** (for images)
   - Add disk in Render settings
   - Update image path to use disk

3. **Add Redis** (for caching)
   - Add Redis instance in Render
   - Update backend to use Redis for sessions

### Frontend (Vercel)

1. **Image Optimization**
   - Use Next.js Image component
   - Configure image domains in next.config.ts

2. **Enable Caching**
   ```typescript
   // next.config.ts
   export default {
     headers: async () => [{
       source: '/:all*(svg|jpg|png)',
       headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000' }]
     }]
   }
   ```

3. **Analyze Bundle Size**
   ```bash
   npm run build -- --profile
   ```

### Database (Neon)

1. **Autoscaling**
   - Enable auto-suspend (free tier)
   - Adjust min/max compute units

2. **Connection Pooling**
   - Use Neon's pooled connection string
   - Add `?pgbouncer=true` to connection URL

---

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] JWT secrets are strong random strings (32+ chars)
- [ ] Database password is strong
- [ ] CORS is restricted to your frontend domain
- [ ] Stripe webhook secret is configured
- [ ] Rate limiting is enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (TypeORM provides this)
- [ ] XSS protection enabled (helmet)
- [ ] HTTPS enforced (automatic on Render/Vercel)

---

## Monitoring & Maintenance

### Render
- Monitor logs: Dashboard → Service → Logs
- Set up alerts: Settings → Notifications
- Check metrics: CPU, Memory usage

### Vercel
- Analytics: Dashboard → Analytics
- Error tracking: Integrations → Sentry
- Performance: Speed Insights

### Neon
- Monitor queries: Console → Queries
- Check usage: Billing → Usage
- Set up alerts: Settings → Alerts

---

## Backup Strategy

### Database Backups (Neon)
```bash
# Automated backups (enabled by default in Neon)
# Manual backup
pg_dump "your_neon_connection_string" > backup_$(date +%Y%m%d).sql

# Restore
psql "your_neon_connection_string" < backup_20250113.sql
```

### Code Backups
- GitHub provides version control
- Regular commits and tags
- Use branches for major releases

---

## Scaling Considerations

### When to Scale

**Backend:**
- Response time > 2 seconds
- CPU usage consistently > 80%
- Memory usage near limit

**Database:**
- Query response time > 100ms
- Storage > 80% capacity
- Connection pool exhausted

**Frontend:**
- Core Web Vitals scores drop
- Build times > 5 minutes

### How to Scale

1. **Upgrade Render Plan** (Starter → Standard)
2. **Upgrade Neon Plan** (Free → Pro)
3. **Add Caching Layer** (Redis)
4. **Use CDN** (Cloudflare, Vercel Edge)
5. **Database Optimization** (indexes, query optimization)

---

## Support & Resources

### Documentation
- NestJS: https://docs.nestjs.com
- Next.js: https://nextjs.org/docs
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs

### Community
- NestJS Discord: https://discord.gg/nestjs
- Next.js Discussions: https://github.com/vercel/next.js/discussions

---

## Summary

✅ **Deployment Complete!**

Your e-commerce platform is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://ecommerce-backend-prod.onrender.com/api/v1
- **API Docs**: https://ecommerce-backend-prod.onrender.com/api-docs

**Next Steps:**
1. Test all functionality using the testing script
2. Configure custom domains
3. Set up monitoring and alerts
4. Add production data
5. Enable SSL/HTTPS (automatic)
6. Configure email service
7. Set up backup routine

**Estimated Costs:**
- Neon (Free tier): $0/month
- Render (Starter): $7/month
- Vercel (Hobby): $0/month
- **Total**: ~$7/month

For production use with better performance:
- Render (Standard): $25/month
- Neon (Pro): $19/month
- Vercel (Pro): $20/month
- **Total**: ~$64/month

---

**Need Help?**
- Check troubleshooting section
- Review deployment logs
- Contact support for respective platforms
- Review this guide carefully

**Good luck with your deployment! 🚀**
