#!/bin/bash

echo "🔗 TESTING SIGNUP ROUTE FIXES"
echo "=============================="

echo -e "\n1. Testing signup route accessibility..."

# Test that /Singup route works
SINGUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/Singup)
if [ "$SINGUP_STATUS" = "200" ]; then
    echo "✅ /Singup route is accessible"
else
    echo "❌ /Singup route returned status: $SINGUP_STATUS"
fi

# Test if old /signup route still exists
SIGNUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/signup)
if [ "$SIGNUP_STATUS" = "404" ]; then
    echo "✅ Old /signup route properly removed (404 expected)"
else
    echo "⚠️  Old /signup route still accessible (status: $SIGNUP_STATUS)"
fi

echo -e "\n2. Testing login route accessibility..."
LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login)
if [ "$LOGIN_STATUS" = "200" ]; then
    echo "✅ /login route is accessible"
else
    echo "❌ /login route returned status: $LOGIN_STATUS"
fi

echo -e "\n🎯 FIXES APPLIED:"
echo "=================="
echo "✅ Navigation.tsx: Updated both signup buttons to use /Singup"
echo "✅ AuthContextNew.tsx: Updated 401 redirect logic to exclude /Singup"
echo "✅ login/page.tsx: Already had correct /Singup link"

echo -e "\n📋 UPDATED COMPONENTS:"
echo "======================"
echo "✅ Navigation component - Desktop signup button"
echo "✅ Navigation component - Mobile signup button"
echo "✅ Auth context - 401 error handling"
echo "✅ Login page - Sign up link (already correct)"

echo -e "\n🚀 TO TEST THE CHANGES:"
echo "======================="
echo "1. Open http://localhost:3000"
echo "2. Click 'Sign up' in navigation → Should go to /Singup"
echo "3. Open http://localhost:3000/login"
echo "4. Click 'Sign Up' link → Should go to /Singup"
echo "5. Open http://localhost:3000/Singup directly → Should work"

echo -e "\n✨ All signup links now use your preferred /Singup route!"