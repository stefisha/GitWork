import dotenv from 'dotenv';

// Load environment variables IMMEDIATELY when this module is imported
dotenv.config();

console.log('🔑 Environment loaded');
console.log('🔑 GITHUB_WEBHOOK_SECRET:', process.env.GITHUB_WEBHOOK_SECRET ? '✅ LOADED' : '❌ MISSING');

export default {
  GITHUB_APP_ID: process.env.GITHUB_APP_ID,
  GITHUB_PRIVATE_KEY_PATH: process.env.GITHUB_PRIVATE_KEY_PATH,
  GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET,
  PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  USDC_MINT_ADDRESS: process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  PORT: process.env.PORT || 3000
};

