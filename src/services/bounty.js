import db from '../db/database.js';
import { checkUSDCBalance, checkSOLBalance } from './solana.js';
import { createBountyWallet } from './privy.js';
import { 
  postIssueComment, 
  generateDepositRequestComment,
  generateDepositConfirmedComment,
  generateClaimNotificationComment 
} from './github.js';
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
  installationId 
}) {
  // Generate a unique bounty ID first
  const tempId = `${githubRepoOwner}-${githubRepoName}-${githubIssueNumber}-${Date.now()}`;
  
  // Create Privy Solana wallet for this bounty
  const walletAddress = await createBountyWallet(tempId);
  console.log(`📬 Escrow wallet created: ${walletAddress}`);
  
  const stmt = db.prepare(`
    INSERT INTO bounties (
      github_issue_id,
      github_repo_owner,
      github_repo_name,
      github_issue_number,
      bounty_amount,
      currency,
      escrow_wallet_address,
      escrow_wallet_private_key,
      github_installation_id,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_deposit')
  `);
  
  const result = stmt.run(
    githubIssueId,
    githubRepoOwner,
    githubRepoName,
    githubIssueNumber,
    bountyAmount,
    currency,
    walletAddress,
    null, // Privy manages the private key, we don't store it
    installationId
  );
  
  logActivity(result.lastInsertRowid, 'bounty_created', { 
    amount: bountyAmount, 
    currency,
    walletAddress: walletAddress
  });
  
  return {
    id: result.lastInsertRowid,
    escrowWallet: walletAddress,
    amount: bountyAmount,
    currency
  };
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
 * 
 * @param {number} bountyId - Bounty ID
 * @returns {Promise<boolean>} - True if deposit confirmed
 */
export async function checkBountyDeposit(bountyId) {
  const bounty = getBountyById(bountyId);
  
  if (!bounty || bounty.status !== 'pending_deposit') {
    return false;
  }
  
  const checkBalance = bounty.currency === 'USDC' ? checkUSDCBalance : checkSOLBalance;
  const balance = await checkBalance(bounty.escrow_wallet_address);
  
  return balance >= bounty.bounty_amount;
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
  
  // Check if bounty already exists
  const existing = getBountyByIssue(
    issue.repository.owner.login,
    issue.repository.name,
    issue.number
  );
  
  if (existing) {
    console.log(`Bounty already exists for issue #${issue.number}`);
    return existing;
  }
  
  // Create new bounty
  const bounty = await createBounty({
    githubIssueId: issue.id,
    githubRepoOwner: issue.repository.owner.login,
    githubRepoName: issue.repository.name,
    githubIssueNumber: issue.number,
    bountyAmount: bountyInfo.amount,
    currency: bountyInfo.currency,
    installationId: installationId
  });
  
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

