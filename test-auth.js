const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:4002',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testAuth() {
  try {
    console.log('🔐 Testing authentication flow...');
    
    // First, try to register a test user
    console.log('\n1. Creating test admin user...');
    try {
      const registerResponse = await api.post('/users/create', {
        username: 'testadmin2',
        email: 'testadmin2@example.com',
        password: 'password123',
        fullName: 'Test Admin 2'
      });
      console.log('✅ User created:', registerResponse.data);
    } catch (err) {
      console.log('ℹ️ User might already exist:', err.response?.data?.message || err.message);
    }
    
    // Now manually set the user as admin in database (or test with existing admin)
    console.log('\n2. Testing login with new auth endpoint...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'admin123' // Common admin password
    });
    console.log('✅ Login successful:', loginResponse.data);
    
    // Test accessing protected endpoint
    console.log('\n3. Testing access to admin endpoint...');
    const adminResponse = await api.get('/admin/sellers/pending');
    console.log('✅ Admin endpoint accessible:', adminResponse.data);
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    // Try different password combinations
    const passwords = ['password123', 'admin123', '123456', 'password'];
    console.log('\n🔄 Trying different passwords...');
    
    for (const password of passwords) {
      try {
        console.log(`Trying password: ${password}`);
        const loginResponse = await api.post('/auth/login', {
          email: 'admin@example.com',
          password: password
        });
        console.log('✅ Login successful with password:', password);
        
        // Test admin endpoint
        const adminResponse = await api.get('/admin/sellers/pending');
        console.log('✅ Admin endpoint works:', adminResponse.data);
        return;
      } catch (err) {
        console.log(`❌ Failed with password: ${password}`);
      }
    }
    
    console.log('❌ All password attempts failed');
  }
}

testAuth();
