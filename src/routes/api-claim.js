import express from 'express';
import { getBountyById, updateBountyStatus, logActivity } from '../services/bounty.js';
import { transferBountyFunds } from '../services/privy.js';
import { postIssueComment } from '../services/github.js';
import { getOrCreateUserWallet } from '../services/user-wallet.js';
import db from '../db/database.js';

const router = express.Router();

/**
 * Claim a bounty
 * POST /api/claim/:bountyId
 */
router.post('/:bountyId', express.json(), async (req, res) => {
  try {
    const { bountyId } = req.params;
    const { walletAddress, claimType } = req.body; // claimType: 'direct' or 'wallet'
    
    // Check authentication
    if (!req.session || !req.session.githubUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const githubUser = req.session.githubUser.login;
    const githubUserId = req.session.githubUser.id;

    // Get bounty first (needed for currency check when claiming to wallet)
    const bounty = getBountyById(parseInt(bountyId));
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
    }
    
    // Validate claim type
    if (!claimType || !['direct', 'wallet'].includes(claimType)) {
      return res.status(400).json({ error: 'Claim type must be "direct" or "wallet"' });
    }
    
    let recipientAddress = walletAddress;
    
    if (claimType === 'wallet') {
      // GitWork wallet only supports USDC and SOL (withdraw and balance are limited to those)
      const currencyUpper = (bounty.currency || '').toUpperCase();
      if (!['USDC', 'SOL'].includes(currencyUpper)) {
        return res.status(400).json({
          error: `GitWork wallet only supports USDC and SOL. This bounty is in ${currencyUpper}. Please claim directly to your own wallet.`
        });
      }
      const userWallet = await getOrCreateUserWallet(githubUserId, githubUser);
      recipientAddress = userWallet.walletAddress;
      console.log(`🔒 Claiming to GitWork wallet: ${recipientAddress}`);
    } else {
      // Direct claim - validate provided wallet address
      if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'Wallet address required for direct claim' });
      }
      console.log(`💸 Claiming directly to user wallet: ${recipientAddress}`);
    }
    
    // Validate bounty status
    if (bounty.status !== 'ready_to_claim') {
      return res.status(400).json({ 
        error: `Bounty is not ready to claim. Current status: ${bounty.status}` 
      });
    }
    
    // Verify the user is the contributor
    if (bounty.contributor_github_username !== githubUser) {
      return res.status(403).json({ 
        error: `This bounty belongs to @${bounty.contributor_github_username}` 
      });
    }
    
    // Check if already claimed
    if (bounty.claim_wallet_address) {
      return res.status(400).json({ 
        error: 'Bounty already claimed',
        transactionSignature: bounty.transaction_signature
      });
    }
    
    console.log(`💰 Processing ${claimType} claim for bounty ${bounty.id} by @${githubUser}`);
    console.log(`   Transferring ${bounty.bounty_amount} ${bounty.currency} to ${recipientAddress}`);
    
    // Transfer funds
    let transactionSignature;
    try {
      transactionSignature = await transferBountyFunds(
        bounty.escrow_wallet_address,
        recipientAddress,
        bounty.bounty_amount,
        bounty.currency
      );
      
      console.log(`✅ Transfer successful: ${transactionSignature}`);
    } catch (error) {
      console.error(`❌ Transfer failed:`, error);
      return res.status(500).json({ 
        error: 'Failed to transfer funds: ' + error.message 
      });
    }
    
    // Update bounty status with claim type and GitHub user ID
    updateBountyStatus(bounty.id, 'claimed', {
      claimed_at: new Date().toISOString(),
      claim_wallet_address: recipientAddress,
      transaction_signature: transactionSignature
    });
    
    // Update claim_type and claimed_by_github_id
    db.prepare(`
      UPDATE bounties 
      SET claim_type = ?, claimed_by_github_id = ?
      WHERE id = ?
    `).run(claimType, githubUserId, bounty.id);
    
    logActivity(bounty.id, 'bounty_claimed', {
      contributor: githubUser,
      claimType,
      wallet: recipientAddress,
      transactionSignature
    });
    
    // Discord notification removed - only notify when bounty is funded
    
    // Post final comment on GitHub
    try {
      const claimMessage = claimType === 'wallet' 
        ? `**Claimed to:** GitWork Wallet (balance can be withdrawn anytime)`
        : `**Recipient:** \`${recipientAddress}\``;
      
      const comment = `## ✅ Bounty Claimed!

Congratulations! The bounty has been successfully claimed by @${githubUser}.

**Amount:** ${bounty.bounty_amount} ${bounty.currency}
${claimMessage}
**Transaction:** [View on Solana Explorer](https://explorer.solana.com/tx/${transactionSignature})

---
*Powered by [GitWork](https://gitwork.io) 🚀*`;

      await postIssueComment(
        bounty.github_installation_id,
        bounty.github_repo_owner,
        bounty.github_repo_name,
        bounty.github_issue_number,
        comment
      );
      
      console.log(`💬 Posted claim confirmation comment on issue #${bounty.github_issue_number}`);
    } catch (error) {
      console.error(`❌ Error posting confirmation comment:`, error.message);
      // Don't fail the claim if comment posting fails
    }
    
    res.json({
      success: true,
      transactionSignature,
      amount: bounty.bounty_amount,
      currency: bounty.currency,
      claimType,
      recipientAddress
    });
    
  } catch (error) {
    console.error('❌ Claim error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

export default router;

