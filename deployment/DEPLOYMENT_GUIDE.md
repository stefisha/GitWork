# 🚀 GitWork GCP VM Deployment Guide

## 📋 Your VM Details
- **SSH:** `stefanhrmail@34.32.66.109`
- **OS:** Debian
- **Domain:** gitwork.io (Namecheap)
- **External IP:** 34.32.66.109

---

## 🎯 **PHASE 1: Set Up Webhook Endpoint**

### **Step 1: Point Domain to VM**

**In Namecheap DNS settings for gitwork.io:**

1. Log into Namecheap
2. Go to Domain List → gitwork.io → Manage
3. Advanced DNS tab
4. Add/Update these records:

```
Type    Host    Value               TTL
A       @       34.32.66.109        Automatic
A       www     34.32.66.109        Automatic
```

5. Save changes
6. Wait 5-10 minutes for DNS propagation

**Verify DNS:**
```bash
# On your local machine
nslookup gitwork.io
# Should return: 34.32.66.109
```

---

### **Step 2: SSH into Your VM**

```bash
ssh stefanhrmail@34.32.66.109
```

---

### **Step 3: Run VM Setup Script**

```bash
# Create setup script
cat > setup-vm.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Setting up GitWork VM..."

# Update system
echo "📦 Updating system..."
sudo apt update
sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install nginx
echo "📦 Installing nginx..."
sudo apt install -y nginx

# Install certbot
echo "📦 Installing certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install git
echo "📦 Installing git..."
sudo apt install -y git

# Create app directory
echo "📁 Creating directories..."
mkdir -p ~/apps
mkdir -p ~/backups

echo ""
echo "✅ VM setup complete!"
node --version
npm --version
pm2 --version
nginx -v

EOF

# Make executable and run
chmod +x setup-vm.sh
./setup-vm.sh
```

---

### **Step 4: Push Code to GitHub**

**On your local machine (Windows):**

```bash
# Initialize git (if not already)
cd C:\Users\Stefan\OneDrive\Desktop\GitWork
git init
git add .
git commit -m "Initial commit - GitWork app"

# Create GitHub repo (if not exists)
# Go to github.com → New Repository → gitwork

# Push to GitHub
git remote add origin https://github.com/stefisha/gitwork.git
git branch -M main
git push -u origin main
```

---

### **Step 5: Clone Repository on VM**

**On the VM:**

```bash
cd ~/apps
git clone https://github.com/stefisha/gitwork.git
cd gitwork

# Install dependencies
npm install
```

---

### **Step 6: Set Up Environment Variables**

```bash
# Create .env file
nano .env

# Paste (update AUTH_CALLBACK_URL to use gitwork.io):
GITHUB_APP_ID=2149376
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
GITHUB_WEBHOOK_SECRET=030a0587b2f812f52b188e84c6c7c64f2fc843ea
PRIVY_APP_ID=cmgy7ru4w019yld0cpodllpch
PRIVY_APP_SECRET=5B9R2nA7j5Qcdp4qcxBgojdBF2eNLPcY7CLcBRQqDxC97QKigcAc8gDKS5rAAqaSm6UqUhkCjTo9Jy7mTbXrqG7X
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=57eb2d58-88e1-40ec-8643-3f3573d3ed78
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
PORT=3000
GITHUB_CLIENT_ID=Iv23lib6FqyUnA4LtKml
GITHUB_CLIENT_SECRET=9677fd1a478b4a63a9e02c1c96672fe75a61b0d0
AUTH_CALLBACK_URL=https://gitwork.io/auth/github/callback
SESSION_SECRET=gitwork-secret-key-748754389
SOLANA_FEE_PAYER_PRIVATE_KEY=64sAKpenYuGdEMisW2LWoAsRTwUjgs9PJFCn2oy7ohj5kpLpCdeHTAFRCQP47VXEmvvCLxrWqfbnzGR1hJ49HfB1

# Save: Ctrl+X, then Y, then Enter
```

---

### **Step 7: Upload Private Key**

**On your local machine:**

```bash
# Upload private-key.pem to VM
scp private-key.pem stefanhrmail@34.32.66.109:~/apps/gitwork/

# Or if you have the key content, paste it on the VM:
# On VM:
nano ~/apps/gitwork/private-key.pem
# Paste content, save

# Secure it
chmod 600 ~/apps/gitwork/private-key.pem
chmod 600 ~/apps/gitwork/.env
```

---

### **Step 8: Create Data Directory**

```bash
mkdir -p ~/apps/gitwork/data
```

---

### **Step 9: Test the App**

```bash
cd ~/apps/gitwork
npm start

# Should see:
# ✅ GitWork API running on port 3000
# ✅ Deposit monitor started

# Test it works:
curl http://localhost:3000/api/webhooks/health

# Should return: {"status":"ok","service":"GitWork Webhooks"}

# Stop with Ctrl+C
```

---

### **Step 10: Start with PM2**

```bash
# Start app
pm2 start src/index.js --name gitwork

# Save PM2 config
pm2 save

# Set PM2 to auto-start on reboot
pm2 startup
# Run the command it outputs (starts with sudo)

# Check status
pm2 status
pm2 logs gitwork --lines 20
```

---

### **Step 11: Configure Nginx**

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/gitwork

# Paste this:
```

```nginx
server {
    listen 80;
    server_name gitwork.io www.gitwork.io;
    
    # Increase timeouts for webhooks
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    
    # Max body size for webhooks
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
    
    location /api/webhooks/health {
        proxy_pass http://localhost:3000/api/webhooks/health;
        access_log off;
    }
}
```

```bash
# Save: Ctrl+X, Y, Enter

# Enable the site
sudo ln -s /etc/nginx/sites-available/gitwork /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### **Step 12: Configure GCP Firewall**

**In GCP Console:**

1. Go to: VPC Network → Firewall → Create Firewall Rule
2. Settings:
   - **Name:** allow-http-https
   - **Targets:** All instances in network
   - **Source IP ranges:** 0.0.0.0/0
   - **Protocols and ports:** tcp:80, tcp:443
3. Click **Create**

**Or via gcloud CLI:**

```bash
gcloud compute firewall-rules create allow-http-https \
    --allow tcp:80,tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP and HTTPS"
```

---

### **Step 13: Test HTTP Access**

**On your local machine:**

```bash
# Test if nginx is working
curl http://gitwork.io/api/webhooks/health

# Should return: {"status":"ok","service":"GitWork Webhooks"}
```

---

### **Step 14: Set Up SSL with Let's Encrypt**

**On the VM:**

```bash
# Get SSL certificate
sudo certbot --nginx -d gitwork.io -d www.gitwork.io

# Follow prompts:
# - Email: your-email@example.com
# - Agree to terms: Y
# - Share email with EFF: N (optional)
# - Redirect HTTP to HTTPS: Yes (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

### **Step 15: Test HTTPS Access**

```bash
# From local machine
curl https://gitwork.io/api/webhooks/health

# Should return: {"status":"ok","service":"GitWork Webhooks"}

# Visit in browser:
# https://gitwork.io/api/webhooks/health
```

---

### **Step 16: Update GitHub App Webhook URL**

**In GitHub App settings:**

1. Go to: https://github.com/settings/apps/gitwork-io
2. Webhook section:
   - **OLD:** https://smee.io/DcnvOWIJ3PJfbQzZ
   - **NEW:** https://gitwork.io/api/webhooks/github
3. Save changes

---

### **Step 17: Test Webhook Delivery**

**On the VM, watch logs:**

```bash
pm2 logs gitwork --lines 50
```

**On GitHub, create a test issue with bounty label:**
- Label: `Octavian:USDC:0.5`

**You should see in VM logs:**
```
🏷️  Issue #XX labeled with: octavian:usdc:0.5
💰 Bounty label detected on issue #XX
✅ Privy Solana wallet created: [address]
```

---

## 📝 **Quick Start Commands**

Here's everything in one script you can copy/paste:

```bash
# === RUN THIS ON YOUR VM ===

# 1. Update system and install everything
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
sudo npm install -g pm2

# 2. Verify installations
node --version && npm --version && pm2 --version

# 3. Create app directory
mkdir -p ~/apps && cd ~/apps

# You'll then need to:
# 4. Clone your repo (after you push to GitHub)
# 5. Set up .env and private-key.pem
# 6. Configure nginx
# 7. Set up SSL
# 8. Start with PM2
```

---

## 🎯 **What We'll Do Next**

**Step-by-step process:**

1. ✅ You push your code to GitHub (I'll help)
2. ✅ You run the setup script on VM
3. ✅ You clone the repo
4. ✅ You set up .env and private key
5. ✅ Configure nginx
6. ✅ Set up SSL with certbot
7. ✅ Start app with PM2
8. ✅ Update GitHub App URLs
9. ✅ Test with a bounty!

---

## ❓ **Ready to Start?**

**First, let's push your code to GitHub:**

Should I:
1. Create a `.gitignore` to exclude sensitive files?
2. Help you push to GitHub?
3. Then we SSH into the VM and set everything up?

Let me know and we'll go step-by-step! 🚀
