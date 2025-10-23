import express from 'express';
import db from '../db/database.js';

const router = express.Router();

/**
 * GET /api/user/profile
 * Get user profile with bounty statistics
 * Requires GitHub OAuth (session)
 */
router.get('/profile', (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.githubUser) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        loginUrl: '/auth/github'
      });
    }
    
    const githubUsername = req.session.githubUser.login;
    
    // Get user's claimed bounties
    const claimedBounties = db.prepare(`
      SELECT 
        b.id,
        b.bounty_amount as amount,
        b.currency,
        b.github_repo_owner as owner,
        b.github_repo_name as repo,
        b.github_issue_number as issue_number,
        b.github_issue_title as issue_title,
        b.claimed_at,
        b.payout_transaction as transaction,
        (b.github_repo_owner || '/' || b.github_repo_name) as full_repo_name
      FROM bounties b
      WHERE 
        b.claimed_by_github_username = ?
        AND b.status = 'claimed'
      ORDER BY b.claimed_at DESC
    `).all(githubUsername);
    
    // Calculate earnings
    const totalUSDC = claimedBounties
      .filter(b => b.currency.toUpperCase() === 'USDC')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const totalSOL = claimedBounties
      .filter(b => b.currency.toUpperCase() === 'SOL')
      .reduce((sum, b) => sum + b.amount, 0);
    
    // Transform bounties to frontend format
    const bountyHistory = claimedBounties.map(b => ({
      id: b.id,
      amount: b.amount,
      currency: b.currency.toUpperCase(),
      repo: b.full_repo_name,
      issueNumber: b.issue_number,
      issueTitle: b.issue_title,
      claimedAt: b.claimed_at,
      githubUrl: `https://github.com/${b.owner}/${b.repo}/issues/${b.issue_number}`,
      transactionUrl: b.transaction ? `https://solscan.io/tx/${b.transaction}` : null
    }));
    
    res.json({
      success: true,
      user: {
        githubUsername,
        avatar: req.session.githubUser.avatar_url,
        name: req.session.githubUser.name || githubUsername,
        email: req.session.githubUser.email,
        joinedDate: req.session.githubUser.created_at
      },
      stats: {
        totalBounties: claimedBounties.length,
        totalUSDC,
        totalSOL,
        totalEarningsUSD: totalUSDC + (totalSOL * 150) // Rough SOL to USD conversion for display
      },
      bountyHistory
    });
    
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

/**
 * GET /api/user/status
 * Check if user is authenticated
 */
router.get('/status', (req, res) => {
  if (req.session && req.session.githubUser) {
    res.json({
      authenticated: true,
      username: req.session.githubUser.login,
      avatar: req.session.githubUser.avatar_url
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

export default router;

