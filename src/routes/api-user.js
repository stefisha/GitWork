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
        b.claimed_at,
        b.transaction_signature as tx_signature,
        (b.github_repo_owner || '/' || b.github_repo_name) as full_repo_name
      FROM bounties b
      WHERE 
        b.contributor_github_username = ?
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
      issueTitle: `Issue #${b.issue_number}`,
      claimedAt: b.claimed_at,
      githubUrl: `https://github.com/${b.owner}/${b.repo}/issues/${b.issue_number}`,
      transactionUrl: b.tx_signature ? `https://solscan.io/tx/${b.tx_signature}` : null
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
  console.log('🔍 Checking user status...');
  console.log('Session exists:', !!req.session);
  console.log('GitHub user in session:', !!req.session?.githubUser);
  
  if (req.session && req.session.githubUser) {
    console.log('✅ User authenticated:', req.session.githubUser.login);
    res.json({
      authenticated: true,
      username: req.session.githubUser.login,
      avatar: req.session.githubUser.avatar_url
    });
  } else {
    console.log('❌ User not authenticated');
    res.json({
      authenticated: false
    });
  }
});

export default router;

