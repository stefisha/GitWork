# GitWork

Open source runs the internet, yet most of the people building it are doing it for free. GitWork fixes that by turning GitHub issues into instant bounties on the Solana blockchain.

## How It Works

### For Repo Owners
1. Install the Octavian GitHub bot
2. Create an issue with label `Octavian:USDC:50` (for a 50 USDC bounty)
3. Deposit funds into the escrow wallet
4. Contributors solve the issue and get paid automatically when merged

### For Contributors
1. Solve an issue with a bounty
2. Submit a pull request
3. When merged, claim your reward via the GitWork dashboard

## Setup

### Prerequisites
- Node.js 18+
- GitHub App credentials
- Privy account for wallet management
- Solana devnet/mainnet access

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run db:migrate
npm start
```

### GitHub App Setup

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Create a new GitHub App with:
   - Webhook URL: `https://your-domain.com/api/webhooks/github`
   - Webhook secret: (generate a random string)
   - Permissions:
     - Issues: Read & Write
     - Pull Requests: Read & Write
     - Contents: Read-only
   - Subscribe to events:
     - Issues
     - Issue comment
     - Pull request
     - Label

3. Generate a private key and save it as `private-key.pem`
4. Note your App ID and update `.env`

## Project Structure

```
gitwork/
├── src/
│   ├── index.js              # Entry point
│   ├── routes/
│   │   └── webhooks.js       # GitHub webhook handlers
│   ├── services/
│   │   ├── github.js         # GitHub API interactions
│   │   ├── solana.js         # Solana blockchain interactions
│   │   ├── privy.js          # Privy wallet management
│   │   └── bounty.js         # Bounty business logic
│   ├── db/
│   │   ├── database.js       # Database connection
│   │   └── migrate.js        # Database migrations
│   └── utils/
│       └── parser.js         # Label parsing utilities
└── package.json
```

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Blockchain**: Solana
- **Wallet Management**: Privy
- **GitHub Integration**: Octokit

## License

MIT


