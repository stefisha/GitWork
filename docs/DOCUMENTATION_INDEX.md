# GitWork Documentation Index

Last updated: October 22, 2025

## 📁 Documentation Structure

```
GitWork/
├── README.md                           # Main project README
│
├── docs/                               # 📚 All documentation in one place
│   ├── README.md                       # Documentation hub
│   ├── DOCUMENTATION_INDEX.md          # This file (complete index)
│   │
│   ├── REPO_OWNER_FLOW.md             # How to create bounties
│   ├── CONTRIBUTOR_FLOW.md            # How to claim bounties
│   │
│   ├── ARCHITECTURE.md                 # System design overview
│   ├── VISUAL_FLOW.md                  # Diagrams and flowcharts
│   │
│   ├── SETUP_GUIDE.md                  # Local development setup
│   ├── QUICK_REFERENCE.md              # Common commands
│   │
│   ├── DEPLOYMENT_GUIDE.md             # Production deployment (detailed)
│   ├── DEPLOYMENT_QUICK_START.md       # Production deployment (quick)
│   │
│   └── MAINNET_SETUP.md                # Mainnet configuration
│
├── deployment/                         # ⚙️ Configuration files only
│   ├── README.md                       # Points to docs/
│   ├── setup-vm.sh                     # Automated server setup script
│   └── nginx-config.conf               # Nginx configuration
│
└── src/                                # Source code
    ├── scripts/                        # Utility scripts
    │   ├── check-balance.js            # Check wallet balance
    │   ├── simulate-deposit.js         # Simulate deposit (testing)
    │   └── test-webhook.js             # Test webhook processing
    └── ...
```

## 🎯 Documentation by Use Case

### I want to create bounties on my repos
1. Start: [REPO_OWNER_FLOW.md](./REPO_OWNER_FLOW.md)
2. Reference: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. Troubleshooting: Check logs in [REPO_OWNER_FLOW.md#troubleshooting](./REPO_OWNER_FLOW.md#troubleshooting)

### I want to solve bounties and get paid
1. Start: [CONTRIBUTOR_FLOW.md](./CONTRIBUTOR_FLOW.md)
2. Claiming: [CONTRIBUTOR_FLOW.md#claim-bounty](./CONTRIBUTOR_FLOW.md#claim-bounty)
3. FAQ: [CONTRIBUTOR_FLOW.md#faq](./CONTRIBUTOR_FLOW.md#faq)

### I want to run GitWork locally
1. Start: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Quick: [QUICKSTART.md](./QUICKSTART.md)
3. Database: `src/db/migrate.js`

### I want to deploy to production
1. Start: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Quick reference: [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)
3. Config files: [../deployment/](../deployment/)

### I want to understand the technical architecture
1. Start: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Visual: [VISUAL_FLOW.md](./VISUAL_FLOW.md)

### I want to switch to mainnet
1. Start: [MAINNET_SETUP.md](./MAINNET_SETUP.md)

## 📖 Documentation Files

### User Guides

| File | Description | Who It's For |
|------|-------------|--------------|
| [REPO_OWNER_FLOW.md](./REPO_OWNER_FLOW.md) | Complete guide for creating and managing bounties | Repo owners, maintainers |
| [CONTRIBUTOR_FLOW.md](./CONTRIBUTOR_FLOW.md) | Complete guide for solving issues and claiming bounties | Contributors, developers |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Common commands and workflows | All users |

### Technical Guides

| File | Description | Who It's For |
|------|-------------|--------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, tech stack, components | Developers |
| [VISUAL_FLOW.md](./VISUAL_FLOW.md) | Diagrams and flowcharts | Developers, visual learners |

### Setup & Deployment

| File | Description | Who It's For |
|------|-------------|--------------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Local development environment setup | Developers |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Comprehensive production deployment | DevOps, first-time deployers |
| [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md) | Quick deployment commands | Experienced deployers |

### Mainnet Configuration

| File | Description | Who It's For |
|------|-------------|--------------|
| [MAINNET_SETUP.md](./MAINNET_SETUP.md) | Configure for Solana mainnet (USDC & SOL) | Admins, deployers |

## 🔍 Find What You Need

### Quick Answers

**"How do I create a bounty?"**
→ [REPO_OWNER_FLOW.md#step-2-create-issue-with-bounty-label](./REPO_OWNER_FLOW.md)

**"How do I claim a bounty?"**
→ [CONTRIBUTOR_FLOW.md#step-4-claim-bounty](./CONTRIBUTOR_FLOW.md)

**"How do I deploy GitWork?"**
→ [../deployment/DEPLOYMENT_GUIDE.md](../deployment/DEPLOYMENT_GUIDE.md)

**"What currencies are supported?"**
→ USDC and SOL - See [CONTRIBUTOR_FLOW.md#supported-currencies](./CONTRIBUTOR_FLOW.md#supported-currencies)

**"How does the escrow work?"**
→ [REPO_OWNER_FLOW.md#step-3-repo-owner-deposits-funds](./REPO_OWNER_FLOW.md)

**"Can I cancel a bounty?"**
→ Yes! [REPO_OWNER_FLOW.md#issues-unlabeled-event](./REPO_OWNER_FLOW.md)

**"How do I get my GitHub App credentials?"**
→ [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**"What's the database schema?"**
→ [README.md#database-schema](./README.md#database-schema) or `src/db/migrate.js`

### Common Tasks

| Task | Documentation |
|------|---------------|
| Install GitWork bot | [REPO_OWNER_FLOW.md#step-1-install-octavian-bot](./REPO_OWNER_FLOW.md) |
| Create first bounty | [REPO_OWNER_FLOW.md](./REPO_OWNER_FLOW.md) |
| Solve a bounty issue | [CONTRIBUTOR_FLOW.md#step-2-work-on-the-issue](./CONTRIBUTOR_FLOW.md) |
| Claim your reward | [CONTRIBUTOR_FLOW.md#step-4-claim-bounty](./CONTRIBUTOR_FLOW.md) |
| Set up local environment | [SETUP_GUIDE.md](./SETUP_GUIDE.md) |
| Deploy to production | [../deployment/DEPLOYMENT_GUIDE.md](../deployment/DEPLOYMENT_GUIDE.md) |
| Switch to mainnet | [MAINNET_SETUP.md](./MAINNET_SETUP.md) |
| Check wallet balance | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Debug webhooks | [REPO_OWNER_FLOW.md#troubleshooting](./REPO_OWNER_FLOW.md) |

## 🆕 What's New

### Recently Added
- **[CONTRIBUTOR_FLOW.md](./CONTRIBUTOR_FLOW.md)** - Complete contributor guide (NEW!)
- **Organized documentation** - All docs now in `/docs` folder
- **Updated README** - Clearer quick start and navigation

### Recently Updated
- **Security features** - Currency and deposit validation
- **Bounty cancellation** - Auto-refund when label removed
- **Race condition handling** - Graceful duplicate prevention

## 🔗 External Resources

- **Solana Docs**: https://docs.solana.com
- **Privy Docs**: https://docs.privy.io
- **GitHub Apps**: https://docs.github.com/en/apps
- **Solana Explorer**: https://explorer.solana.com

## 📝 Contributing to Docs

Found a typo? Want to improve the docs?

1. Edit the relevant file in `docs/`
2. Submit a PR with your changes
3. We'll review and merge!

**Documentation Style Guide:**
- Use clear, concise language
- Include code examples
- Add diagrams where helpful
- Test all commands before documenting
- Keep it up-to-date with code changes

## 🎯 Documentation Goals

Our documentation aims to:
- ✅ Help users get started quickly
- ✅ Provide comprehensive technical reference
- ✅ Be searchable and navigable
- ✅ Include practical examples
- ✅ Stay current with features

## 📊 Documentation Coverage

- [x] Repo owner flow - Complete
- [x] Contributor flow - Complete
- [x] Local setup - Complete
- [x] Deployment - Complete
- [x] Architecture - Complete
- [x] API reference - Partial
- [ ] Advanced features - Coming soon
- [ ] Video tutorials - Planned
- [ ] Interactive examples - Planned

---

**Last updated:** October 22, 2025  
**Maintained by:** GitWork Team  
**Questions?** Open an issue or contact support@gitwork.io

