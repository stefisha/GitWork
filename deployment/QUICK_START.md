# ⚡ GitWork GCP Deployment - Quick Start

## 🎯 **Your Details**
- **VM IP:** 34.32.66.109
- **SSH:** `ssh stefanhrmail@34.32.66.109`
- **Domain:** gitwork.io
- **OS:** Debian

---

## 📋 **5-Minute Checklist**

### **BEFORE SSH'ing (Do on Windows):**

**1. Point DNS (Namecheap):**
```
gitwork.io    →  A Record  →  34.32.66.109
www.gitwork.io →  A Record  →  34.32.66.109
```

**2. Push to GitHub:**
```bash
cd C:\Users\Stefan\OneDrive\Desktop\GitWork
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/stefisha/gitwork.git
git push -u origin main
```

---

### **ON THE VM (SSH in):**

**3. Install Everything:**
```bash
sudo apt update && sudo apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git && \
sudo npm install -g pm2
```

**4. Clone & Setup:**
```bash
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/stefisha/gitwork.git
cd gitwork
npm install
mkdir -p data
```

**5. Create .env:**
```bash
nano .env
# Paste your .env content (with https://gitwork.io callback)
# Save: Ctrl+X, Y, Enter
chmod 600 .env
```

**6. Upload private-key.pem:**
```bash
nano private-key.pem
# Paste content
# Save: Ctrl+X, Y, Enter
chmod 600 private-key.pem
```

**7. Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/gitwork
```
(Use the config from DEPLOYMENT_GUIDE.md)

```bash
sudo ln -s /etc/nginx/sites-available/gitwork /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**8. Configure Firewall (GCP Console):**
- Allow tcp:80,tcp:443 from 0.0.0.0/0

**9. Set up SSL:**
```bash
sudo certbot --nginx -d gitwork.io -d www.gitwork.io
```

**10. Start App:**
```bash
pm2 start src/index.js --name gitwork
pm2 save
pm2 startup  # Run the sudo command it gives you
pm2 logs gitwork
```

**11. Update GitHub App:**
- Webhook: `https://gitwork.io/api/webhooks/github`
- Callback: `https://gitwork.io/auth/github/callback`

**12. Test:**
- Create issue with `Octavian:USDC:0.5`
- Watch logs: `pm2 logs gitwork`

---

## ✅ **Done!**

Your app is now live at **https://gitwork.io** 🚀

