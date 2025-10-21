/**
 * Script to check wallet balances
 * Usage: node src/scripts/check-balance.js <wallet_address>
 */

import { checkUSDCBalance, checkSOLBalance } from '../services/solana.js';

const walletAddress = process.argv[2];

if (!walletAddress) {
  console.error('❌ Please provide a wallet address');
  console.log('Usage: node src/scripts/check-balance.js <wallet_address>');
  process.exit(1);
}

async function checkBalances() {
  console.log(`🔍 Checking balances for: ${walletAddress}\n`);

  try {
    const solBalance = await checkSOLBalance(walletAddress);
    console.log(`💰 SOL Balance: ${solBalance.toFixed(4)} SOL`);

    const usdcBalance = await checkUSDCBalance(walletAddress);
    console.log(`💵 USDC Balance: ${usdcBalance.toFixed(2)} USDC`);
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
    process.exit(1);
  }
}

checkBalances();

