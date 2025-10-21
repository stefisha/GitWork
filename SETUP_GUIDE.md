# GitWork Setup Guide

This guide will walk you through setting up GitWork for the **repo owner flow** on Solana blockchain.

## Prerequisites

- Node.js 18 or higher
- A GitHub account
- Access to Solana devnet (for testing) or mainnet (for production)
- ngrok or similar tunneling service (for local development)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration. For now, we'll focus on the essentials:

```env
PORT=3000
NODE_ENV=development

# These will be filled in after creating the GitHub App
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
GITHUB_WEBHOOK_SECRET=

# Solana Configuration (using devnet for testing)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# USDC Mint Address (Devnet USDC)
USDC_MINT_ADDRESS=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Claim URL (will be your ngrok URL or production domain)
CLAIM_BASE_URL=http://localhost:3000
```

## Step 3: Initialize Database

Run the database migrations:

```bash
npm run db:migrate
```

This creates a SQLite database at `data/gitwork.db` with the necessary tables.

## Step 4: Create a GitHub App

1. Go to https://github.com/settings/apps
2. Click **"New GitHub App"**
3. Fill in the details:

   **Basic Information:**
   - **GitHub App name**: `Octavian` (or any unique name)
   - **Homepage URL**: `https://gitwork.dev` (or your domain)
   - **Webhook URL**: For local testing, use ngrok (see Step 5)
     - Example: `https://abc123.ngrok.io/api/webhooks/github`
   - **Webhook secret**: Generate a random string (e.g., `openssl rand -hex 32`)
     - Save this in your `.env` as `GITHUB_WEBHOOK_SECRET`

   **Permissions:**
   - Repository permissions:
     - **Issues**: Read & Write
     - **Pull requests**: Read & Write
     - **Metadata**: Read-only
   
   **Subscribe to events:**
   - ✅ Issues
   - ✅ Issue comment
   - ✅ Label
   - ✅ Pull request

4. Click **"Create GitHub App"**

5. After creation:
   - Note your **App ID** and add it to `.env` as `GITHUB_APP_ID`
   - Click **"Generate a private key"** button
   - Save the downloaded `.pem` file as `private-key.pem` in your project root

## Step 5: Expose Local Server (Development Only)

For local development, you need to expose your server to the internet so GitHub can send webhooks.

### Using ngrok:

```bash
# Install ngrok if you haven't already
# Download from https://ngrok.com/download

# Start your GitWork server
npm start

# In another terminal, start ngrok
ngrok http 3000
```

ngrok will give you a URL like `https://abc123.ngrok.io`. Use this as your webhook URL in the GitHub App settings.

**Update your webhook URL:**
1. Go back to your GitHub App settings
2. Update the **Webhook URL** to `https://abc123.ngrok.io/api/webhooks/github`
3. Save changes

## Step 6: Install the GitHub App on a Repository

1. Go to your GitHub App's page
2. Click **"Install App"** in the left sidebar
3. Choose an account (your personal account or an organization)
4. Select which repositories to install it on:
   - You can select "All repositories" or choose specific repos
5. Click **"Install"**

## Step 7: Start the Server

```bash
npm start
```

You should see:
```
🚀 Starting GitWork...
📊 Initializing database...
Running database migrations...
✅ All migrations completed successfully!
✅ GitWork API running on port 3000
📡 Webhook endpoint: http://localhost:3000/api/webhooks/github
🔍 Health check: http://localhost:3000/api/webhooks/health
🔍 Starting deposit monitor...
✅ Deposit monitor started (checking every 30s)
```

## Step 8: Test the Repo Owner Flow

Now let's test the complete flow!

### 8.1 Create an Issue with Bounty Label

1. Go to one of your GitHub repositories where you installed the app
2. Create a new issue:
   - **Title**: "Add dark mode support"
   - **Description**: "We need a dark mode toggle"
3. Add a label with the exact format: `Octavian:USDC:50`
   - This means: 50 USDC bounty
   - You can create this label if it doesn't exist

### 8.2 Octavian Bot Comments

Within seconds, the Octavian bot should post a comment on the issue with:
- Bounty amount confirmation
- Escrow wallet address where funds should be deposited
- Instructions for next steps

### 8.3 Deposit Funds to Escrow Wallet

**For testing on devnet:**

You can get devnet USDC from a faucet or airdrop. The wallet address will be in the bot's comment.

```bash
# Check the wallet balance
node src/scripts/check-balance.js <WALLET_ADDRESS_FROM_COMMENT>
```

Transfer the required amount of USDC to the escrow wallet address.

### 8.4 Deposit Confirmation

The deposit monitor runs every 30 seconds. Once it detects the deposit:
- The bounty status updates to `deposit_confirmed`
- Octavian posts another comment confirming the bounty is active

### 8.5 Verify in Database

You can check the database to see the bounty record:

```bash
sqlite3 data/gitwork.db "SELECT * FROM bounties;"
```

## Testing with Mock Webhooks

If you want to test without actually creating GitHub issues, you can use the test script:

```bash
node src/scripts/test-webhook.js
```

This simulates:
1. GitHub App installation
2. Issue labeled with bounty
3. Pull request merged

## Troubleshooting

### Webhooks not received

1. Check that ngrok is running and the URL is correct
2. Verify the webhook secret matches in GitHub App settings and `.env`
3. Check server logs for errors
4. Use the GitHub App's "Advanced" tab to see webhook deliveries and responses

### Database errors

```bash
# Reset the database
rm data/gitwork.db
npm run db:migrate
```

### Solana connection issues

- Make sure you're using the correct RPC URL
- For devnet: `https://api.devnet.solana.com`
- For mainnet: Use a paid RPC provider like QuickNode or Alchemy

### Private key errors

- Make sure `private-key.pem` is in the project root
- Verify the file has the correct permissions
- Check that the path in `.env` is correct

## Next Steps

Once the repo owner flow is working:

1. **Contributor Flow**: Build the dashboard where contributors can claim bounties
2. **Payment System**: Implement automatic transfers from escrow to contributor wallets
3. **Production Deployment**: Deploy to a cloud service (Railway, Render, Heroku, etc.)
4. **Mainnet Migration**: Switch from devnet to mainnet for real transactions

## Architecture Overview

```
┌─────────────────┐
│  GitHub Issue   │
│  with label:    │
│ Octavian:USDC:50│
└────────┬────────┘
         │
         │ Webhook
         ▼
┌─────────────────┐
│  GitWork API    │
│  (Express)      │
└────────┬────────┘
         │
         ├──► Parse Label
         ├──► Create Escrow Wallet (Solana)
         ├──► Save to Database (SQLite)
         └──► Post Comment (GitHub)
         
         
┌─────────────────┐
│ Deposit Monitor │ ──► Check Wallet Balance
│  (Background)   │ ──► Update Status
└─────────────────┘ ──► Post Confirmation
```

## Security Notes

- **Private Keys**: Never commit `private-key.pem` or `.env` to version control
- **Webhook Secret**: Keep this secret and rotate it periodically
- **Escrow Wallets**: Private keys are stored in the database - in production, use encryption
- **Database**: The SQLite database contains sensitive information - secure it appropriately

## Support

For issues or questions:
- Check the logs: The server provides detailed console output
- Database queries: Use `sqlite3 data/gitwork.db` to inspect data
- Test webhooks: Use the test script to simulate events


