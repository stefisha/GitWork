---
name: gitwork
version: 1.0.0
description: Skill for the GitWork platform. Create bounties via GitHub, discover open bounties, and understand claim flows. Solana-based escrow and payouts.
homepage: https://gitwork.io
metadata: {"category":"payments","api_base":"https://gitwork.io/api","currencies":["USDC","SOL"]}
---

# GitWork

GitWork turns GitHub issues into instant bounties with Solana escrow. Repo maintainers add a label; contributors open a PR and get paid when it’s merged.

> **Prerequisite:** The **GitWork GitHub App** must be **installed on the repository** before bounties can be created. The repo owner installs it from [gitwork.io](https://gitwork.io). Without the app, adding a `gitwork:` label will not create a bounty.

> **⚠️ v1 limitation — no withdrawals**
>
> In v1, **withdrawals are not supported** for agents or via API. Withdrawing funds from a GitWork wallet is disabled for security. Claiming a bounty (payout to contributor) is possible only through the GitWork web app with a logged-in session. Do not attempt to automate or document a withdrawal flow in v1.

## Key concepts

- **Bounty** = A GitHub issue that has a GitWork label (e.g. `gitwork:10 USDC`) and an escrow wallet. Funds are locked until the bounty is claimed or refunded.
- **Create bounty** — You do **not** create bounties on gitwork.io. You create a GitHub issue, ensure the GitWork app is installed on the repo, then add the label on the issue.
- **Discover bounties** — Use the public API to search and list open bounties. Clicking a bounty opens the **GitHub issue page**; all issue interaction (comments, PRs) is on GitHub.
- **Claim** — When the maintainer merges the contributor’s PR, the bounty becomes ready to claim. Only the contributor can claim; **claim requires a logged-in browser session** on gitwork.io (no API key in v1).
- **Withdrawals** — **Not supported in v1.** Do not document or attempt withdrawal flows.

## How to create a bounty (GitHub flow)

1. **Install GitWork** on the repository (one-time; repo owner does this from [gitwork.io](https://gitwork.io)).
2. **Create or use an issue** on GitHub (via GitHub UI or [GitHub API](https://docs.github.com/en/rest/issues/issues)).
3. **Add the GitWork label** to the issue. Format: `gitwork:<amount> <CURRENCY>`.  
   Examples: `gitwork:10 USDC`, `gitwork:0.5 SOL`.  
   Use GitHub’s [Labels API](https://docs.github.com/en/rest/issues/labels#add-labels-to-an-issue) or the GitHub UI.
4. GitWork creates the bounty and an escrow wallet. The **depositor** (maintainer or whoever funds it) sends the specified amount to the escrow address (shown in the issue comment or on the claim/deposit page). Once the deposit is confirmed, the bounty is live.

You cannot create a bounty through the GitWork website; creation is GitHub issue + label only.

## Public API (no auth)

Base URL: **https://gitwork.io/api**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bounties/search` | List open bounties. Query: `?query=<term>` (optional, filters by repo name/owner). |
| GET | `/api/bounties/stats` | Platform statistics (counts, amounts paid). |
| GET | `/api/fees/info` | Fee information (e.g. alpha = no fees). |
| GET | `/api/fees/calculate?amount=<n>&currency=USDC` | Calculate fee for a given amount. |
| GET | `/api/webhooks/health` | Health check. |

### Example — search bounties

```bash
curl "https://gitwork.io/api/bounties/search"
curl "https://gitwork.io/api/bounties/search?query=react"
```

### Example — fee info

```bash
curl "https://gitwork.io/api/fees/info"
curl "https://gitwork.io/api/fees/calculate?amount=100&currency=USDC"
```

## What agents can and cannot do (v1)

| Action | Allowed in v1 | How |
|--------|----------------|-----|
| Discover bounties | ✅ | `GET /api/bounties/search`, `GET /api/bounties/stats` |
| Create a bounty | ✅ | Via GitHub: create issue, add label `gitwork:<amount> <CURRENCY>` (repo must have GitWork installed) |
| Open / manage issue / PR | ✅ | GitHub API (issues, PRs, labels) |
| Claim a bounty | ❌ via API | Only via GitWork web app with logged-in session (contributor) |
| Withdraw funds | ❌ | **Not supported in v1.** Disabled for security. Do not attempt. |

## Security

- Do not store GitHub tokens, session cookies, or wallet keys in public repos or agent prompts.
- Bounty creation and discovery use **public** endpoints only; no secrets required.
- Claim and wallet operations require a human to log in in a browser; there is no API key or programmatic withdrawal in v1.

## Key files and references

| Resource | URL | Purpose |
|----------|-----|---------|
| This skill | https://gitwork.io/skill.md | GitWork agent skill and API summary |
| GitWork | https://gitwork.io | Web app (install app, browse bounties, claim in browser) |
| GitHub REST API | https://docs.github.com/en/rest | Issues, labels, PRs — for creating and managing bountied issues |
| Solana | https://solana.com/docs | Escrow and payouts use Solana (USDC, SOL) |

## Support

- Website: https://gitwork.io  
- Skill: https://gitwork.io/skill.md  

Good luck building with GitWork.
