# 📋 Pre-Deployment Checklist

## Before You Deploy

Complete this checklist to ensure smooth deployment.

---

## 1. Code Repository ✅

- [ ] All code is committed to Git
- [ ] Repository is pushed to GitHub
- [ ] Branch is `main` or specify your branch
- [ ] `.gitignore` is properly configured
- [ ] No sensitive data (passwords, API keys) in repository
- [ ] README.md is up to date

**Commands to verify:**
```bash
cd /home/dip-roy/e-commerce_project
git status
git log --oneline -5
```

---

## 2. Environment Variables 🔐

### Backend Variables
- [ ] Database connection details ready (Neon)
- [ ] JWT secrets generated (32+ characters)
- [ ] Stripe API keys obtained (test or live)
- [ ] Pusher credentials obtained
- [ ] CORS origins prepared (will update after frontend deploy)
- [ ] Email service configured (optional)
- [ ] Google OAuth configured (optional)

### Frontend Variables
- [ ] Backend API URL ready
- [ ] Pusher public key ready
- [ ] Stripe publishable key ready
- [ ] App name and configuration ready

**Tip:** Use the `.env.production.template` files as reference

---

## 3. External Services 🌐

### Neon (Database)
- [ ] Account created: https://neon.tech
- [ ] Project created
- [ ] Connection string copied
- [ ] PostgreSQL version 15+ selected

### Render (Backend)
- [ ] Account created: https://render.com
- [ ] Credit card added (required for paid plans)
- [ ] GitHub connected
- [ ] Repository access granted

### Vercel (Frontend)
- [ ] Account created: https://vercel.com
- [ ] GitHub connected
- [ ] Repository access granted

### Stripe (Payments)
- [ ] Account created: https://stripe.com
- [ ] Test mode enabled OR live keys ready
- [ ] API keys copied (Secret Key & Publishable Key)
- [ ] Webhook endpoint URL prepared

### Pusher (Real-time)
- [ ] Account created: https://pusher.com
- [ ] App created
- [ ] Credentials copied (App ID, Key, Secret, Cluster)

---

## 4. Code Quality ✨

### Backend
- [ ] All TypeScript errors fixed
- [ ] Build succeeds locally: `npm run build`
- [ ] Tests pass (if applicable): `npm test`
- [ ] No console errors in production build
- [ ] Database migrations are ready

**Run locally:**
```bash
cd e-commerce_backend
npm install
npm run build
# Should complete without errors
```

### Frontend
- [ ] All TypeScript errors fixed
- [ ] Build succeeds locally: `npm run build`
- [ ] No console warnings
- [ ] Images optimized
- [ ] API calls use correct endpoints

**Run locally:**
```bash
cd e-commerce-frontend
npm install
npm run build
# Should complete without errors
```

---

## 5. Database Preparation 🗄️

- [ ] Connection string tested locally
- [ ] Required extensions noted (uuid-ossp)
- [ ] TypeORM migrations ready
- [ ] Seed data prepared (optional)
- [ ] Backup strategy planned

**Test connection:**
```bash
psql "your_neon_connection_string"
# Should connect successfully
```

---

## 6. Security Review 🔒

- [ ] All `.env` files in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection (TypeORM)
- [ ] XSS protection enabled (Helmet)
- [ ] CSRF protection configured

---

## 7. Performance Optimization ⚡

- [ ] Images compressed
- [ ] Unnecessary dependencies removed
- [ ] Build size checked
- [ ] Caching strategy implemented
- [ ] Database indexes planned
- [ ] API response times acceptable (<500ms)

**Check build size:**
```bash
cd e-commerce-frontend
npm run build
# Check .next folder size
```

---

## 8. Documentation 📚

- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Admin user creation documented
- [ ] Testing procedures documented

---

## 9. Monitoring & Alerts 📊

- [ ] Error tracking strategy planned (Sentry, LogRocket)
- [ ] Uptime monitoring planned (UptimeRobot)
- [ ] Analytics setup planned (Google Analytics)
- [ ] Log aggregation planned
- [ ] Performance monitoring planned

---

## 10. Backup & Recovery 💾

- [ ] Database backup strategy planned
- [ ] Code versioning with Git tags
- [ ] Environment variables documented securely
- [ ] Recovery procedures documented
- [ ] Rollback plan prepared

---

## 11. Testing Plan 🧪

- [ ] Automated test script ready (`test-production-deployment.sh`)
- [ ] Manual testing checklist prepared
- [ ] Test user accounts ready
- [ ] Stripe test cards documented
- [ ] Browser compatibility checked

---

## 12. Post-Deployment Tasks 📝

- [ ] Admin account creation planned
- [ ] Stripe webhook configuration ready
- [ ] CORS update procedure prepared
- [ ] Custom domain setup planned (optional)
- [ ] SSL certificate verification planned
- [ ] Initial data seeding planned

---

## Quick Verification Commands

Run these before deployment:

```bash
# 1. Check Git status
git status
git log --oneline -1

# 2. Test backend build
cd e-commerce_backend
npm install
npm run build
echo $?  # Should be 0

# 3. Test frontend build
cd ../e-commerce-frontend
npm install
npm run build
echo $?  # Should be 0

# 4. Check for TypeScript errors
cd ../e-commerce_backend
npm run build 2>&1 | grep -i error
cd ../e-commerce-frontend
npm run build 2>&1 | grep -i error

# 5. Verify .gitignore
cat .gitignore | grep -E "\.env|node_modules"

# 6. Check for sensitive data
git grep -i "password\|secret\|key" | grep -v ".env.template\|.md"
```

---

## Environment Variable Generator

Use this to generate secure secrets:

```bash
# Generate JWT Secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT Refresh Secret
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate multiple secrets at once
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## Ready to Deploy? ✅

If you've checked all items above, you're ready to proceed with deployment!

**Next Steps:**
1. Follow `QUICK_START_DEPLOYMENT.md` for step-by-step deployment
2. Or follow `DEPLOYMENT_GUIDE.md` for detailed instructions
3. Run `test-production-deployment.sh` after deployment

---

## Common Pre-Deployment Issues

### Issue: Build fails locally
**Solution:** Fix TypeScript errors, check dependencies

### Issue: Database connection fails
**Solution:** Verify connection string, check SSL mode

### Issue: Missing environment variables
**Solution:** Use `.env.production.template` as reference

### Issue: Large build size
**Solution:** Remove unused dependencies, optimize images

### Issue: Secrets in repository
**Solution:** Remove from history, update `.gitignore`

---

## Support Resources

- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Quick Start**: `QUICK_START_DEPLOYMENT.md`
- **Test Script**: `test-production-deployment.sh`
- **Templates**: `.env.production.template` files

---

**Last Updated:** November 13, 2025

**Estimated Time to Complete Checklist:** 30-60 minutes

Once complete, proceed with deployment! 🚀
