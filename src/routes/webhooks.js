import '../config.js'; // Load environment variables FIRST
import express from 'express';
import { Webhooks } from '@octokit/webhooks';
import db from '../db/database.js';
import { processBountyLabel, getBountyByIssue, updateBountyStatus, logActivity } from '../services/bounty.js';
import { postIssueComment, generateClaimNotificationComment } from '../services/github.js';

const router = express.Router();

console.log('🔐 Webhooks creating with secret:', process.env.GITHUB_WEBHOOK_SECRET ? '✅ LOADED' : '❌ MISSING');

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET || 'development-secret'
});

/**
 * Handle installation events
 */
webhooks.on('installation.created', async ({ payload }) => {
  console.log(`📦 GitHub App installed by ${payload.installation.account.login}`);
  
  const stmt = db.prepare(`
    INSERT INTO installations (github_installation_id, github_account_login, github_account_type)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(
    payload.installation.id,
    payload.installation.account.login,
    payload.installation.account.type
  );
});

/**
 * Handle installation deletion
 */
webhooks.on('installation.deleted', async ({ payload }) => {
  console.log(`❌ GitHub App uninstalled by ${payload.installation.account.login}`);
  
  const stmt = db.prepare(`
    UPDATE installations 
    SET uninstalled_at = CURRENT_TIMESTAMP 
    WHERE github_installation_id = ?
  `);
  
  stmt.run(payload.installation.id);
});

/**
 * Handle issue labeled events
 * This is triggered when a repo owner adds a bounty label
 */
webhooks.on('issues.labeled', async ({ payload }) => {
  const { issue, label, installation, repository } = payload;
  
  console.log(`🏷️  Issue #${issue.number} labeled with: ${label.name}`);
  
  // Check if this is a bounty label (Octavian:USDC:50 or octavian:usdc:50)
  if (label.name.toLowerCase().startsWith('octavian:')) {
    console.log(`💰 Bounty label detected on issue #${issue.number}`);
    
    try {
      await processBountyLabel(
        {
          ...issue,
          repository: {
            owner: repository.owner,
            name: repository.name
          }
        },
        installation.id
      );
      
      console.log(`✅ Bounty created for issue #${issue.number}`);
    } catch (error) {
      console.error(`❌ Error processing bounty label:`, error);
    }
  }
});

/**
 * Handle issue unlabeled events
 * This could be used to cancel a bounty if the label is removed
 */
webhooks.on('issues.unlabeled', async ({ payload }) => {
  const { issue, label, repository } = payload;
  
  if (label.name.startsWith('Octavian:')) {
    console.log(`🗑️  Bounty label removed from issue #${issue.number}`);
    
    const bounty = getBountyByIssue(
      repository.owner.login,
      repository.name,
      issue.number
    );
    
    if (bounty && bounty.status === 'pending_deposit') {
      // Only allow cancellation if not yet deposited
      updateBountyStatus(bounty.id, 'cancelled');
      console.log(`✅ Bounty cancelled for issue #${issue.number}`);
    }
  }
});

/**
 * Handle pull request closed events
 * This is triggered when a PR is merged that resolves an issue
 */
webhooks.on('pull_request.closed', async ({ payload }) => {
  const { pull_request, installation, repository } = payload;
  
  // Only process merged PRs
  if (!pull_request.merged) {
    console.log(`⏭️  PR #${pull_request.number} closed but not merged`);
    return;
  }
  
  console.log(`🎉 PR #${pull_request.number} merged by ${pull_request.user.login}`);
  
  // Extract issue numbers from PR body or title
  // GitHub uses "Fixes #123" or "Closes #456" syntax
  const issueReferences = extractIssueReferences(pull_request.body || '', pull_request.title);
  
  if (issueReferences.length === 0) {
    console.log(`ℹ️  No issue references found in PR #${pull_request.number}`);
    return;
  }
  
  // Process each referenced issue
  for (const issueNumber of issueReferences) {
    const bounty = getBountyByIssue(
      repository.owner.login,
      repository.name,
      issueNumber
    );
    
    if (!bounty) {
      console.log(`ℹ️  No bounty found for issue #${issueNumber}`);
      continue;
    }
    
    if (bounty.status !== 'deposit_confirmed') {
      console.log(`⚠️  Bounty for issue #${issueNumber} not in deposit_confirmed status`);
      continue;
    }
    
    // Update bounty with contributor info
    updateBountyStatus(bounty.id, 'ready_to_claim', {
      contributor_github_username: pull_request.user.login,
      pull_request_number: pull_request.number
    });
    
    // Post claim notification comment
    const claimUrl = `${process.env.CLAIM_BASE_URL || 'http://localhost:3000'}/claim/${bounty.id}`;
    const comment = generateClaimNotificationComment(
      pull_request.user.login,
      bounty.bounty_amount,
      bounty.currency,
      claimUrl
    );
    
    try {
      await postIssueComment(
        installation.id,
        repository.owner.login,
        repository.name,
        issueNumber,
        comment
      );
      
      console.log(`✅ Claim notification posted for issue #${issueNumber}`);
    } catch (error) {
      console.error(`❌ Error posting claim notification:`, error);
    }
  }
});

/**
 * Extract issue numbers from text using GitHub's syntax
 * Supports: "Fixes #123", "Closes #456", "Resolves #789"
 * 
 * @param {string} body - PR body text
 * @param {string} title - PR title
 * @returns {Array<number>} - Array of issue numbers
 */
function extractIssueReferences(body, title) {
  const text = `${title}\n${body}`;
  const pattern = /(?:fix|fixes|fixed|close|closes|closed|resolve|resolves|resolved)\s+#(\d+)/gi;
  const matches = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push(parseInt(match[1], 10));
  }
  
  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Express route handler for GitHub webhooks
 */
router.post('/github', express.json(), async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const eventName = req.headers['x-github-event'];
  
  try {
    await webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'],
      name: eventName,
      signature: signature,
      payload: JSON.stringify(req.body)
    });
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'GitWork Webhooks' });
});

export default router;

