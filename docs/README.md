# GitWork Documentation

Welcome to the GitWork documentation! This folder contains comprehensive guides for using and deploying GitWork.

## 📚 Documentation Index

### For Users

- **[Repo Owner Flow](./REPO_OWNER_FLOW.md)** - How to create bounties on your GitHub issues
- **[Contributor Flow](./CONTRIBUTOR_FLOW.md)** - How to solve issues and claim bounties
- **[Quick Reference](./QUICK_REFERENCE.md)** - Common commands and workflows
- **[Visual Flow](./VISUAL_FLOW.md)** - Diagrams showing how GitWork works

### For Developers

- **[Architecture](./ARCHITECTURE.md)** - System design and technical overview
- **[Setup Guide](./SETUP_GUIDE.md)** - Local development setup
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Deployment Quick Start](./DEPLOYMENT_QUICK_START.md)** - Rapid deployment commands

### Specific Topics

- **[Mainnet Setup](./MAINNET_SETUP.md)** - Configuring for Solana mainnet

## 🚀 Quick Start

### For Repo Owners

1. **Install GitWork bot** on your repository
2. **Create an issue** with a bounty label: `Octavian:USDC:50`
3. **Fund the escrow wallet** shown in the bot's comment
4. **Wait for contributors** to solve it!

See [Repo Owner Flow](./REPO_OWNER_FLOW.md) for details.

### For Contributors

1. **Find an issue** with an `Octavian:` label and ✅ funded
2. **Create a PR** that references the issue (e.g., "Fixes #123")
3. **Get your PR merged** by the maintainer
4. **Claim your bounty** via the link in the bot's comment

See [Contributor Flow](./CONTRIBUTOR_FLOW.md) for details.

## 🏗️ What is GitWork?

GitWork turns GitHub issues into instant bounties on the Solana blockchain.

**The Problem:**
- Open source runs the internet
- Most developers building it work for free
- Maintainers burn out, contributors aren't compensated
- No simple way to pay for contributions (beyond sponsorships and goodwill)

**The Solution:**
GitWork makes it trivial to:
- **Create bounties** - Just add a label to a GitHub issue
- **Escrow funds automatically** - Solana wallets created per bounty
- **Pay contributors** - Automatic payout when PR is merged
- **No middlemen** - Direct on-chain payments

## 💡 Key Features

### ✅ Simple Bounty Creation
```markdown
# Just add a label to your issue:
Octavian:USDC:50
```

### ✅ Automatic Escrow
- Unique Solana wallet created for each bounty
- Funds held securely until work is complete
- No manual intervention needed

### ✅ Instant Payouts
- PR merged → bounty claimable
- One-click claim via dashboard
- Funds arrive in seconds

### ✅ Multiple Currencies
- **USDC** - Stablecoin (pegged to USD)
- **SOL** - Native Solana token

### ✅ Zero Fees
- No platform fees (currently)
- Transaction fees paid by GitWork
- Contributors receive full bounty amount

### ✅ Full Transparency
- All transactions on Solana blockchain
- View on Solana Explorer
- Complete activity log

## 🔧 Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Blockchain**: Solana (Mainnet-Beta)
- **Wallet Management**: Privy (embedded wallets)
- **GitHub Integration**: GitHub Apps + Webhooks
- **Authentication**: GitHub OAuth (Passport.js)

## 📋 Supported Label Formats

```
Octavian:USDC:50     ✅ 50 USDC bounty
Octavian:SOL:0.1     ✅ 0.1 SOL bounty
octavian:usdc:25     ✅ Case insensitive
Octavian:USDC:12.5   ✅ Decimals allowed

Octavian:ETH:1       ❌ ETH not supported
Octavian:USDC        ❌ Amount required
USDC:50              ❌ Must start with "Octavian:"
```

## 🔐 Security Features

### Currency Validation
- Only USDC and SOL accepted
- Rejects unsupported currencies (ETH, BTC, etc.)
- Clear error messages

### Deposit Validation
- Ensures correct currency is deposited
- Validates exact amount (or more)
- Detects wrong token deposits

### Multiple Labels Protection
- Rejects multiple bounty labels on one issue
- Guides users to fix the issue
- Prevents accidental double bounties

### Bounty Cancellation
- Remove label → bounty cancelled
- Automatic refunds if funds escrowed
- Cannot cancel after claimed

### Race Condition Handling
- Handles simultaneous webhook events
- Prevents duplicate bounties
- Graceful error recovery

## 🚦 Bounty Lifecycle

```
┌─────────────────┐
│ Label Added     │
│ Octavian:USDC:50│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Pending Deposit │
│ (Escrow created)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deposit         │
│ Confirmed       │
│ (Funds in)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ready to Claim  │
│ (PR merged)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Claimed         │
│ (Paid out)      │
└─────────────────┘

Alternative paths:
- Label removed → Cancelled (+ refund)
- Issue closed before merge → Cancelled
```

## 🌍 Deployment Options

GitWork can be deployed to:

- ✅ **VPS/VM** (recommended for production)
  - GCP, AWS, DigitalOcean
  - Full control
  - Persistent database

- ✅ **PaaS**
  - Railway, Render, Fly.io
  - Easy deployment
  - Auto-scaling

- ⚠️ **Serverless** (not recommended)
  - SQLite doesn't work well serverless
  - Complex webhook handling
  - Consider this only if you migrate to PostgreSQL

See [deployment/](../deployment/) for detailed guides.

## 📊 Database Schema

### Bounties Table
```sql
CREATE TABLE bounties (
  id INTEGER PRIMARY KEY,
  github_issue_id INTEGER,
  github_repo_owner TEXT,
  github_repo_name TEXT,
  github_issue_number INTEGER,
  bounty_amount REAL,
  currency TEXT DEFAULT 'USDC',
  escrow_wallet_address TEXT,
  github_installation_id INTEGER,
  status TEXT DEFAULT 'pending_deposit',
  contributor_github_username TEXT,
  pull_request_number INTEGER,
  transaction_signature TEXT,
  claim_wallet_address TEXT,
  cancelled_at DATETIME,
  refund_transaction TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  deposit_confirmed_at DATETIME,
  claimed_at DATETIME,
  UNIQUE(github_repo_owner, github_repo_name, github_issue_number)
);
```

### Installations Table
```sql
CREATE TABLE installations (
  id INTEGER PRIMARY KEY,
  github_installation_id INTEGER UNIQUE,
  github_account_login TEXT,
  installed_at DATETIME,
  uninstalled_at DATETIME
);
```

### Activity Log Table
```sql
CREATE TABLE activity_log (
  id INTEGER PRIMARY KEY,
  bounty_id INTEGER,
  event_type TEXT,
  event_data TEXT,
  created_at DATETIME,
  FOREIGN KEY (bounty_id) REFERENCES bounties(id)
);
```

## 🔗 Important Links

- **GitHub App**: https://github.com/apps/gitwork-io
- **Production**: https://gitwork.io
- **Source Code**: https://github.com/yourusername/gitwork
- **Issues**: https://github.com/yourusername/gitwork/issues

## 🤝 Contributing

Want to contribute to GitWork itself?

1. Check existing issues or create a new one
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for local development setup.

## 📝 License

[Add your license here]

## 💬 Support

- **Discord**: [Coming soon]
- **Twitter**: [@GitWork]
- **Email**: support@gitwork.io
- **GitHub Issues**: For bugs and feature requests

## 🗺️ Roadmap

### Current Features ✅
- [x] GitHub App integration
- [x] USDC bounties
- [x] SOL bounties
- [x] Automatic escrow
- [x] Claim dashboard
- [x] GitHub OAuth
- [x] Mainnet support
- [x] Bounty cancellation & refunds
- [x] Currency validation
- [x] Deposit validation

### Planned Features 🚧
- [ ] Bounty discovery dashboard
- [ ] Email notifications
- [ ] Multiple contributors per bounty
- [ ] Partial bounty claims
- [ ] Reputation system
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Browser extension
- [ ] Discord bot
- [ ] More blockchains (Ethereum, Polygon)

## 📈 Stats & Metrics

[Add your metrics here when available]

- **Total Bounties Created**: [X]
- **Total Value Escrowed**: [X] USDC
- **Total Bounties Claimed**: [X]
- **Average Bounty Size**: [X] USDC
- **Active Repositories**: [X]

---

**Made with ❤️ by the GitWork team**

*Making open source rewarding.*

