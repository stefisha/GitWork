import '../config.js'; // Load environment variables first
import db from '../db/database.js';
import { updateBountyStatus, logActivity } from '../services/bounty.js';
import { postIssueComment } from '../services/github.js';

const walletAddress = process.argv[2];
const amount = parseFloat(process.argv[3]);

if (!walletAddress || !amount) {
  console.error('Usage: node simulate-deposit.js <wallet-address> <amount>');
  process.exit(1);
}

async function simulateDeposit() {
  console.log(`💰 Simulating deposit of ${amount} USDC to ${walletAddress}...`);

  // Find the bounty
  const bounty = db.prepare(`
    SELECT * FROM bounties 
    WHERE escrow_wallet_address = ? 
    AND status = 'pending_deposit'
  `).get(walletAddress);

  if (!bounty) {
    console.error('❌ No pending bounty found for this wallet');
    process.exit(1);
  }

  console.log(`✅ Found bounty #${bounty.id} for issue #${bounty.github_issue_number}`);

  // Update bounty status to deposit_confirmed first
  updateBountyStatus(bounty.id, 'deposit_confirmed', {
    deposit_confirmed_at: new Date().toISOString()
  });

  logActivity(bounty.id, 'deposit_confirmed', {
    amount,
    wallet: walletAddress,
    simulated: true
  });

  console.log('✅ Bounty status updated to deposit_confirmed');

  // Post GitHub comment
  const commentBody = `## 💰 Funds Confirmed in Escrow! ✅

Great news! **${bounty.bounty_amount} ${bounty.currency}** has been deposited and is now safely held in escrow.

**Escrow Wallet**: \`${bounty.escrow_wallet_address}\`

### 🎯 What happens next?

This bounty is now **live and ready to claim**! When a contributor:
1. ✅ Submits a pull request that fixes this issue
2. ✅ Gets the PR merged by the maintainer

The funds will be **automatically released** to the contributor! 🚀

---
*Powered by GitWork - Making open source rewarding* 💎`;

  try {
    await postIssueComment(
      bounty.github_installation_id,
      bounty.github_repo_owner,
      bounty.github_repo_name,
      bounty.github_issue_number,
      commentBody
    );
    console.log('✅ GitHub comment posted!');
  } catch (error) {
    console.error('❌ Failed to post comment:', error.message);
    console.error('Full error:', error);
  }

  console.log('🎉 Deposit simulation complete!');
  process.exit(0);
}

simulateDeposit();

