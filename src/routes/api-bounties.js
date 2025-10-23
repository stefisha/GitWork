import express from 'express';
import db from '../db/database.js';

const router = express.Router();

/**
 * GET /api/bounties/search
 * Search for bounties (all or filtered by query)
 * Query params:
 *   - query: search term (repo name, owner, language, etc.)
 */
router.get('/search', (req, res) => {
  try {
    const { query } = req.query;
    
    let sql = `
      SELECT 
        b.id,
        b.bounty_amount as amount,
        b.currency,
        b.status,
        b.github_repo_owner as owner,
        b.github_repo_name as repo,
        b.github_issue_number as issue_number,
        b.created_at,
        b.contributor_github_username as claimed_by,
        b.claimed_at,
        (b.github_repo_owner || '/' || b.github_repo_name) as full_repo_name
      FROM bounties b
      WHERE status IN ('deposit_confirmed', 'ready_to_claim', 'claimed')
    `;
    
    const params = [];
    
    // If query provided, filter by repo name or owner
    if (query && query.trim() !== '') {
      sql += `
        AND (
          LOWER(b.github_repo_name) LIKE LOWER(?) OR
          LOWER(b.github_repo_owner) LIKE LOWER(?)
        )
      `;
      const searchTerm = `%${query.trim()}%`;
      params.push(searchTerm, searchTerm);
    }
    
    sql += ' ORDER BY b.created_at DESC LIMIT 100';
    
    const bounties = db.prepare(sql).all(...params);
    
    // Transform to frontend-friendly format
    const results = bounties.map(b => ({
      id: b.id,
      name: `${b.owner}/${b.repo} #${b.issue_number}`,
      description: `Issue #${b.issue_number}`,
      githubUrl: `https://github.com/${b.owner}/${b.repo}/issues/${b.issue_number}`,
      amount: b.amount,
      currency: b.currency.toUpperCase(),
      status: b.status,
      repo: b.full_repo_name,
      owner: b.owner,
      createdAt: b.created_at,
      claimedBy: b.claimed_by,
      claimedAt: b.claimed_at
    }));
    
    res.json({
      success: true,
      count: results.length,
      bounties: results
    });
    
  } catch (error) {
    console.error('❌ Error searching bounties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search bounties'
    });
  }
});

/**
 * GET /api/bounties/stats
 * Get overall bounty statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_bounties,
        SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed_count,
        SUM(CASE WHEN status IN ('deposit_confirmed', 'ready_to_claim') THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN currency = 'USDC' AND status = 'claimed' THEN bounty_amount ELSE 0 END) as total_usdc_paid,
        SUM(CASE WHEN currency = 'SOL' AND status = 'claimed' THEN bounty_amount ELSE 0 END) as total_sol_paid
      FROM bounties
    `).get();
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error getting bounty stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

/**
 * GET /api/bounties/debug
 * Debug endpoint to see all bounties and their statuses
 */
router.get('/debug', (req, res) => {
  try {
    const allBounties = db.prepare(`
      SELECT 
        id,
        github_repo_owner,
        github_repo_name,
        github_issue_number,
        bounty_amount,
        currency,
        status,
        contributor_github_username,
        claimed_at,
        created_at
      FROM bounties
      ORDER BY created_at DESC
    `).all();
    
    res.json({
      success: true,
      count: allBounties.length,
      bounties: allBounties
    });
    
  } catch (error) {
    console.error('❌ Error getting debug info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get debug info'
    });
  }
});

export default router;

