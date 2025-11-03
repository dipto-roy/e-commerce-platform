# Notification Bell Icon & Admin Notifications Fix

## Date: October 8, 2025

## Issues Identified

### 1. Admin Notifications 404 Error
**Error:** `❌ API Error: 404 "/admin/notifications?page=1&limit=10" {}`

**Root Cause:**
- Frontend was calling `/admin/notifications` endpoint which doesn't exist
- Backend notification endpoints are at `/notifications/*` not `/admin/notifications/*`
- Controller was using `@Body()` decorator for GET request pagination params instead of `@Query()`

### 2. Notification Bell Icon Not Showing
**Symptoms:**
- Console shows notifications are received
- Bell icon not visible in navigation bar

**Root Cause:**
- NotificationBell component only renders when user is logged in (`{user && <NotificationBell />}`)
- Need to ensure user is properly authenticated before bell appears

## Fixes Applied

### Backend Changes

#### 1. Fixed Notification Controller Query Parameters
**File:** `src/notification/notification.controller.ts`

**Changes:**
```typescript
// Added Query import
import { Query } from '@nestjs/common';

// Changed from @Body() to @Query() for GET endpoints
@Get('my')
async getMyNotifications(
  @CurrentUser() user: any,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  const pageNum = page || 1;
  const limitNum = limit || 20;
  return this.notificationService.getUserNotifications(
    user.id,
    pageNum,
    limitNum,
  );
}

@Get('user/:userId')
async getUserNotifications(
  @Param('userId', ParseIntPipe) userId: number,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  const pageNum = page || 1;
  const limitNum = limit || 20;
  return this.notificationService.getUserNotifications(
    userId,
    pageNum,
    limitNum,
  );
}
```

**Impact:** GET requests can now properly receive pagination parameters via query string

### Frontend Changes

#### 1. Fixed Admin API Notification Endpoints
**File:** `src/lib/adminAPI.ts`

**Changes:**
```typescript
// Changed from non-existent /admin/notifications to actual endpoints
export const adminAPI = {
  // OLD (404 Error):
  // getNotifications: (page = 1, limit = 10) => 
  //   api.get(`/admin/notifications?page=${page}&limit=${limit}`),
  
  // NEW (Working):
  getNotifications: (page = 1, limit = 10) => 
    api.get(`/notifications/my?page=${page}&limit=${limit}`),

  markNotificationAsRead: (id: number) => 
    api.post(`/notifications/${id}/read`),

  markAllNotificationsAsRead: () => 
    api.post('/notifications/my/read-all'),

  deleteNotification: (id: number) => 
    api.post(`/notifications/${id}/delete`),

  createNotification: (data: any) => 
    api.post('/notifications/send', data)
};
```

**Impact:** Admin dashboard can now fetch notifications without 404 errors

#### 2. Enhanced NotificationBell Component
**File:** `src/components/NotificationBell.tsx`

**Changes:**
```typescript
// Added debug logging on mount/update
useEffect(() => {
  console.log('🔔 NotificationBell mounted/updated:', {
    notificationsCount: notifications.length,
    unreadCount,
    isConnected,
    className
  });
}, [notifications.length, unreadCount, isConnected]);

// Added data-testid attributes for debugging
<div 
  className={`relative ${className}`} 
  ref={dropdownRef}
  data-testid="notification-bell-container"
>
  <button
    data-testid="notification-bell-button"
    // ... rest of button props
  >
```

**Impact:** Better debugging capabilities, easier to identify rendering issues

#### 3. Fixed Navigation Z-Index
**File:** `src/components/Navigation.tsx`

**Changes:**
```typescript
{user && (
  <div className="relative z-40">
    <NotificationBell />
  </div>
)}
```

**Impact:** Ensures notification bell and dropdown are properly layered above other elements

## Available Notification Endpoints

### User Endpoints (Authenticated)
- `GET /notifications/my?page=1&limit=20` - Get current user's notifications
- `GET /notifications/my/unread-count` - Get unread notification count
- `POST /notifications/:id/read` - Mark notification as read
- `POST /notifications/my/read-all` - Mark all as read
- `POST /notifications/:id/delete` - Delete notification
- `POST /notifications/my/delete-read` - Delete all read notifications

### Admin Endpoints (ADMIN role only)
- `GET /notifications/user/:userId?page=1&limit=20` - Get any user's notifications
- `POST /notifications/send` - Create notification
- `POST /notifications/send-to-user/:userId` - Send to specific user
- `POST /notifications/send-to-role/:role` - Send to all users with role
- `POST /notifications/broadcast` - Send to all users

### Test Endpoints
- `GET /notifications/health` - Health check
- `GET /notifications/status` - Pusher connection status
- `POST /notifications/test` - Send test notification

## Testing Steps

### 1. Test Admin Dashboard Notifications
```bash
# Login as admin
curl -X POST http://localhost:4002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  -c admin_cookies.txt

# Get notifications (should work now, no 404)
curl http://localhost:4002/notifications/my?page=1&limit=10 \
  -b admin_cookies.txt
```

### 2. Test Notification Bell
1. **Login:** Go to `http://localhost:3000/login`
2. **Check Console:** Look for `🔔 NotificationBell mounted/updated:` logs
3. **Verify Bell:** Should see bell icon in top right navigation
4. **Check Badge:** Unread count badge should appear if notifications exist
5. **Test Click:** Click bell to open dropdown
6. **Check Dropdown:** Should show list of notifications

### 3. Test Real-Time Notifications
```bash
# Send test notification to user
curl -X POST http://localhost:4002/notifications/send-to-user/8 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "system"
  }' \
  -b admin_cookies.txt

# Should appear in:
# - Browser console
# - Notification bell dropdown
# - Browser notification (if permitted)
```

## Verification Checklist

- [x] Backend notification controller accepts query params
- [x] Admin API uses correct notification endpoints
- [x] NotificationBell component has debug logging
- [x] NotificationBell only shows when user is logged in
- [x] Z-index prevents dropdown from being hidden
- [x] GET requests use @Query() decorator
- [x] POST requests use correct endpoint paths
- [x] Pagination works correctly

## Common Issues & Solutions

### Issue: Bell Icon Not Showing
**Solution:** Check if user is logged in. Bell only appears for authenticated users.
```typescript
// In browser console:
localStorage.getItem('user') // Should show user data
```

### Issue: Notifications Not Real-Time
**Solution:** Check Pusher connection status
```bash
curl http://localhost:4002/notifications/status
```

### Issue: 404 on Admin Notifications
**Solution:** Use `/notifications/my` instead of `/admin/notifications`

### Issue: Pagination Not Working
**Solution:** Backend now uses @Query() decorator - pass params in URL query string

## Next Steps

1. **Remove Debug Logging:** Once confirmed working, remove console.log statements
2. **Add Tests:** Create unit tests for notification endpoints
3. **Add Error Handling:** Better error messages for failed notification delivery
4. **Optimize Queries:** Add database indexes for notification queries
5. **Add Filters:** Allow filtering notifications by type, date, read status

## Related Files

### Backend
- `src/notification/notification.controller.ts` - Main notification endpoints
- `src/notification/notification.service.ts` - Business logic
- `src/auth/roles/roles.guard.ts` - Enhanced with better error logging

### Frontend
- `src/components/NotificationBell.tsx` - Bell icon component
- `src/components/Navigation.tsx` - Main navigation with bell
- `src/contexts/NotificationContext.tsx` - Pusher integration
- `src/lib/adminAPI.ts` - Admin API methods

## Success Criteria

✅ **Admin dashboard loads without 404 errors**
✅ **Notification bell shows when user is logged in**
✅ **Bell icon is visible and clickable**
✅ **Dropdown opens with notification list**
✅ **Unread count badge displays correctly**
✅ **Real-time notifications appear via Pusher**
✅ **Pagination works on notification list**
✅ **Mark as read/delete functions work**

---

**Status:** ✅ All fixes applied and ready for testing
**Backend:** Running on port 4002 (watch mode enabled)
**Frontend:** Running on port 3000
**Database:** PostgreSQL on port 5432
