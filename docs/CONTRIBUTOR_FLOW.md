# Contributor Flow - Complete Guide

This document provides a detailed walkthrough of the contributor flow in GitWork.

## Overview

The contributor flow allows developers to solve bounty issues, get their PRs merged, and claim their rewards automatically through GitWork.

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONTRIBUTOR FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Step 1: Discover Bounty Issue
┌──────────────────┐
│ Browse GitHub    │
│ Find issue with  │
│ Octavian label   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Issue #42: Add Dark Mode         │
│ 💰 Bounty: 50 USDC              │
│ ✅ Funds in escrow              │
└──────────────────────────────────┘


Step 2: Work on the Issue
┌──────────────────┐
│ Fork repo        │
│ Create branch    │
│ Write code       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Test changes     │
│ Commit code      │
│ Push to fork     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Create Pull Request              │
│ Title: "Add dark mode toggle"   │
│ Description: "Fixes #42"         │◀─── Webhook: pull_request.opened
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GitWork Processing               │
│                                  │
│ 1. Extract issue reference       │
│    - Pattern: "Fixes #42"        │
│    - Also: "Closes #42", "#42"   │
│                                  │
│ 2. Find linked bounty            │
│    SELECT * FROM bounties        │
│    WHERE issue_number = 42       │
│                                  │
│ 3. Post comment on issue         │
│    "PR created, awaiting merge"  │
└──────────────────────────────────┘


Step 3: Code Review & Merge
┌──────────────────┐
│ Maintainer       │
│ reviews PR       │
│ Requests changes │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Contributor      │
│ addresses        │
│ feedback         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Maintainer       │
│ approves &       │
│ merges PR        │◀─── Webhook: pull_request.closed
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GitWork Processing               │
│                                  │
│ 1. Verify PR merged              │
│    IF merged == true:            │
│                                  │
│ 2. Extract issue number          │
│    FROM PR body: "Fixes #42"     │
│                                  │
│ 3. Find bounty                   │
│    WHERE issue_number = 42       │
│    AND status = 'deposit_confirmed' │
│                                  │
│ 4. Update bounty status          │
│    SET status = 'ready_to_claim' │
│    SET contributor = '@username' │
│    SET pull_request_number = 123 │
│                                  │
│ 5. Post claim notification       │
│    - On issue                    │
│    - On PR                       │
│    - With claim link             │
└──────────────────────────────────┘


Step 4: Claim Bounty
┌──────────────────────────────────┐
│ Contributor sees comment:        │
│ "🎉 Bounty Ready to Claim!"     │
│ Link: gitwork.io/claim/42        │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Click claim link │
│ Opens dashboard  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Claim Dashboard                  │
│                                  │
│ Issue: #42 - Add Dark Mode       │
│ Amount: 50 USDC                  │
│ Status: Ready to Claim           │
│                                  │
│ [Login with GitHub] ◀──────────────── GitHub OAuth
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GitHub OAuth Flow                │
│                                  │
│ 1. Redirect to GitHub            │
│ 2. User authorizes GitWork       │
│ 3. Callback with code            │
│ 4. Exchange for access token     │
│ 5. Verify username matches       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Wallet Address Input             │
│                                  │
│ Enter your Solana wallet:        │
│ [____________________________]   │
│                                  │
│ [Claim 50 USDC]                  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GitWork Backend Processing       │
│                                  │
│ 1. Validate request              │
│    - Check user is contributor   │
│    - Check bounty is claimable   │
│    - Validate wallet address     │
│                                  │
│ 2. Transfer funds via Privy      │
│    transferBountyFunds(          │
│      escrowWallet,               │
│      contributorWallet,          │
│      amount,                     │
│      currency                    │
│    )                             │
│                                  │
│ 3. Update database               │
│    SET status = 'claimed'        │
│    SET claimed_at = NOW()        │
│    SET claim_wallet_address      │
│    SET transaction_signature     │
│                                  │
│ 4. Log transaction               │
│    INSERT INTO activity_log...   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Solana Transaction               │
│                                  │
│ From: Escrow Wallet              │
│   7Np8E2rC3VKf9Up...            │
│                                  │
│ To: Contributor Wallet           │
│   9jK2mP5nQ8rT3Lp...            │
│                                  │
│ Amount: 50 USDC                  │
│ Fee Payer: GitWork Fee Wallet    │
│ Status: ✅ Confirmed             │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Success!                         │
│                                  │
│ ✅ Bounty Claimed!               │
│                                  │
│ Transaction:                     │
│ ABC123xyz...                     │
│                                  │
│ [View on Solana Explorer]        │
└──────────────────────────────────┘


Step 5: Issue Closed
┌──────────────────┐
│ Maintainer       │
│ closes issue     │◀─── Webhook: issues.closed
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ GitWork Posts Final Comment      │
│                                  │
│ "🎉 Bounty Successfully         │
│  Completed!"                     │
│                                  │
│ Contributor: @username           │
│ Amount: 50 USDC                  │
│ Transaction: ABC123xyz...        │
└──────────────────────────────────┘
```

## Detailed Steps

### 1. Find a Bounty Issue

**Where to Look:**
- GitHub issues with `Octavian:USDC:XX` or `Octavian:SOL:XX` labels
- Check for `✅ Funds in escrow` comment from GitWork bot
- Read issue requirements carefully

**What to Check:**
- Issue is still open
- Bounty is active (has confirmation comment)
- You understand the requirements
- You can complete the work

### 2. Create a Pull Request

**PR Title Best Practices:**
```
Good: "Add dark mode toggle to settings"
Good: "Fix: Memory leak in data processing"
Bad: "Fixed it"
Bad: "Update"
```

**PR Description MUST Include:**
```markdown
## What this PR does
Adds a dark mode toggle to the settings page.

## Changes
- Added toggle component
- Implemented theme switching
- Persisted user preference

## Testing
- [ ] Tested toggle functionality
- [ ] Verified theme persistence
- [ ] Checked all pages

Fixes #42
```

**Important:** The PR description **must** reference the issue:
- `Fixes #42` ✅
- `Closes #42` ✅
- `Resolves #42` ✅
- `#42` ✅
- Just "#42" anywhere in the title or body works!

### 3. Wait for Merge

**What Happens:**
1. Maintainer reviews your PR
2. You address any feedback
3. Maintainer merges PR
4. GitWork detects the merge
5. Bounty status changes to `ready_to_claim`
6. You receive notification with claim link

**Timeline:**
- Review time: Varies by repo
- Merge detection: Instant (webhook)
- Status update: < 1 second
- Comment posted: < 5 seconds

### 4. Claim Your Bounty

**Click the Claim Link:**
```
https://gitwork.io/claim/42
```

**Login with GitHub:**
- GitWork verifies you are the contributor
- No password needed (OAuth)
- Read-only access to your GitHub profile

**Enter Wallet Address:**
- Use any Solana wallet (Phantom, Solflare, etc.)
- Copy your wallet address
- Paste into the form
- Click "Claim Bounty"

**Supported Wallets:**
- Phantom Wallet
- Solflare
- Backpack
- Any Solana-compatible wallet

### 5. Receive Funds

**Transaction Details:**
- **Speed**: ~5-10 seconds
- **Fees**: Paid by GitWork (not deducted from bounty)
- **Confirmation**: 1 Solana block (~400ms)

**What You Get:**
- Exact bounty amount (no deductions)
- Direct to your wallet
- Instant availability
- Transaction proof on-chain

## Webhook Events

### Pull Request Opened

**Trigger:** PR created that references an issue

**Payload:**
```json
{
  "action": "opened",
  "pull_request": {
    "number": 123,
    "title": "Add dark mode",
    "body": "Fixes #42",
    "user": {
      "login": "contributor"
    },
    "merged": false
  }
}
```

**GitWork Action:**
1. Extract issue number from body (`#42`)
2. Find bounty for issue #42
3. Post comment on issue: "PR created, awaiting merge"

### Pull Request Closed (Merged)

**Trigger:** PR merged by maintainer

**Payload:**
```json
{
  "action": "closed",
  "pull_request": {
    "number": 123,
    "merged": true,
    "user": {
      "login": "contributor"
    },
    "body": "Fixes #42"
  }
}
```

**GitWork Action:**
1. Verify PR was merged (not just closed)
2. Extract issue number
3. Update bounty:
   ```sql
   UPDATE bounties 
   SET status = 'ready_to_claim',
       contributor_github_username = 'contributor',
       pull_request_number = 123
   WHERE github_issue_number = 42
   ```
4. Post claim notification on issue
5. Post claim notification on PR

### Issue Closed

**Trigger:** Issue closed (after bounty claimed)

**GitWork Action:**
Post completion comment:
```markdown
## 🎉 Bounty Successfully Completed!

Congratulations! This bounty has been completed and claimed.

**Contributor:** @contributor
**Amount:** 50 USDC
**Transaction:** [View on Explorer](https://explorer.solana.com/tx/ABC123...)

Thank you for contributing to open source! 💎
```

## Security & Verification

### Authentication

**GitHub OAuth:**
- GitWork uses GitHub OAuth to verify your identity
- Permissions requested:
  - `read:user` - Read your GitHub username
  - No access to private repos
  - No write permissions

**Verification:**
```javascript
// Backend verification
if (session.githubUsername !== bounty.contributor_github_username) {
  return res.status(403).json({ 
    error: 'Unauthorized: You are not the contributor' 
  });
}
```

### Wallet Validation

**Address Format:**
- Must be valid Solana address (base58)
- Length: 32-44 characters
- Example: `9jK2mP5nQ8rT3LpX6vY4zR1bN3cD7eF8gH9iJ0kL1mM2`

**Validation:**
```javascript
import { PublicKey } from '@solana/web3.js';

try {
  new PublicKey(walletAddress); // Throws if invalid
} catch (error) {
  return res.status(400).json({ 
    error: 'Invalid wallet address' 
  });
}
```

### Transaction Security

**Custom Fee Payer:**
- GitWork pays transaction fees (not you!)
- Your bounty amount is never reduced
- Fee payer wallet: `DJGSnu...VURq`

**Dual Signing:**
```javascript
// 1. Escrow wallet signs the token transfer
const escrowSignature = await privy.wallets().solana().signMessage(...)

// 2. Fee payer signs to cover transaction costs
transaction.sign([feePayerWallet])

// 3. Transaction submitted to Solana
const signature = await connection.sendTransaction(transaction)
```

## Status Transitions

```
deposit_confirmed
    │
    │ [PR opened referencing issue]
    │ (Post "PR created" comment)
    │
    ▼
deposit_confirmed
    │
    │ [PR merged]
    ▼
ready_to_claim
    │
    │ [Contributor claims via dashboard]
    ▼
claimed
    │
    │ [Issue closed]
    │ (Post "Bounty completed" comment)
    │
    ▼
claimed (final)
```

## Claim Dashboard

### URL Structure

```
https://gitwork.io/claim/{bountyId}
```

**Example:**
```
https://gitwork.io/claim/42
```

### Dashboard States

**1. Not Logged In:**
```
┌──────────────────────────────────┐
│ Bounty #42: Add Dark Mode        │
│                                  │
│ Amount: 50 USDC                  │
│ Status: Ready to Claim           │
│                                  │
│ [Login with GitHub]              │
└──────────────────────────────────┘
```

**2. Logged In (Correct User):**
```
┌──────────────────────────────────┐
│ Welcome @contributor!            │
│                                  │
│ Bounty #42: Add Dark Mode        │
│ Amount: 50 USDC                  │
│                                  │
│ Enter your Solana wallet:        │
│ [____________________________]   │
│                                  │
│ [Claim 50 USDC]                  │
└──────────────────────────────────┘
```

**3. Already Claimed:**
```
┌──────────────────────────────────┐
│ Bounty Already Claimed! ✅       │
│                                  │
│ This bounty was claimed by:      │
│ @contributor                     │
│                                  │
│ Transaction:                     │
│ [View on Solana Explorer]        │
└──────────────────────────────────┘
```

**4. Wrong User:**
```
┌──────────────────────────────────┐
│ Unauthorized ❌                  │
│                                  │
│ This bounty is for:              │
│ @contributor                     │
│                                  │
│ You are logged in as:            │
│ @otheruser                       │
└──────────────────────────────────┘
```

## API Endpoints

### GET /claim/:id

**Purpose:** Display claim dashboard

**Response:**
```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Claim Bounty #42</h1>
    ...
  </body>
</html>
```

### GET /auth/github

**Purpose:** Initiate GitHub OAuth

**Flow:**
```
1. User clicks "Login with GitHub"
2. Redirect to GitHub: 
   https://github.com/login/oauth/authorize?client_id=...
3. User authorizes
4. GitHub redirects back:
   /auth/github/callback?code=ABC123
5. Exchange code for token
6. Store username in session
7. Redirect to claim page
```

### POST /api/claim/:id

**Purpose:** Claim bounty and transfer funds

**Request:**
```json
{
  "walletAddress": "9jK2mP5nQ8rT3LpX6vY4zR1bN3cD7eF8gH9iJ0kL1mM2"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionSignature": "ABC123xyz...",
  "amount": 50,
  "currency": "USDC",
  "explorerUrl": "https://explorer.solana.com/tx/ABC123xyz..."
}
```

**Response (Error):**
```json
{
  "error": "Bounty not ready to claim"
}
```

## Troubleshooting

### "Bounty Not Available"

**Possible Causes:**
- Bounty hasn't been created yet
- PR hasn't been merged yet
- Bounty already claimed
- Invalid bounty ID

**Check:**
```bash
# On server
sqlite3 data/gitwork.db "SELECT * FROM bounties WHERE id=42;"
```

### "Unauthorized"

**Possible Causes:**
- Not logged in with GitHub
- Logged in as wrong user
- Session expired

**Solution:**
- Logout and login again
- Make sure you're the contributor who created the PR

### "Invalid Wallet Address"

**Possible Causes:**
- Not a valid Solana address
- Contains spaces or special characters
- Ethereum/Bitcoin address (wrong blockchain)

**Solution:**
- Copy address directly from your Solana wallet
- Remove any spaces
- Verify it starts with a letter or number (not 0x)

### Transaction Failed

**Possible Causes:**
- Insufficient SOL in fee payer wallet
- Network congestion
- Invalid token accounts

**Check Logs:**
```bash
pm2 logs gitwork --lines 50
```

**Manual Retry:**
Contact GitWork support with:
- Bounty ID
- Your GitHub username
- Wallet address
- Error message

## Testing Guide

### Test the Full Flow

**1. Create Test Issue:**
```markdown
Title: Test Bounty Issue
Body: This is a test issue for bounty flow

Labels: Octavian:USDC:1
```

**2. Fund the Bounty:**
- Wait for GitWork comment
- Send 1 USDC to escrow wallet
- Wait for confirmation comment

**3. Create Test PR:**
```markdown
Title: Fix test issue
Body: This fixes the test issue

Fixes #123
```

**4. Merge PR:**
- Merge the PR
- Wait for GitWork comment with claim link

**5. Claim Bounty:**
- Click claim link
- Login with GitHub
- Enter wallet address
- Click claim
- Verify transaction on Solana Explorer

**6. Verify:**
- Check wallet received USDC
- Check issue has completion comment
- Check database status is `claimed`

## Best Practices for Contributors

### 1. Communication

**Before Starting:**
- Comment on the issue: "I'd like to work on this"
- Wait for maintainer confirmation
- Ask questions if requirements unclear

**During Work:**
- Keep maintainer updated
- Ask for help if stuck
- Be responsive to feedback

### 2. Quality Work

**Code Quality:**
- Follow project conventions
- Add tests if applicable
- Update documentation
- Keep changes focused

**PR Quality:**
- Clear description
- Reference the issue
- Include screenshots if UI change
- Explain your approach

### 3. Timely Delivery

**Set Expectations:**
- Estimate how long you'll need
- Communicate delays
- Don't abandon issues

**If You Can't Finish:**
- Comment on the issue
- Let maintainer know
- Allow others to take over

### 4. Professional Conduct

**Be Respectful:**
- Thank maintainers for creating bounty
- Accept feedback gracefully
- Help other contributors if you can

**Be Patient:**
- Maintainers review when they can
- Bounties may take time to review
- Ask politely if no response after a week

## FAQ

**Q: Can multiple people claim the same bounty?**
A: No, only one bounty per issue. First merged PR wins.

**Q: What if two PRs are submitted?**
A: Maintainer decides which to merge. Only merged PR gets bounty.

**Q: Can I claim in a different currency?**
A: No, bounty is paid in the currency specified in the label.

**Q: How long do I have to claim?**
A: No time limit currently, but claim soon after merge.

**Q: Can I change my wallet address after claiming?**
A: No, transaction is immediate. Double-check address!

**Q: What if I don't have a Solana wallet?**
A: Download Phantom or Solflare wallet (free), then claim.

**Q: Are there any fees deducted?**
A: No! GitWork pays all transaction fees. You get the full amount.

**Q: Can I claim on behalf of someone else?**
A: No, must be logged in as the PR author.

**Q: What if the maintainer doesn't merge my PR?**
A: Bounty isn't claimable until PR is merged. Work with maintainer.

**Q: Can I see all available bounties?**
A: Currently, browse GitHub for `Octavian:` labels. Dashboard coming soon!

## Supported Currencies

### USDC (USD Coin)
- **Mint Address**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **Decimals**: 6
- **Network**: Solana Mainnet
- **Stable**: ✅ (pegged to USD)

### SOL (Solana)
- **Type**: Native token
- **Decimals**: 9
- **Network**: Solana Mainnet
- **Stable**: ❌ (price varies)

## Transaction Examples

### USDC Transfer
```
From: 7Np8E2rC3VKf9UpGbQ5xJ8mL2nP9rS4tU6vW7xY8zA1B
To:   9jK2mP5nQ8rT3LpX6vY4zR1bN3cD7eF8gH9iJ0kL1mM2
Amount: 50 USDC (50,000,000 micro-USDC)
Fee Payer: DJGSnuhwRJ7yTVFc6eUu8YRWFx4sRHSvAg1VBtP8VURq
Fee: ~0.000005 SOL (paid by GitWork)
Status: ✅ Confirmed
```

### SOL Transfer
```
From: 7Np8E2rC3VKf9UpGbQ5xJ8mL2nP9rS4tU6vW7xY8zA1B
To:   9jK2mP5nQ8rT3LpX6vY4zR1bN3cD7eF8gH9iJ0kL1mM2
Amount: 0.1 SOL (100,000,000 lamports)
Fee Payer: DJGSnuhwRJ7yTVFc6eUu8YRWFx4sRHSvAg1VBtP8VURq
Fee: ~0.000005 SOL (paid by GitWork)
Status: ✅ Confirmed
```

## Activity Log

Every claim is logged:

```sql
INSERT INTO activity_log (bounty_id, event_type, event_data)
VALUES (42, 'status_changed', '{"status": "ready_to_claim"}');

INSERT INTO activity_log (bounty_id, event_type, event_data)
VALUES (42, 'bounty_claimed', '{
  "contributor": "username",
  "wallet": "9jK2m...",
  "transactionSignature": "ABC123..."
}');
```

## Next Steps

After claiming your first bounty:

1. **Find More Bounties**: Look for other `Octavian:` labeled issues
2. **Share Your Success**: Tweet about it! Help spread the word
3. **Become a Maintainer**: Create bounties on your own repos
4. **Join Community**: Discord, Twitter, GitHub Discussions

---

**Happy Contributing!** 🚀

GitWork makes open source rewarding.

