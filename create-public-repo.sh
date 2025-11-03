#!/bin/bash

# ============================================
# E-Commerce Platform - Public Repository Setup
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}E-Commerce Platform - GitHub Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check if we're in the right directory
if [ ! -d "e-commerce_backend" ] || [ ! -d "e-commerce-frontend" ]; then
    echo -e "${RED}❌ Error: Must run from e-commerce_project directory${NC}"
    echo -e "${YELLOW}Current directory: $(pwd)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found project directories${NC}"
echo ""

# Step 2: Get GitHub username
echo -e "${YELLOW}Enter your GitHub username:${NC}"
read -p "> " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ GitHub username is required${NC}"
    exit 1
fi

echo ""

# Step 3: Choose repository structure
echo -e "${YELLOW}Choose repository structure:${NC}"
echo "1) Single monorepo (frontend + backend together)"
echo "2) Separate repos (frontend and backend separate)"
read -p "Choice (1 or 2): " REPO_CHOICE

echo ""

# Step 4: Clean sensitive data
echo -e "${YELLOW}🧹 Step 1: Cleaning sensitive data...${NC}"

# Create backup of .env files
echo -e "${BLUE}Creating backup of sensitive files...${NC}"
if [ -f "e-commerce_backend/.env" ]; then
    cp e-commerce_backend/.env e-commerce_backend/.env.backup
    echo -e "${GREEN}✓ Backend .env backed up${NC}"
fi

if [ -f "e-commerce-frontend/.env.local" ]; then
    cp e-commerce-frontend/.env.local e-commerce-frontend/.env.local.backup
    echo -e "${GREEN}✓ Frontend .env.local backed up${NC}"
fi

echo ""

# Step 5: Update .gitignore files
echo -e "${YELLOW}📝 Step 2: Ensuring .gitignore is complete...${NC}"

# Backend .gitignore
cat > e-commerce_backend/.gitignore.new << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.*.local
*.env.backup

# Sensitive files
*_cookies.txt
cookies.txt
auth_cookies.txt
admin_cookies.txt
seller_cookies.txt
buyer_cookies.txt
*.cookies.txt

# Database files
*.sql.backup
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log
npm-debug.log*

# Build outputs
dist/
build/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Uploads (if storing locally)
uploads/
image/
public/uploads/

# Test files (optional - remove if you want to keep)
test-*.sh
*-test.sh
quick-*.sh

# Documentation (optional - keep if public)
# *.md
EOF

# Frontend .gitignore
cat > e-commerce-frontend/.gitignore.new << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Next.js
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env.backup

# Sensitive files
*_cookies.txt
cookies.txt
*.cookies.txt

# Logs
logs/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Test files (optional)
test-*.sh
*-test.sh
EOF

echo -e "${GREEN}✓ .gitignore files updated${NC}"
echo ""

# Step 6: Remove sensitive files from git history
echo -e "${YELLOW}🔐 Step 3: Removing sensitive files from repository...${NC}"

cd e-commerce_backend
echo -e "${BLUE}Backend: Removing sensitive files from git...${NC}"
git rm --cached .env 2>/dev/null || true
git rm --cached *_cookies.txt 2>/dev/null || true
git rm --cached cookies.txt 2>/dev/null || true
git rm --cached *.sql 2>/dev/null || true
mv .gitignore.new .gitignore
echo -e "${GREEN}✓ Backend cleaned${NC}"
cd ..

cd e-commerce-frontend
echo -e "${BLUE}Frontend: Removing sensitive files from git...${NC}"
git rm --cached .env.local 2>/dev/null || true
git rm --cached .env 2>/dev/null || true
git rm --cached *_cookies.txt 2>/dev/null || true
git rm --cached cookies.txt 2>/dev/null || true
mv .gitignore.new .gitignore
echo -e "${GREEN}✓ Frontend cleaned${NC}"
cd ..

echo ""

# Step 7: Repository setup based on choice
if [ "$REPO_CHOICE" = "1" ]; then
    # Monorepo setup
    REPO_NAME="e-commerce-platform"
    
    echo -e "${YELLOW}📦 Step 4: Setting up monorepo structure...${NC}"
    
    echo -e "${BLUE}Creating monorepo README...${NC}"
    
    cat > README.md << 'EOFREADME'
# E-Commerce Platform

Full-stack e-commerce platform with Next.js frontend and NestJS backend.

## 🚀 Features

- **User Authentication** - JWT-based authentication with OAuth support
- **Product Management** - Complete CRUD operations for products
- **Shopping Cart** - Real-time cart management
- **Order Processing** - Complete order lifecycle management
- **Seller Dashboard** - Seller verification and product management
- **Admin Panel** - Platform administration and analytics
- **Real-time Notifications** - Pusher-based notification system
- **Secure Payments** - Payment processing integration
- **Image Upload** - Product image management
- **API Documentation** - Complete Swagger/OpenAPI documentation

## 📁 Project Structure

```
e-commerce-platform/
├── e-commerce_backend/     # NestJS Backend API
├── e-commerce-frontend/    # Next.js Frontend
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Pusher

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Real-time**: Pusher

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd e-commerce_backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server:
```bash
npm run start:dev
```

Backend runs on: http://localhost:4002

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd e-commerce-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:3000

## 📚 Documentation

- **API Documentation**: http://localhost:4002/api-docs
- **OpenAPI Spec**: http://localhost:4002/api-docs-json
- **Frontend Docs**: See `e-commerce-frontend/README.md`
- **Backend Docs**: See `e-commerce_backend/README.md`

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=4002
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=e_commerce
JWT_SECRET=your_jwt_secret
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_cluster
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4002/api/v1
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

## 🔑 Default Admin Credentials

After setting up the database, you can create an admin user or use the default one created by migrations.

## 🌐 API Endpoints

View complete API documentation at: http://localhost:4002/api-docs

Main endpoints:
- `/api/v1/auth/*` - Authentication
- `/api/v1/products/*` - Products
- `/api/v1/orders/*` - Orders
- `/api/v1/cart/*` - Shopping Cart
- `/api/v1/sellers/*` - Sellers
- `/api/v1/admin/*` - Admin

## 🧪 Testing

### Backend Tests
```bash
cd e-commerce_backend
npm run test
```

### Frontend Tests
```bash
cd e-commerce-frontend
npm run test
```

## 📦 Deployment

### Backend Deployment
- Can be deployed to Heroku, AWS, DigitalOcean, etc.
- Requires PostgreSQL database
- Set environment variables in hosting platform

### Frontend Deployment
- Optimized for Vercel deployment
- Can also deploy to Netlify, AWS Amplify
- Set environment variables in hosting platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

Your Name - [@your_github_username](https://github.com/$GITHUB_USERNAME)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Next.js team for the React framework
- All contributors and users

## 📞 Support

For support, email your-email@example.com or open an issue.
EOFREADME

    echo -e "${GREEN}✓ Monorepo README created${NC}"
    echo ""
    
    echo -e "${YELLOW}📤 Step 5: Preparing to push to GitHub...${NC}"
    echo ""
    echo -e "${BLUE}Run these commands to create and push to GitHub:${NC}"
    echo ""
    echo -e "${GREEN}# 1. Initialize git (if not already done)${NC}"
    echo "git init"
    echo "git add ."
    echo "git commit -m \"Initial commit: E-Commerce Platform\""
    echo ""
    echo -e "${GREEN}# 2. Create repository on GitHub:${NC}"
    echo "   Go to: https://github.com/new"
    echo "   Repository name: e-commerce-platform"
    echo "   Description: Full-stack e-commerce platform with Next.js and NestJS"
    echo "   Visibility: Public"
    echo "   Click 'Create repository'"
    echo ""
    echo -e "${GREEN}# 3. Push to GitHub:${NC}"
    echo "git remote add origin https://github.com/$GITHUB_USERNAME/e-commerce-platform.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    
else
    # Separate repos setup
    echo -e "${YELLOW}📦 Step 4: Setting up separate repositories...${NC}"
    
    # Backend repo
    echo -e "${BLUE}Setting up backend repository...${NC}"
    cd e-commerce_backend
    
    # Commit changes
    git add .gitignore
    git commit -m "chore: update .gitignore for public repo" || true
    
    echo -e "${GREEN}✓ Backend ready${NC}"
    echo ""
    echo -e "${BLUE}Backend commands:${NC}"
    echo "cd e-commerce_backend"
    echo "# Create repo at: https://github.com/new"
    echo "# Name: e-commerce-backend"
    echo "git remote set-url origin https://github.com/$GITHUB_USERNAME/e-commerce-backend.git"
    echo "git push -u origin main"
    cd ..
    echo ""
    
    # Frontend repo
    echo -e "${BLUE}Setting up frontend repository...${NC}"
    cd e-commerce-frontend
    
    # Commit changes
    git add .gitignore
    git commit -m "chore: update .gitignore for public repo" || true
    
    echo -e "${GREEN}✓ Frontend ready${NC}"
    echo ""
    echo -e "${BLUE}Frontend commands:${NC}"
    echo "cd e-commerce-frontend"
    echo "# Create repo at: https://github.com/new"
    echo "# Name: e-commerce-frontend"
    echo "git remote set-url origin https://github.com/$GITHUB_USERNAME/e-commerce-frontend.git"
    echo "git push -u origin main"
    cd ..
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Repository Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
echo "1. ✅ .env files are now in .gitignore"
echo "2. ✅ Sensitive files are excluded"
echo "3. ✅ Cookie files are excluded"
echo "4. ⚠️  Review code before pushing"
echo "5. ⚠️  Never commit real credentials"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Create repository on GitHub: https://github.com/new"
echo "2. Follow the commands shown above to push"
echo "3. Add repository topics/description on GitHub"
echo "4. Set up branch protection rules (optional)"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
