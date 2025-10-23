# GitWork

**Turn GitHub issues into instant bounties. Pay developers automatically when their contributions are merged.**

GitWork is a platform that connects open-source projects with developers through automated bounty payments on the Solana blockchain.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Solana wallet (for testing)
- GitHub account
- GitHub App installation

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/gitwork.git
cd gitwork

# Install backend dependencies
npm install

# Install frontend dependencies
cd gitwork-front
npm install
cd ..

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

---

## 📁 Project Structure

```
gitwork/
├── src/                    # Backend source code
│   ├── routes/            # API endpoints and routes
│   ├── services/          # Business logic
│   ├── db/                # Database setup and migrations
│   ├── utils/             # Utility functions
│   └── index.js           # Main application entry
├── gitwork-front/         # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── services/      # API client
│   └── public/            # Static assets
├── docs/                  # Documentation
├── deployment/            # Deployment scripts and configs
└── data/                  # SQLite database (local dev)
```

---

## 🎯 Features

- ✅ **Automated Bounties** - Create bounties by adding labels to GitHub issues
- ✅ **Instant Payments** - Automatic payouts when PRs are merged
- ✅ **Solana Integration** - Fast, low-cost blockchain payments
- ✅ **Multiple Currencies** - Support for USDC and SOL
- ✅ **GitHub OAuth** - Secure authentication for contributors
- ✅ **Escrow System** - Funds held safely until work is completed
- ✅ **Mobile-Responsive** - Works perfectly on all devices

---

## 💻 Development

### Backend (Node.js/Express)

```bash
# Start backend server
npm run dev

# Run tests
npm test

# Check Solana balance
npm run check:balance

# Database operations
npm run db:migrate    # Run migrations
npm run db:reset      # Reset database
```

### Frontend (React/Vite)

```bash
cd gitwork-front

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Production

```bash
# On your server
cd ~/apps/gitwork
git pull origin main

# Backend
npm install
pm2 restart gitwork

# Frontend
cd gitwork-front
npm install
npm run build
cd ..
pm2 restart gitwork
```

---

## 📚 Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Contributor Flow](docs/CONTRIBUTOR_FLOW.md)** - How to claim bounties
- **[Repo Owner Flow](docs/REPO_OWNER_FLOW.md)** - How to create bounties
- **[API Reference](docs/FRONTEND_INTEGRATION.md)** - API endpoints
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Command cheat sheet

See [docs/README.md](docs/README.md) for full documentation index.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite** - Database
- **Solana Web3.js** - Blockchain integration
- **Octokit** - GitHub API client
- **Privy** - Wallet management

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **EmailJS** - Contact form

---

## 🔒 Security

- All private keys stored securely in `.env` (never committed)
- GitHub webhooks verified with secret
- User authentication via GitHub OAuth
- Transaction signing on backend only
- Input validation and sanitization

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTOR_FLOW.md](docs/CONTRIBUTOR_FLOW.md) for details on:

- How to claim bounties
- PR guidelines
- Code standards
- Testing requirements

---

## 📄 License

MIT License - see LICENSE file for details

---

## 💬 Support

- **Email**: support@gitwork.io
- **Website**: https://gitwork.io
- **GitHub Issues**: Report bugs or request features

---

## 🎉 Status

**🚀 Alpha Launch** - We are onboarding projects! If you want your repo and issues listed, contact us at support@gitwork.io

---

Made with 💜 by the GitWork team
