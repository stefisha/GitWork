import express from 'express';
import { 
  getBountyById, 
  updateBountyStatus, 
  logActivity,
  getBountySessionId 
} from '../services/bounty.js';
import { transferBountyFunds } from '../services/privy.js';
import { postIssueComment } from '../services/github.js';

const router = express.Router();

/**
 * Claim a bounty
 * POST /api/claim/:bountyId
 */
router.post('/:bountyId', express.json(), async (req, res) => {
  try {
    const { bountyId } = req.params;
    const { walletAddress } = req.body;
    
    // Check authentication
    if (!req.session || !req.session.githubUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const githubUser = req.session.githubUser.login;
    
    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    // Get bounty
    const bounty = getBountyById(parseInt(bountyId));
    
    if (!bounty) {
      return res.status(404).json({ error: 'Bounty not found' });
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
    
    console.log(`💰 Processing claim for bounty ${bounty.id} by @${githubUser}`);
    console.log(`   Transferring ${bounty.bounty_amount} ${bounty.currency} to ${walletAddress}`);
    
    // Get ephemeral session for fast transfer
    const sessionId = getBountySessionId(bounty.id);
    if (sessionId) {
      console.log(`⚡ Using MagicBlock ephemeral session: ${sessionId}`);
    } else {
      console.log(`🌐 No ephemeral session, using base layer`);
    }
    
    // Transfer funds using MagicBlock ephemeral rollup if session exists
    let transactionSignature;
    try {
      transactionSignature = await transferBountyFunds(
        bounty.escrow_wallet_address,
        walletAddress,
        bounty.bounty_amount,
        bounty.currency,
        sessionId // Pass session ID for ephemeral execution
      );
      
      console.log(`✅ Transfer successful: ${transactionSignature}`);
    } catch (error) {
      console.error(`❌ Transfer failed:`, error);
      return res.status(500).json({ 
        error: 'Failed to transfer funds: ' + error.message 
      });
    }
    
    // Update bounty status
    updateBountyStatus(bounty.id, 'claimed', {
      claimed_at: new Date().toISOString(),
      claim_wallet_address: walletAddress,
      transaction_signature: transactionSignature
    });
    
    logActivity(bounty.id, 'bounty_claimed', {
      contributor: githubUser,
      wallet: walletAddress,
      transactionSignature
    });
    
    // Post final comment on GitHub
    try {
      const comment = `## ✅ Bounty Claimed!

Congratulations! The bounty has been successfully claimed by @${githubUser}.

**Amount:** ${bounty.bounty_amount} ${bounty.currency}
**Recipient:** \`${walletAddress}\`
**Transaction:** [View on Solana Explorer](https://explorer.solana.com/tx/${transactionSignature})

---
*Powered by [GitWork](https://gitwork.dev) 🚀*`;

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
      currency: bounty.currency
    });
    
  } catch (error) {
    console.error('❌ Claim error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

export default router;

