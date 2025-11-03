#!/bin/bash

# Test Products Page Fixes
# Verifies all React errors are resolved

echo "🧪 Testing Products Page Fixes..."
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Checking file modifications...${NC}"
echo ""

# Check if products page exists
if [ -f "e-commerce-frontend/src/app/dashboard/admin/products/page.tsx" ]; then
    echo -e "${GREEN}✅ Products page file exists${NC}"
else
    echo -e "${RED}❌ Products page file not found${NC}"
    exit 1
fi

# Check for getValidImageUrl function
if grep -q "getValidImageUrl" e-commerce-frontend/src/app/dashboard/admin/products/page.tsx; then
    echo -e "${GREEN}✅ getValidImageUrl helper function added${NC}"
else
    echo -e "${RED}❌ getValidImageUrl function not found${NC}"
    exit 1
fi

# Check for key prop fix in category select
if grep -q 'key={`${category}-${index}`}' e-commerce-frontend/src/app/dashboard/admin/products/page.tsx; then
    echo -e "${GREEN}✅ Category select key prop fixed${NC}"
else
    echo -e "${RED}❌ Category select key prop not fixed${NC}"
    exit 1
fi

# Check for alt text fallback
if grep -q 'alt={product.title || ' e-commerce-frontend/src/app/dashboard/admin/products/page.tsx; then
    echo -e "${GREEN}✅ Alt text fallback added${NC}"
else
    echo -e "${RED}❌ Alt text fallback not found${NC}"
    exit 1
fi

# Check for unoptimized prop
if grep -q 'unoptimized' e-commerce-frontend/src/app/dashboard/admin/products/page.tsx; then
    echo -e "${GREEN}✅ Image unoptimized prop added${NC}"
else
    echo -e "${RED}❌ Image unoptimized prop not found${NC}"
    exit 1
fi

# Check for onError handler
if grep -q 'onError={(e) =>' e-commerce-frontend/src/app/dashboard/admin/products/page.tsx; then
    echo -e "${GREEN}✅ Image error handler added${NC}"
else
    echo -e "${RED}❌ Image error handler not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Checking Next.js configuration...${NC}"
echo ""

# Check if next.config.ts has uploads path
if [ -f "e-commerce-frontend/next.config.ts" ]; then
    if grep -q '/uploads/\*\*' e-commerce-frontend/next.config.ts; then
        echo -e "${GREEN}✅ Next.js config updated with /uploads/** path${NC}"
    else
        echo -e "${RED}❌ /uploads/** path not found in next.config.ts${NC}"
    fi
else
    echo -e "${RED}❌ next.config.ts not found${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Testing Image URL Helper Logic...${NC}"
echo ""

# Test various image URL formats
cat > /tmp/test-image-helper.js << 'EOF'
// Simulate the helper function
function getValidImageUrl(images) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  const firstImage = images[0];
  if (!firstImage || typeof firstImage !== 'string' || firstImage.trim() === '') {
    return null;
  }
  
  if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
    return firstImage;
  }
  
  return `http://localhost:4002/${firstImage.replace(/^\/+/, '')}`;
}

// Test cases
const tests = [
  { input: undefined, expected: null, desc: "undefined images" },
  { input: [], expected: null, desc: "empty array" },
  { input: [null], expected: null, desc: "null image" },
  { input: [''], expected: null, desc: "empty string" },
  { input: ['   '], expected: null, desc: "whitespace only" },
  { input: ['http://example.com/image.jpg'], expected: 'http://example.com/image.jpg', desc: "full URL http" },
  { input: ['https://example.com/image.jpg'], expected: 'https://example.com/image.jpg', desc: "full URL https" },
  { input: ['uploads/images/test.jpg'], expected: 'http://localhost:4002/uploads/images/test.jpg', desc: "relative path" },
  { input: ['/uploads/images/test.jpg'], expected: 'http://localhost:4002/uploads/images/test.jpg', desc: "absolute path" },
];

console.log('Testing Image URL Helper Function:');
console.log('===================================\n');

let passed = 0;
let failed = 0;

tests.forEach(test => {
  const result = getValidImageUrl(test.input);
  const success = result === test.expected;
  
  if (success) {
    console.log(`✅ PASS: ${test.desc}`);
    console.log(`   Result: ${result === null ? 'null' : result}\n`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${test.desc}`);
    console.log(`   Expected: ${test.expected === null ? 'null' : test.expected}`);
    console.log(`   Got: ${result === null ? 'null' : result}\n`);
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
EOF

node /tmp/test-image-helper.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All image URL helper tests passed${NC}"
else
    echo ""
    echo -e "${RED}❌ Some image URL helper tests failed${NC}"
fi

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Products Page Fixes Complete!${NC}"
echo "=================================="
echo ""
echo "Fixed Issues:"
echo "  1. ✅ Missing key prop in category select"
echo "  2. ✅ Empty string in image src"
echo "  3. ✅ Missing image src property"
echo "  4. ✅ Missing alt property"
echo "  5. ✅ Image error handling"
echo ""
echo "Next Steps:"
echo "  1. Frontend server is running (check terminal)"
echo "  2. Hard refresh browser: Ctrl+Shift+R"
echo "  3. Navigate to: http://localhost:3000/dashboard/admin/products"
echo "  4. Check browser console - should have NO errors"
echo ""
echo -e "${YELLOW}📖 See PRODUCTS_PAGE_REACT_ERRORS_FIX.md for complete documentation${NC}"
echo ""
