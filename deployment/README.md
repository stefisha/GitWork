# Deployment

This folder contains deployment scripts and configuration files for GitWork.

## 📁 Contents

- **`setup-vm.sh`** - Automated setup script for fresh VM/VPS
- **`nginx-config.conf`** - Nginx reverse proxy configuration

## 🚀 Quick Deploy

For detailed deployment instructions, see:
- [docs/DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [docs/DEPLOYMENT_QUICK_START.md](../docs/DEPLOYMENT_QUICK_START.md) - Quick reference

## ⚡ One-Command Deploy

On your production server:

```bash
npm run deploy
```

This will:
1. Pull latest code
2. Install backend dependencies
3. Install frontend dependencies
4. Build frontend
5. Restart PM2 process

## 📋 Manual Deployment Steps

### 1. Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/gitwork.git
cd gitwork

# Run setup script (first time only)
chmod +x deployment/setup-vm.sh
./deployment/setup-vm.sh
```

### 2. Configure Environment

```bash
# Edit .env file
nano .env

# Add your configuration:
# - GitHub App credentials
# - Privy credentials
# - Solana RPC and keys
# - Domain and URLs
```

### 3. Set Up Database

```bash
npm run db:migrate
```

### 4. Build Frontend

```bash
cd gitwork-front
npm install
npm run build
cd ..
```

### 5. Start with PM2

```bash
pm2 start src/index.js --name gitwork
pm2 save
```

### 6. Configure Nginx

```bash
# Copy nginx config
sudo cp deployment/nginx-config.conf /etc/nginx/sites-available/gitwork
sudo ln -s /etc/nginx/sites-available/gitwork /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Set Up SSL

```bash
sudo certbot --nginx -d yourdomain.com
```

## 🔄 Updating Production

```bash
cd ~/apps/gitwork
git pull origin main
npm install
cd gitwork-front
npm install
npm run build
cd ..
pm2 restart gitwork
```

Or use the one-command deploy:

```bash
npm run deploy
```

## 🔍 Monitoring

```bash
# View logs
pm2 logs gitwork

# Check status
pm2 status

# Monitor
pm2 monit
```

## 🛠️ Troubleshooting

See [docs/DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md#troubleshooting) for common issues and solutions.

## 📝 Requirements

- Node.js 18+
- PM2
- Nginx
- Certbot (for SSL)
- Domain with DNS configured
