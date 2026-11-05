import db from '../db/database.js';
import { createBountyWallet } from './privy.js';

/**
 * Get or create a user's GitWork wallet
 * One wallet per GitHub user (identified by GitHub ID, not username)
 * 
 * @param {number} githubUserId - GitHub user ID (stable, never changes)
 * @param {string} githubUsername - GitHub username (for display, can change)
 * @returns {Promise<Object>} - User wallet object
 */
export async function getOrCreateUserWallet(githubUserId, githubUsername) {
  console.log(`🔍 Looking for wallet for GitHub user: ${githubUsername} (ID: ${githubUserId})`);
  
  // Check if wallet already exists
  const existingWallet = db.prepare(`
    SELECT * FROM user_wallets 
    WHERE github_user_id = ?
  `).get(githubUserId);
  
  if (existingWallet) {
    console.log(`✅ Found existing wallet: ${existingWallet.privy_wallet_address}`);
    
    // Update username if it changed
    if (existingWallet.github_username !== githubUsername) {
      console.log(`📝 Updating username: ${existingWallet.github_username} → ${githubUsername}`);
      db.prepare(`
        UPDATE user_wallets 
        SET github_username = ?, updated_at = CURRENT_TIMESTAMP
        WHERE github_user_id = ?
      `).run(githubUsername, githubUserId);
    }
    
    return {
      id: existingWallet.id,
      githubUserId: existingWallet.github_user_id,
      githubUsername: githubUsername, // Return updated username
      walletAddress: existingWallet.privy_wallet_address,
      privyWalletId: existingWallet.privy_wallet_id,
      createdAt: existingWallet.created_at
    };
  }
  
  // Create new wallet
  console.log(`🔑 Creating new GitWork wallet for ${githubUsername} (ID: ${githubUserId})`);
  
  try {
    // Create a wallet for this user (using a unique identifier)
    const wallet = await createBountyWallet(`user-${githubUserId}`);
    console.log(`✅ Created Privy wallet: ${wallet.address}`);
    console.log(`🔑 Privy wallet ID: ${wallet.id}`);
    
    // Store in database
    const result = db.prepare(`
      INSERT INTO user_wallets (
        github_user_id,
        github_username,
        privy_wallet_address,
        privy_wallet_id
      ) VALUES (?, ?, ?, ?)
    `).run(
      githubUserId,
      githubUsername,
      wallet.address,    // Store wallet address
      wallet.id          // Store ACTUAL Privy wallet ID (e.g., clmxxx)
    );
    
    console.log(`✅ User wallet created in database (ID: ${result.lastInsertRowid})`);
    
    return {
      id: result.lastInsertRowid,
      githubUserId,
      githubUsername,
      walletAddress: wallet.address,
      privyWalletId: wallet.id,
      createdAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Failed to create user wallet:', error);
    throw new Error(`Failed to create GitWork wallet: ${error.message}`);
  }
}

/**
 * Get user wallet by GitHub user ID
 * 
 * @param {number} githubUserId - GitHub user ID
 * @returns {Object|null} - User wallet object or null if not found
 */
export function getUserWallet(githubUserId) {
  const wallet = db.prepare(`
    SELECT * FROM user_wallets 
    WHERE github_user_id = ?
  `).get(githubUserId);
  
  if (!wallet) {
    return null;
  }
  
  return {
    id: wallet.id,
    githubUserId: wallet.github_user_id,
    githubUsername: wallet.github_username,
    walletAddress: wallet.privy_wallet_address,
    privyWalletId: wallet.privy_wallet_id,
    createdAt: wallet.created_at
  };
}

/**
 * Get user's earnings history
 * Shows all bounties claimed by this user
 * 
 * @param {number} githubUserId - GitHub user ID
 * @returns {Array} - Array of bounty earnings
 */
export function getUserEarnings(githubUserId) {
  const earnings = db.prepare(`
    SELECT 
      b.id,
      b.github_repo_owner,
      b.github_repo_name,
      b.github_issue_number,
      b.bounty_amount,
      b.currency,
      b.status,
      b.claim_type,
      b.claimed_at,
      b.transaction_signature
    FROM bounties b
    WHERE b.claimed_by_github_id = ?
    ORDER BY b.claimed_at DESC
  `).all(githubUserId);
  
  return earnings.map(e => ({
    id: e.id,
    repoOwner: e.github_repo_owner,
    repoName: e.github_repo_name,
    issueNumber: e.github_issue_number,
    issueTitle: `Issue #${e.github_issue_number}`, // Fallback since we don't store title
    amount: e.bounty_amount,
    currency: e.currency,
    status: e.status,
    claimType: e.claim_type, // 'direct' or 'wallet'
    claimedAt: e.claimed_at,
    transactionSignature: e.transaction_signature
  }));
}

/**
 * Get user's wallet balance by checking Solana blockchain
 * 
 * @param {string} walletAddress - Solana wallet address
 * @returns {Promise<Object>} - Balance object with USDC and SOL
 */
export async function getWalletBalance(walletAddress) {
  console.log(`💰 Checking balance for wallet: ${walletAddress}`);
  
  try {
    const { Connection, PublicKey } = await import('@solana/web3.js');
    const { getAccount, getAssociatedTokenAddress } = await import('@solana/spl-token');
    
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const walletPubkey = new PublicKey(walletAddress);
    
    // Get SOL balance
    const solBalance = await connection.getBalance(walletPubkey);
    const solAmount = solBalance / 1_000_000_000; // Convert lamports to SOL
    
    // Get USDC balance
    let usdcAmount = 0;
    try {
      const USDC_MINT = process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
      const usdcTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(USDC_MINT),
        walletPubkey
      );
      
      const accountInfo = await getAccount(connection, usdcTokenAccount);
      usdcAmount = Number(accountInfo.amount) / 1_000_000; // Convert micro-USDC to USDC
    } catch (error) {
      // Token account doesn't exist yet (no USDC received)
      console.log('ℹ️ No USDC token account found (balance is 0)');
    }
    
    console.log(`✅ Balance: ${usdcAmount} USDC | ${solAmount} SOL`);
    
    return {
      usdc: parseFloat(usdcAmount.toFixed(6)),
      sol: parseFloat(solAmount.toFixed(9)),
      total: usdcAmount // Total in USD equivalent
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch wallet balance:', error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
}

export default {
  getOrCreateUserWallet,
  getUserWallet,
  getUserEarnings,
  getWalletBalance
};

