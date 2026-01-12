#!/bin/bash

# Security Enhancement Installation Script
# This script installs all required dependencies for the new security features

set -e

echo "🔐 Installing security enhancement dependencies..."
echo ""

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install \
  redis \
  nodemailer \
  speakeasy \
  qrcode \
  bcryptjs \
  @sentry/nextjs \
  @sentry/react \
  logrocket \
  dotenv-cli

# Install development dependencies (TypeScript types)
echo "📦 Installing TypeScript type definitions..."
npm install --save-dev \
  @types/nodemailer \
  @types/speakeasy \
  @types/qrcode

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Copy .env.local.example to .env.local"
echo "2. Configure environment variables (Redis, Email, etc.)"
echo "3. Run 'npm run dev' to start development server"
echo ""
echo "📚 Documentation:"
echo "- SECURITY_ENHANCEMENTS.md - Complete security features guide"
echo "- API_SECURITY_ENDPOINTS.md - API endpoint documentation"
echo ""
