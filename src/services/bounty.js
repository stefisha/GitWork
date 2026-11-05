import db from '../db/database.js';
import { checkSOLBalance, checkSPLBalance } from './solana.js';
import { getTokenBySymbol, getSupportedSymbols } from '../config/tokens.js';
import { createBountyWallet } from './privy.js';
import { 
  postIssueComment, 
  generateDepositRequestComment,
  generateDepositConfirmedComment,
  generateClaimNotificationComment 
} from './github.js';
import { refundEscrowedFunds } from './privy.js';
import { parseBountyLabel, findBountyLabel } from '../utils/parser.js';

/**
 * Create a new bounty from a GitHub issue
 * 
 * @param {Object} params - Bounty parameters
 * @returns {Object} - Created bounty
 */
export async function createBounty({ 
  githubIssueId, 
  githubRepoOwner, 
  githubRepoName, 
  githubIssueNumber, 
  bountyAmount, 
  currency,
  installationId,
  githubIssueTitle = null,
  isRepoPrivate = false
}) {
  // Generate a unique bounty ID first
  const tempId = `${githubRepoOwner}-${githubRepoName}-${githubIssueNumber}-${Date.now()}`;
  
  // Create Privy Solana wallet for this bounty
  const wallet = await createBountyWallet(tempId);
  console.log(`📬 Escrow wallet created: ${wallet.address}`);
  
  const stmt = db.prepare(`
    INSERT INTO bounties (
      github_issue_id,
      github_repo_owner,
      github_repo_name,
      github_issue_number,
      github_issue_title,
      is_repo_private,
      bounty_amount,
      currency,
      escrow_wallet_address,
      escrow_wallet_private_key,
      github_installation_id,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_deposit')
  `);
  
  try {
    const result = stmt.run(
      githubIssueId,
      githubRepoOwner,
      githubRepoName,
      githubIssueNumber,
      githubIssueTitle,
      isRepoPrivate ? 1 : 0,
      bountyAmount,
      currency,
      wallet.address,
      null, // Privy manages the private key, we don't store it
      installationId
    );
    
    logActivity(result.lastInsertRowid, 'bounty_created', { 
      amount: bountyAmount, 
      currency,
      walletAddress: wallet.address
    });
    
    return {
      id: result.lastInsertRowid,
      escrowWallet: wallet.address,
      amount: bountyAmount,
      currency
    };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`Bounty already exists for issue #${githubIssueNumber} (race condition detected)`);
      // Return the existing bounty
      const existing = getBountyByIssue(githubRepoOwner, githubRepoName, githubIssueNumber);
      if (existing) {
        return existing;
      }
      throw new Error('Bounty already exists but could not retrieve it');
    }
    throw error;
  }
}

/**
 * Get bounty by GitHub issue
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @returns {Object|null} - Bounty data or null
 */
export function getBountyByIssue(owner, repo, issueNumber) {
  const stmt = db.prepare(`
    SELECT * FROM bounties 
    WHERE github_repo_owner = ? 
      AND github_repo_name = ? 
      AND github_issue_number = ?
    LIMIT 1
  `);
  
  return stmt.get(owner, repo, issueNumber);
}

/**
 * Get bounty by ID
 * 
 * @param {number} id - Bounty ID
 * @returns {Object|null} - Bounty data or null
 */
export function getBountyById(id) {
  const stmt = db.prepare('SELECT * FROM bounties WHERE id = ?');
  return stmt.get(id);
}

/**
 * Update bounty status
 * 
 * @param {number} id - Bounty ID
 * @param {string} status - New status
 * @param {Object} additionalData - Additional fields to update
 */
export function updateBountyStatus(id, status, additionalData = {}) {
  const fields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
  const values = [status];
  
  if (status === 'deposit_confirmed') {
    fields.push('deposit_confirmed_at = CURRENT_TIMESTAMP');
  }
  
  if (status === 'claimed') {
    fields.push('claimed_at = CURRENT_TIMESTAMP');
  }
  
  Object.keys(additionalData).forEach(key => {
    fields.push(`${key} = ?`);
    values.push(additionalData[key]);
  });
  
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE bounties 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  stmt.run(...values);
  logActivity(id, 'status_changed', { status, ...additionalData });
}

/**
 * Check if a bounty has received the required deposit
 * Validates correct currency and exact amount
 * 
 * @param {number} bountyId - Bounty ID
 * @returns {Promise<Object>} - { valid: boolean, reason?: string, actualBalance?: number }
 */
export async function checkBountyDeposit(bountyId) {
  const bounty = getBountyById(bountyId);
  
  if (!bounty || bounty.status !== 'pending_deposit') {
    return { valid: false, reason: 'Bounty not found or not pending deposit' };
  }
  
  console.log(`🔍 Checking deposit for bounty ${bountyId}: ${bounty.bounty_amount} ${bounty.currency}`);

  const token = getTokenBySymbol(bounty.currency);
  if (!token) {
    return { valid: false, reason: `Unsupported currency: ${bounty.currency}` };
  }

  if (token.symbol === 'SOL') {
    const solBalance = await checkSOLBalance(bounty.escrow_wallet_address);
    console.log(`💰 Wallet SOL balance: ${solBalance}`);
    if (solBalance < bounty.bounty_amount) {
      return {
        valid: false,
        reason: `Insufficient SOL. Required: ${bounty.bounty_amount}, Found: ${solBalance}`,
        actualBalance: solBalance
      };
    }
    return { valid: true, actualBalance: solBalance };
  }

  // SPL token (USDC or any whitelisted token)
  const balance = await checkSPLBalance(
    bounty.escrow_wallet_address,
    token.mint,
    token.decimals
  );
  console.log(`💰 Wallet ${token.symbol} balance: ${balance}`);
  if (balance < bounty.bounty_amount) {
    return {
      valid: false,
      reason: `Insufficient ${token.symbol}. Required: ${bounty.bounty_amount}, Found: ${balance}`,
      actualBalance: balance
    };
  }
  return { valid: true, actualBalance: balance };
}

/**
 * Log activity for a bounty
 * 
 * @param {number} bountyId - Bounty ID
 * @param {string} eventType - Event type
 * @param {Object} eventData - Event data
 */
export function logActivity(bountyId, eventType, eventData = {}) {
  const stmt = db.prepare(`
    INSERT INTO activity_log (bounty_id, event_type, event_data)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(bountyId, eventType, JSON.stringify(eventData));
}

/**
 * Cancel a bounty and refund any escrowed funds
 * 
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @param {number} issueNumber - Issue number
 * @param {number} installationId - GitHub installation ID
 * @returns {Promise<Object|null>} - Cancelled bounty or null
 */
export async function cancelBountyAndRefund(repoOwner, repoName, issueNumber, installationId) {
  console.log(`🗑️  Cancelling bounty for issue #${issueNumber} in ${repoOwner}/${repoName}`);
  
  // Find the bounty
  const bounty = getBountyByIssue(repoOwner, repoName, issueNumber);
  
  if (!bounty) {
    console.log(`No bounty found for issue #${issueNumber}`);
    return null;
  }
  
  // Only cancel if bounty is not already claimed
  if (bounty.status === 'claimed') {
    console.log(`Bounty ${bounty.id} already claimed, cannot cancel`);
    return bounty;
  }
  
  console.log(`Found bounty ${bounty.id} with status: ${bounty.status}`);
  
  // Check if there are funds to refund
  let refundResult = null;
  if (bounty.status === 'deposit_confirmed' || bounty.status === 'ready_to_claim') {
    console.log(`💰 Refunding escrowed funds: ${bounty.bounty_amount} ${bounty.currency}`);
    
    try {
      refundResult = await refundEscrowedFunds(bounty);
      console.log(`✅ Refund successful: ${refundResult.transactionSignature}`);
    } catch (error) {
      console.error(`❌ Refund failed:`, error.message);
      // Continue with cancellation even if refund fails
    }
  }
  
  // Update bounty status to cancelled
  updateBountyStatus(bounty.id, 'cancelled', {
    cancelled_at: new Date().toISOString(),
    refund_transaction: refundResult?.transactionSignature || null
  });
  
  // Log the cancellation
  logActivity(bounty.id, 'bounty_cancelled', {
    reason: 'label_removed',
    refund_transaction: refundResult?.transactionSignature || null,
    refund_amount: bounty.bounty_amount,
    refund_currency: bounty.currency
  });
  
  // Post cancellation comment
  try {
    const { postIssueComment } = await import('./github.js');
    
    const comment = `## 🗑️ Bounty Cancelled

This bounty has been cancelled because the bounty label was removed.

**Bounty Details:**
- **Amount:** ${bounty.bounty_amount} ${bounty.currency}
- **Status:** Cancelled
${refundResult ? `- **Refund:** [View Transaction](https://explorer.solana.com/tx/${refundResult.transactionSignature})` : ''}

${refundResult ? '**Funds have been refunded to the original depositor.**' : '**No funds were escrowed, so no refund was necessary.**'}

---
*Powered by [GitWork](https://gitwork.io) - Making open source rewarding* 💎`;

    await postIssueComment(
      installationId,
      repoOwner,
      repoName,
      issueNumber,
      comment
    );
    
    console.log(`💬 Posted cancellation comment on issue #${issueNumber}`);
  } catch (error) {
    console.error(`❌ Failed to post cancellation comment:`, error.message);
  }
  
  return bounty;
}

/**
 * Process a new bounty label on an issue
 * 
 * @param {Object} issue - GitHub issue object
 * @param {number} installationId - GitHub installation ID
 * @returns {Promise<Object|null>} - Created bounty or null
 */
export async function processBountyLabel(issue, installationId) {
  const bountyInfo = findBountyLabel(issue.labels);
  
  if (!bountyInfo) {
    return null;
  }
  
  // Handle multiple bounty labels error
  if (bountyInfo.error === 'MULTIPLE_BOUNTY_LABELS') {
    console.log(`❌ ${bountyInfo.message}`);
    
    // Post error comment on the issue
    const errorComment = `## ❌ Multiple Bounty Labels Detected

I found multiple bounty labels on this issue. Please use **only one bounty label** per issue.

**Found labels:**
${bountyInfo.labels.map(label => `- \`${label.labelName}\` (${label.amount} ${label.currency})`).join('\n')}

**To fix this:**
1. Remove all bounty labels except one
2. I'll automatically create the bounty when only one label remains

**Supported formats:**
- \`gitwork:USDC:50\` - 50 USDC bounty
- \`gitwork:SOL:0.1\` - 0.1 SOL bounty

---
*Powered by [GitWork](https://gitwork.io) - Making open source rewarding* 💎`;

    try {
      await postIssueComment(
        installationId,
        issue.repository.owner.login,
        issue.repository.name,
        issue.number,
        errorComment
      );
      console.log(`✅ Posted multiple labels error comment on issue #${issue.number}`);
    } catch (error) {
      console.error(`❌ Failed to post error comment:`, error.message);
    }
    
    return null;
  }
  
  // Handle unsupported currency error
  if (bountyInfo.error === 'UNSUPPORTED_CURRENCY') {
    console.log(`❌ ${bountyInfo.message}`);

    const supportedList = getSupportedSymbols();
    const examples = supportedList.slice(0, 3).map(s => `\`gitwork:${s}:<amount>\``).join(', ');

    const errorComment = `## ❌ Unsupported Currency Detected

I found an unsupported currency in your bounty label: **${bountyInfo.currency}**

**Label:** \`${bountyInfo.labelName}\`

**Supported currencies:** ${supportedList.join(', ')}

**To fix this:**
1. Remove the current label: \`${bountyInfo.labelName}\`
2. Add a supported label, e.g. ${examples}

**Examples:**
- \`gitwork:USDC:50\` - 50 USDC bounty
- \`gitwork:SOL:0.1\` - 0.1 SOL bounty

---
*Powered by [GitWork](https://gitwork.io) - Making open source rewarding* 💎`;

    try {
      await postIssueComment(
        installationId,
        issue.repository.owner.login,
        issue.repository.name,
        issue.number,
        errorComment
      );
      console.log(`✅ Posted unsupported currency error comment on issue #${issue.number}`);
    } catch (error) {
      console.error(`❌ Failed to post error comment:`, error.message);
    }
    
    return null;
  }
  
  console.log(`💰 Processing bounty: ${bountyInfo.amount} ${bountyInfo.currency} for issue #${issue.number}`);
  
  // Check if bounty already exists
  const existing = getBountyByIssue(
    issue.repository.owner.login,
    issue.repository.name,
    issue.number
  );
  
  if (existing) {
    console.log(`Bounty already exists for issue #${issue.number} (ID: ${existing.id})`);
    
    // If the existing bounty has different details, update it
    if (existing.currency !== bountyInfo.currency || existing.bounty_amount !== bountyInfo.amount) {
      console.log(`Updating existing bounty from ${existing.currency} ${existing.bounty_amount} to ${bountyInfo.currency} ${bountyInfo.amount}`);
      
      // Update the existing bounty (including issue title and private status if changed)
      const updateStmt = db.prepare(`
        UPDATE bounties 
        SET bounty_amount = ?, 
            currency = ?, 
            github_issue_title = ?,
            is_repo_private = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      
      updateStmt.run(
        bountyInfo.amount, 
        bountyInfo.currency, 
        issue.title || existing.github_issue_title,
        issue.repository.private ? 1 : 0,
        existing.id
      );
      
      // Log the update
      logActivity(existing.id, 'bounty_updated', {
        old_amount: existing.bounty_amount,
        old_currency: existing.currency,
        new_amount: bountyInfo.amount,
        new_currency: bountyInfo.currency
      });
      
      return { ...existing, bounty_amount: bountyInfo.amount, currency: bountyInfo.currency };
    }
    
    return existing;
  }
  
  // Create new bounty with error handling for race conditions
  let bounty;
  try {
    bounty = await createBounty({
      githubIssueId: issue.id,
      githubRepoOwner: issue.repository.owner.login,
      githubRepoName: issue.repository.name,
      githubIssueNumber: issue.number,
      bountyAmount: bountyInfo.amount,
      currency: bountyInfo.currency,
      installationId: installationId,
      githubIssueTitle: issue.title,
      isRepoPrivate: issue.repository.private || false
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      console.log(`Bounty already exists for issue #${issue.number} (race condition detected)`);
      // Return the existing bounty
      return getBountyByIssue(
        issue.repository.owner.login,
        issue.repository.name,
        issue.number
      );
    }
    throw error;
  }
  
  // Post comment requesting deposit
  const comment = generateDepositRequestComment(
    bountyInfo.amount,
    bountyInfo.currency,
    bounty.escrowWallet
  );
  
  await postIssueComment(
    installationId,
    issue.repository.owner.login,
    issue.repository.name,
    issue.number,
    comment
  );
  
  logActivity(bounty.id, 'deposit_requested', { installationId });
  
  return bounty;
}

/**
 * Get all bounties with a specific status
 * 
 * @param {string} status - Status to filter by
 * @returns {Array} - Array of bounties
 */
export function getBountyByStatus(status) {
  const stmt = db.prepare('SELECT * FROM bounties WHERE status = ?');
  return stmt.all(status);
}

export default {
  createBounty,
  getBountyByIssue,
  getBountyById,
  updateBountyStatus,
  checkBountyDeposit,
  logActivity,
  processBountyLabel,
  getBountyByStatus
};

