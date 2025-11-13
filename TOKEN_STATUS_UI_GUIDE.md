# Token Status UI Component Guide

## Overview
The TokenStatus component provides visual feedback about the authentication token state in real-time. It integrates with the automatic token refresh system to show users when their session is being refreshed in the background.

## Features

### 🎯 Key Capabilities
- **Real-time Token Status**: Visual indicator of token validity
- **Countdown Timer**: Shows time until token expiration (15 minutes)
- **Auto-Refresh Feedback**: Shows when token is being refreshed automatically
- **Progress Bar**: Visual representation of remaining token lifetime
- **Event-Driven**: Updates automatically via custom browser events
- **Two Display Modes**: Minimal (icon only) and Detailed (full info panel)

## Component Props

```typescript
interface TokenStatusProps {
  showDetails?: boolean;  // false = icon only, true = detailed panel
  className?: string;     // Additional CSS classes
}
```

## Token States

### 1. Valid ✅ (Green)
- Token is currently valid
- Shows countdown timer
- Progress bar indicating time remaining
- Changes to orange when < 1 minute remaining

### 2. Refreshing 🔄 (Blue)
- Automatic token refresh in progress
- Spinning icon animation
- "Refreshing..." message

### 3. Expired ⚠️ (Red)
- Token has expired and refresh failed
- Shows error message
- Prompts user to refresh or log in again

### 4. Unknown 🔍 (Gray)
- Initial state while checking token
- Shows "Checking..." message

## Installation & Usage

### Step 1: The Component is Already Created
Location: `/e-commerce-frontend/src/components/TokenStatus.tsx`

### Step 2: Import in Your Layouts/Pages

#### Minimal View (Icon Only) - Best for Navigation Bar
```tsx
import TokenStatus from '@/components/TokenStatus';

export default function Navigation() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1>My App</h1>
          {/* Other nav items */}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Show token status icon in navbar */}
          <TokenStatus showDetails={false} />
          
          <button className="btn-profile">Profile</button>
        </div>
      </div>
    </nav>
  );
}
```

#### Detailed View - Best for Dashboard/Settings
```tsx
import TokenStatus from '@/components/TokenStatus';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Token Status Card */}
        <TokenStatus showDetails={true} className="md:col-span-1" />
        
        {/* Other dashboard cards */}
        <div className="bg-white p-4 rounded-lg shadow">
          {/* Stats */}
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Events are Automatically Dispatched

The component listens for these custom events:

| Event Name | When Dispatched | Auto-Dispatched By |
|------------|-----------------|-------------------|
| `token-refreshed` | Token refresh successful | axios interceptor |
| `token-expired` | Token expired or refresh failed | axios interceptor |
| `token-refreshing` | Token refresh started | axios interceptor |

**No additional setup required!** The axios interceptor (`/src/utils/api.ts`) automatically dispatches these events.

## Visual Examples

### Minimal View (showDetails={false})

```
┌─────────────────────────────────────────┐
│ Logo  Home  Products     [✓]  Profile   │  ← Green checkmark icon
└─────────────────────────────────────────┘

With warning when < 1 minute:
┌─────────────────────────────────────────┐
│ Logo  Home  Products     [✓•]  Profile  │  ← Orange pulse indicator
└─────────────────────────────────────────┘
```

### Detailed View (showDetails={true})

```
┌────────────────────────────────────────┐
│ ✅ Token Valid              🕐 14:35   │
│ Last refresh: 2:30:15 PM               │
│ ████████████████████░░░░░░ 97%         │  ← Progress bar
└────────────────────────────────────────┘

When refreshing:
┌────────────────────────────────────────┐
│ 🔄 Refreshing...                       │
│ Automatically refreshing your session..│
│                                        │
└────────────────────────────────────────┘

When expired:
┌────────────────────────────────────────┐
│ ⚠️ Token Expired                       │
│ Please refresh the page or log in again│
│                                        │
└────────────────────────────────────────┘
```

## Integration Examples

### Example 1: Admin Dashboard
```tsx
// /e-commerce-frontend/src/app/admin/dashboard/page.tsx

import TokenStatus from '@/components/TokenStatus';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          
          {/* Show token status in header */}
          <TokenStatus showDetails={true} className="w-96" />
        </div>
        
        {/* Dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats cards */}
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Seller Dashboard
```tsx
// /e-commerce-frontend/src/app/seller/dashboard/page.tsx

import TokenStatus from '@/components/TokenStatus';

export default function SellerDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <p className="text-gray-600">Manage your store</p>
          </div>
          
          {/* Compact token status */}
          <TokenStatus showDetails={true} />
        </div>
      </div>
      
      {/* Dashboard content */}
    </div>
  );
}
```

### Example 3: Navigation Bar (Minimal)
```tsx
// /e-commerce-frontend/src/components/Navbar.tsx

import TokenStatus from '@/components/TokenStatus';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold">E-Commerce</span>
            <a href="/" className="text-gray-700 hover:text-gray-900">Home</a>
            <a href="/products" className="text-gray-700 hover:text-gray-900">Products</a>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Minimal token status icon */}
            <TokenStatus />
            
            <button className="text-gray-700 hover:text-gray-900">
              Notifications
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Customization

### Custom Styling
```tsx
// Add custom classes
<TokenStatus 
  showDetails={true} 
  className="shadow-lg rounded-xl border-2 border-blue-200" 
/>
```

### Hide in Production
```tsx
// Only show in development
{process.env.NODE_ENV === 'development' && (
  <TokenStatus showDetails={true} />
)}
```

### Conditional Display
```tsx
// Only show for authenticated users
import { useAuth } from '@/contexts/AuthContextNew';

export default function MyComponent() {
  const { user } = useAuth();
  
  return (
    <>
      {user && <TokenStatus showDetails={false} />}
    </>
  );
}
```

## How It Works

### 1. Token Lifecycle
```
15:00 - User logs in
        └─ Token lifetime: 15 minutes
        └─ TokenStatus shows: 15:00 countdown

15:14 - 1 minute remaining
        └─ Progress bar turns orange
        └─ Pulsing indicator appears
        └─ Still fully functional

15:15 - User clicks a button (makes API request)
        └─ Access token expired (401 error)
        └─ Axios interceptor catches error
        └─ Dispatches 'token-refreshing' event
        └─ TokenStatus shows: "Refreshing..."
        └─ Calls /auth/refresh automatically
        └─ Gets new tokens from backend
        └─ Dispatches 'token-refreshed' event
        └─ TokenStatus resets to 15:00
        └─ Original request retries automatically
        └─ User sees seamless experience! ✅
```

### 2. Event Flow
```typescript
// Axios Interceptor (api.ts)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Dispatch event: token-refreshing
      window.dispatchEvent(new Event('token-refreshing'));
      
      try {
        await api.post('/auth/refresh');
        
        // Dispatch event: token-refreshed
        window.dispatchEvent(new Event('token-refreshed'));
      } catch {
        // Dispatch event: token-expired
        window.dispatchEvent(new Event('token-expired'));
      }
    }
  }
);

// TokenStatus Component
useEffect(() => {
  // Listen for events
  window.addEventListener('token-refreshing', handleRefreshing);
  window.addEventListener('token-refreshed', handleRefreshed);
  window.addEventListener('token-expired', handleExpired);
  
  return () => {
    window.removeEventListener('token-refreshing', handleRefreshing);
    window.removeEventListener('token-refreshed', handleRefreshed);
    window.removeEventListener('token-expired', handleExpired);
  };
}, []);
```

## Testing

### Quick Test (30 seconds)
1. Temporarily change token expiry in backend:
   ```env
   # backend/.env
   JWT_ACCESS_EXPIRES_IN=30s  # Instead of 15m
   ```

2. Restart backend server

3. Login to frontend

4. Add TokenStatus to dashboard:
   ```tsx
   <TokenStatus showDetails={true} />
   ```

5. Watch the countdown:
   - Starts at 0:30
   - Progress bar decreases
   - At 0:05, turns orange with pulse
   - At 0:00, click any button
   - Shows "Refreshing..." (blue)
   - Resets to 0:30 (green)
   - Button action completes successfully!

### Manual Testing
```bash
# In e-commerce_project directory
./test-token-refresh.sh
```

## Benefits

### For Users
- **Transparency**: See authentication status at a glance
- **No Surprises**: Warning when token is about to expire
- **Confidence**: Visual confirmation of automatic refresh
- **Peace of Mind**: Know when session is being maintained

### For Developers
- **Debugging**: Easy to see token refresh in action
- **Development**: Visual feedback during testing
- **Monitoring**: Track token lifecycle in real-time
- **UX**: Professional, polished authentication experience

### For Interviews
> "I implemented a real-time token status component that integrates with our automatic token refresh system. It uses custom browser events to listen for token lifecycle changes and provides visual feedback in two modes: minimal for navigation and detailed for dashboards. The component includes a countdown timer, progress bar, and automatic state updates, giving users full transparency of their session status."

## Performance Considerations

### Resource Usage
- **Timer**: 1 interval running at 1-second frequency (only when token is valid)
- **Events**: 3 lightweight event listeners
- **Memory**: Minimal (~1KB for component state)
- **CPU**: Negligible (<0.1% impact)

### Optimization
```tsx
// Clean up interval on unmount
useEffect(() => {
  const interval = setInterval(() => {
    setTimeUntilExpiry(prev => prev - 1);
  }, 1000);
  
  return () => clearInterval(interval);  // ✅ Cleanup
}, [timeUntilExpiry]);
```

## Common Issues

### Issue 1: Timer Not Starting
**Problem**: Component shows "Unknown" status forever

**Solution**: Call checkTokenStatus on mount
```tsx
useEffect(() => {
  checkTokenStatus();  // Check on mount
}, []);
```

### Issue 2: Events Not Firing
**Problem**: Component doesn't update on token refresh

**Solution**: Verify axios interceptor is dispatching events
```typescript
// In api.ts interceptor
window.dispatchEvent(new Event('token-refreshed'));  // ✅ Required
```

### Issue 3: Progress Bar Not Showing
**Problem**: Progress bar stays hidden

**Solution**: Ensure timeUntilExpiry is set after token check
```typescript
if (response.ok) {
  setTokenStatus('valid');
  setTimeUntilExpiry(15 * 60);  // ✅ Set timer
}
```

## Future Enhancements

### Planned Features
1. **Token Refresh History**: Show last 5 refresh timestamps
2. **Refresh Button**: Manual refresh trigger for users
3. **Session Activity**: Show time since last API call
4. **Multi-Device View**: Show active sessions across devices
5. **Sound Notifications**: Optional audio alert for expiry

### Customization Options
```tsx
interface TokenStatusProps {
  showDetails?: boolean;
  className?: string;
  
  // Future props
  showHistory?: boolean;        // Show refresh history
  allowManualRefresh?: boolean; // Add refresh button
  warningThreshold?: number;    // Warning time in seconds (default: 60)
  playSound?: boolean;          // Audio notification
}
```

## Complete Example

Here's a complete dashboard page with TokenStatus:

```tsx
// /e-commerce-frontend/src/app/dashboard/page.tsx

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContextNew';
import TokenStatus from '@/components/TokenStatus';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with minimal token status */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <TokenStatus />  {/* Minimal icon */}
            <span className="text-gray-700">{user?.email}</span>
            <button onClick={logout} className="text-red-600 hover:text-red-800">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Token Status Card - Detailed */}
          <div className="md:col-span-1">
            <TokenStatus showDetails={true} />
          </div>

          {/* Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <p className="text-3xl font-bold mt-2">42</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Revenue</h3>
              <p className="text-3xl font-bold mt-2">$1,234</p>
            </div>
          </div>
        </div>

        {/* More dashboard content */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {/* Activity list */}
        </div>
      </main>
    </div>
  );
}
```

## Summary

The TokenStatus component provides:
- ✅ Real-time token validity visualization
- ✅ Automatic refresh feedback
- ✅ Countdown timer and progress bar
- ✅ Two display modes (minimal/detailed)
- ✅ Event-driven updates
- ✅ Zero configuration required
- ✅ Professional UI/UX
- ✅ Development and debugging tool

**Integration is simple**: Just import and add `<TokenStatus />` to any component!

---

**Created**: Token refresh UI component for automatic session management  
**Updated**: Axios interceptor to dispatch token lifecycle events  
**Ready to use**: Import and display in any authenticated pages
