# GitWork

**Turn GitHub issues into funded bounties.** Reward open source contributions through GitHub workflows and Solana payments.

[![Status](https://img.shields.io/badge/status-retired-64748b)](#project-status)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Solana](https://img.shields.io/badge/Solana-14f195)](https://solana.com/)

## Project status

GitWork is a retired project, preserved here as a portfolio and technical reference. This repository contains the latest application implementation, including its original interface and integration flows. The former hosted service is no longer presented as an active product.

Running the full application requires your own GitHub, Privy, Solana, and optional browser integration configuration. No production credentials or user databases are included.

## How it works

1. A repository owner adds a label such as `gitwork:USDC:50` to a GitHub issue.
2. The GitHub App processes the label and creates a bounty with a dedicated escrow wallet.
3. A deposit monitor confirms funding and updates the bounty listing.
4. A contributor submits a pull request referencing the issue.
5. Once the pull request is merged, the contributor can claim the reward.

The implementation includes GitHub OAuth, contributor profiles, managed user wallets, earnings history, withdrawals, configurable fees, refunds, token price estimates, and optional Discord funding notifications. Bounty labels support SOL and allowlisted SPL tokens; internal wallet withdrawals support USDC and SOL. Legacy `octavian:` labels remain supported.

## Technology

| Layer | Stack |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS |
| API | Node.js, Express, Passport, Octokit |
| Storage | SQLite with `better-sqlite3` |
| Wallets and settlement | Privy, Solana web3.js, SPL Token |
| Supporting integrations | CoinGecko pricing, Discord webhooks, EmailJS |

## Local setup

Use Node.js 22 or newer and npm. The native SQLite dependency may require compiler tools if a prebuilt binary is unavailable for your environment.

```sh
# Install the backend and frontend dependencies
npm ci
npm --prefix gitwork-front ci

# Copy the safe configuration templates
cp .env.example .env
cp gitwork-front/.env.example gitwork-front/.env.local
```

Configure your own credentials in the local environment files. Generate independent session and webhook secrets, for example with `openssl rand -hex 32`. Set `GITHUB_PRIVATE_KEY_PATH` to a locally stored GitHub App private key, and configure OAuth callback and claim URLs for your environment.

```sh
# Initialize storage and start the backend
npm run db:migrate
npm run dev
```

In another terminal, run the original frontend:

```sh
npm --prefix gitwork-front run dev
```

The original Vite configuration and backend both default to port 3000. If running them separately, choose another frontend port, such as `npm --prefix gitwork-front run dev -- --port 5173`, and configure the API and OAuth URLs for the setup you are testing. For a same-origin deployment, build the frontend and serve it through the Express production configuration.

```sh
npm --prefix gitwork-front run build
NODE_ENV=production npm start
```

The example RPC and USDC mint use **Solana devnet**. Other allowlisted token mint addresses are historical mainnet configuration: review mint addresses and cluster compatibility before enabling those currencies.

Browser settings beginning with `VITE_` are public. Keep GitHub App private keys, OAuth secrets, Privy secrets, RPC credentials, and wallet private keys in server-only configuration. Set `PLATFORM_REVENUE_WALLET` to a public wallet address explicitly.

## Source map

| Path | Purpose |
| --- | --- |
| `gitwork-front/` | Original application interface |
| `src/routes/` | Webhook, authentication, bounty, claim, wallet, and fee endpoints |
| `src/services/` | GitHub, Privy, Solana, deposit monitoring, pricing, and Discord |
| `src/db/` | Database schema and migrations |
| `src/config/tokens.js` | Supported token configuration |
| `docs/` | Product flows and implementation references |
| `archive-site/` | Existing retired-project landing page |

## Documentation

- [Repository owner flow](docs/REPO_OWNER_FLOW.md)
- [Contributor flow](docs/CONTRIBUTOR_FLOW.md)
- [Wallet flow](docs/GITWORK_WALLET.md)
- [Fee system](docs/FEE_SYSTEM.md)
- [Quick reference](docs/QUICK_REFERENCE.md)
- [Visual flow](docs/VISUAL_FLOW.md)
- [Security notes](SECURITY.md)

Detailed flow documents describe the retired service and may refer to its former hosted endpoints.

## Validation and limitations

```sh
# Compile the frontend
npm --prefix gitwork-front run build

# Scan the full Git history with Gitleaks installed
gitleaks git . --log-opts="--all" --redact
```

The original `npm test` command auto-discovers scripts that exercise wallet transfers and webhooks. These are integration scripts, not an offline test suite; inspect and configure them before running. A successful frontend build does not validate payment settlement.

This is historical application code, not an audited payment product. It uses server-controlled wallets rather than a trustless escrow smart contract. Review authorization, session handling, payout idempotency, concurrent withdrawals, amount validation, token configuration, and refunds before considering any deployment with real funds.
