import '../config.js'; // Load environment variables FIRST
import express from 'express';
import { Webhooks } from '@octokit/webhooks';
import db from '../db/database.js';
import { processBountyLabel, getBountyByIssue, updateBountyStatus, logActivity, cancelBountyAndRefund } from '../services/bounty.js';
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
 * This cancels a bounty if the label is removed and refunds any escrowed funds
 */
webhooks.on('issues.unlabeled', async ({ payload }) => {
  const { issue, label, repository, installation } = payload;
  
  if (label.name.toLowerCase().startsWith('octavian:')) {
    console.log(`🗑️  Bounty label removed from issue #${issue.number}: ${label.name}`);
    
    try {
      await cancelBountyAndRefund(
        repository.owner.login,
        repository.name,
        issue.number,
        installation.id
      );
      
      console.log(`✅ Bounty cancelled and refunded for issue #${issue.number}`);
    } catch (error) {
      console.error(`❌ Error cancelling bounty:`, error);
    }
  }
});

/**
 * Handle issue closed events
 * Post a confirmation comment when an issue with a bounty is closed
 */
webhooks.on('issues.closed', async ({ payload }) => {
  const { issue, repository, installation } = payload;
  
  console.log(`🔒 Issue #${issue.number} closed`);
  
  // Check if this issue has a bounty
  const bounty = getBountyByIssue(
    repository.owner.login,
    repository.name,
    issue.number
  );
  
  if (!bounty) {
    return; // No bounty on this issue
  }
  
  console.log(`💰 Issue #${issue.number} has a bounty (status: ${bounty.status})`);
  
  // Post completion comment based on bounty status
  let comment = '';
  
  if (bounty.status === 'claimed') {
    comment = `## 🎊 Bounty Complete - Payment Sent!

**Congratulations!** This issue has been successfully resolved and the bounty has been paid out.

### 💰 Payment Details:
- **Amount:** ${bounty.bounty_amount} ${bounty.currency}
- **Paid to:** @${bounty.contributor_github_username}
- **Pull Request:** #${bounty.pull_request_number}
${bounty.transaction_signature ? `- **Transaction:** [View on Solana Explorer](https://explorer.solana.com/tx/${bounty.transaction_signature}) ✅` : ''}

### 🎉 Thank You!
Big thanks to @${bounty.contributor_github_username} for contributing to open source and making this project better!

---
*Automated by [GitWork](https://gitwork.dev) - Turn GitHub issues into instant bounties 🚀*`;
  } else if (bounty.status === 'ready_to_claim') {
    // Don't post "ready to claim" comment when issue is closed
    // because the claim happens so quickly it creates redundant comments
    console.log(`ℹ️  Skipping "ready to claim" comment for issue #${issue.number} - bounty will be claimed soon`);
    return; // Exit early, don't post comment
  } else {
    // Issue closed but bounty not claimed yet
    comment = `## 📌 Issue Closed

This issue has been closed. 

**Bounty Status:** ${bounty.status}

---
*Powered by [GitWork](https://gitwork.dev) 🚀*`;
  }
  
  try {
    await postIssueComment(
      installation.id,
      repository.owner.login,
      repository.name,
      issue.number,
      comment
    );
    
    console.log(`💬 Posted completion comment on issue #${issue.number}`);
  } catch (error) {
    console.error(`❌ Error posting completion comment:`, error.message);
  }
});

/**
 * Handle pull request opened events
 * Post a comment on the issue when a PR is created to resolve it
 */
webhooks.on('pull_request.opened', async ({ payload }) => {
  const { pull_request, installation, repository } = payload;
  
  console.log(`📝 PR #${pull_request.number} opened by ${pull_request.user.login}`);
  
  // Extract issue numbers from PR body or title
  const issueReferences = extractIssueReferences(pull_request.body || '', pull_request.title);
  
  if (issueReferences.length === 0) {
    console.log(`ℹ️  No issue references found in PR #${pull_request.number}`);
    return;
  }
  
  // Post comment on each referenced issue
  for (const issueNumber of issueReferences) {
    const bounty = getBountyByIssue(
      repository.owner.login,
      repository.name,
      issueNumber
    );
    
    if (!bounty) {
      continue; // Not a bounty issue
    }
    
    // Post notification on the issue
    const comment = `## 🔧 Pull Request Created!

@${pull_request.user.login} has submitted a pull request to resolve this issue: #${pull_request.number}

**Bounty:** ${bounty.bounty_amount} ${bounty.currency}
**Status:** Awaiting review and merge from repository owner

Once the PR is reviewed and merged, @${pull_request.user.login} will be able to claim the bounty! 🎯

---
*Powered by [GitWork](https://gitwork.dev) 🚀*`;
    
    try {
      await postIssueComment(
        installation.id,
        repository.owner.login,
        repository.name,
        issueNumber,
        comment
      );
      
      console.log(`✅ PR notification posted on issue #${issueNumber}`);
    } catch (error) {
      console.error(`❌ Error posting PR notification on issue:`, error);
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
    
    // Post claim notification comment on the issue
    const claimUrl = `${process.env.CLAIM_BASE_URL || 'http://localhost:3000'}/claim/${bounty.id}`;
    const issueComment = generateClaimNotificationComment(
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
        issueComment
      );
      
      console.log(`✅ Claim notification posted on issue #${issueNumber}`);
    } catch (error) {
      console.error(`❌ Error posting claim notification on issue:`, error);
    }
    
    // Also post a comment on the PR itself
    const prComment = `## 🎉 PR Merged - Bounty Unlocked!

**Awesome work @${pull_request.user.login}!** 

This PR successfully resolved issue #${issueNumber} which has a **${bounty.bounty_amount} ${bounty.currency}** bounty!

### 💰 Claim Your Reward:
1. Click here to claim: **[Claim ${bounty.bounty_amount} ${bounty.currency}](${claimUrl})**
2. Sign in with your GitHub account
3. Provide your Solana wallet address
4. Receive your payment instantly! ⚡

Your contribution to open source just got rewarded. Thank you! 🚀

---
*Automated by [GitWork](https://gitwork.dev) - Making open source sustainable*`;
    
    try {
      // Post comment on PR using Octokit
      const { getOctokitForInstallation } = await import('../services/github.js');
      const octokit = await getOctokitForInstallation(installation.id);
      
      await octokit.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pull_request.number,
        body: prComment
      });
      
      console.log(`✅ Bounty notification posted on PR #${pull_request.number}`);
    } catch (error) {
      console.error(`❌ Error posting comment on PR:`, error);
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
  // Simple pattern: just look for #123 anywhere in the PR title or description
  const pattern = /#(\d+)/g;
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

