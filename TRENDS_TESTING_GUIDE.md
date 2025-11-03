# 📊 Dashboard Trends - Visual Testing Guide

## 🎯 Quick Test Steps

### 1. Start Servers

**Backend:**
```bash
cd e-commerce_backend
npm run start:dev
```
Expected output: `Server running on http://localhost:4002`

**Frontend:**
```bash
cd e-commerce-frontend
npm run dev
```
Expected output: `Ready on http://localhost:3000`

---

## 2. Test Backend API (Optional)

```bash
./test-trends-api.sh
```

**What to look for:**
- ✅ Login successful
- ✅ 4 different period responses
- ✅ Each response has `data` array
- ✅ Cumulative counts increasing

---

## 3. Test Frontend

### A. Login as Admin
1. Go to: `http://localhost:3000/login`
2. Email: `admin@ecommerce.com`
3. Password: `Admin@123`
4. Click "Login"

### B. Navigate to Dashboard
1. Click "Dashboard" or go to: `http://localhost:3000/dashboard/admin`
2. Scroll down to find "Growth Trends" chart

### C. Visual Checks

**Initial State (Loading):**
```
┌─────────────────────────────────────────┐
│ 📈 Growth Trends    [Period Buttons]    │
├─────────────────────────────────────────┤
│                                         │
│           [Spinner Animation]           │
│       Loading trend data...             │
│                                         │
└─────────────────────────────────────────┘
```

**Success State:**
```
┌─────────────────────────────────────────┐
│ 📈 Growth Trends                        │
│                                         │
│  [Last 7 Days] [Last 30 Days]           │
│  [Last 3 Months] [Last Year]            │
├─────────────────────────────────────────┤
│                                         │
│        [Line Chart with 3 lines]        │
│   - Blue line (Users) 📈                │
│   - Green line (Sellers) 📈             │
│   - Purple line (Products) 📈           │
│                                         │
├─────────────────────────────────────────┤
│ ✅ Real-time data from backend API      │
└─────────────────────────────────────────┘
```

**Error State (if backend down):**
```
┌─────────────────────────────────────────┐
│ 📈 Growth Trends    [Period Buttons]    │
├─────────────────────────────────────────┤
│ ⚠️ Failed to load trend data            │
│    Showing sample data as fallback      │
├─────────────────────────────────────────┤
│        [Line Chart - Sample Data]       │
└─────────────────────────────────────────┘
```

---

## 4. Interactive Testing

### Test Period Selector

**Click each button and observe:**

| Button | Expected Result |
|--------|----------------|
| **Last 7 Days** | - Chart shows 7 data points<br>- X-axis: Mon, Tue, Wed, Thu, Fri, Sat, Sun<br>- Button turns blue |
| **Last 30 Days** | - Chart shows 30 data points<br>- X-axis: Nov 1, Nov 2, Nov 3, etc.<br>- Button turns blue |
| **Last 3 Months** | - Chart shows ~90 data points<br>- X-axis: Nov 2024, Dec 2024, Jan 2025<br>- Button turns blue |
| **Last Year** | - Chart shows ~365 data points<br>- X-axis: Jan 2024, Feb 2024, Mar 2024, etc.<br>- Button turns blue |

### Test Chart Interactivity

**Hover over data points:**
- ✅ Tooltip appears
- ✅ Shows date and values
- ✅ Format: "Date: Mon / Users: 45 / Sellers: 12 / Products: 89"

**Hover over legend:**
- ✅ Users (blue line)
- ✅ Sellers (green line)
- ✅ Products (purple line)

---

## 5. Browser Console Checks

**Open DevTools (F12) → Console Tab**

**Expected logs when changing period:**
```
📈 Dashboard trends fetched: {success: true, data: Array(7), ...}
```

**Expected logs if error:**
```
❌ Error fetching dashboard trends: AxiosError {...}
```

---

## 6. Network Tab Checks

**Open DevTools (F12) → Network Tab**

**Look for API call:**
- **Request URL:** `http://localhost:4002/api/v1/admin/dashboard/trends?period=7days`
- **Method:** GET
- **Status:** 200 OK
- **Headers:** Authorization: Bearer {token}

**Response Preview:**
```json
{
  "success": true,
  "data": [
    {"date": "2025-01-15", "users": 45, "sellers": 12, "products": 89},
    ...
  ],
  "period": "7days",
  "startDate": "2025-01-15",
  "endDate": "2025-01-21"
}
```

---

## 7. Data Validation

### Check Cumulative Nature

**Important:** Values should NEVER decrease!

**Valid Example:**
```
Day 1: Users = 45
Day 2: Users = 47 ✅ (increased)
Day 3: Users = 47 ✅ (stayed same)
Day 4: Users = 50 ✅ (increased)
```

**Invalid Example:**
```
Day 1: Users = 45
Day 2: Users = 47
Day 3: Users = 42 ❌ (decreased - ERROR!)
```

If you see decreasing values:
- 🔍 Check database queries in backend
- 🔍 Verify `Between` operator usage
- 🔍 Check date filtering logic

---

## 8. Mobile Responsiveness

**Test on different screen sizes:**

**Desktop (>1024px):**
```
Period buttons in one row: [7D] [30D] [3M] [1Y]
Chart: Full width
```

**Tablet (768px - 1024px):**
```
Period buttons in one row: [7D] [30D] [3M] [1Y]
Chart: Full width
```

**Mobile (<768px):**
```
Period buttons wrap to 2 rows:
[7D] [30D]
[3M] [1Y]
Chart: Full width, scrollable
```

---

## 9. Performance Check

**Loading time should be:**
- ✅ 7 days: < 1 second
- ✅ 30 days: < 2 seconds
- ✅ 3 months: < 5 seconds
- ✅ 1 year: < 10 seconds

**If slow:**
- Check database indexes on `created_at`
- Consider caching with Redis
- Use aggregation queries instead of counting

---

## 10. Edge Cases

### No Data in Database

**Expected:**
- Chart shows flat lines at 0
- All values = 0
- No errors

### First Day After Fresh Install

**Expected:**
- Day 1: users=1, sellers=0, products=0
- Shows very small numbers but still works

### Large Dataset (1000+ users)

**Expected:**
- Chart scales Y-axis automatically
- Smooth curves
- No performance issues

---

## 🎨 Color Reference

| Entity | Color | Hex Code |
|--------|-------|----------|
| Users | Blue | #3B82F6 |
| Sellers | Green | #10B981 |
| Products | Purple | #8B5CF6 |
| Grid | Gray | #E5E7EB |
| Text | Dark Gray | #6B7280 |

---

## ✅ Success Criteria

The implementation is successful if:

1. ✅ Chart loads without errors
2. ✅ Period selector changes the data
3. ✅ Date labels match the period
4. ✅ Values are cumulative (never decrease)
5. ✅ Loading state appears briefly
6. ✅ Error state handles failures gracefully
7. ✅ Tooltips work on hover
8. ✅ Legend is visible and accurate
9. ✅ Footer shows "Real-time data from backend API"
10. ✅ No console errors

---

## 🐛 Common Issues & Solutions

### Issue: "Unauthorized" error

**Solution:**
```bash
# Check if logged in as admin
# JWT token should be in localStorage
console.log(localStorage.getItem('accessToken'))
```

### Issue: CORS error

**Solution:**
```typescript
// Check backend main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true
});
```

### Issue: Chart not updating

**Solution:**
```typescript
// Check useEffect dependencies
useEffect(() => {
  fetchTrends();
}, [selectedPeriod]); // Must include selectedPeriod!
```

### Issue: Date labels overlapping

**Solution:**
```typescript
// Reduce font size or rotate labels
<XAxis 
  dataKey="date" 
  angle={-45}
  textAnchor="end"
  height={60}
/>
```

---

## 📸 Screenshots Reference

### Expected View:

```
┌────────────────────────────────────────────────────┐
│  Admin Dashboard                                   │
├────────────────────────────────────────────────────┤
│  📊 Overview Stats                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │
│  │ 56  │ │ 16  │ │ 108 │ │ 3   │                 │
│  │Users│ │Sells│ │Prod.│ │Pend.│                 │
│  └─────┘ └─────┘ └─────┘ └─────┘                 │
│                                                    │
│  📈 Growth Trends    [7D] [30D] [3M] [1Y]         │
│  ┌────────────────────────────────────────────┐   │
│  │     /‾‾‾‾‾‾‾‾‾‾‾ (Blue - Users)            │   │
│  │    /‾‾‾‾‾‾‾ (Green - Sellers)              │   │
│  │   /‾‾‾‾‾‾‾‾‾‾ (Purple - Products)          │   │
│  │  /                                         │   │
│  │ /                                          │   │
│  └────────────────────────────────────────────┘   │
│  ✅ Real-time data from backend API               │
└────────────────────────────────────────────────────┘
```

---

## 🚀 Ready to Test!

1. Start backend: `npm run start:dev`
2. Start frontend: `npm run dev`
3. Open: http://localhost:3000/dashboard/admin
4. Look for "Growth Trends" chart
5. Click period buttons
6. Watch the magic! ✨

---

**Happy Testing! 🎉**
