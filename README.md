# GitWork

[![Live](https://img.shields.io/badge/Live-gitwork.io-8B5CF6?style=for-the-badge)](https://gitwork.io)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-14F195?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![GitHub App](https://img.shields.io/badge/GitHub-App-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/apps/gitwork-io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Alpha-orange?style=for-the-badge)](https://gitwork.io)

**Turn GitHub issues into instant bounties. Pay developers automatically when their contributions are merged.**

GitWork makes open source rewarding by enabling anyone to create bounties on GitHub issues and automatically paying contributors when their work is merged—all powered by Solana blockchain.

🌐 **Live at:** [gitwork.io](https://gitwork.io)

---

## 🎯 For Repo Owners

### How to Create a Bounty

1. **Install the GitWork GitHub App**  
   Visit [github.com/apps/gitwork-io](https://github.com/apps/gitwork-io) and install it on your repository

2. **Add a bounty label to any issue**  
   Format: `gitwork:CURRENCY:AMOUNT`
   
   Examples:
   ```
   gitwork:usdc:50    → 50 USDC bounty
   gitwork:sol:0.5    → 0.5 SOL bounty
   gitwork:usdc:12.5  → 12.5 USDC bounty
   ```

3. **Fund the escrow wallet**  
   GitWork bot will comment with a Solana wallet address. Send the exact amount in the specified currency.

4. **Wait for contributors**  
   Once funded, the bounty becomes active and contributors can start working on it!

5. **Merge the PR**  
   When a contributor submits a PR that fixes the issue and you merge it, they can claim the bounty automatically.

### Canceling a Bounty

Simply remove the bounty label from the issue. If funds were already deposited, they'll be automatically refunded.

📖 **Full Guide:** See [docs/REPO_OWNER_FLOW.md](docs/REPO_OWNER_FLOW.md)

---

## 💰 For Contributors

### How to Claim a Bounty

1. **Find a bounty**  
   - Visit [gitwork.io](https://gitwork.io) to search for active bounties
   - Or look for issues with `gitwork:` labels on GitHub

2. **Work on the issue**  
   - Comment on the issue to let others know you're working on it
   - Create a fix in your fork

3. **Submit a PR**  
   - Reference the issue number in your PR description (e.g., "Fixes #123")
   - Make sure your code is clean and tested

4. **Get your PR merged**  
   - Wait for repo owner review
   - Address any feedback

5. **Claim your payment**  
   - Once merged, GitWork bot posts a claim link
   - Click the link, connect your Solana wallet, claim instantly!

📖 **Full Guide:** See [docs/CONTRIBUTOR_FLOW.md](docs/CONTRIBUTOR_FLOW.md)

---

## ✨ Features

- ⚡ **Lightning Fast** - Powered by MagicBlock Ephemeral Rollups for instant claims
- ✅ **Instant Payments** - Receive funds in seconds via Solana blockchain
- ✅ **Automatic Escrow** - Funds held securely until work is completed
- ✅ **Zero Fees** - No platform fees (we cover transaction costs)
- ✅ **Multiple Currencies** - Support for USDC (stablecoin) and SOL
- ✅ **GitHub Integration** - Works seamlessly with your workflow
- ✅ **Global Access** - Anyone with a Solana wallet can participate

---

## 💡 Supported Currencies

### USDC (Recommended)
- Stablecoin pegged to USD
- No price volatility
- Perfect for predictable payments

### SOL
- Solana's native token
- Fast and low-cost
- Price varies with market

---

## 📋 How It Works

```
1. Repo Owner adds label     → gitwork:usdc:50
2. GitWork creates escrow     → Solana wallet generated
3. Owner funds escrow         → Sends 50 USDC to wallet
4. Bounty becomes active      → Listed on gitwork.io + Ephemeral session created ⚡
5. Contributor submits PR     → References issue #123
6. Owner merges PR            → Closes the issue
7. Contributor claims         → Receives 50 USDC instantly via MagicBlock ⚡
```

### 🚀 MagicBlock Ephemeral Rollups

GitWork uses **MagicBlock Ephemeral Rollups** to provide:
- **⚡ Sub-second finality**: Claims are instant
- **💰 Lower costs**: Minimal transaction fees
- **🔄 Automatic settlement**: Periodic commits to Solana base layer
- **🛡️ Secure**: Same security as Solana, faster execution

When a bounty becomes claimable, an ephemeral session is automatically created, enabling contributors to receive their payments almost instantly. See [MAGICBLOCK_INTEGRATION.md](MAGICBLOCK_INTEGRATION.md) for technical details.

---

## 🔒 Security & Trust

- **Escrow Protection** - Funds held in secure Solana wallets until work is completed
- **On-Chain Transparency** - All transactions visible on Solana blockchain
- **Automatic Validation** - Deposits and payouts verified automatically
- **Refund Guarantee** - Cancel anytime before PR is merged for full refund

---

## 🌟 Why GitWork?

### The Problem
- Open source developers work for free
- No easy way to compensate contributors
- Maintainers burn out without funding
- Great contributors don't get rewarded

### The Solution
GitWork makes it **trivial** to reward open source work:
- Label an issue → Bounty created
- Merge a PR → Contributor paid
- Zero manual payment processing
- Global, instant, on-chain

---

## 📱 Getting Started

### For Repo Owners
1. [Install GitWork](https://github.com/apps/gitwork-io) on your repository
2. Read the [Repo Owner Guide](docs/REPO_OWNER_FLOW.md)
3. Create your first bounty!

### For Contributors
1. Visit [gitwork.io](https://gitwork.io)
2. Read the [Contributor Guide](docs/CONTRIBUTOR_FLOW.md)
3. Start solving issues and earning!

---

## 📚 Documentation

- **[Repo Owner Flow](docs/REPO_OWNER_FLOW.md)** - How to create and manage bounties
- **[Contributor Flow](docs/CONTRIBUTOR_FLOW.md)** - How to claim bounties and get paid
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Common commands and tips
- **[Visual Flow](docs/VISUAL_FLOW.md)** - Diagrams showing how everything works
- **[FAQ](docs/CONTRIBUTOR_FLOW.md#faq)** - Frequently asked questions

---

## 💬 Support

- **Website:** [gitwork.io](https://gitwork.io)
- **Email:** support@gitwork.io
- **GitHub Issues:** Report bugs or request features
- **Contact Form:** Available on [gitwork.io/contact](https://gitwork.io/contact)

---

## 🚀 Status

**🎉 Alpha Launch** - We are onboarding projects!

Want your repository listed? Contact us at support@gitwork.io

---

## 📊 Stats

Building the future of open source compensation:
- 💰 Total bounties created: Growing daily
- 🌍 Global contributors: From anywhere, paid instantly
- ⚡ Average claim time: < 1 minute

---

## 🤝 Contributing to GitWork

Want to help improve GitWork itself? We welcome contributions!

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features  
- Submitting pull requests
- Our code of conduct

---

## 📄 License

MIT License - Making open source rewarding for everyone.

---

**Made with 💜 for the open source community**

*GitWork - Making open source rewarding.*
