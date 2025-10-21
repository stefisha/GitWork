# 📝 GitWork Deployment - Step-by-Step Checklist

## ✅ **Phase 1: Prepare for Deployment**

### **☐ 1. Point Domain to VM (Do this FIRST - DNS takes time)**

**In Namecheap (gitwork.io):**
1. Login to Namecheap
2. Domain List → gitwork.io → Manage
3. Advanced DNS tab
4. Add these A records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | 34.32.66.109 | Automatic |
| A Record | www | 34.32.66.109 | Automatic |

5. Save changes
6. **Wait 5-10 minutes** for DNS to propagate

**Verify (from your Windows machine):**
```bash
nslookup gitwork.io
# Should show: 34.32.66.109
```

---

### **☐ 2. Push Code to GitHub**

**IMPORTANT:** Make sure `.gitignore` excludes sensitive files!

**Your `.gitignore` already has:**
- ✅ `.env`
- ✅ `*.pem`
- ✅ `data/`
- ✅ `node_modules/`

**Push to GitHub:**
```bash
# On your Windows machine
cd C:\Users\Stefan\OneDrive\Desktop\GitWork

# Initialize git
git init
git add .
git commit -m "GitWork - Initial deployment"

# Create repo on GitHub: https://github.com/new
# Name: gitwork
# Make it PRIVATE (contains sensitive code structure)

# Push
git remote add origin https://github.com/stefisha/gitwork.git
git branch -M main
git push -u origin main
```

---

## ✅ **Phase 2: Set Up VM**

### **☐ 3. SSH into VM**

```bash
ssh stefanhrmail@34.32.66.109
```

---

### **☐ 4. Install Required Software**

**Run this ONE big command:**

```bash
# Update and install everything
sudo apt update && sudo apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git && \
sudo npm install -g pm2 && \
mkdir -p ~/apps ~/backups && \
echo "✅ Installation complete!" && \
node --version && npm --version && pm2 --version
```

---

### **☐ 5. Clone Repository**

```bash
cd ~/apps
git clone https://github.com/stefisha/gitwork.git
cd gitwork
npm install
```

---

### **☐ 6. Create .env File**

```bash
nano .env
```

**Paste this (note AUTH_CALLBACK_URL uses gitwork.io):**

```env
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
SESSION_SECRET=gitwork-production-secret-change-this-$(openssl rand -hex 16)
SOLANA_FEE_PAYER_PRIVATE_KEY=64sAKpenYuGdEMisW2LWoAsRTwUjgs9PJFCn2oy7ohj5kpLpCdeHTAFRCQP47VXEmvvCLxrWqfbnzGR1hJ49HfB1
```

**Save:** Ctrl+X, Y, Enter

---

### **☐ 7. Upload Private Key**

**Option A - From your Windows machine:**
```bash
scp C:\Users\Stefan\OneDrive\Desktop\GitWork\private-key.pem stefanhrmail@34.32.66.109:~/apps/gitwork/
```

**Option B - Paste directly on VM:**
```bash
nano ~/apps/gitwork/private-key.pem
# Paste content
# Save: Ctrl+X, Y, Enter

# Secure it
chmod 600 ~/apps/gitwork/private-key.pem
chmod 600 ~/apps/gitwork/.env
```

---

### **☐ 8. Create Data Directory**

```bash
mkdir -p ~/apps/gitwork/data
```

---

### **☐ 9. Test App Locally**

```bash
cd ~/apps/gitwork
npm start

# Should see:
# ✅ GitWork API running on port 3000
# ✅ Deposit monitor started

# In another SSH session (or use curl):
curl http://localhost:3000/api/webhooks/health

# Stop with Ctrl+C
```

---

## ✅ **Phase 3: Configure Nginx & SSL**

### **☐ 10. Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/gitwork
```

**Paste this:**

```nginx
server {
    listen 80;
    server_name gitwork.io www.gitwork.io;
    
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
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
}
```

**Save:** Ctrl+X, Y, Enter

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gitwork /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### **☐ 11. Test HTTP Access**

**From your Windows machine:**

```bash
curl http://gitwork.io/api/webhooks/health
# Should return: {"status":"ok","service":"GitWork Webhooks"}
```

**Or visit in browser:**
http://gitwork.io/api/webhooks/health

---

### **☐ 12. Configure GCP Firewall Rules**

**Via GCP Console:**
1. Navigation menu → VPC network → Firewall
2. Click "CREATE FIREWALL RULE"
3. Settings:
   - Name: `allow-http-https`
   - Targets: `All instances in the network`
   - Source IPv4 ranges: `0.0.0.0/0`
   - Protocols and ports: Check `tcp` → `80, 443`
4. Click CREATE

---

### **☐ 13. Set Up SSL Certificate**

```bash
# Run certbot
sudo certbot --nginx -d gitwork.io -d www.gitwork.io

# Follow prompts:
# Email: stefan@example.com
# Terms: A (Agree)
# Share email: N
# Redirect HTTP to HTTPS: 2 (Yes, redirect)

# Test renewal
sudo certbot renew --dry-run
```

---

### **☐ 14. Test HTTPS Access**

```bash
# From Windows
curl https://gitwork.io/api/webhooks/health

# Or browser: https://gitwork.io/api/webhooks/health
```

---

## ✅ **Phase 4: Start Production App**

### **☐ 15. Start App with PM2**

```bash
cd ~/apps/gitwork

# Start app
pm2 start src/index.js --name gitwork

# Save PM2 configuration
pm2 save

# Enable auto-start on VM reboot
pm2 startup
# IMPORTANT: Run the sudo command it outputs!

# Check status
pm2 status
pm2 logs gitwork --lines 30
```

---

### **☐ 16. Update GitHub App Settings**

**Go to:** https://github.com/settings/apps/gitwork-io

**Update these 3 URLs:**

1. **Webhook URL:**
   ```
   OLD: https://smee.io/DcnvOWIJ3PJfbQzZ
   NEW: https://gitwork.io/api/webhooks/github
   ```

2. **Callback URL:**
   ```
   OLD: http://localhost:3000/auth/github/callback
   NEW: https://gitwork.io/auth/github/callback
   ```

3. **Homepage URL:**
   ```
   NEW: https://gitwork.io
   ```

**Save changes!**

---

### **☐ 17. Test End-to-End**

**Create a test bounty:**

1. Go to your test repo on GitHub
2. Create issue with label: `Octavian:USDC:0.5`
3. Watch VM logs: `pm2 logs gitwork`
4. Should see webhook received and bounty created!

---

## 🔍 **Useful Commands**

### **On VM:**

```bash
# View logs
pm2 logs gitwork
pm2 logs gitwork --lines 100

# Restart app
pm2 restart gitwork

# Stop app
pm2 stop gitwork

# App status
pm2 status

# System resources
pm2 monit

# Update code
cd ~/apps/gitwork
git pull
npm install
pm2 restart gitwork

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx

# Check nginx config
sudo nginx -t
```

---

## 🚨 **Troubleshooting**

### **Webhook not received:**
```bash
# Check app is running
pm2 status

# Check logs
pm2 logs gitwork --lines 50

# Test health endpoint
curl http://localhost:3000/api/webhooks/health

# Check nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### **SSL not working:**
```bash
# Check cert status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check nginx config
sudo nginx -t
```

### **Database issues:**
```bash
# Check data directory
ls -la ~/apps/gitwork/data/

# Check permissions
chmod 755 ~/apps/gitwork/data
```

---

## 📊 **Monitoring**

### **Set up log rotation:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### **Database backups:**
```bash
# Manual backup
cp ~/apps/gitwork/data/gitwork.db ~/backups/gitwork-$(date +%Y%m%d).db

# Automated daily backup (add to crontab)
crontab -e
# Add this line:
0 0 * * * cp ~/apps/gitwork/data/gitwork.db ~/backups/gitwork-$(date +\%Y\%m\%d).db
```

---

## 🎯 **Next Steps**

**Ready to deploy? Here's what we'll do:**

1. I'll help you push code to GitHub (with proper .gitignore)
2. You SSH into the VM
3. Run the setup commands
4. Configure nginx
5. Set up SSL
6. Update GitHub App URLs
7. Test with a real bounty!

**Want to start? Let me know!** 🚀

