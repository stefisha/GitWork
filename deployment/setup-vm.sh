#!/bin/bash

# GitWork VM Setup Script for Debian
# Run this on your GCP VM

set -e

echo "🚀 Setting up GitWork VM..."
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js
echo ""
echo "✅ Node.js installed:"
node --version
npm --version

# Install PM2
echo ""
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install nginx
echo ""
echo "📦 Installing nginx..."
sudo apt install -y nginx

# Install certbot for SSL
echo ""
echo "📦 Installing certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

# Install git
echo ""
echo "📦 Installing git..."
sudo apt install -y git

# Create app directory
echo ""
echo "📁 Creating app directory..."
mkdir -p ~/apps
cd ~/apps

echo ""
echo "✅ VM setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your GitWork repository"
echo "2. Set up environment variables"
echo "3. Configure nginx"
echo "4. Set up SSL with certbot"

