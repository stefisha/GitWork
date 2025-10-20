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
    const hasDeposit = await checkBountyDeposit(bounty.id);

    if (hasDeposit) {
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

