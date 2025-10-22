# GitWork - Turn GitHub Issues into Instant Bounties

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/blockchain-Solana-purple)](https://solana.com)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)

> **Making open source rewarding.**

GitWork turns GitHub issues into instant bounties on the Solana blockchain. Create bounties with a simple label, funds are automatically escrowed, and contributors get paid instantly when their PR is merged.

## 🚀 Quick Start

### For Repo Owners (Create Bounties)

1. **Install the GitWork bot** on your repository: [github.com/apps/gitwork-io](https://github.com/apps/gitwork-io)
2. **Add a bounty label** to any issue:
   ```
   Octavian:USDC:50
   ```
3. **Fund the escrow** wallet shown in the bot's comment
4. **Done!** Contributors can now solve it and get paid automatically

👉 **Full Guide:** [docs/REPO_OWNER_FLOW.md](docs/REPO_OWNER_FLOW.md)

### For Contributors (Claim Bounties)

1. **Find an issue** with an `Octavian:` label that's ✅ funded
2. **Create a PR** that fixes the issue (must reference it: "Fixes #123")
3. **Get merged** by the maintainer
4. **Claim your reward** via the link in the bot's comment

👉 **Full Guide:** [docs/CONTRIBUTOR_FLOW.md](docs/CONTRIBUTOR_FLOW.md)

## 💡 Why GitWork?

**The Problem:**
- Open source runs the internet, yet most developers build it for free
- Maintainers burn out, contributors aren't compensated
- No simple way to pay for contributions beyond sponsorships

**The Solution:**
GitWork makes it trivial to create and claim bounties:
- ✅ Simple label-based bounty creation
- ✅ Automatic escrow on Solana blockchain
- ✅ Instant payouts when PR is merged
- ✅ Zero fees for contributors
- ✅ No middlemen - direct on-chain payments

## ✨ Features

- **🏷️ Simple Labels** - Just add `Octavian:USDC:50` to create a 50 USDC bounty
- **🔒 Automatic Escrow** - Unique Solana wallet created for each bounty
- **⚡ Instant Payouts** - Funds arrive in seconds after PR merge
- **💰 Multiple Currencies** - USDC (stable) and SOL (native)
- **🛡️ Secure** - Currency validation, deposit verification, race condition handling
- **🔄 Cancellable** - Remove label to cancel and auto-refund
- **📊 Transparent** - All transactions on Solana blockchain

## 🎯 How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Repo Owner   │     │  Contributor │     │   Solana     │
│              │     │              │     │  Blockchain  │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ 1. Add label       │                    │
       │  "Octavian:USDC:50"│                    │
       ├────────────────────┼───────────────────>│
       │                    │   Create escrow    │
       │                    │                    │
       │ 2. Fund escrow     │                    │
       ├────────────────────┼───────────────────>│
       │                    │                    │
       │                    │ 3. Create PR       │
       │<────────────────────                    │
       │                    │                    │
       │ 4. Merge PR        │                    │
       ├───────────────────>│                    │
       │                    │                    │
       │                    │ 5. Claim bounty    │
       │                    ├───────────────────>│
       │                    │   Transfer funds   │
       │                    │<───────────────────│
       │                    │  💰 Paid!          │
```

## 📋 Supported Label Formats

```bash
✅ Octavian:USDC:50     # 50 USDC bounty
✅ Octavian:SOL:0.1     # 0.1 SOL bounty
✅ octavian:usdc:25     # Case insensitive
✅ Octavian:USDC:12.5   # Decimals allowed

❌ Octavian:ETH:1       # ETH not supported
❌ Octavian:USDC        # Amount required
❌ USDC:50              # Must start with "Octavian:"
```

## 🔐 Security Features

- **Currency Validation** - Only USDC and SOL accepted
- **Deposit Validation** - Ensures correct token and amount
- **Multiple Labels Protection** - One bounty per issue
- **Bounty Cancellation** - Auto-refund when label removed
- **Race Condition Handling** - Graceful duplicate prevention
- **Authentication** - GitHub OAuth verification
- **Transaction Security** - Dual-signing with custom fee payer

## 🏗️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Blockchain**: Solana (Mainnet-Beta)
- **Wallet Management**: Privy (embedded wallets)
- **GitHub Integration**: GitHub Apps + Webhooks
- **Authentication**: GitHub OAuth (Passport.js)

## 📚 Documentation

- **[Repo Owner Flow](docs/REPO_OWNER_FLOW.md)** - Create and manage bounties
- **[Contributor Flow](docs/CONTRIBUTOR_FLOW.md)** - Solve issues and claim rewards
- **[Architecture](docs/ARCHITECTURE.md)** - Technical overview
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Local development setup
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Common commands
- **[Mainnet Setup](docs/MAINNET_SETUP.md)** - Configuring for mainnet
- **[All Documentation](docs/)** - Complete documentation index

## 🚀 Deployment

GitWork can be deployed to:

- **VPS/VM** (recommended) - GCP, AWS, DigitalOcean
- **PaaS** - Railway, Render, Fly.io
- **Container Services** - GCP Cloud Run, AWS ECS

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions.

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/gitwork.git
cd gitwork

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# - GitHub App credentials
# - Privy credentials
# - Solana RPC URL
# - Fee payer private key

# Run database migrations
node src/db/migrate.js

# Start the server
npm start

# Server runs on http://localhost:3000
```

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed setup instructions.

## 📊 Bounty Lifecycle

```
pending_deposit → deposit_confirmed → ready_to_claim → claimed
       │                                                  
       └─────> cancelled (if label removed)
```

**Status Definitions:**
- `pending_deposit` - Bounty created, awaiting funds
- `deposit_confirmed` - Funds escrowed, ready for work
- `ready_to_claim` - PR merged, contributor can claim
- `claimed` - Bounty paid out
- `cancelled` - Bounty cancelled, funds refunded

## 🧪 Testing

```bash
# Check balance of a wallet
node src/scripts/check-balance.js <wallet-address>

# Simulate a deposit (devnet)
node src/scripts/simulate-deposit.js <wallet-address> <amount>

# Test webhook
node src/scripts/test-webhook.js
```

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for development setup.

## 🗺️ Roadmap

### Current Features ✅
- [x] GitHub App integration
- [x] USDC and SOL bounties
- [x] Automatic escrow
- [x] Claim dashboard
- [x] GitHub OAuth
- [x] Mainnet support
- [x] Bounty cancellation & refunds
- [x] Security validations

### Planned Features 🚧
- [ ] Bounty discovery dashboard
- [ ] Email notifications
- [ ] Multiple contributors per bounty
- [ ] Partial bounty claims
- [ ] Reputation system
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Browser extension
- [ ] More blockchains (Ethereum, Polygon)

## 📝 License

[Add your license here - e.g., MIT]

## 💬 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/gitwork/issues)
- **Discord**: [Coming soon]
- **Twitter**: [@GitWork](https://twitter.com/gitwork)
- **Email**: support@gitwork.io

## 🌟 Show Your Support

If you find GitWork useful:
- ⭐ Star this repository
- 🐦 Tweet about it
- 📝 Write a blog post
- 🎤 Talk about it at meetups
- 💰 Create bounties on your repos!

## 🙏 Acknowledgments

- **Solana** - For the blazing fast blockchain
- **Privy** - For embedded wallet infrastructure
- **GitHub** - For the amazing API and webhooks
- **The Open Source Community** - For making the internet what it is

---

<div align="center">

**Made with ❤️ for the open source community**

[Website](https://gitwork.io) • [Twitter](https://twitter.com/gitwork) • [Discord](#) • [Docs](docs/)

</div>
