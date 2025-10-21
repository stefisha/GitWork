import { getBountyByStatus, updateBountyStatus } from './src/services/bounty.js';
import { postIssueComment, generateDepositConfirmedComment } from './src/services/github.js';

async function simulateDeposit() {
  try {
    // Get the latest bounty (Issue #11)
    const bounties = getBountyByStatus('pending_deposit');
    console.log('Pending bounties:', bounties.length);
    
    if (bounties.length > 0) {
      const latestBounty = bounties[bounties.length - 1];
      console.log('Latest bounty:', latestBounty);
      
      // Manually update status to deposit_confirmed
      updateBountyStatus(latestBounty.id, 'deposit_confirmed');
      console.log('✅ Manually updated bounty status to deposit_confirmed');
      
      // Post the confirmation comment
      const comment = generateDepositConfirmedComment(
        latestBounty.bounty_amount,
        latestBounty.currency
      );
      
      await postIssueComment(
        latestBounty.github_installation_id,
        latestBounty.github_repo_owner,
        latestBounty.github_repo_name,
        latestBounty.github_issue_number,
        comment
      );
      
      console.log('💬 Posted deposit confirmation comment!');
    } else {
      console.log('No pending bounties found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simulateDeposit();

