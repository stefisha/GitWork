# GitWork Architecture

## System Overview

GitWork is a bounty platform that integrates GitHub issues with Solana blockchain payments. It consists of three main components:

1. **GitHub App (Octavian Bot)** - Listens to repository events
2. **Backend API** - Processes webhooks and manages bounties
3. **Dashboard** - Web interface for claiming bounties (to be implemented)

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **GitHub Integration**: Octokit (webhooks + REST API)

### Blockchain
- **Network**: Solana
- **Token**: USDC (SPL Token)
- **SDK**: @solana/web3.js, @solana/spl-token

### Authentication
- **GitHub OAuth** (for contributor verification)
- **Privy** (optional, for embedded wallets)

## Data Flow

### Repo Owner Flow

```
1. Issue Created + Label Added
   ↓
2. GitHub Webhook → GitWork API
   ↓
3. Parse Label (Octavian:USDC:50)
   ↓
4. Create Solana Escrow Wallet
   ↓
5. Save Bounty to Database
   ↓
6. Post Comment with Deposit Instructions
   ↓
7. Deposit Monitor (Background Service)
   ↓
8. Detect Deposit → Update Status
   ↓
9. Post Confirmation Comment
```

### Contributor Flow (Current + Planned)

```
1. PR Merged (closes issue)
   ↓
2. GitHub Webhook → GitWork API
   ↓
3. Update Bounty Status
   ↓
4. Post Claim Notification with Link
   ↓
5. Contributor Clicks Link → Dashboard
   ↓
6. Authenticate with GitHub
   ↓
7. Provide Solana Wallet Address
   ↓
8. Transfer from Escrow to Contributor
   ↓
9. Update Status to 'Claimed'
```

## Database Schema

### Tables

#### `bounties`
Primary table storing all bounty information.

```sql
CREATE TABLE bounties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_issue_id INTEGER NOT NULL UNIQUE,
  github_repo_owner TEXT NOT NULL,
  github_repo_name TEXT NOT NULL,
  github_issue_number INTEGER NOT NULL,
  bounty_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  escrow_wallet_address TEXT,
  escrow_wallet_private_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending_deposit',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deposit_confirmed_at DATETIME,
  claimed_at DATETIME,
  claim_wallet_address TEXT,
  contributor_github_username TEXT,
  pull_request_number INTEGER,
  transaction_signature TEXT
);
```

#### `installations`
Tracks GitHub App installations.

```sql
CREATE TABLE installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_installation_id INTEGER NOT NULL UNIQUE,
  github_account_login TEXT NOT NULL,
  github_account_type TEXT NOT NULL,
  installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  uninstalled_at DATETIME
);
```

#### `activity_log`
Audit trail for all bounty activities.

```sql
CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bounty_id INTEGER,
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bounty_id) REFERENCES bounties(id)
);
```

### Status Flow

```
pending_deposit → deposit_confirmed → ready_to_claim → claimed
                ↓
            cancelled
```

- **pending_deposit**: Bounty created, waiting for repo owner to deposit
- **deposit_confirmed**: Funds in escrow, bounty is active
- **ready_to_claim**: PR merged, contributor can claim
- **claimed**: Funds transferred to contributor
- **cancelled**: Bounty removed (only if pending_deposit)

## API Endpoints

### Webhooks

#### `POST /api/webhooks/github`
Receives GitHub webhooks.

**Headers:**
- `X-GitHub-Event`: Event type
- `X-GitHub-Delivery`: Unique delivery ID
- `X-Hub-Signature-256`: HMAC signature

**Events Handled:**
- `installation.created`
- `installation.deleted`
- `issues.labeled`
- `issues.unlabeled`
- `pull_request.closed`

### Health Check

#### `GET /api/webhooks/health`
Returns server status.

**Response:**
```json
{
  "status": "ok",
  "service": "GitWork Webhooks"
}
```

## Services

### GitHub Service (`src/services/github.js`)

Handles all GitHub API interactions:
- Create comments on issues
- Get issue/PR details
- Authenticate with GitHub App
- Generate formatted comment messages

**Key Functions:**
- `getOctokitForInstallation()` - Get authenticated GitHub client
- `postIssueComment()` - Post a comment
- `generateDepositRequestComment()` - Format deposit request
- `generateDepositConfirmedComment()` - Format confirmation
- `generateClaimNotificationComment()` - Format claim notification

### Solana Service (`src/services/solana.js`)

Manages blockchain interactions:
- Create escrow wallets
- Check balances (USDC/SOL)
- Monitor for deposits

**Key Functions:**
- `createEscrowWallet()` - Generate new keypair
- `checkUSDCBalance()` - Get USDC balance
- `checkSOLBalance()` - Get SOL balance
- `getUSDCTokenAccount()` - Get associated token account
- `waitForDeposit()` - Poll for deposit confirmation

### Bounty Service (`src/services/bounty.js`)

Core business logic for bounties:
- Create and manage bounties
- Process labels
- Update statuses
- Activity logging

**Key Functions:**
- `createBounty()` - Create new bounty record
- `getBountyByIssue()` - Find bounty by issue
- `updateBountyStatus()` - Change bounty status
- `checkBountyDeposit()` - Verify deposit
- `processBountyLabel()` - Handle new bounty label
- `logActivity()` - Record activity

### Deposit Monitor (`src/services/deposit-monitor.js`)

Background service that:
- Runs every 30 seconds
- Checks all `pending_deposit` bounties
- Verifies wallet balances
- Updates status when deposit detected
- Posts confirmation comments

**Lifecycle:**
```javascript
depositMonitor.start()  // Start monitoring
depositMonitor.stop()   // Stop monitoring
```

## Label Format

Bounty labels must follow this exact format:

```
Octavian:CURRENCY:AMOUNT
```

**Examples:**
- `Octavian:USDC:50` - 50 USDC bounty
- `Octavian:USDC:100.5` - 100.5 USDC bounty
- `Octavian:SOL:2` - 2 SOL bounty

**Validation:**
- Currency must be uppercase (USDC or SOL)
- Amount must be a positive number
- Decimals are allowed

**Implementation:**
```javascript
// src/utils/parser.js
const pattern = /^Octavian:([A-Z]+):(\d+(?:\.\d+)?)$/i;
```

## Webhook Processing

### Issue Labeled Event

```javascript
webhooks.on('issues.labeled', async ({ payload }) => {
  1. Check if label matches bounty format
  2. Create escrow wallet
  3. Save bounty to database
  4. Post comment with deposit address
});
```

### Pull Request Closed (Merged) Event

```javascript
webhooks.on('pull_request.closed', async ({ payload }) => {
  1. Check if PR was merged (not just closed)
  2. Extract issue references from PR body
  3. Find bounties for those issues
  4. Update status to 'ready_to_claim'
  5. Post claim notification with link
});
```

**Issue Reference Patterns:**
- `Fixes #123`
- `Closes #456`
- `Resolves #789`

Regex: `/(?:fix|fixes|fixed|close|closes|closed|resolve|resolves|resolved)\s+#(\d+)/gi`

## Security Considerations

### Webhook Verification

All GitHub webhooks are verified using HMAC-SHA256:

```javascript
const signature = req.headers['x-hub-signature-256'];
await webhooks.verifyAndReceive({
  signature: signature,
  payload: JSON.stringify(req.body)
});
```

### Private Key Storage

**Current Implementation:**
- Escrow wallet private keys stored in database (encrypted in production)
- GitHub App private key stored as file

**Production Recommendations:**
- Use environment variable encryption (Railway, Render secrets)
- Consider AWS Secrets Manager or HashiCorp Vault
- Encrypt database columns containing private keys

### Access Control

- Only verified GitHub users can claim bounties
- Webhook signatures prevent spoofing
- Installation tracking prevents unauthorized access

## Solana Wallet Management

### Escrow Wallets

Each bounty gets a unique Solana keypair:

```javascript
const keypair = Keypair.generate();
// Public key: Deposit address (shown to repo owner)
// Private key: Stored securely (used for transfer to contributor)
```

### Token Accounts

USDC requires Associated Token Accounts (ATA):

```javascript
const ata = await getAssociatedTokenAddress(
  USDC_MINT,
  walletPubkey
);
```

### Balance Checking

**USDC:**
```javascript
const accountInfo = await getAccount(connection, tokenAccount);
const balance = Number(accountInfo.amount) / 1_000_000; // 6 decimals
```

**SOL:**
```javascript
const balance = await connection.getBalance(walletPubkey);
const sol = balance / LAMPORTS_PER_SOL;
```

## Error Handling

### Webhook Processing
- Errors are logged but don't crash the server
- GitHub receives 200 OK to prevent retries
- Failed operations are logged to activity_log

### Deposit Monitoring
- Individual bounty errors don't stop monitoring
- Network errors are retried on next cycle
- Failed checks are logged

### Database Errors
- Unique constraints prevent duplicate bounties
- Transactions ensure data consistency
- WAL mode prevents corruption

## Performance Optimization

### Database Indexing

Key indexes for query performance:
```sql
CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_repo ON bounties(github_repo_owner, github_repo_name);
CREATE INDEX idx_bounties_escrow_wallet ON bounties(escrow_wallet_address);
```

### Webhook Processing

- Webhooks are processed asynchronously
- No blocking operations in webhook handlers
- Background services handle time-consuming tasks

### Rate Limiting

Consider implementing:
- GitHub API rate limit handling
- Solana RPC rate limits
- Webhook delivery rate limits

## Testing

### Manual Testing

```bash
# Test webhook delivery
node src/scripts/test-webhook.js

# Check wallet balance
node src/scripts/check-balance.js <address>

# Query database
sqlite3 data/gitwork.db "SELECT * FROM bounties;"
```

### Integration Testing

Use ngrok for local webhook testing:
```bash
ngrok http 3000
# Update GitHub App webhook URL
```

### Unit Testing (To Be Implemented)

```javascript
// Example test structure
describe('Label Parser', () => {
  it('should parse valid bounty label', () => {
    const result = parseBountyLabel('Octavian:USDC:50');
    expect(result).toEqual({ currency: 'USDC', amount: 50 });
  });
});
```

## Monitoring & Observability

### Logging

Console logging with prefixes:
- ✅ Success
- ❌ Error
- ⚠️ Warning
- 🔍 Info
- 💰 Bounty
- 📦 Installation

### Metrics to Track

- Bounties created per day
- Deposits confirmed per day
- Claims processed per day
- Average time to deposit
- Average time to claim
- Failed webhook deliveries

### Alerts

Set up alerts for:
- Webhook processing failures
- Database errors
- Solana RPC errors
- Deposit monitor failures

## Future Enhancements

### Phase 1 (Completed)
- ✅ GitHub App integration
- ✅ Webhook processing
- ✅ Escrow wallet creation
- ✅ Deposit monitoring
- ✅ Comment automation

### Phase 2 (Next - Contributor Flow)
- [ ] Dashboard web app
- [ ] GitHub OAuth integration
- [ ] Claim interface
- [ ] Automatic fund transfers
- [ ] Transaction confirmation

### Phase 3 (Future)
- [ ] Bounty cancellation & refunds
- [ ] Multi-currency support
- [ ] Partial payouts
- [ ] Contributor leaderboard
- [ ] Repository discovery
- [ ] Analytics dashboard

### Phase 4 (Advanced)
- [ ] DAO governance
- [ ] Staking mechanisms
- [ ] Reputation system
- [ ] Automated code review bounties
- [ ] Integration with other platforms

## Deployment Architecture

```
┌──────────────────┐
│   GitHub.com     │
│   (Webhooks)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  Load Balancer   │────▶│  GitWork API     │
│   (Optional)     │     │  (Express)       │
└──────────────────┘     └────────┬─────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │   Database   │ │ Solana RPC   │ │   GitHub     │
         │   (SQLite)   │ │   Provider   │ │     API      │
         └──────────────┘ └──────────────┘ └──────────────┘
```

## Contributing

When adding new features:

1. Update database schema in `src/db/migrate.js`
2. Add service methods in `src/services/`
3. Create webhook handlers in `src/routes/webhooks.js`
4. Update this documentation
5. Add tests

## License

MIT - See LICENSE file

---

**Architecture Documentation Version 1.0**

Last Updated: October 2025


