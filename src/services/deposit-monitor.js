import { getBountyByStatus, checkBountyDeposit, updateBountyStatus, getBountyById } from './bounty.js';
import { postIssueComment, generateDepositConfirmedComment } from './github.js';
import db from '../db/database.js';
import { notifyBountyFunded } from './discord.js';
import { findDepositorAddress } from './solana.js';
import { getTokenBySymbol } from '../config/tokens.js';

const CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Background service to monitor pending deposits
 */
class DepositMonitor {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Start monitoring for deposits
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Deposit monitor already running');
      return;
    }

    console.log('🔍 Starting deposit monitor...');
    this.isRunning = true;

    // Run immediately
    this.checkPendingDeposits();

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.checkPendingDeposits();
    }, CHECK_INTERVAL);

    console.log(`✅ Deposit monitor started (checking every ${CHECK_INTERVAL / 1000}s)`);
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️  Deposit monitor stopped');
  }

  /**
   * Check all bounties pending deposit
   */
  async checkPendingDeposits() {
    const pendingBounties = getBountyByStatus('pending_deposit');

    if (pendingBounties.length === 0) {
      return;
    }

    console.log(`🔍 Checking ${pendingBounties.length} pending deposit(s)...`);

    for (const bounty of pendingBounties) {
      try {
        await this.checkBounty(bounty);
      } catch (error) {
        console.error(`❌ Error checking bounty ${bounty.id}:`, error.message);
      }
    }
  }

  /**
   * Check a specific bounty for deposit
   * 
   * @param {Object} bounty - Bounty object
   */
  async checkBounty(bounty) {
    const depositResult = await checkBountyDeposit(bounty.id);

    if (depositResult.valid) {
      console.log(`✅ Deposit confirmed for bounty ${bounty.id} (Issue #${bounty.github_issue_number})`);

      // Try to find and store the depositor address
      let depositorAddress = null;
      try {
        const token = getTokenBySymbol(bounty.currency);
        const mintForDepositor = token && token.mint ? token.mint : null;
        depositorAddress = await findDepositorAddress(
          bounty.escrow_wallet_address,
          bounty.bounty_amount,
          bounty.currency,
          mintForDepositor
        );
        
        if (depositorAddress) {
          // Validate the address is a valid Solana public key before storing
          try {
            const { PublicKey } = await import('@solana/web3.js');
            new PublicKey(depositorAddress); // This will throw if invalid
            console.log(`👤 Found depositor address: ${depositorAddress}`);
            // Store depositor address in database
            db.prepare(`UPDATE bounties SET depositor_address = ? WHERE id = ?`).run(
              depositorAddress,
              bounty.id
            );
          } catch (error) {
            console.error(`❌ Invalid depositor address found: ${depositorAddress}. Error: ${error.message}`);
            console.log(`⚠️  Skipping invalid depositor address for bounty ${bounty.id}`);
          }
        } else {
          console.log(`⚠️  Could not determine depositor address for bounty ${bounty.id}`);
        }
      } catch (error) {
        console.error(`❌ Error finding depositor address:`, error.message);
        // Continue even if we can't find the depositor
      }

      // Update status (with depositor address if found)
      const updateData = depositorAddress ? { depositor_address: depositorAddress } : {};
      updateBountyStatus(bounty.id, 'deposit_confirmed', updateData);
      
      // Notify Discord - only notification we send!
      await notifyBountyFunded(bounty);

      // Check if we have installation ID
      if (!bounty.github_installation_id) {
        console.error(`❌ No installation ID for bounty ${bounty.id}`);
        return;
      }

      // Post confirmation comment
      try {
        const comment = generateDepositConfirmedComment(
          bounty.bounty_amount,
          bounty.currency
        );

        await postIssueComment(
          bounty.github_installation_id,
          bounty.github_repo_owner,
          bounty.github_repo_name,
          bounty.github_issue_number,
          comment
        );

        console.log(`💬 Posted deposit confirmation comment on issue #${bounty.github_issue_number}`);
      } catch (error) {
        console.error(`❌ Error posting comment:`, error.message);
      }
    } else {
      // Log validation failure
      console.log(`❌ Deposit validation failed for bounty ${bounty.id}: ${depositResult.reason}`);
      
      // If there's a significant balance but wrong currency, post a warning comment
      if (depositResult.actualBalance && depositResult.actualBalance > 0) {
        await this.postDepositErrorComment(bounty, depositResult);
      }
    }
  }

  /**
   * Post error comment for invalid deposits
   * 
   * @param {Object} bounty - Bounty object
   * @param {Object} depositResult - Deposit validation result
   */
  async postDepositErrorComment(bounty, depositResult) {
    if (!bounty.github_installation_id) {
      return;
    }

    // Get current balance for the expected currency
    const token = getTokenBySymbol(bounty.currency);
    let currentBalance = 0;
    if (token) {
      if (token.symbol === 'SOL') {
        const { checkSOLBalance } = await import('./solana.js');
        currentBalance = await checkSOLBalance(bounty.escrow_wallet_address);
      } else {
        const { checkSPLBalance } = await import('./solana.js');
        currentBalance = await checkSPLBalance(bounty.escrow_wallet_address, token.mint, token.decimals);
      }
    }

    const errorComment = `## ❌ Invalid Deposit Detected

I detected a deposit in the escrow wallet, but it doesn't match the bounty requirements.

**Bounty Requirements:**
- **Currency:** ${bounty.currency}
- **Amount:** ${bounty.bounty_amount} ${bounty.currency}

**Current ${bounty.currency} Balance:** ${currentBalance}

**Issue:** ${depositResult.reason}

**To fix this:**
1. Send the **correct currency** (${bounty.currency}) to the escrow wallet
2. Send the **exact amount** (${bounty.bounty_amount} ${bounty.currency})
3. I'll automatically detect the correct deposit

**Escrow Wallet:** \`${bounty.escrow_wallet_address}\`

---
*Powered by [GitWork](https://gitwork.io) - Making open source rewarding* 💎`;

    try {
      await postIssueComment(
        bounty.github_installation_id,
        bounty.github_repo_owner,
        bounty.github_repo_name,
        bounty.github_issue_number,
        errorComment
      );

      console.log(`💬 Posted deposit error comment on issue #${bounty.github_issue_number}`);
    } catch (error) {
      console.error(`❌ Error posting deposit error comment:`, error.message);
    }
  }

  /**
   * Get GitHub installation for a repository
   * 
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Object|null} - Installation data
   */
  getInstallationForRepo(owner, repo) {
    // For simplicity, we're just getting the installation by account name
    // In production, you'd want to track which repos each installation has access to
    const stmt = db.prepare(`
      SELECT * FROM installations 
      WHERE github_account_login = ?
        AND uninstalled_at IS NULL
      LIMIT 1
    `);

    return stmt.get(owner);
  }
}

// Create singleton instance
const monitor = new DepositMonitor();

export default monitor;

