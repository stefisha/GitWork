# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. **Backend .env Configuration**

**IMPORTANT:** Update your `.env` file with production URLs:

```bash
# On your LOCAL machine, update .env:
AUTH_CALLBACK_URL=https://gitwork.io/auth/github/callback
CLAIM_BASE_URL=https://gitwork.io
NODE_ENV=production
```

Your current `.env` has:
- ❌ `AUTH_CALLBACK_URL=http://localhost:3000/auth/github/callback` (WRONG)
- ❌ Missing `CLAIM_BASE_URL`
- ❌ Missing `NODE_ENV=production`

**Fixed version should be:**
```bash
GITHUB_APP_ID=2149376
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
GITHUB_WEBHOOK_SECRET=030a0587b2f812f52b188e84c6c7c64f2fc843ea
PRIVY_APP_ID=cmgy7ru4w019yld0cpodllpch
NEXT_PUBLIC_PRIVY_APP_ID=cmgy7ru4w019yld0cpodllpch
PRIVY_APP_SECRET=5B9R2nA7j5Qcdp4qcxBgojdBF2eNLPcY7CLcBRQqDxC97QKigcAc8gDKS5rAAqaSm6UqUhkCjTo9Jy7mTbXrqG7X
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=57eb2d58-88e1-40ec-8643-3f3573d3ed78
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
PORT=3000

GITHUB_CLIENT_ID=Iv23lib6FqyUnA4LtKml
GITHUB_CLIENT_SECRET=9677fd1a478b4a63a9e02c1c96672fe75a61b0d0
AUTH_CALLBACK_URL=https://gitwork.io/auth/github/callback
CLAIM_BASE_URL=https://gitwork.io
SESSION_SECRET=gitwork-secret-key-748754389
NODE_ENV=production
SOLANA_FEE_PAYER_PRIVATE_KEY=64sAKpenYuGdEMisW2LWoAsRTwUjgs9PJFCn2oy7ohj5kpLpCdeHTAFRCQP47VXEmvvCLxrWqfbnzGR1hJ49HfB1
```

### 2. **Files Ready for Deployment**

✅ **New Backend Files:**
- `src/routes/api-bounties.js` - Bounty search API
- `src/routes/api-user.js` - User profile API
- `src/index.js` - Updated with new routes + frontend serving

✅ **Frontend Files:**
- `gitwork-front/` - Complete React app
- `gitwork-front/.env` - Has `VITE_API_URL=http://localhost:3000` (dev only, ignored in production)

✅ **Documentation:**
- `docs/FRONTEND_INTEGRATION.md` - Integration guide
- All docs consolidated in `docs/` folder

### 3. **Git Status**

Check what's ready to commit:
```bash
git status
git add .
git commit -m "feat: integrate frontend dashboard with backend API"
```

---

## 🚀 Deployment Steps

### **Step 1: Fix .env (CRITICAL)**

**On your LOCAL machine:**
```bash
# Open .env in editor and change:
AUTH_CALLBACK_URL=https://gitwork.io/auth/github/callback
# Add these lines:
CLAIM_BASE_URL=https://gitwork.io
NODE_ENV=production
```

### **Step 2: Build Frontend Locally (Test)**

```bash
cd gitwork-front
npm install
npm run build

# Verify dist/ folder was created
ls dist/
```

### **Step 3: Commit and Push**

```bash
cd ..
git add .
git commit -m "feat: integrate frontend dashboard with backend API

- Add bounty search API endpoint
- Add user profile API endpoint
- Connect React frontend to backend
- Add production frontend serving
- Update documentation"

git push origin main
```

### **Step 4: Deploy to Production VM**

**SSH to your server:**
```bash
ssh stefanhrmail@34.32.66.109
```

**On the server:**
```bash
# Navigate to app
cd ~/apps/gitwork

# Pull latest code
git pull origin main

# Install and build frontend
cd gitwork-front
npm install
npm run build

# Verify build
ls dist/  # Should show index.html, assets/, etc.

# Go back to root
cd ..

# Update .env on server (IMPORTANT!)
nano .env
# Make sure it has:
# AUTH_CALLBACK_URL=https://gitwork.io/auth/github/callback
# CLAIM_BASE_URL=https://gitwork.io
# NODE_ENV=production

# Restart the app
export NODE_ENV=production
pm2 restart gitwork

# Check logs
pm2 logs gitwork --lines 50
```

### **Step 5: Verify Deployment**

**Test these URLs:**

1. **Homepage:**
   - Visit: https://gitwork.io
   - Should show: GitWork landing page with search

2. **About Page:**
   - Visit: https://gitwork.io/about
   - Should show: Feature overview, how it works

3. **API Endpoints:**
   - Test: https://gitwork.io/api/bounties/search
   - Should return: JSON with bounties

4. **Profile Page:**
   - Visit: https://gitwork.io/profile
   - Click "Login with GitHub"
   - Should redirect to GitHub OAuth
   - After login, should show your profile

5. **Search Functionality:**
   - On homepage, press Enter (empty search)
   - Should show: All bounties from database
   - Type "stefisha" and search
   - Should show: Only your repos

---

## 🐛 Troubleshooting

### **Issue: Frontend shows blank page**
**Solution:**
```bash
# On server
cd ~/apps/gitwork/gitwork-front
rm -rf dist node_modules
npm install
npm run build
pm2 restart gitwork
```

### **Issue: GitHub OAuth fails**
**Check:**
1. `.env` has `AUTH_CALLBACK_URL=https://gitwork.io/auth/github/callback`
2. GitHub App settings has callback URL: `https://gitwork.io/auth/github/callback`
3. `NODE_ENV=production` is set

### **Issue: API returns 404**
**Check:**
```bash
pm2 logs gitwork
# Look for errors about routes
```

### **Issue: Search returns no results**
**Reason:** No bounties with status `deposit_confirmed`, `ready_to_claim`, or `claimed`

**Solution:** Create a test bounty and deposit funds, or simulate deposit:
```bash
node src/scripts/simulate-deposit.js <wallet-address> <amount>
```

---

## 📊 Expected Results

After deployment, you should have:

✅ **Landing Page** - Beautiful homepage at https://gitwork.io
✅ **Search** - Works with all bounties or filtered
✅ **Profile** - GitHub login working, shows earnings
✅ **About** - Full feature showcase
✅ **API** - All endpoints responding

---

## 🎯 Post-Deployment Checklist

- [ ] Homepage loads at https://gitwork.io
- [ ] Search returns bounties (or empty if none deposited)
- [ ] About page displays correctly
- [ ] GitHub OAuth redirects work
- [ ] Profile shows after login
- [ ] No errors in `pm2 logs gitwork`
- [ ] Frontend assets load (check browser console)
- [ ] Mobile responsive (test on phone)

---

## ⚡ Quick Deploy Command

**All-in-one deployment on server:**
```bash
cd ~/apps/gitwork && \
git pull origin main && \
cd gitwork-front && npm install && npm run build && cd .. && \
export NODE_ENV=production && \
pm2 restart gitwork && \
pm2 logs gitwork --lines 30
```

---

**Ready to deploy! 🚀**

