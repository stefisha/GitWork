import { getBountyByStatus, checkBountyDeposit, updateBountyStatus, getBountyById } from './bounty.js';
import { postIssueComment, generateDepositConfirmedComment } from './github.js';
import db from '../db/database.js';

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

      // Update status
      updateBountyStatus(bounty.id, 'deposit_confirmed');

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

    // Get current balances for display
    const { checkUSDCBalance, checkSOLBalance } = await import('./solana.js');
    const [usdcBalance, solBalance] = await Promise.all([
      checkUSDCBalance(bounty.escrow_wallet_address),
      checkSOLBalance(bounty.escrow_wallet_address)
    ]);

    const errorComment = `## ❌ Invalid Deposit Detected

I detected a deposit in the escrow wallet, but it doesn't match the bounty requirements.

**Bounty Requirements:**
- **Currency:** ${bounty.currency}
- **Amount:** ${bounty.bounty_amount} ${bounty.currency}

**Current Wallet Balance:**
- **USDC:** ${usdcBalance}
- **SOL:** ${solBalance}

**Issue:** ${depositResult.reason}

**To fix this:**
1. Send the **correct currency** (${bounty.currency}) to the escrow wallet
2. Send the **exact amount** (${bounty.bounty_amount} ${bounty.currency})
3. I'll automatically detect the correct deposit

**Escrow Wallet:** \`${bounty.escrow_wallet_address}\`

---
*Powered by GitWork - Making open source rewarding* 💎`;

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

