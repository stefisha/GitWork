import express from 'express';
import { getOrCreateUserWallet, getUserWallet, getUserEarnings, getWalletBalance } from '../services/user-wallet.js';
import { transferBountyFunds } from '../services/privy.js';
import db from '../db/database.js';

const router = express.Router();

/**
 * GET /api/wallet/me
 * Get current user's GitWork wallet
 */
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.githubUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const githubUserId = req.session.githubUser.id;
    const githubUsername = req.session.githubUser.login;
    
    const wallet = await getOrCreateUserWallet(githubUserId, githubUsername);
    const balance = await getWalletBalance(wallet.walletAddress);
    const earnings = getUserEarnings(githubUserId);
    
    res.json({
      wallet: {
        address: wallet.walletAddress,
        githubUsername: wallet.githubUsername,
        createdAt: wallet.createdAt
      },
      balance,
      earnings
    });
    
  } catch (error) {
    console.error('❌ Error getting user wallet:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wallet/balance
 * Get wallet balance for current user
 */
router.get('/balance', async (req, res) => {
  try {
    if (!req.session || !req.session.githubUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const githubUserId = req.session.githubUser.id;
    const wallet = getUserWallet(githubUserId);
    
    if (!wallet) {
      return res.json({
        usdc: 0,
        sol: 0,
        total: 0,
        hasWallet: false
      });
    }
    
    const balance = await getWalletBalance(wallet.walletAddress);
    
    res.json({
      ...balance,
      hasWallet: true
    });
    
  } catch (error) {
    console.error('❌ Error getting wallet balance:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/wallet/earnings
 * Get earnings history for current user
 */
router.get('/earnings', (req, res) => {
  try {
    if (!req.session || !req.session.githubUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const githubUserId = req.session.githubUser.id;
    const earnings = getUserEarnings(githubUserId);
    
    res.json({ earnings });
    
  } catch (error) {
    console.error('❌ Error getting earnings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/wallet/withdraw
 * Withdraw funds from GitWork wallet to user's personal wallet
 * 
 * Body: {
 *   recipientAddress: 'solana_wallet_address',
 *   currency: 'USDC' | 'SOL',
 *   amount: number (optional - if not specified, withdraws all)
 * }
 */
router.post('/withdraw', async (req, res) => {
  try {
    if (!req.session || !req.session.githubUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { recipientAddress, currency, amount } = req.body;
    
    if (!recipientAddress) {
      return res.status(400).json({ error: 'Recipient address required' });
    }
    
    if (!currency || !['USDC', 'SOL'].includes(currency)) {
      return res.status(400).json({
        error: 'Only USDC and SOL can be withdrawn from your GitWork wallet. Claim bounties in other tokens directly to your own wallet when you claim.'
      });
    }
    
    const githubUserId = req.session.githubUser.id;
    const wallet = getUserWallet(githubUserId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'GitWork wallet not found' });
    }
    
    // Get current balance
    const balance = await getWalletBalance(wallet.walletAddress);
    const currentBalance = currency === 'USDC' ? balance.usdc : balance.sol;
    
    if (currentBalance === 0) {
      return res.status(400).json({ error: `No ${currency} balance to withdraw` });
    }
    
    // Determine withdrawal amount
    const withdrawAmount = amount || currentBalance;
    
    if (withdrawAmount > currentBalance) {
      return res.status(400).json({ 
        error: `Insufficient balance. You have ${currentBalance} ${currency}` 
      });
    }
    
    console.log(`💸 Withdrawing ${withdrawAmount} ${currency} from GitWork wallet to ${recipientAddress}`);
    console.log(`🔑 Using Privy wallet ID: ${wallet.privyWalletId}`);
    
    // Transfer funds (pass privyWalletId for proper wallet signing)
    const transactionSignature = await transferBountyFunds(
      wallet.walletAddress,
      recipientAddress,
      withdrawAmount,
      currency,
      wallet.privyWalletId  // Pass Privy wallet ID for signing
    );
    
    console.log(`✅ Withdrawal successful: ${transactionSignature}`);
    
    res.json({
      success: true,
      transactionSignature,
      amount: withdrawAmount,
      currency,
      recipientAddress
    });
    
  } catch (error) {
    console.error('❌ Withdrawal failed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;



