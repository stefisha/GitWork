# Security Architecture

## Overview

GitWork is a platform that automates bounty payments for open-source contributions on GitHub. Security is critical as we handle real user funds (USDC and SOL) in escrow wallets. This document outlines our current security model, known risks, and our roadmap for decentralization.

---

## Current Architecture (Day 1)

### Escrow Wallet Management

**Technology:** Privy Embedded Wallets

GitWork currently uses [Privy](https://privy.io) for escrow wallet management. When a bounty is created, we generate a **server-controlled Solana wallet** to hold escrowed funds until the bounty is claimed.

**How it works:**

1. **Bounty Creation**: GitWork creates a Privy-managed Solana wallet for each bounty
2. **Fund Deposit**: Repo owner deposits USDC/SOL to the escrow wallet address
3. **PR Merge**: Contributor submits and merges a pull request
4. **Payment Release**: GitWork server signs a transaction (via Privy API) to transfer funds to contributor

**Code Reference:**
```javascript
// Server-controlled wallet (no user owner)
const wallet = await privyClient.wallets().create({
  chain_type: 'solana'
  // No owner = server controls via PRIVY_APP_SECRET
});
```

### Authentication

**Technology:** GitHub OAuth + Express Sessions

- Users authenticate via GitHub OAuth
- Session data stored server-side with `express-session`
- Only PR authors can claim their bounties (verified via GitHub username)

### Transaction Signing

**Technology:** Privy API + Fee Payer Wallet

- **Escrow wallet**: Privy signs transactions via API call
- **Fee payer wallet**: Server-controlled Solana keypair pays transaction fees
- Both signatures required for fund transfers

---

## Security Model

### Trust Assumptions

GitWork currently operates as a **trusted intermediary**:

| Party | Trust Required | Risk |
|-------|---------------|------|
| **GitWork Server** | High | Server has full signing authority over escrow wallets |
| **Privy** | Medium | Privy holds encrypted private keys and provides signing API |
| **GitHub** | Medium | GitHub OAuth is the source of truth for contributor identity |
| **Repo Owners** | None | Cannot access escrow funds after deposit |
| **Contributors** | None | Cannot claim funds until PR is merged |

### Security Features

✅ **Separation of Concerns**
- Escrow wallets: Privy-managed (enterprise key management)
- Fee payer wallet: Server-controlled (for transaction costs)
- User wallets: Self-custodied (contributors own their funds post-claim)

✅ **Automatic Escrow Release**
- Funds automatically transferred when PR is merged
- No manual intervention required
- Reduces human error and fraud opportunities

✅ **GitHub Verification**
- Only the PR author can claim the bounty
- Verified via GitHub OAuth session
- Prevents impersonation attacks

✅ **Transaction Sponsorship**
- Contributors don't pay gas fees
- Improves UX and accessibility
- Fee payer wallet is separate from escrow

✅ **Credential Management**
- `PRIVY_APP_SECRET` stored in environment variables (not in code)
- Never committed to version control
- Server-side only (not exposed to frontend)

---

## Known Risks & Mitigations

### 🚨 Risk 1: Compromised `PRIVY_APP_SECRET`

**Threat:** If an attacker gains access to the `PRIVY_APP_SECRET` environment variable, they can sign transactions for all escrow wallets and drain funds.

**Impact:** Critical - all escrowed funds at risk

**Mitigations:**
- ✅ Secret stored in secure environment variables (not in code)
- ✅ Server access restricted (production server hardened)
- ✅ Privy uses enterprise-grade key management (HSMs)
- ✅ Transaction logging for audit trail
- ⚠️ **Day 2**: Migrate to on-chain escrow (removes this risk entirely)

### 🚨 Risk 2: Server Compromise

**Threat:** If the GitWork server is hacked, attacker gains access to all credentials and can manipulate bounty logic.

**Impact:** Critical - arbitrary fund transfers possible

**Mitigations:**
- ✅ Standard server hardening practices
- ✅ Regular security updates
- ✅ Minimal attack surface (no SSH access, firewalled)
- ⚠️ **Day 2**: On-chain escrow eliminates centralized control

### 🚨 Risk 3: Privy Service Outage/Failure

**Threat:** If Privy's service goes down or the company fails, escrow wallets may become temporarily or permanently inaccessible.

**Impact:** Medium - funds locked until service restored

**Mitigations:**
- ✅ Privy is a well-funded, established provider
- ✅ Used by major Web3 projects (proven track record)
- ⚠️ **Day 2**: On-chain escrow removes dependency on third-party service

### 🚨 Risk 4: GitHub OAuth Compromise

**Threat:** If a contributor's GitHub account is compromised, attacker could claim their bounty.

**Impact:** Low-Medium - affects individual bounties, not systemic

**Mitigations:**
- ✅ GitHub's security (2FA, session management)
- ✅ Contributors must provide their own Solana wallet (adds verification step)
- ✅ Transaction logs for dispute resolution
- ⚠️ **Future**: Add secondary verification (email, wallet signature)

### 🚨 Risk 5: Insider Threat

**Threat:** GitWork operators have full access to `PRIVY_APP_SECRET` and could maliciously drain escrow funds.

**Impact:** Critical - reputational and financial damage

**Mitigations:**
- ✅ Transparent operations (open-source codebase)
- ✅ On-chain transaction history (all transfers publicly visible on Solana)
- ✅ Legal liability (company structure, ToS)
- ⚠️ **Day 2**: On-chain escrow makes this impossible (trustless)

---

## Encryption & Privacy

### Arcium Integration (Optional)

For bounties using the `gitwork:currency:encrypted:amount` label format, we integrate **Arcium MPC** for confidential bounty amounts:

**Security Benefits:**
- 🔐 Bounty amounts encrypted using Multi-Party Computation
- 🔐 Only authorized parties (repo owner, contributor) can decrypt
- 🔐 Prevents gaming (contributors don't know bounty size)
- 🔐 Enterprise privacy compliance

**Implementation:**
- Uses `@arcium-hq/client` and `@arcium-hq/reader` SDKs
- Encryption happens before database storage
- Decryption requires authorization proof
- Fallback to plaintext if Arcium unavailable

**Documentation:** See `ARCIUM_INTEGRATION.md`

---

## Performance & Reliability

### MagicBlock Integration (Optional)

For instant bounty claims, we integrate **MagicBlock Ephemeral Rollups**:

**Security Considerations:**
- ⚡ Transactions execute on ephemeral rollup (sub-second finality)
- 🔄 Automatic fallback to Solana base layer if rollup unavailable
- ✅ No additional trust assumptions (same escrow model)
- ✅ Periodic settlement to base layer ensures security

**Implementation:**
- Uses `@magicblock-labs/ephemeral-rollups-sdk`
- Ephemeral sessions created for active bounties
- All transactions eventually settle on Solana mainnet

**Documentation:** See `MAGICBLOCK_INTEGRATION.md`

---

## Day 2: Decentralized Architecture

### Why We Need to Decentralize

Our current architecture prioritizes **user experience** and **rapid development**, but introduces **centralization risk**. For GitWork to scale and gain enterprise adoption, we must eliminate single points of failure and trusted intermediaries.

### Planned Migration: On-Chain Escrow Program

**Timeline:** 6-12 months post-launch

**Technology:** Solana Smart Contract (Anchor Framework)

**How it will work:**

1. **Deploy Solana Program**
   - Rust-based smart contract for trustless escrow
   - All escrow logic enforced on-chain
   - No centralized control by GitWork

2. **Program Derived Addresses (PDAs)**
   - Each bounty gets a deterministic escrow account
   - Funds locked in PDA (controlled by program, not private keys)
   - Cannot be accessed except through program instructions

3. **Oracle Model**
   - GitWork operates as an **oracle** (not custodian)
   - Oracle verifies PR merge and assigns contributor on-chain
   - Oracle cannot steal funds (only assign claimant)
   - Oracle key can be multi-sig for added security

4. **Trustless Flow**
   ```
   1. Repo Owner → createBounty() → Funds locked in PDA
   2. Contributor → PR merged
   3. GitWork Oracle → assignContributor(wallet) → On-chain verification
   4. Contributor → claim() → Direct transfer from PDA
   ```

5. **Security Properties**
   - ✅ **Trustless**: No party can steal funds
   - ✅ **Transparent**: All logic visible on-chain
   - ✅ **Auditable**: Smart contract code is public
   - ✅ **Time-locked**: Cancellations have delay periods
   - ✅ **Decentralized**: Works even if GitWork goes offline

### Hybrid Approach (Transition Period)

During migration, we'll operate a **hybrid system**:

- **Small bounties (< $100)**: Privy escrow (current system)
  - Fast UX, low risk
  - Users accept centralization for convenience

- **Large bounties (≥ $100)**: On-chain escrow (smart contract)
  - Trustless custody for high-value bounties
  - Repo owners opt-in for security

### Smart Contract Audit

Before deploying on-chain escrow, we will:
1. ✅ Complete smart contract development (Anchor/Rust)
2. ✅ Internal security review
3. ✅ **Professional security audit** (this is where Adevar Labs comes in)
4. ✅ Testnet deployment and testing
5. ✅ Gradual mainnet rollout

---

## Audit Scope

### What We'd Like Audited

If selected for the Adevar Labs security audit, we would prioritize:

#### **Phase 1: Current System (Immediate)**
1. **Backend Security**
   - Credential management (`PRIVY_APP_SECRET`, `GITHUB_WEBHOOK_SECRET`)
   - Session handling and authentication flows
   - API endpoint authorization (who can trigger payments?)
   - SQL injection / database security

2. **Transaction Flow**
   - Privy wallet integration (are we using it securely?)
   - Transaction signing and verification
   - Fee payer wallet security
   - Fund tracking and reconciliation

3. **GitHub Integration**
   - Webhook signature verification
   - OAuth token handling
   - PR merge verification logic
   - Bot comment security (prevent impersonation)

#### **Phase 2: Day 2 Architecture (Future)**
1. **Smart Contract Design**
   - Escrow PDA security model
   - Oracle authorization and trust assumptions
   - Instruction validation and access control
   - Reentrancy and race conditions
   - Integer overflow/underflow

2. **On-Chain Logic**
   - Bounty creation and funding
   - Contributor assignment
   - Claim and refund mechanisms
   - Time-lock implementation
   - Emergency pause/upgrade logic

3. **Oracle Security**
   - Oracle key management
   - PR merge verification (off-chain → on-chain)
   - Multi-sig oracle design
   - Oracle failure scenarios

---

## Security Best Practices

### Current Implementation

✅ **Credential Security**
- All secrets in environment variables
- `.env` files in `.gitignore`
- No secrets in frontend code
- Separate dev/prod environments

✅ **Input Validation**
- GitHub webhook signature verification
- Bounty label parsing (prevent injection)
- Wallet address validation (PublicKey checks)
- Amount validation (prevent overflow)

✅ **Logging & Monitoring**
- All transactions logged with timestamps
- Webhook events recorded
- Error tracking and alerting
- PM2 process monitoring

✅ **Database Security**
- Parameterized queries (prevent SQL injection)
- Minimal permissions
- Regular backups
- Schema migrations tracked

✅ **API Security**
- GitHub OAuth required for sensitive actions
- Session-based authentication
- CORS configured
- Rate limiting (future)

### Roadmap Improvements

⚠️ **Planned Security Enhancements:**
1. Rate limiting on API endpoints
2. Multi-signature oracle (3-of-5) for on-chain escrow
3. Bug bounty program after mainnet launch
4. Real-time monitoring and alerting
5. Penetration testing
6. Third-party security audit (Adevar Labs)

---

## Threat Model

### Attack Vectors

| Attack Vector | Likelihood | Impact | Mitigation Status |
|---------------|------------|--------|------------------|
| Compromised `PRIVY_APP_SECRET` | Low | Critical | ✅ Env vars, Day 2 migration |
| Server breach | Low | Critical | ✅ Hardening, Day 2 migration |
| GitHub OAuth hijack | Medium | Medium | ✅ GitHub security, wallet verification |
| Webhook forgery | Low | Medium | ✅ Signature verification |
| SQL injection | Low | Medium | ✅ Parameterized queries |
| Insider theft | Very Low | Critical | ✅ Transparency, Day 2 migration |
| Privy service failure | Very Low | High | ⚠️ Day 2 migration |
| Smart contract exploit | N/A (future) | Critical | ⚠️ Audit before deployment |

---

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Pause bounty creation (disable GitHub bot)
   - Rotate compromised credentials
   - Assess scope of breach (which wallets affected?)

2. **Communication**
   - Notify affected users immediately
   - Public disclosure (transparency)
   - Status page updates

3. **Recovery**
   - Restore service with patched vulnerability
   - Compensate affected users (if funds lost)
   - Post-mortem and root cause analysis

4. **Prevention**
   - Implement additional security controls
   - Update documentation
   - Security audit follow-up

### Contact

For security issues, please contact:
- **Email:** support@gitwork.io
- **GitHub Security Advisory:** (private disclosure)

**Please DO NOT disclose security vulnerabilities publicly until we've had a chance to address them.**

---

## Compliance & Legal

### Data Handling

- **User Data**: GitHub username, wallet address, transaction history
- **Storage**: SQLite database (local, not cloud)
- **Privacy**: See `PRIVACY.md` for full privacy policy
- **Retention**: Transaction logs retained indefinitely for auditing

### Regulatory Considerations

GitWork is:
- ✅ Non-custodial (users own their wallets after claim)
- ✅ Open-source (transparent operations)
- ⚠️ Escrow provider (temporary custody during bounty lifecycle)

**Day 2 migration eliminates escrow custody** → GitWork becomes purely an oracle service.

---

## Conclusion

GitWork's current architecture prioritizes **user experience** and **rapid iteration** while maintaining **acceptable security** for early-stage operations. We are transparent about the trade-offs:

- ✅ **Current**: Centralized escrow (Privy) for UX and speed
- 🎯 **Day 2**: Decentralized escrow (Solana smart contract) for trustlessness

**We view the Adevar Labs security audit as a critical milestone** in our journey toward full decentralization. The audit will:
1. Validate our current security model
2. Identify vulnerabilities before they're exploited
3. Inform our smart contract architecture design
4. Demonstrate our commitment to security

**Security is not a one-time event, but an ongoing commitment.** We're building for the long term.

---

## Resources

- **Website:** https://gitwork.io
- **GitHub:** https://github.com/stefisha/GitWork
- **Documentation:** `/docs` directory
- **Arcium Integration:** `ARCIUM_INTEGRATION.md`
- **MagicBlock Integration:** `MAGICBLOCK_INTEGRATION.md`
- **Privacy Policy:** `PRIVACY.md` (coming soon)

---

**Last Updated:** October 31, 2025  
**Version:** 1.0.0 (Day 1 Architecture)

