# Deployment Configuration Files

This folder contains configuration files and scripts for deploying GitWork.

## 📁 Files

- **`setup-vm.sh`** - Automated server setup script
- **`nginx-config.conf`** - Nginx reverse proxy configuration

## 📚 Documentation

**All deployment documentation has been moved to the `docs/` folder:**

- **[Deployment Guide](../docs/DEPLOYMENT_GUIDE.md)** - Comprehensive deployment walkthrough
- **[Quick Start](../docs/DEPLOYMENT_QUICK_START.md)** - Rapid deployment commands

## 🚀 Quick Deploy

```bash
# 1. SSH to your server
ssh user@your-server

# 2. Run automated setup
curl -o setup-vm.sh https://raw.githubusercontent.com/yourusername/gitwork/main/deployment/setup-vm.sh
chmod +x setup-vm.sh
sudo ./setup-vm.sh

# 3. Clone and deploy
git clone https://github.com/yourusername/gitwork.git
cd gitwork
npm install

# Configure .env, then:
pm2 start src/index.js --name gitwork
pm2 save
```

See [Deployment Guide](../docs/DEPLOYMENT_GUIDE.md) for detailed instructions.
