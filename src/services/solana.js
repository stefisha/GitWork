import { 
  Connection, 
  Keypair, 
  PublicKey,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';
import { getSmartConnection, getSolanaConnection } from './magicblock.js';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const USDC_MINT = new PublicKey(process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const USE_MAGICBLOCK = process.env.USE_MAGICBLOCK === 'true' || false; // Disabled by default until SDK available

// Initialize connection (will use MagicBlock if enabled)
let connection = null;

async function initConnection() {
  if (!connection) {
    if (USE_MAGICBLOCK) {
      connection = await getSmartConnection(true);
      console.log('✅ Using MagicBlock ephemeral rollup for Solana operations');
    } else {
      connection = new Connection(SOLANA_RPC_URL, 'confirmed');
      console.log('✅ Using standard Solana connection');
    }
  }
  return connection;
}

/**
 * Create a new Solana keypair for escrow
 * 
 * @returns {Object} - { publicKey, privateKey }
 */
export function createEscrowWallet() {
  const keypair = Keypair.generate();
  
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey)
  };
}

/**
 * Get the USDC token account address for a wallet
 * 
 * @param {string} walletAddress - Base58 encoded public key
 * @returns {Promise<string>} - Token account address
 */
export async function getUSDCTokenAccount(walletAddress) {
  const walletPubkey = new PublicKey(walletAddress);
  const tokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    walletPubkey
  );
  
  return tokenAccount.toBase58();
}

/**
 * Check USDC balance of a wallet
 * 
 * @param {string} walletAddress - Base58 encoded public key
 * @returns {Promise<number>} - Balance in USDC (not lamports)
 */
export async function checkUSDCBalance(walletAddress) {
  try {
    const conn = await initConnection();
    const walletPubkey = new PublicKey(walletAddress);
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletPubkey
    );
    
    const accountInfo = await getAccount(
      conn,
      tokenAccount,
      'confirmed',
      TOKEN_PROGRAM_ID
    );
    
    // USDC has 6 decimals
    return Number(accountInfo.amount) / 1_000_000;
  } catch (error) {
    // Token account doesn't exist yet
    if (error.name === 'TokenAccountNotFoundError') {
      return 0;
    }
    throw error;
  }
}

/**
 * Check SOL balance of a wallet
 * 
 * @param {string} walletAddress - Base58 encoded public key
 * @returns {Promise<number>} - Balance in SOL
 */
export async function checkSOLBalance(walletAddress) {
  const conn = await initConnection();
  const walletPubkey = new PublicKey(walletAddress);
  const balance = await conn.getBalance(walletPubkey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Monitor a wallet for deposits (polling)
 * 
 * @param {string} walletAddress - Base58 encoded public key
 * @param {number} expectedAmount - Expected USDC amount
 * @param {string} currency - Currency type (USDC or SOL)
 * @returns {Promise<boolean>} - True if deposit confirmed
 */
export async function waitForDeposit(walletAddress, expectedAmount, currency = 'USDC') {
  const checkBalance = currency === 'USDC' ? checkUSDCBalance : checkSOLBalance;
  
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes with 5 second intervals
  
  while (attempts < maxAttempts) {
    const balance = await checkBalance(walletAddress);
    
    if (balance >= expectedAmount) {
      return true;
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  }
  
  return false;
}

/**
 * Get connection instance
 * 
 * @returns {Promise<Connection>}
 */
export async function getConnection() {
  return await initConnection();
}

/**
 * Get base layer connection (always Solana mainnet/devnet, not ephemeral)
 * 
 * @returns {Connection}
 */
export function getBaseConnection() {
  return getSolanaConnection();
}

export default {
  createEscrowWallet,
  getUSDCTokenAccount,
  checkUSDCBalance,
  checkSOLBalance,
  waitForDeposit,
  getConnection
};

