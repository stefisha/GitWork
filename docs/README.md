> Historical reference: the hosted service is retired. Hostnames ending in `.example` below are placeholders for a self-hosted installation, not live GitWork services.

# GitWork Documentation

Welcome to GitWork! This documentation will help you understand how to use GitWork to create and claim bounties.

---

## 🎯 Quick Links

### For Repo Owners
- **[Repo Owner Flow](./REPO_OWNER_FLOW.md)** - Complete guide to creating bounties
- **[Visual Flow](./VISUAL_FLOW.md)** - Diagrams showing how bounties work

### For Contributors  
- **[Contributor Flow](./CONTRIBUTOR_FLOW.md)** - Complete guide to claiming bounties
- **[Quick Reference](./QUICK_REFERENCE.md)** - Common commands and tips

---

## 🚀 Getting Started

### I'm a Repo Owner

**Want to reward contributors for solving issues?**

1. Install the [GitWork GitHub App](https://github.com/apps/gitwork-io)
2. Add a bounty label to any issue: `gitwork:usdc:50`
3. Fund the escrow wallet (GitWork bot will tell you where)
4. Contributors solve it, you merge, they get paid!

📖 **Read:** [Repo Owner Flow](./REPO_OWNER_FLOW.md)

---

### I'm a Contributor

**Want to earn money solving open source issues?**

1. Visit [gitwork.example](https://gitwork.example) to find bounties
2. Pick an issue and solve it
3. Submit a PR that references the issue number
4. Get it merged
5. Claim your payment instantly!

📖 **Read:** [Contributor Flow](./CONTRIBUTOR_FLOW.md)

---

## 💰 How Bounties Work

### Creating a Bounty

```
1. Label → gitwork:usdc:50
2. Escrow wallet created
3. You fund it → 50 USDC
4. Bounty goes live
```

### Claiming a Bounty

```
1. Find issue with bounty
2. Submit PR → "Fixes #123"
3. PR gets merged
4. Claim link appears
5. Get paid instantly
```

---

## 🔧 Supported Label Formats

```
✅ gitwork:usdc:50     → 50 USDC bounty
✅ gitwork:sol:0.5     → 0.5 SOL bounty  
✅ gitwork:usdc:12.5   → 12.5 USDC (decimals OK)
✅ GitWork:USDC:50     → Case insensitive

❌ gitwork:eth:1       → ETH not supported
❌ gitwork:usdc        → Amount required
❌ usdc:50            → Must start with "gitwork:"
```

---

## 🌍 Currencies

### USDC (Recommended)
- Stablecoin pegged to $1 USD
- No price volatility
- Predictable value

### SOL
- Solana's native token
- Fast and low-cost
- Price varies with crypto market

---

## 🔒 Security

### For Repo Owners
- Funds held in escrow until work is done
- Cancel anytime before PR merge for full refund
- Only exact amount can be claimed

### For Contributors
- Payment guaranteed once PR is merged
- Instant payouts (no waiting)
- Transparent on-chain transactions

---

## 📊 Bounty Status Meanings

- **Pending Deposit** - Bounty created, waiting for funding
- **Active** - Funded and ready for contributors to work on
- **Ready to Claim** - PR merged, contributor can claim payment
- **Claimed** - Payment completed
- **Cancelled** - Bounty removed (refund issued if funded)

---

## ❓ Common Questions

### Can I create multiple bounties on one issue?
No, only one bounty label per issue. Remove the old label before adding a new one.

### What if I deposit the wrong amount?
The bot will detect this and let you know. You'll need to send the exact amount.

### Can I increase a bounty after creating it?
Remove the old label, add a new one with the higher amount, and fund the new escrow.

### What happens if no one solves the issue?
Remove the bounty label anytime to cancel and get a full refund.

### How long does claiming take?
Instantly! Once you click claim and sign with your wallet, funds arrive in seconds.

---

## 💬 Support

Need help?

- **Project source:** [GitWork repository](https://github.com/stefisha/GitWork)
- **Website:** [gitwork.example](https://gitwork.example)
- **Contact Form:** [gitwork.example/contact](https://gitwork.example/contact)

---

## 🎉 Status

**Alpha Launch** - We're onboarding projects!

The hosted service is retired. Self-hosting requires your own GitHub App and configuration.

---

**Made with 💜 for open source**

*GitWork - Making open source rewarding.*
