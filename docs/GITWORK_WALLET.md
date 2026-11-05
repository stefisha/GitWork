# GitWork Wallet System

## Overview

The GitWork Wallet is a **balance system** where contributors can accumulate their bounty earnings in a single Privy-managed wallet associated with their GitHub account. Instead of providing a Solana wallet address for each bounty claim, users can choose to keep their earnings in their GitWork Wallet and withdraw them whenever they want.

## Key Features

✅ **One Wallet Per User** - Each GitHub user gets one persistent Privy wallet  
✅ **Flexible Claiming** - Choose to claim directly or keep in GitWork Wallet  
✅ **Cumulative Balance** - Track USDC and SOL balances separately  
✅ **Withdraw Anytime** - Transfer funds to personal wallet whenever needed  
✅ **Earnings History** - See all bounties earned, both claimed and in wallet  
✅ **Future: Fiat Withdrawals** - Planned for Q2 2025  

---

## How It Works

### For Contributors

#### 1. **Earn a Bounty**

When a PR is merged, the contributor gets a claim link in the GitHub issue comment.

#### 2. **Claim Options**

When clicking the claim link, contributors see two options:

```
🎉 Congratulations! You've earned 50 USDC!

Choose what to do with your reward:

[💸 Claim Now]  [🔒 Keep in GitWork Wallet]
```

**Option A: Claim Now** (Direct)
- Enter Solana wallet address
- Funds transferred immediately
- Transaction recorded

**Option B: Keep in GitWork Wallet**
- Funds added to GitWork balance
- No wallet address needed
- Can withdraw later

#### 3. **View Profile**

On the profile page, contributors see:

```
💰 GitWork Wallet

Total Balance:
  125.50 USDC | 0.5 SOL

[💸 Withdraw Funds]

Earnings History:
✅ repo/name #42 - 50 USDC (claimed)
🔒 repo/name #38 - 50 USDC (in wallet)
🔒 repo/name #27 - 25.50 USDC (in wallet)
```

#### 4. **Withdraw**

Click "Withdraw Funds":
- Select currency (USDC or SOL)
- Enter Solana wallet address
- Confirm withdrawal
- Funds transferred immediately

---

## Technical Implementation

### Database Schema

#### New Table: `user_wallets`

```sql
CREATE TABLE user_wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_user_id INTEGER NOT NULL UNIQUE,
  github_username TEXT NOT NULL,
  privy_wallet_address TEXT NOT NULL UNIQUE,
  privy_wallet_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Why GitHub User ID (not username)?**
- GitHub ID is **stable** and **never changes**
- GitHub username can be changed by the user
- Using ID ensures wallet persistence even if username changes

#### Updated Table: `bounties`

```sql
ALTER TABLE bounties 
ADD COLUMN claim_type TEXT DEFAULT NULL;

ALTER TABLE bounties 
ADD COLUMN claimed_by_github_id INTEGER DEFAULT NULL;
```

**claim_type values:**
- `NULL` - Not claimed yet
- `'direct'` - Claimed directly to user's personal wallet
- `'wallet'` - Claimed to GitWork Wallet

---

### Backend API Endpoints

#### `GET /api/wallet/me`

Get current user's GitWork wallet with balance and earnings.

**Response:**
```json
{
  "wallet": {
    "address": "ABC...XYZ",
    "githubUsername": "stefisha",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "balance": {
    "usdc": 125.50,
    "sol": 0.5,
    "total": 125.50
  },
  "earnings": [
    {
      "id": 1,
      "repoOwner": "stefisha",
      "repoName": "test-OSS",
      "issueNumber": 42,
      "issueTitle": "Add dark mode",
      "amount": 50,
      "currency": "USDC",
      "claimType": "wallet",
      "claimedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

#### `GET /api/wallet/balance`

Get just the balance (faster).

**Response:**
```json
{
  "usdc": 125.50,
  "sol": 0.5,
  "total": 125.50,
  "hasWallet": true
}
```

#### `GET /api/wallet/earnings`

Get earnings history only.

**Response:**
```json
{
  "earnings": [...]
}
```

#### `POST /api/wallet/withdraw`

Withdraw funds from GitWork Wallet to personal wallet.

**Request Body:**
```json
{
  "recipientAddress": "ABC...XYZ",
  "currency": "USDC",
  "amount": 50  // Optional - withdraws all if not specified
}
```

**Response:**
```json
{
  "success": true,
  "transactionSignature": "tx_abc123...",
  "amount": 50,
  "currency": "USDC",
  "recipientAddress": "ABC...XYZ"
}
```

---

### Updated Claim Flow

#### `POST /api/claim/:bountyId`

**Updated Request Body:**
```json
{
  "claimType": "wallet",  // or "direct"
  "walletAddress": "ABC...XYZ"  // Required only for "direct"
}
```

**Behavior:**

**If `claimType === 'wallet'`:**
1. Get or create user's GitWork wallet
2. Transfer bounty to GitWork wallet
3. Mark bounty as claimed with `claim_type = 'wallet'`
4. Store `claimed_by_github_id`

**If `claimType === 'direct'`:**
1. Require `walletAddress` parameter
2. Transfer bounty directly to provided address
3. Mark bounty as claimed with `claim_type = 'direct'`
4. Store `claimed_by_github_id`

---

### Frontend Components

#### `ProfilePage.jsx`

**Updated Features:**
- GitWork Wallet balance card (gradient purple design)
- Earnings history with claim type badges
- Withdraw modal with currency selection
- Real-time balance updates

#### `AboutPage.jsx`

**Updated Features:**
- "Coming Soon" section featuring:
  - **Fiat Withdrawals** (Q2 2025) - highlighted with purple border
  - Mobile App (Future)
  - Reputation System (Future)

---

## User Experience

### Scenario 1: First-Time Contributor

1. Completes bounty, gets claim link
2. Clicks "Keep in GitWork Wallet" (easier, no wallet needed)
3. Funds added to GitWork balance
4. Can withdraw later when they set up a Solana wallet

**Benefit:** Lower barrier to entry - don't need Solana wallet immediately

### Scenario 2: Regular Contributor

1. Earns multiple bounties
2. Keeps all in GitWork Wallet
3. Accumulates balance: 500 USDC
4. Withdraws once to save on transaction overhead

**Benefit:** Batch withdrawals, easier tracking

### Scenario 3: Advanced User

1. Already has Solana wallet
2. Chooses "Claim Now" for immediate access
3. Funds go directly to personal wallet
4. Can use DeFi, trade, etc. immediately

**Benefit:** Maximum flexibility

---

## Future: Fiat Withdrawals (Q2 2025)

### Planned Features

```
💵 Withdraw to Bank Account

Choose withdrawal method:
○ Solana Wallet (Instant, 0 fees)
● Bank Transfer (1-3 days, 2% fee)

Amount: 125.50 USDC → $125.50 USD

Bank Details:
  Account: *****1234
  Routing: *****5678

[Confirm Withdrawal]
```

### Integration Options

1. **Stripe Connect** - Direct bank transfers
2. **Circle** - USDC → fiat on/off ramp
3. **Wise** - International transfers
4. **PayPal** - Instant fiat withdrawals

### User Benefits

- No need to learn crypto
- Direct USD/EUR to bank account
- Lower friction for non-crypto users
- Expands addressable market

---

## Security Considerations

### GitHub ID as Primary Key

✅ **Stable identifier** - Never changes  
✅ **Unique per user** - No collisions  
✅ **Automatically available** - From OAuth session  

### Wallet Management

- Each user gets **one Privy wallet**
- Wallet is **non-custodial** (user owns keys via Privy)
- Funds are **secured by Privy's infrastructure**
- Transactions require **GitHub authentication**

### Withdrawal Safety

- Wallet address validation
- Confirmation required before withdrawal
- Clear warnings about irreversibility
- Transaction logs for audit trail

---

## Database Queries

### Get User Wallet Balance

```javascript
import { getWalletBalance } from './services/user-wallet.js';

const wallet = getUserWallet(githubUserId);
const balance = await getWalletBalance(wallet.walletAddress);

// balance: { usdc: 125.50, sol: 0.5, total: 125.50 }
```

### Get Earnings History

```javascript
import { getUserEarnings } from './services/user-wallet.js';

const earnings = getUserEarnings(githubUserId);

// Returns all bounties claimed by this user
// Includes: amount, currency, claimType, repoInfo, issueInfo
```

### Get or Create Wallet

```javascript
import { getOrCreateUserWallet } from './services/user-wallet.js';

const wallet = await getOrCreateUserWallet(githubUserId, githubUsername);

// Creates new wallet if doesn't exist
// Returns existing wallet if already created
// Updates username if it changed
```

---

## Migration Path

### Deployment Steps

1. **Run Migration:**
```bash
# Migration runs automatically on server start
# Creates user_wallets table
# Adds claim_type and claimed_by_github_id columns to bounties
```

2. **Restart Server:**
```bash
pm2 restart gitwork
```

3. **Test:**
```bash
# Test wallet creation
curl -X GET https://gitwork.io/api/wallet/me \
  --cookie "session=..."

# Test claim with wallet
curl -X POST https://gitwork.io/api/claim/1 \
  -H "Content-Type: application/json" \
  -d '{"claimType":"wallet"}' \
  --cookie "session=..."
```

---

## Code Locations

### Backend
- **Migration:** `src/db/migrations/004_user_wallets.js`
- **Service:** `src/services/user-wallet.js`
- **API Routes:** `src/routes/api-wallet.js`
- **Updated Claim:** `src/routes/api-claim.js`
- **Main App:** `src/index.js` (registers `/api/wallet` routes)

### Frontend
- **Profile Page:** `gitwork-front/src/pages/ProfilePage.jsx`
- **About Page:** `gitwork-front/src/pages/AboutPage.jsx` (fiat mention)

---

## Testing Checklist

- [ ] Migration runs successfully
- [ ] User wallet is created on first claim with `claimType: 'wallet'`
- [ ] Balance shows correctly on profile page
- [ ] Earnings history displays all bounties
- [ ] Withdrawal works for USDC
- [ ] Withdrawal works for SOL
- [ ] Direct claim still works with `claimType: 'direct'`
- [ ] Username updates if GitHub username changes
- [ ] Multiple bounties accumulate in same wallet
- [ ] Transaction signatures recorded correctly

---

## Future Enhancements

### Phase 1: Core Wallet (✅ Implemented)
- One wallet per user
- Balance tracking
- Withdraw to Solana wallet
- Earnings history

### Phase 2: Fiat Withdrawals (Q2 2025)
- Bank account withdrawals
- Multiple fiat currencies (USD, EUR, GBP)
- Integration with payment providers
- KYC/AML compliance

### Phase 3: Advanced Features (Future)
- Multi-currency support (more tokens)
- Staking rewards
- Referral bonuses
- Tipping other developers
- Subscription payments

---

## Support

For issues or questions:
- **Email:** support@gitwork.io
- **Discord:** https://discord.gg/VWkGRHj3Cj
- **GitHub:** https://github.com/stefisha/Octavian

---

**GitWork Wallet - Making open source development rewarding, one bounty at a time! 🚀**

