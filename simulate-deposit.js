import { getBountyByStatus, updateBountyStatus, getBountyById } from './src/services/bounty.js';
import { postIssueComment, generateDepositConfirmedComment } from './src/services/github.js';
import db from './src/db/database.js';

async function simulateDeposit() {
  try {
    console.log('🔍 Looking for pending bounties...');
    
    // Get all bounties from the database directly
    const stmt = db.prepare('SELECT * FROM bounties WHERE status = ?');
    const pendingBounties = stmt.all('pending_deposit');
    
    console.log('Pending bounties found:', pendingBounties.length);
    
    if (pendingBounties.length > 0) {
      const latestBounty = pendingBounties[pendingBounties.length - 1];
      console.log('Latest bounty:', {
        id: latestBounty.id,
        issue: latestBounty.github_issue_number,
        amount: latestBounty.bounty_amount,
        currency: latestBounty.currency,
        wallet: latestBounty.escrow_wallet_address,
        installationId: latestBounty.github_installation_id
      });
      
      // Manually update status to deposit_confirmed
      updateBountyStatus(latestBounty.id, 'deposit_confirmed');
      console.log('✅ Manually updated bounty status to deposit_confirmed');
      
      // Post the confirmation comment
      const comment = generateDepositConfirmedComment(
        latestBounty.bounty_amount,
        latestBounty.currency
      );
      
      console.log('💬 Posting confirmation comment...');
      await postIssueComment(
        latestBounty.github_installation_id,
        latestBounty.github_repo_owner,
        latestBounty.github_repo_name,
        latestBounty.github_issue_number,
        comment
      );
      
      console.log('🎉 Deposit simulation complete! Check Issue #12 for the comment!');
    } else {
      console.log('❌ No pending bounties found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

simulateDeposit();
