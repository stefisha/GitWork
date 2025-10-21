# GitWork Visual Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GITWORK ECOSYSTEM                            │
└─────────────────────────────────────────────────────────────────────┘

                              GitHub.com
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              Installation    Labeled PR    PR Merged
                Event         Event        Event
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   GitWork Backend       │
                    │   (Express + Node.js)   │
                    └─────────────────────────┘
                                  │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
    ┌──────────────┐   ┌──────────────┐    ┌──────────────┐
    │   Database   │   │   Solana     │    │   GitHub     │
    │   (SQLite)   │   │  Blockchain  │    │     API      │
    │              │   │              │    │              │
    │  - Bounties  │   │  - Wallets   │    │  - Comments  │
    │  - Activity  │   │  - USDC      │    │  - Issues    │
    │  - Installs  │   │  - Transfer  │    │  - PRs       │
    └──────────────┘   └──────────────┘    └──────────────┘
```

## Repo Owner Flow (Detailed)

```
╔═══════════════════════════════════════════════════════════════════╗
║                    REPO OWNER CREATES BOUNTY                       ║
╚═══════════════════════════════════════════════════════════════════╝

     Repo Owner                 GitHub              GitWork            Solana
         │                        │                    │                │
         │                        │                    │                │
    1. Install                    │                    │                │
       Octavian ───────────────▶  │                    │                │
         │                        │                    │                │
         │                        │  Webhook:          │                │
         │                        │  installation ─────▶                │
         │                        │                    │                │
         │                        │                 Record              │
         │                        │                Installation          │
         │                        │                    │                │
    2. Create Issue               │                    │                │
       "Add dark mode" ──────────▶│                    │                │
         │                        │                    │                │
    3. Add Label                  │                    │                │
       "Octavian:USDC:50"────────▶│                    │                │
         │                        │                    │                │
         │                        │  Webhook:          │                │
         │                        │  labeled ──────────▶                │
         │                        │                    │                │
         │                        │                Parse Label          │
         │                        │                (USDC, 50)           │
         │                        │                    │                │
         │                        │                    │   Generate     │
         │                        │                    │   Keypair  ────▶
         │                        │                    │                │
         │                        │                    │  ◀────────  Public Key
         │                        │                    │             7Np8E...
         │                        │                    │                │
         │                        │                Save Bounty          │
         │                        │                to Database          │
         │                        │                    │                │
         │                        │  ◀────────── Post Comment           │
         │  ◀───── Notification   │  "Deposit 50      │                │
         │         from GitHub    │   USDC to..."     │                │
         │                        │                    │                │
    4. Read Comment               │                    │                │
       Copy wallet address        │                    │                │
         │                        │                    │                │
    5. Open Phantom/Solflare      │                    │                │
       wallet                     │                    │                │
         │                        │                    │                │
    6. Send 50 USDC ──────────────┼────────────────────┼───────────────▶
         │                        │                    │     Blockchain │
         │                        │                    │     confirms   │
         │                        │                    │     transfer   │
         │                        │                    │                │
         │                        │            ┌───────────────┐        │
         │                        │            │ Deposit       │        │
         │                        │            │ Monitor       │        │
         │                        │            │ (every 30s)   │        │
         │                        │            └───────┬───────┘        │
         │                        │                    │                │
         │                        │                Check Balance ───────▶
         │                        │                    │                │
         │                        │                    │  ◀──────── 50 USDC
         │                        │                    │            found!
         │                        │                    │                │
         │                        │            Update Status            │
         │                        │            to 'deposit_confirmed'   │
         │                        │                    │                │
         │                        │  ◀────────── Post Comment           │
         │  ◀───── Notification   │  "✅ Bounty      │                │
         │         from GitHub    │   Active!"        │                │
         │                        │                    │                │
         │                        │                    │                │
    ✅ BOUNTY IS NOW LIVE          │                    │                │
       FOR CONTRIBUTORS            │                    │                │
         │                        │                    │                │
```

## Contributor Flow (When PR Merged)

```
╔═══════════════════════════════════════════════════════════════════╗
║                  CONTRIBUTOR SOLVES & CLAIMS                       ║
╚═══════════════════════════════════════════════════════════════════╝

   Contributor              GitHub              GitWork            Solana
         │                    │                    │                │
    1. See bounty issue       │                    │                │
       on GitHub ─────────────▶                    │                │
         │                    │                    │                │
    2. Fork & clone           │                    │                │
       repository ────────────▶                    │                │
         │                    │                    │                │
    3. Write code             │                    │                │
       locally                │                    │                │
         │                    │                    │                │
    4. Create PR              │                    │                │
       "Fixes #42" ───────────▶                    │                │
         │                    │                    │                │
    5. Maintainer reviews     │                    │                │
       & merges PR ───────────▶                    │                │
         │                    │                    │                │
         │                    │  Webhook:          │                │
         │                    │  PR closed ────────▶                │
         │                    │  (merged=true)     │                │
         │                    │                    │                │
         │                    │                Extract issue #      │
         │                    │                from PR body         │
         │                    │                (regex: Fixes #42)   │
         │                    │                    │                │
         │                    │                Find bounty          │
         │                    │                for issue #42        │
         │                    │                    │                │
         │                    │                Update status        │
         │                    │                to 'ready_to_claim'  │
         │                    │                    │                │
         │                    │  ◀────────── Post Comment           │
         │  ◀──── Notification│  "@contributor    │                │
         │        from GitHub │   claim your      │                │
         │                    │   50 USDC at..."  │                │
         │                    │                    │                │
    6. Click claim link       │                    │                │
       (future dashboard) ────┼────────────────────▶                │
         │                    │                    │                │
    7. Login with GitHub      │                    │                │
       (OAuth) ───────────────┼────────────────────▶                │
         │                    │                    │                │
         │                    │                Verify user          │
         │                    │                matches PR author    │
         │                    │                    │                │
    8. Connect wallet         │                    │                │
       (Phantom) ─────────────┼────────────────────▶                │
         │                    │                    │                │
    9. Click "Claim"          │                    │                │
         │                    │                    │                │
         │                    │                Transfer from        │
         │                    │                escrow wallet ───────▶
         │                    │                    │    Send 50     │
         │                    │                    │    USDC        │
         │                    │                    │                │
         │  ◀──────────────────────────────────────┼───────────  Transaction
         │                    │                    │             confirmed!
         │  "50 USDC          │                    │                │
         │   received!"       │                Update status        │
         │                    │                to 'claimed'         │
         │                    │                    │                │
    ✅ BOUNTY CLAIMED!        │                    │                │
         │                    │                    │                │
```

## Database State Machine

```
╔════════════════════════════════════════════════════════════════╗
║                     BOUNTY STATUS LIFECYCLE                     ║
╚════════════════════════════════════════════════════════════════╝

                        ┌───────────────────┐
                        │  Label Added      │
                        │  (GitHub)         │
                        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                  ┌─────│ pending_deposit   │
                  │     └─────────┬─────────┘
                  │               │
                  │               │ Deposit detected
                  │               │ by monitor
                  │               ▼
                  │     ┌───────────────────┐
                  │     │deposit_confirmed  │
                  │     └─────────┬─────────┘
                  │               │
                  │               │ PR merged
                  │               │
                  │               ▼
                  │     ┌───────────────────┐
                  │     │ ready_to_claim    │
                  │     └─────────┬─────────┘
                  │               │
                  │               │ User claims
                  │               │ via dashboard
                  │               ▼
                  │     ┌───────────────────┐
                  │     │    claimed        │
                  │     └───────────────────┘
                  │
                  │ Label removed
                  │ (before deposit)
                  │
                  └────▶┌───────────────────┐
                        │    cancelled      │
                        └───────────────────┘
```

## Component Interaction

```
╔═══════════════════════════════════════════════════════════════════╗
║                    COMPONENT INTERACTIONS                          ║
╚═══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│                     GitHub Webhook Event                          │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Webhook Router                                 │
│                  (src/routes/webhooks.js)                         │
│                                                                   │
│  • Verify signature                                               │
│  • Route to appropriate handler                                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Installation │ │   Issue      │ │  Pull Request│
    │   Handler    │ │  Labeled     │ │   Closed     │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           ▼                ▼                ▼
    ┌──────────────────────────────────────────────────┐
    │         Bounty Service                            │
    │       (src/services/bounty.js)                    │
    │                                                   │
    │  • processBountyLabel()                           │
    │  • createBounty()                                 │
    │  • updateBountyStatus()                           │
    └────────┬──────────────────────────┬───────────────┘
             │                          │
             ▼                          ▼
    ┌────────────────┐       ┌────────────────┐
    │ Solana Service │       │ GitHub Service │
    │ (solana.js)    │       │ (github.js)    │
    │                │       │                │
    │ • Create wallet│       │ • Post comment │
    │ • Check balance│       │ • Get issue    │
    └────────┬───────┘       └────────┬───────┘
             │                        │
             ▼                        ▼
    ┌────────────────┐       ┌────────────────┐
    │ Solana         │       │   GitHub       │
    │ Blockchain     │       │     API        │
    └────────────────┘       └────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │   Deposit Monitor              │
    │   (deposit-monitor.js)         │
    │                                │
    │   Background service           │
    │   Check every 30s              │
    └────────────────────────────────┘
             │
             ▼
    ┌────────────────┐
    │   Database     │
    │   (SQLite)     │
    │                │
    │ • bounties     │
    │ • installations│
    │ • activity_log │
    └────────────────┘
```

## Data Flow Example

```
╔═══════════════════════════════════════════════════════════════════╗
║              EXAMPLE: Creating a 50 USDC Bounty                    ║
╚═══════════════════════════════════════════════════════════════════╝

1. Label Added: "Octavian:USDC:50"
   ↓
2. Webhook Payload:
   {
     "action": "labeled",
     "label": { "name": "Octavian:USDC:50" },
     "issue": {
       "number": 42,
       "repository": "myrepo"
     }
   }
   ↓
3. Parse Label:
   currency = "USDC"
   amount = 50
   ↓
4. Create Solana Wallet:
   keypair = Keypair.generate()
   publicKey = "7Np8E2rC..."
   privateKey = "encrypted..."
   ↓
5. Database Insert:
   INSERT INTO bounties (
     github_issue_number = 42,
     bounty_amount = 50,
     currency = "USDC",
     escrow_wallet_address = "7Np8E2rC...",
     status = "pending_deposit"
   )
   ↓
6. GitHub Comment:
   POST /repos/owner/repo/issues/42/comments
   body = "Deposit 50 USDC to 7Np8E2rC..."
   ↓
7. Activity Log:
   INSERT INTO activity_log (
     bounty_id = 1,
     event_type = "bounty_created",
     event_data = '{"amount": 50, "currency": "USDC"}'
   )
   ↓
8. Deposit Monitor Starts Watching...
   ↓
9. User Deposits 50 USDC to 7Np8E2rC...
   ↓
10. Monitor Detects:
    balance = await checkUSDCBalance("7Np8E2rC...")
    if (balance >= 50) {
      status = "deposit_confirmed"
    }
    ↓
11. Update Database:
    UPDATE bounties
    SET status = "deposit_confirmed",
        deposit_confirmed_at = NOW()
    WHERE id = 1
    ↓
12. Post Confirmation:
    POST /repos/owner/repo/issues/42/comments
    body = "✅ Bounty Active!"
    ↓
13. Log Activity:
    INSERT INTO activity_log (
      bounty_id = 1,
      event_type = "status_changed",
      event_data = '{"status": "deposit_confirmed"}'
    )

COMPLETE! Bounty is now live and waiting for contributors.
```

## File Structure Flow

```
Request Flow Through Files:
═══════════════════════════

GitHub Webhook
    │
    ▼
src/index.js
    │ (Express app)
    │
    ├─▶ app.use('/api/webhooks', webhookRoutes)
    │
    ▼
src/routes/webhooks.js
    │ (Route handlers)
    │
    ├─▶ webhooks.on('issues.labeled', ...)
    │   │
    │   ▼
    │   src/services/bounty.js
    │       │
    │       ├─▶ processBountyLabel()
    │       │   │
    │       │   ├─▶ src/utils/parser.js
    │       │   │   └─▶ parseBountyLabel()
    │       │   │
    │       │   ├─▶ src/services/solana.js
    │       │   │   └─▶ createEscrowWallet()
    │       │   │
    │       │   ├─▶ src/db/database.js
    │       │   │   └─▶ INSERT INTO bounties
    │       │   │
    │       │   └─▶ src/services/github.js
    │       │       └─▶ postIssueComment()
    │       │
    │       └─▶ logActivity()
    │           └─▶ INSERT INTO activity_log
    │
    └─▶ Response: 200 OK

Background Process:
═══════════════════

src/index.js
    │ (After server start)
    │
    └─▶ depositMonitor.start()
        │
        ▼
    src/services/deposit-monitor.js
        │
        ├─▶ setInterval(30s)
        │   │
        │   └─▶ checkPendingDeposits()
        │       │
        │       ├─▶ src/services/bounty.js
        │       │   └─▶ getBountyByStatus('pending_deposit')
        │       │
        │       ├─▶ src/services/solana.js
        │       │   └─▶ checkUSDCBalance()
        │       │
        │       ├─▶ src/services/bounty.js
        │       │   └─▶ updateBountyStatus()
        │       │
        │       └─▶ src/services/github.js
        │           └─▶ postIssueComment()
```

---

## Legend

```
 ──▶  Flow direction
 ┌──┐ Component/Service
 │  │ Process/Action
 ═══  Major section
 ···  Background process
 ✅   Success state
 ❌   Error state
 ⏳   Waiting state
 💰   Money/Bounty related
```

---

**These diagrams show the complete flow of GitWork from all angles!**


