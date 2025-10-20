# GitWork Quick Start

Get GitWork up and running in 5 minutes!

## 1. Install

```bash
npm install
```

## 2. Setup Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env - for now, just set a webhook secret
# You'll fill in the GitHub App details after creating it
```

In `.env`, at minimum set:
```env
GITHUB_WEBHOOK_SECRET=your_random_secret_here
```

## 3. Initialize Database

```bash
npm run db:migrate
```

## 4. Start Server

```bash
npm start
```

## 5. Expose with ngrok (for testing)

In a new terminal:
```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## 6. Create GitHub App

1. Go to: https://github.com/settings/apps/new
2. Fill in:
   - **Name**: `Octavian-YourName` (must be unique)
   - **Webhook URL**: `https://abc123.ngrok.io/api/webhooks/github` (your ngrok URL)
   - **Webhook Secret**: Same value as in your `.env`
   
3. Permissions:
   - Issues: **Read & Write**
   - Pull requests: **Read & Write**
   
4. Events:
   - ✅ Issues
   - ✅ Pull request
   - ✅ Label

5. Click **Create GitHub App**

6. Download private key, save as `private-key.pem`

7. Copy App ID to `.env`:
   ```env
   GITHUB_APP_ID=123456
   ```

8. Restart your server:
   ```bash
   npm start
   ```

## 7. Install & Test

1. Install the app on a test repository
2. Create an issue
3. Add label: `Octavian:USDC:50`
4. Watch the bot comment with deposit instructions! 🎉

## What Happens Next?

1. **Bot comments** with escrow wallet address
2. **Deposit monitor** checks for funds every 30 seconds
3. When deposit confirmed, **bot comments** again
4. When PR merged, **bot notifies** contributor to claim

## Test Without Real GitHub

```bash
node src/scripts/test-webhook.js
```

## Check Wallet Balance

```bash
node src/scripts/check-balance.js <wallet_address>
```

## View Database

```bash
sqlite3 data/gitwork.db "SELECT * FROM bounties;"
```

## Troubleshooting

**Webhooks not working?**
- Check ngrok is running
- Verify webhook URL in GitHub App settings
- Check server logs

**Database errors?**
```bash
rm data/gitwork.db
npm run db:migrate
```

**Need help?**
See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## Next Steps

Once this works, you can:
- Build the claim dashboard (contributor flow)
- Deploy to production
- Switch to mainnet for real transactions

---

**You're all set!** 🚀 Start turning GitHub issues into bounties!

