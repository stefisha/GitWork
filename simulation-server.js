import express from 'express';
import { getBountyByStatus, updateBountyStatus } from './src/services/bounty.js';
import { postIssueComment, generateDepositConfirmedComment } from './src/services/github.js';
import db from './src/db/database.js';

const app = express();
app.use(express.json());

// Simulate deposit endpoint
app.post('/simulate-deposit', async (req, res) => {
  try {
    console.log('🔍 Simulating deposit...');
    
    // Get the latest pending bounty
    const stmt = db.prepare('SELECT * FROM bounties WHERE status = ? ORDER BY id DESC LIMIT 1');
    const bounty = stmt.get('pending_deposit');
    
    if (!bounty) {
      return res.status(404).json({ error: 'No pending bounties found' });
    }
    
    console.log('Found bounty:', {
      id: bounty.id,
      issue: bounty.github_issue_number,
      amount: bounty.bounty_amount,
      wallet: bounty.escrow_wallet_address
    });
    
    // Update status to deposit_confirmed
    updateBountyStatus(bounty.id, 'deposit_confirmed');
    console.log('✅ Updated bounty status to deposit_confirmed');
    
    // Post confirmation comment
    const comment = generateDepositConfirmedComment(
      bounty.bounty_amount,
      bounty.currency
    );
    
    await postIssueComment(
      bounty.github_installation_id,
      bounty.github_repo_owner,
      bounty.github_repo_name,
      bounty.github_issue_number,
      comment
    );
    
    console.log('💬 Posted confirmation comment!');
    
    res.json({ 
      success: true, 
      message: 'Deposit simulated successfully!',
      bounty: {
        id: bounty.id,
        issue: bounty.github_issue_number,
        amount: bounty.bounty_amount
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🎯 Simulation server running on port ${PORT}`);
  console.log('POST to http://localhost:3001/simulate-deposit to trigger simulation');
});

