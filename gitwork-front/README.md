# GitWork 🐙

**Make money on GitHub** - Turn GitHub issues into instant bounties with automated payments on Solana.

## 🚀 Overview

GitWork is a platform that makes open source development rewarding by automatically paying contributors when their work is merged. Built on Solana for instant, low-cost transactions.

## ✨ Features

- **Instant Payments** - Powered by Solana blockchain
- **No Fees During Beta** - Zero transaction fees while in beta
- **Automatic Escrow** - Secure wallet management with Privy
- **GitHub Integration** - Works seamlessly with your existing workflow
- **Multiple Currencies** - Support for USDC and SOL
- **Global Access** - Pay anyone, anywhere with just a Solana wallet

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Blockchain**: Solana
- **Authentication**: GitHub OAuth (planned)
- **Wallet Management**: Privy (planned)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gitwork-front.git
   cd gitwork-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How It Works

### For Repository Owners

1. **Install GitWork** - Add the Octavian GitHub App to your repository
2. **Label Your Issue** - Add a label like `octavian:usdc:50` to any GitHub issue
3. **Fund the Escrow** - Octavian creates a secure wallet and requests the bounty amount
4. **Auto-Release** - Funds automatically released when a PR solving the issue is merged

### For Contributors

1. **Find a Bounty** - Look for issues labeled with Octavian bounties on GitHub
2. **Solve the Issue** - Submit a pull request that references the issue
3. **Get Tagged** - When your PR is merged, Octavian tags you with a claim link
4. **Claim & Cash Out** - Login with GitHub, provide your Solana wallet, get paid instantly

## 💰 Supported Currencies

- **USDC** - Stablecoin pegged to USD
  ```
  octavian:usdc:50
  ```
- **SOL** - Native Solana token
  ```
  octavian:sol:0.5
  ```

## 📱 Pages

### Home Page
- Clean search interface
- Logo and branding
- Dynamic "Go" button that appears when typing

### About Page
- Platform overview and features
- How it works explanation
- Supported currencies
- Social links (X, Telegram, Discord)
- Call-to-action sections

### Profile Page
- GitHub login required
- User stats (earnings, completed bounties)
- Account information
- Recent bounty history
- Reputation system (coming soon)

### Search Page
- Project and bounty search functionality

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Social Links

- **X (Twitter)**: [@gitworkio](https://x.com/gitworkio/)
- **Telegram**: [GitWork Announcements](https://t.me/gitwork)
- **Discord**: [Join our community](https://discord.gg/ZhsXQBj4)

## 📧 Contact

For collaboration and support: [support@gitwork.io](mailto:support@gitwork.io)

## 🚧 Beta Status

This application is currently in **beta**. Some features like the reputation system are not yet available. All transactions during beta have **zero fees**.

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the open source community**