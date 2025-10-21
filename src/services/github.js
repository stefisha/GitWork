import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import { readFileSync } from 'fs';

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_PRIVATE_KEY_PATH = process.env.GITHUB_PRIVATE_KEY_PATH || './private-key.pem';

let privateKey;
try {
  privateKey = readFileSync(GITHUB_PRIVATE_KEY_PATH, 'utf8');
} catch (error) {
  console.warn('⚠️  GitHub private key not found. GitHub API features will be limited.');
}

/**
 * Get an authenticated Octokit instance for an installation
 * 
 * @param {number} installationId - GitHub installation ID
 * @returns {Octokit}
 */
export function getOctokitForInstallation(installationId) {
  if (!privateKey || !GITHUB_APP_ID) {
    throw new Error('GitHub App credentials not configured');
  }

  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: GITHUB_APP_ID,
      privateKey: privateKey,
      installationId: installationId,
    },
  });

  return octokit;
}

/**
 * Post a comment on a GitHub issue
 * 
 * @param {number} installationId - GitHub installation ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @param {string} body - Comment body (markdown)
 * @returns {Promise<Object>} - Comment data
 */
export async function postIssueComment(installationId, owner, repo, issueNumber, body) {
  const octokit = getOctokitForInstallation(installationId);
  
  const response = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });
  
  return response.data;
}

/**
 * Get issue details
 * 
 * @param {number} installationId - GitHub installation ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} issueNumber - Issue number
 * @returns {Promise<Object>} - Issue data
 */
export async function getIssue(installationId, owner, repo, issueNumber) {
  const octokit = getOctokitForInstallation(installationId);
  
  const response = await octokit.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });
  
  return response.data;
}

/**
 * Get pull request details
 * 
 * @param {number} installationId - GitHub installation ID
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} pullNumber - Pull request number
 * @returns {Promise<Object>} - Pull request data
 */
export async function getPullRequest(installationId, owner, repo, pullNumber) {
  const octokit = getOctokitForInstallation(installationId);
  
  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });
  
  return response.data;
}

/**
 * Generate a formatted comment for deposit request
 * 
 * @param {number} amount - Bounty amount
 * @param {string} currency - Currency (USDC, SOL)
 * @param {string} walletAddress - Escrow wallet address
 * @returns {string} - Markdown formatted comment
 */
export function generateDepositRequestComment(amount, currency, walletAddress) {
  return `## 🎯 Bounty Created!

Thank you for creating a bounty on this issue!

**Bounty Amount:** ${amount} ${currency}
**Status:** ⏳ Awaiting deposit

### Next Steps:

To activate this bounty, please deposit **${amount} ${currency}** to the following escrow wallet:

\`\`\`
${walletAddress}
\`\`\`

Once the deposit is confirmed, this bounty will be live and available for contributors to claim!

---
*Powered by [GitWork](https://gitwork.dev) 🚀*`;
}

/**
 * Generate a formatted comment for deposit confirmation
 * 
 * @param {number} amount - Bounty amount
 * @param {string} currency - Currency (USDC, SOL)
 * @returns {string} - Markdown formatted comment
 */
export function generateDepositConfirmedComment(amount, currency) {
  return `## ✅ Bounty Active!

The bounty of **${amount} ${currency}** has been deposited and is now in escrow!

### For Contributors:

This issue is now available to work on. The bounty will be automatically released when:
1. A pull request that closes this issue is merged
2. The contributor claims their reward via the GitWork dashboard

### How to Claim:

Once your PR is merged, you'll receive a notification with instructions to claim your ${amount} ${currency}!

---
*Powered by [GitWork](https://gitwork.dev) 🚀*`;
}

/**
 * Generate a formatted comment for claim notification
 * 
 * @param {string} username - GitHub username of contributor
 * @param {number} amount - Bounty amount
 * @param {string} currency - Currency (USDC, SOL)
 * @param {string} claimUrl - URL to claim the bounty
 * @returns {string} - Markdown formatted comment
 */
export function generateClaimNotificationComment(username, amount, currency, claimUrl) {
  return `## 🎉 Bounty Ready to Claim!

Congratulations @${username}! Your pull request has been merged.

**Bounty Amount:** ${amount} ${currency}

### Claim Your Reward:

Click the link below to claim your bounty:

**👉 [Claim ${amount} ${currency}](${claimUrl})**

You'll need to:
1. Sign in with your GitHub account
2. Provide your Solana wallet address
3. Confirm the transfer

The funds will be sent to your wallet immediately!

---
*Powered by [GitWork](https://gitwork.dev) 🚀*`;
}

export default {
  getOctokitForInstallation,
  postIssueComment,
  getIssue,
  getPullRequest,
  generateDepositRequestComment,
  generateDepositConfirmedComment,
  generateClaimNotificationComment
};

