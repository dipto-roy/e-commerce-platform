# 🧪 Seller Verification Test Scenarios

## 📋 Complete Flow Testing Guide

### **Scenario 1: New Seller Registration**
1. **Navigate to Signup**: Go to `/Singup`
2. **Select Seller Role**: Choose "Seller" from dropdown
3. **Observe Notice**: Yellow notice box appears with verification requirements
4. **Complete Registration**: Fill form and submit
5. **Expected Result**: 
   - Alert shows detailed verification message
   - Account created with `isVerified: false`
   - Instructed to wait for admin approval

### **Scenario 2: Unverified Seller Login Attempt**
1. **Navigate to Login**: Go to `/login`
2. **Enter Seller Credentials**: Use unverified seller account
3. **Submit Login**: Click "Log In"
4. **Expected Result**:
   - Backend returns verification error
   - Frontend detects `needsVerification: true`
   - **Automatic redirect** to `/seller/verification-pending`
   - Email stored in sessionStorage for verification page

### **Scenario 3: Verification Pending Page - Not Logged In**
1. **Access from Login Redirect**: After failed login attempt
2. **Expected Display**:
   - Shows email from sessionStorage
   - "Account Verification Required" title
   - Detailed "What happens next" steps
   - "Back to Login" button
   - "Register New Account" link
   - Support contact information

### **Scenario 4: Verification Pending Page - Logged In**
1. **Access as Logged-In Seller**: If somehow logged in but not verified
2. **Expected Display**:
   - Welcome message with username
   - "Verification Pending" title
   - Auto-refresh countdown (30 seconds)
   - "Check Status Now" button
   - "Sign Out" button
   - Account details section

### **Scenario 5: Admin Verification Process**
1. **Admin Login**: Login as admin user
2. **Access Seller Management**: Go to admin dashboard
3. **Verify Seller**: Change `isVerified` to `true` in database
4. **Expected Result**: Seller can now login successfully

### **Scenario 6: Verified Seller Login**
1. **Login After Verification**: Use verified seller credentials
2. **Expected Result**:
   - Successful login
   - **Automatic redirect** to `/dashboard/seller` or `/seller/dashboard`
   - Full dashboard access
   - Logout button in header

### **Scenario 7: Browser Refresh Tests**
1. **Login as Any Role**: Complete successful login
2. **Navigate to Dashboard**: Access role-specific dashboard
3. **Press F5/Refresh**: Browser refresh button
4. **Expected Result**:
   - **No auto-logout**
   - User remains logged in
   - Dashboard stays accessible
   - Session persistence maintained

## 🔄 Error Message Validation

### **Login Error Messages**

#### **Unverified Seller**:
```
"Your seller account is pending verification. Please contact support."
```

#### **Invalid Credentials**:
```
"Invalid credentials"
```

#### **Inactive Account**:
```
"Account is inactive. Please contact administrator."
```

### **Registration Success Messages**

#### **Seller Registration**:
```
Seller account created successfully! ✅

⚠️ IMPORTANT NOTICE: Your account requires admin approval before you can login.

📝 What happens next:
1. Admin will review your seller application
2. You'll be notified once approved  
3. After approval, you can login to access your seller dashboard

💡 If you try to login before approval, you'll see an admin verification message.

Thank you for joining us, [username]!
```

#### **Regular User Registration**:
```
"Account created successfully! Welcome [username]"
```

## 🎯 Key Features Implemented

### ✅ **Backend Verification Logic**
- `auth-new.service.ts` checks `isVerified` field for sellers
- Throws `UnauthorizedException` for unverified sellers
- Proper error logging for failed verification attempts

### ✅ **Frontend Verification Handling**
- `AuthContextNew.tsx` detects `needsVerification` flag
- Login page redirects unverified sellers automatically
- Verification pending page handles both logged-in and non-logged-in states

### ✅ **Enhanced User Experience**
- Real-time signup warnings for seller role selection
- Detailed verification instructions and process explanation
- Auto-refresh checking for verification status updates
- Professional verification pending interface

### ✅ **Robust Session Management**
- Browser refresh persistence with `authInitialized` state
- Proper token handling with HTTP-only cookies
- Automatic role-based dashboard redirections
- Complete logout functionality across all dashboards

## 🚀 Database Requirements

Ensure your `users` table has:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT FALSE;

-- Set existing admins and users as verified
UPDATE users SET isVerified = TRUE WHERE role IN ('ADMIN', 'USER');

-- Sellers remain unverified until admin approval
-- UPDATE users SET isVerified = FALSE WHERE role = 'SELLER';
```

## 📡 API Endpoints Used

- `POST /auth/login` - Enhanced with seller verification checks
- `POST /auth/register` - Creates accounts with appropriate verification status
- `POST /auth/refresh` - Token refresh functionality
- `POST /auth/logout` - Complete session cleanup

## 🎨 UI Components Enhanced

- `/app/Singup/page.tsx` - Seller verification notice
- `/app/login/page.tsx` - Verification redirect logic  
- `/app/seller/verification-pending/page.tsx` - Complete verification interface
- `/contexts/AuthContextNew.tsx` - Enhanced authentication management
- `/components/LogoutButton.tsx` - Reusable logout functionality

## 🔐 Security Features

- HTTP-only cookies prevent XSS attacks
- Proper session validation and refresh
- Role-based access control with verification checks
- Secure error handling without information leakage

---

**🎉 All requirements successfully implemented!** The seller verification system now provides a complete, user-friendly experience with proper error handling, automated redirects, and persistent sessions.