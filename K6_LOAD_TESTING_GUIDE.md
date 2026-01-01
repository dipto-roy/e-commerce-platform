# k6 Load Testing for E-Commerce API

## 📦 What is k6?

k6 is a modern load testing tool built for developers. It allows you to test the performance and reliability of your API under various load conditions.

---

## 🚀 Quick Start

### 1. Install k6

**macOS:**
```bash
brew install k6
```

**Ubuntu/Debian:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

**Or download from:** https://k6.io/docs/get-started/installation/

---

### 2. Verify Installation

```bash
k6 version
```

---

### 3. Start Your Backend

Make sure your backend is running:
```bash
cd e-commerce_backend
npm run start:dev
```

---

### 4. Run Tests

**Interactive Mode (Recommended for first time):**
```bash
./run-k6-tests.sh
```

**Quick Run Mode:**
```bash
# Smoke test (1 minute, 1 user)
./run-k6-tests.sh smoke

# Load test (9 minutes, up to 10 users)
./run-k6-tests.sh load

# Stress test (11 minutes, up to 50 users)
./run-k6-tests.sh stress

# Spike test (2 minutes, sudden surge to 100 users)
./run-k6-tests.sh spike

# Run all tests
./run-k6-tests.sh all

# Health check
./run-k6-tests.sh health
```

---

## 📊 Test Types

### 1. Smoke Test (`smoke-test.js`)
**Duration:** 1 minute  
**Virtual Users:** 1  
**Purpose:** Verify basic functionality works

**When to use:**
- After code changes
- Before committing
- As part of CI/CD

**What it tests:**
- Health check
- Product browsing
- Product search
- User login
- Profile retrieval
- Cart operations
- Order listing

**Success criteria:**
- All requests succeed (< 1% error rate)
- Response time < 500ms (p95)

---

### 2. Load Test (`load-test.js`)
**Duration:** 9 minutes  
**Virtual Users:** Ramps from 0 → 10 → 0  
**Purpose:** Test normal expected traffic

**When to use:**
- Before deployment
- Performance benchmarking
- Capacity planning

**What it tests:**
- 60% public browsing
- 25% authenticated shopping
- 15% admin operations

**Success criteria:**
- Error rate < 10%
- Response time < 500ms (p95)
- Handles 10+ req/s

---

### 3. Stress Test (`stress-test.js`)
**Duration:** 11 minutes  
**Virtual Users:** Ramps 0 → 20 → 50 → 20 → 0  
**Purpose:** Find breaking point

**When to use:**
- Before major events (sales, launches)
- Infrastructure testing
- Finding bottlenecks

**What it tests:**
- Rapid browsing (40%)
- Heavy buyer activity (30%)
- Search intensive (20%)
- Admin heavy ops (10%)

**Success criteria:**
- Error rate < 20%
- Response time < 1000ms (p95)
- System recovers after load

---

### 4. Spike Test (`spike-test.js`)
**Duration:** 2 minutes  
**Virtual Users:** 5 → 100 (sudden) → 5  
**Purpose:** Test sudden traffic surge

**When to use:**
- Before viral campaigns
- Black Friday preparation
- DDoS resilience testing

**What it tests:**
- Sudden traffic surge handling
- System recovery
- Error handling under pressure

**Success criteria:**
- System doesn't crash
- Recovers after spike
- Error rate < 30% during spike

---

## 📈 Understanding Results

### Key Metrics

```
http_reqs..................: 450     15/s
http_req_duration..........: avg=125ms min=50ms med=100ms max=500ms p(95)=200ms p(99)=300ms
http_req_failed............: 2.22%   (10 of 450)
```

**What they mean:**

- **http_reqs**: Total requests sent
- **http_req_duration**: Response time statistics
  - `avg`: Average response time
  - `p(95)`: 95% of requests completed within this time
  - `p(99)`: 99% of requests completed within this time
- **http_req_failed**: Percentage of failed requests

**Good Performance:**
- ✅ p(95) < 500ms
- ✅ p(99) < 1000ms
- ✅ http_req_failed < 5%

**Acceptable Performance:**
- ⚠️ p(95) < 1000ms
- ⚠️ p(99) < 2000ms
- ⚠️ http_req_failed < 10%

**Poor Performance:**
- ❌ p(95) > 1000ms
- ❌ p(99) > 2000ms
- ❌ http_req_failed > 10%

---

## 🎯 Test Results Location

All test results are saved to:
```
results/
├── smoke-test-20250113-120000.json
├── load-test-20250113-120500.json
├── stress-test-20250113-121000.json
└── spike-test-20250113-121500.json
```

---

## 🔧 Configuration

### Environment Variables

You can customize test configuration using environment variables:

```bash
# API URL (default: http://localhost:4002/api/v1)
export API_URL=http://localhost:4002/api/v1

# Admin credentials
export ADMIN_EMAIL=Mridul@example.com
export ADMIN_PASSWORD=password123

# Seller credentials
export SELLER_EMAIL=seller@example.com
export SELLER_PASSWORD=password123

# Buyer credentials
export BUYER_EMAIL=buyer@example.com
export BUYER_PASSWORD=password123

# Then run tests
./run-k6-tests.sh smoke
```

---

## 📝 Test File Structure

```
k6-tests/
├── config.js          # Test configuration and thresholds
├── helpers.js         # Reusable API functions
├── smoke-test.js      # Smoke test scenarios
├── load-test.js       # Load test scenarios
├── stress-test.js     # Stress test scenarios
└── spike-test.js      # Spike test scenarios
```

---

## 🎨 Creating Custom Tests

### Example: Custom Product Test

Create `k6-tests/product-test.js`:

```javascript
import { sleep } from 'k6';
import config from './config.js';
import * as helpers from './helpers.js';

export const options = {
  stages: [
    { duration: '1m', target: 5 },
    { duration: '3m', target: 5 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05']
  }
};

export default function() {
  // Get products
  helpers.getProducts(1, 20);
  sleep(1);
  
  // View specific product
  helpers.getProduct(1);
  sleep(2);
  
  // Search products
  helpers.searchProducts('laptop');
  sleep(1);
}
```

Run it:
```bash
k6 run k6-tests/product-test.js
```

---

## 🐛 Troubleshooting

### Issue: k6 not found
```bash
# Verify installation
which k6

# Reinstall if needed
brew install k6  # macOS
sudo apt-get install k6  # Ubuntu
```

### Issue: Connection refused
```bash
# Check backend is running
curl http://localhost:4002/api/v1/health

# Start backend
cd e-commerce_backend
npm run start:dev
```

### Issue: Authentication failed
```bash
# Verify credentials in database
psql e_commerce -c "SELECT email, role FROM users WHERE role='ADMIN';"

# Update credentials in run-k6-tests.sh or set env vars
export ADMIN_EMAIL=your@email.com
export ADMIN_PASSWORD=yourpassword
```

### Issue: High error rate
- Check backend logs for errors
- Verify database is running
- Check API endpoints are correct
- Reduce concurrent users in test

---

## 📊 Advanced: Cloud Testing

### Run k6 Cloud Tests

1. Sign up at https://k6.io/cloud
2. Get API token
3. Login:
```bash
k6 login cloud --token YOUR_TOKEN
```

4. Run test in cloud:
```bash
k6 cloud k6-tests/load-test.js
```

**Benefits:**
- Distributed load testing
- Geographic testing
- Better reporting
- Team collaboration

---

## 🎓 Best Practices

### 1. Test Regularly
```bash
# Add to CI/CD
- name: Run smoke tests
  run: ./run-k6-tests.sh smoke
```

### 2. Start Small
- Begin with smoke test
- Gradually increase load
- Monitor system resources

### 3. Test Realistic Scenarios
- Mix different user types
- Include think time (sleep)
- Vary request patterns

### 4. Monitor During Tests
```bash
# Watch backend logs
npm run start:dev

# Monitor database
psql e_commerce -c "SELECT count(*) FROM pg_stat_activity;"

# Check system resources
htop
```

### 5. Set Realistic Thresholds
```javascript
thresholds: {
  http_req_duration: ['p(95)<500'],  // 95% under 500ms
  http_req_failed: ['rate<0.05'],    // < 5% errors
  http_reqs: ['rate>10']             // > 10 req/s
}
```

---

## 📚 Resources

- **k6 Documentation**: https://k6.io/docs/
- **Examples**: https://k6.io/docs/examples/
- **Community**: https://community.k6.io/
- **Best Practices**: https://k6.io/docs/testing-guides/

---

## 🚀 Quick Test Checklist

Before deploying:

- [ ] Run smoke test
- [ ] All checks pass
- [ ] Response times acceptable
- [ ] Error rate < 1%
- [ ] Run load test
- [ ] System handles expected traffic
- [ ] No memory leaks
- [ ] Database performs well
- [ ] Run stress test (optional)
- [ ] System recovers from high load
- [ ] Review results
- [ ] Document findings

---

## 💡 Tips

1. **Test Early, Test Often**: Run smoke tests after every major change
2. **Baseline Metrics**: Record performance before optimization
3. **Incremental Load**: Start small, increase gradually
4. **Real Data**: Use production-like test data
5. **Monitor Everything**: Watch logs, metrics, resources
6. **Fix Issues**: Don't ignore performance problems
7. **Document Results**: Keep history of test runs
8. **Team Review**: Share results with team

---

## 🎉 Success!

You're now ready to load test your e-commerce API! Start with a smoke test:

```bash
./run-k6-tests.sh smoke
```

Good luck! 🚀
