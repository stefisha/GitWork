# 🧪 Mainnet Testing Guide

## ✅ Services Running

- ✅ **GitWork Server:** http://localhost:3000
- ✅ **Webhook Proxy:** smee.io → localhost:3000
- ✅ **Network:** Solana Mainnet-Beta
- ✅ **Fee Payer:** 0.1 SOL (~20,000 transactions)

---

## 🚀 Test Flow (Step-by-Step)

### Step 1: Create a Test Bounty

1. Go to your GitHub test repository
2. Create a **new issue**
3. Add label: `Octavian:USDC:0.5` (or smaller amount)
4. **Watch the logs** - bot will comment with escrow wallet address

### Step 2: Fund the Bounty (REAL USDC!)

1. Bot will comment with Solana wallet address
2. Send **0.5 USDC** from your wallet to that address
3. **IMPORTANT:** This is REAL USDC on mainnet!
4. Wait ~30 seconds for deposit confirmation
5. Bot will post confirmation comment

### Step 3: Resolve the Issue

1. Create a branch and make a small change
2. Create a PR with title/description: `"Fixes #[issue-number]"` or `"Fixing #[issue-number]"`
3. Bot will comment on the issue about the PR
4. **Merge the PR**
5. Bot will post claim link

### Step 4: Claim the Bounty

1. Click the claim link from bot comment
2. Login with GitHub
3. Enter your Solana wallet address (where you want to receive USDC)
4. Click "Claim Bounty"
5. **Receive REAL USDC instantly!** 💰

---

## 🔍 What to Watch For

### In the Server Logs:
```
🏷️  Issue #XX labeled with: octavian:usdc:0.5
💰 Bounty label detected on issue #XX
📬 Creating Privy embedded wallet for bounty...
✅ Privy Solana wallet created: [ADDRESS]
📬 Escrow wallet created: [ADDRESS]
```

### After Funding:
```
✅ Deposit confirmed for bounty X (Issue #XX)
💬 Posted deposit confirmation comment on issue #XX
```

### After PR Merge:
```
🎉 PR #XX merged by [username]
✅ Claim notification posted on issue #XX
```

### During Claim:
```
💰 Processing claim for bounty X by @[username]
💸 Transferring 0.5 USDC from [escrow] to [recipient]
💰 Fee payer SOL balance: 0.1 SOL
✅ Sponsored USDC transfer successful: [TX_SIGNATURE]
```

---

## 💰 Cost Breakdown

**For 0.5 USDC Bounty:**
- Bounty amount: **0.5 USDC** (repo owner pays)
- Transaction fee: **~0.000005 SOL** (~$0.0005 USD, from fee payer)
- **Total cost to you:** 0.5 USDC + ~$0.0005 for gas

**Fee Payer Status:**
- Current balance: **0.1 SOL**
- Cost per transaction: **0.000005 SOL**
- Remaining capacity: **~20,000 bounties**

---

## 🔗 Monitor Transactions

### Fee Payer Wallet
**Address:** `DJGSnuhwRJ7yTVFc6eUu8YRWFx4sRHSvAg1VBtP8VURq`

**Explorer:**
- https://explorer.solana.com/address/DJGSnuhwRJ7yTVFc6eUu8YRWFx4sRHSvAg1VBtP8VURq
- https://solscan.io/account/DJGSnuhwRJ7yTVFc6eUu8YRWFx4sRHSvAg1VBtP8VURq

### Your Escrow Wallets
Check the bot comments for each bounty's unique escrow address, then monitor on:
- https://explorer.solana.com/
- https://solscan.io/

---

## ⚠️ Important Reminders

### Before You Start:
- [ ] You have real USDC to test with
- [ ] You're ready to send real money
- [ ] You understand this is mainnet (not testnet)
- [ ] You've backed up your database

### During Testing:
- ✅ Start with small amounts (0.5 USDC or less)
- ✅ Monitor each step in the logs
- ✅ Check Solana Explorer for all transactions
- ✅ Save transaction signatures from comments

### Safety:
- 🔒 Real money is involved
- 🔒 Transactions are irreversible
- 🔒 Double-check wallet addresses
- 🔒 Monitor fee payer balance

---

## 🐛 Troubleshooting

### Bot Doesn't Comment
- Check server logs for errors
- Verify smee.io is forwarding webhooks
- Check GitHub App permissions

### Deposit Not Confirmed
- Wait up to 60 seconds (monitor runs every 30s)
- Check transaction on Solana Explorer
- Verify you sent to correct address
- Verify it's USDC (not SOL or other token)

### Claim Fails
- Check fee payer SOL balance in logs
- Verify recipient wallet address is valid
- Check server logs for detailed error
- Ensure escrow wallet has USDC

### Low Fee Payer Balance
If you see: `🚨 WARNING: Fee payer SOL balance is LOW`
- Send more SOL to: `DJGSnuhwRJ7yTVFc6eUu8YRWFx4sRHSvAg1VBtP8VURq`

---

## 📊 Database Check

To see all bounties:
```bash
node -e "import('./src/db/database.js').then(db => { const bounties = db.default.prepare('SELECT * FROM bounties').all(); console.table(bounties); })"
```

---

## 🎯 Success Checklist

After your test, verify:
- [ ] Issue created with bounty label
- [ ] Bot posted escrow wallet address
- [ ] Deposit sent and confirmed
- [ ] Bot posted confirmation comment
- [ ] PR created and merged
- [ ] Bot posted claim link on issue
- [ ] Bot posted notification on PR
- [ ] Claim page loaded successfully
- [ ] OAuth login worked
- [ ] USDC transferred to recipient wallet
- [ ] Transaction visible on Solana Explorer
- [ ] Bot posted final completion comment

---

## 📞 Need Help?

Check logs in real-time:
- Server logs show detailed operation info
- Look for ❌ or 🚨 for errors
- Check smee.io for webhook delivery

---

**Good luck with your mainnet test! 🚀**

*Remember: This is REAL money. Start small and monitor closely!*

