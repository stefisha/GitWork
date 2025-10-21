# Repo Owner Flow - Complete Guide

This document provides a detailed walkthrough of the repo owner flow in GitWork.

## Overview

The repo owner flow allows repository maintainers to create bounties on GitHub issues simply by adding a special label. GitWork handles the rest automatically.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     REPO OWNER FLOW                              │
└─────────────────────────────────────────────────────────────────┘

Step 1: Install Octavian Bot
┌──────────────────┐
│ GitHub Settings  │
│ Install App      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Installation     │◀─── Webhook: installation.created
│ Recorded in DB   │
└──────────────────┘


Step 2: Create Issue with Bounty Label
┌──────────────────┐
│ Create GitHub    │
│ Issue            │
│ Title: "Add      │
│  dark mode"      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Add Label:       │
│ Octavian:USDC:50 │◀─── Webhook: issues.labeled
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GitWork Processing               │
│                                  │
│ 1. Parse label                   │
│    - Currency: USDC              │
│    - Amount: 50                  │
│                                  │
│ 2. Create Solana wallet          │
│    - Generate keypair            │
│    - Public key: 7Np8E...xyz     │
│    - Private key: encrypted      │
│                                  │
│ 3. Save to database              │
│    INSERT INTO bounties...       │
│    status = 'pending_deposit'    │
│                                  │
│ 4. Post GitHub comment           │
│    "Deposit 50 USDC to..."       │
└──────────────────────────────────┘


Step 3: Repo Owner Deposits Funds
┌──────────────────┐
│ Repo Owner sees  │
│ bot comment with │
│ wallet address   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Send 50 USDC to: │
│ 7Np8E...xyz      │
│ (via Phantom,    │
│  Solflare, etc)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Solana Blockchain                │
│ Transaction confirmed            │
│ USDC transferred to escrow       │
└──────────────────────────────────┘


Step 4: Deposit Monitor Detects Funds
┌──────────────────┐
│ Background       │
│ Service          │
│ (every 30s)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Check Balance Loop               │
│                                  │
│ FOR each pending bounty:         │
│   balance = checkUSDCBalance()   │
│   IF balance >= expected:        │
│     ✅ Deposit confirmed!        │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Update Database                  │
│                                  │
│ UPDATE bounties                  │
│ SET status = 'deposit_confirmed' │
│ SET deposit_confirmed_at = NOW() │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Post Confirmation│
│ Comment on Issue │
│ "✅ Bounty       │
│  Active!"        │
└──────────────────┘


Step 5: Issue is Now Open for Contributors
┌──────────────────────────────────┐
│ GitHub Issue                     │
│ ✅ Has bounty: 50 USDC           │
│ ✅ Funds in escrow               │
│ ✅ Ready for contributors        │
└──────────────────────────────────┘
```

## What Gets Created

### 1. Database Record

```sql
INSERT INTO bounties (
  github_issue_id,
  github_repo_owner,
  github_repo_name,
  github_issue_number,
  bounty_amount,
  currency,
  escrow_wallet_address,
  escrow_wallet_private_key,
  status
) VALUES (
  123456,
  'myusername',
  'myrepo',
  42,
  50.0,
  'USDC',
  '7Np8E...xyz',
  'encrypted_key',
  'pending_deposit'
);
```

### 2. Solana Wallet

- **Public Key**: Given to repo owner for deposit
- **Private Key**: Stored securely, used later for payout
- **Type**: Standard Solana keypair (Ed25519)
- **Purpose**: Escrow for this specific bounty

### 3. GitHub Comments

**First Comment (Deposit Request):**
```markdown
## 🎯 Bounty Created!

Thank you for creating a bounty on this issue!

**Bounty Amount:** 50 USDC
**Status:** ⏳ Awaiting deposit

### Next Steps:

To activate this bounty, please deposit **50 USDC** to the following escrow wallet:

```
7Np8E2rC3VKf9Up...
```

Once the deposit is confirmed, this bounty will be live and available for contributors to claim!

---
*Powered by [GitWork](https://gitwork.dev) 🚀*
```

**Second Comment (Confirmation):**
```markdown
## ✅ Bounty Active!

The bounty of **50 USDC** has been deposited and is now in escrow!

### For Contributors:

This issue is now available to work on. The bounty will be automatically released when:
1. A pull request that closes this issue is merged
2. The contributor claims their reward via the GitWork dashboard

### How to Claim:

Once your PR is merged, you'll receive a notification with instructions to claim your 50 USDC!

---
*Powered by [GitWork](https://gitwork.dev) 🚀*
```

## Activity Log

Every action is logged:

```sql
INSERT INTO activity_log (bounty_id, event_type, event_data)
VALUES (1, 'bounty_created', '{"amount": 50, "currency": "USDC"}');

INSERT INTO activity_log (bounty_id, event_type, event_data)
VALUES (1, 'deposit_requested', '{"installationId": 12345}');

INSERT INTO activity_log (bounty_id, event_type, event_data)
VALUES (1, 'status_changed', '{"status": "deposit_confirmed"}');
```

## Status Transitions

```
pending_deposit
    │
    │ [Deposit detected by monitor]
    ▼
deposit_confirmed
    │
    │ [PR merged - contributor flow]
    ▼
ready_to_claim
    │
    │ [Contributor claims - future]
    ▼
claimed

Alternative path:
pending_deposit
    │
    │ [Label removed before deposit]
    ▼
cancelled
```

## Webhook Events

### Installation Event

**Trigger**: App installed on account/repo

**Payload:**
```json
{
  "action": "created",
  "installation": {
    "id": 12345,
    "account": {
      "login": "username",
      "type": "User"
    }
  }
}
```

**Action**: Record installation in database

### Issues Labeled Event

**Trigger**: Label added to issue

**Payload:**
```json
{
  "action": "labeled",
  "issue": {
    "id": 123456,
    "number": 42,
    "title": "Add dark mode",
    "labels": [
      { "name": "Octavian:USDC:50" },
      { "name": "enhancement" }
    ]
  },
  "label": {
    "name": "Octavian:USDC:50"
  },
  "repository": {
    "owner": { "login": "username" },
    "name": "repo"
  },
  "installation": {
    "id": 12345
  }
}
```

**Action**: 
1. Parse label
2. Create bounty
3. Post comment

### Issues Unlabeled Event

**Trigger**: Label removed from issue

**Action**: 
- If status is `pending_deposit`: Cancel bounty
- Otherwise: No action (can't cancel after deposit)

## Security & Safety

### What Repo Owners Need to Know

1. **Funds are Safe**: 
   - Escrow wallet is unique per bounty
   - Private key stored securely
   - Only transferred when PR merged

2. **No Reversal** (currently):
   - Once deposited, funds can only go to contributor
   - Cancellation only works before deposit
   - Future: Add refund mechanism

3. **Verification**:
   - Bot verifies deposit amount
   - Only processes merged PRs
   - Links PR to issue via GitHub syntax

4. **Costs**:
   - Solana transaction fees (~$0.00001)
   - No GitWork fees (currently)
   - USDC transfer costs minimal SOL for gas

## Troubleshooting

### Bot Doesn't Comment

**Possible Causes:**
- Webhook not delivered (check GitHub App settings)
- Label format incorrect (must be exact: `Octavian:USDC:50`)
- Bot permissions insufficient (needs Issues: Write)
- Server error (check logs)

**Solution:**
- Check webhook deliveries in GitHub App settings
- Re-deliver webhook manually
- Verify label format
- Check server logs

### Deposit Not Detected

**Possible Causes:**
- Sent wrong amount
- Sent to wrong address
- Sent wrong token (SOL instead of USDC)
- Monitor service not running

**Solution:**
```bash
# Check wallet balance manually
node src/scripts/check-balance.js <wallet_address>

# Check database status
sqlite3 data/gitwork.db "SELECT * FROM bounties WHERE status='pending_deposit';"

# Restart deposit monitor
pm2 restart gitwork
```

### Wrong Amount Deposited

**Current Behavior:**
- More than required: Bounty activates, extra funds stay in escrow
- Less than required: Bounty doesn't activate

**Future Enhancement:**
- Partial refunds
- Adjust bounty amount to match deposit

## Testing Checklist

- [ ] Install GitHub App on test repo
- [ ] Create issue
- [ ] Add bounty label with correct format
- [ ] Verify bot posts deposit comment
- [ ] Check database record created
- [ ] Note escrow wallet address
- [ ] Send test USDC (devnet)
- [ ] Wait for deposit monitor (30s)
- [ ] Verify confirmation comment
- [ ] Check database status updated
- [ ] Verify activity log entries

## Monitoring

### What to Track

1. **Bounty Creation Rate**
   ```sql
   SELECT COUNT(*) FROM bounties 
   WHERE DATE(created_at) = DATE('now');
   ```

2. **Pending Deposits**
   ```sql
   SELECT COUNT(*) FROM bounties 
   WHERE status = 'pending_deposit';
   ```

3. **Active Bounties**
   ```sql
   SELECT COUNT(*) FROM bounties 
   WHERE status = 'deposit_confirmed';
   ```

4. **Total Value Escrowed**
   ```sql
   SELECT SUM(bounty_amount) FROM bounties 
   WHERE status IN ('deposit_confirmed', 'ready_to_claim');
   ```

5. **Average Time to Deposit**
   ```sql
   SELECT AVG(
     JULIANDAY(deposit_confirmed_at) - JULIANDAY(created_at)
   ) * 24 as hours_avg
   FROM bounties 
   WHERE deposit_confirmed_at IS NOT NULL;
   ```

## Best Practices for Repo Owners

### 1. Clear Issue Descriptions

```markdown
# Issue Title: Implement Dark Mode Toggle

## Description
Add a dark mode toggle to the settings page...

## Requirements
- [ ] Toggle button in settings
- [ ] Persist preference
- [ ] Apply theme globally

## Bounty
💰 50 USDC - See label for details
```

### 2. Appropriate Bounty Amounts

- **Simple bugs**: 10-25 USDC
- **Features**: 50-200 USDC
- **Complex features**: 200-500 USDC
- **Critical fixes**: 500+ USDC

### 3. Label Consistently

Use additional labels:
- `Octavian:USDC:50`
- `good first issue` (for newcomers)
- `help wanted`
- `bug` or `enhancement`

### 4. Communication

- Respond to questions on bounty issues
- Clarify requirements before work starts
- Review PRs promptly
- Be respectful to contributors

## Next: Contributor Flow

Once the repo owner flow is working, the next phase is:

1. **Dashboard**: Web app for claiming
2. **Authentication**: GitHub OAuth
3. **Payment**: Transfer from escrow to contributor
4. **Notifications**: Email/webhook when claimable

See `CONTRIBUTOR_FLOW.md` (to be created)

---

**Repo Owner Flow Complete!** ✅

Your bounties are now managed automatically on the Solana blockchain.

