# GitWork Quick Reference Card

## Commands

### Setup
```bash
npm install                    # Install dependencies
npm run db:migrate            # Initialize database
npm start                     # Start server
npm run dev                   # Start with auto-reload
```

### Testing
```bash
node src/scripts/test-webhook.js           # Simulate webhooks
node src/scripts/check-balance.js <addr>   # Check wallet balance
```

### Database
```bash
sqlite3 data/gitwork.db                    # Open database
sqlite3 data/gitwork.db "SELECT * FROM bounties;"
sqlite3 data/gitwork.db "SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10;"
```

### Deployment
```bash
ngrok http 3000               # Expose local server
pm2 start src/index.js        # Production process manager
pm2 logs                      # View logs
pm2 restart all               # Restart
```

## Label Format

```
Octavian:CURRENCY:AMOUNT
```

**Examples:**
- `Octavian:USDC:50`
- `Octavian:USDC:100.5`
- `Octavian:SOL:2`

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | API info |
| `/api/webhooks/github` | POST | GitHub webhooks |
| `/api/webhooks/health` | GET | Health check |

## Webhook Events

| Event | Action |
|-------|--------|
| `installation.created` | Record installation |
| `installation.deleted` | Mark as uninstalled |
| `issues.labeled` | Create bounty if label matches |
| `issues.unlabeled` | Cancel if pending_deposit |
| `pull_request.closed` | Process claim if merged |

## Bounty Statuses

```
pending_deposit → deposit_confirmed → ready_to_claim → claimed
       ↓
   cancelled
```

| Status | Meaning |
|--------|---------|
| `pending_deposit` | Waiting for repo owner to deposit |
| `deposit_confirmed` | Funds in escrow, bounty active |
| `ready_to_claim` | PR merged, ready for contributor |
| `claimed` | Funds transferred to contributor |
| `cancelled` | Bounty cancelled before deposit |

## Environment Variables

### Required
```env
GITHUB_APP_ID=123456
GITHUB_WEBHOOK_SECRET=your_secret
GITHUB_PRIVATE_KEY_PATH=./private-key.pem
```

### Solana
```env
# Devnet (testing)
SOLANA_RPC_URL=https://api.devnet.solana.com
USDC_MINT_ADDRESS=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Mainnet (production)
SOLANA_RPC_URL=https://your-rpc-provider.com/key
USDC_MINT_ADDRESS=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

## Database Schema Quick View

### bounties
```sql
id, github_issue_id, github_repo_owner, github_repo_name,
github_issue_number, bounty_amount, currency,
escrow_wallet_address, escrow_wallet_private_key, status,
created_at, updated_at, deposit_confirmed_at, claimed_at,
claim_wallet_address, contributor_github_username,
pull_request_number, transaction_signature
```

### installations
```sql
id, github_installation_id, github_account_login,
github_account_type, installed_at, uninstalled_at
```

### activity_log
```sql
id, bounty_id, event_type, event_data, created_at
```

## Common Queries

### View all bounties
```sql
SELECT github_repo_owner, github_repo_name, github_issue_number, 
       bounty_amount, currency, status 
FROM bounties 
ORDER BY created_at DESC;
```

### View pending deposits
```sql
SELECT * FROM bounties WHERE status = 'pending_deposit';
```

### View active bounties
```sql
SELECT * FROM bounties WHERE status = 'deposit_confirmed';
```

### View recent activity
```sql
SELECT b.github_issue_number, a.event_type, a.created_at 
FROM activity_log a 
JOIN bounties b ON a.bounty_id = b.id 
ORDER BY a.created_at DESC 
LIMIT 20;
```

### Total value in escrow
```sql
SELECT SUM(bounty_amount) as total, currency 
FROM bounties 
WHERE status IN ('deposit_confirmed', 'ready_to_claim') 
GROUP BY currency;
```

## File Structure

```
src/
├── index.js                 # Main entry point
├── routes/
│   └── webhooks.js          # Webhook handlers
├── services/
│   ├── bounty.js            # Core bounty logic
│   ├── github.js            # GitHub API
│   ├── solana.js            # Blockchain
│   ├── privy.js             # Wallet auth
│   └── deposit-monitor.js   # Background service
├── db/
│   ├── database.js          # DB connection
│   └── migrate.js           # Migrations
├── utils/
│   └── parser.js            # Label parsing
└── scripts/
    ├── test-webhook.js      # Test tool
    └── check-balance.js     # Balance checker
```

## Key Services

### bounty.js
- `createBounty()` - Create new bounty
- `getBountyByIssue()` - Find by issue
- `updateBountyStatus()` - Change status
- `processBountyLabel()` - Handle label event
- `checkBountyDeposit()` - Verify deposit

### github.js
- `postIssueComment()` - Post comment
- `getIssue()` - Get issue details
- `generateDepositRequestComment()` - Format message
- `generateDepositConfirmedComment()` - Format message

### solana.js
- `createEscrowWallet()` - Generate keypair
- `checkUSDCBalance()` - Get USDC balance
- `checkSOLBalance()` - Get SOL balance
- `getUSDCTokenAccount()` - Get token account

### deposit-monitor.js
- `start()` - Start monitoring
- `stop()` - Stop monitoring
- Runs every 30 seconds
- Checks all pending deposits

## Troubleshooting

### Webhooks not received
1. Check ngrok is running
2. Verify webhook URL in GitHub App settings
3. Check webhook secret matches
4. View deliveries in GitHub App → Advanced tab

### Deposit not detected
1. Verify correct wallet address
2. Check correct token (USDC not SOL)
3. Verify amount matches
4. Check monitor is running: `pm2 list`
5. Manual check: `node src/scripts/check-balance.js <addr>`

### Database locked
```bash
# Check for other processes
ps aux | grep node

# If needed, restart
pm2 restart gitwork
```

### GitHub App permissions
Ensure these permissions:
- Issues: Read & Write ✅
- Pull requests: Read & Write ✅
- Metadata: Read-only ✅

## Monitoring

### Health Check
```bash
curl http://localhost:3000/api/webhooks/health
```

### Logs
```bash
pm2 logs gitwork           # View logs
pm2 logs gitwork --lines 100  # Last 100 lines
```

### Process Status
```bash
pm2 status                 # All processes
pm2 show gitwork          # Detailed info
```

## Backup

### Database
```bash
cp data/gitwork.db backups/gitwork_$(date +%Y%m%d).db
```

### Automated (add to crontab)
```bash
0 2 * * * cp /path/to/data/gitwork.db /path/to/backups/gitwork_$(date +\%Y\%m\%d).db
```

## Security Checklist

- [ ] `.env` not in git
- [ ] `private-key.pem` not in git
- [ ] Webhook secret is strong
- [ ] Database file has restricted permissions
- [ ] HTTPS enabled in production
- [ ] Rate limiting enabled
- [ ] Regular backups configured

## URLs

- GitHub Apps: https://github.com/settings/apps
- Solana Explorer (Devnet): https://explorer.solana.com/?cluster=devnet
- Solana Explorer (Mainnet): https://explorer.solana.com/

## Support Resources

- **QUICKSTART.md** - 5-minute setup
- **SETUP_GUIDE.md** - Detailed setup
- **ARCHITECTURE.md** - System design
- **DEPLOYMENT.md** - Production deployment
- **REPO_OWNER_FLOW.md** - Flow walkthrough
- **VISUAL_FLOW.md** - Diagrams

## Development

### Add New Feature
1. Update database schema in `src/db/migrate.js`
2. Add service methods in `src/services/`
3. Add webhook handler in `src/routes/webhooks.js`
4. Update documentation

### Debug
```javascript
// Enable verbose logging
console.log('Bounty data:', bounty);
console.log('Webhook payload:', JSON.stringify(payload, null, 2));
```

## Performance

### Database Indexes
Already optimized with indexes on:
- `status`
- `github_repo_owner, github_repo_name`
- `escrow_wallet_address`

### Monitor Performance
```sql
-- Slow queries (if any)
PRAGMA compile_options;
EXPLAIN QUERY PLAN SELECT * FROM bounties WHERE status = 'pending_deposit';
```

## Constants

- Deposit check interval: **30 seconds**
- USDC decimals: **6**
- SOL decimals: **9**
- Default port: **3000**
- Database: **SQLite (WAL mode)**

---

**Keep this card handy for quick reference!** 📋


