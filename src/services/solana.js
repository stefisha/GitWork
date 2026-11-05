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

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const USDC_MINT = new PublicKey(process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

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
    const walletPubkey = new PublicKey(walletAddress);
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletPubkey
    );
    
    const accountInfo = await getAccount(
      connection,
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
  const walletPubkey = new PublicKey(walletAddress);
  const balance = await connection.getBalance(walletPubkey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Check SPL token balance for a given mint
 *
 * @param {string} walletAddress - Base58 encoded public key
 * @param {string} mintAddress - SPL token mint address
 * @param {number} decimals - Token decimals (e.g. 6 for USDC)
 * @returns {Promise<number>} - Balance in human-readable units
 */
export async function checkSPLBalance(walletAddress, mintAddress, decimals) {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const mint = new PublicKey(mintAddress);
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      walletPubkey
    );
    const accountInfo = await getAccount(
      connection,
      tokenAccount,
      'confirmed',
      TOKEN_PROGRAM_ID
    );
    const divisor = Math.pow(10, decimals);
    return Number(accountInfo.amount) / divisor;
  } catch (error) {
    if (error.name === 'TokenAccountNotFoundError') {
      return 0;
    }
    throw error;
  }
}

/**
 * Monitor a wallet for deposits (polling)
 * Uses token whitelist for SPL tokens; supports SOL and any whitelisted symbol.
 *
 * @param {string} walletAddress - Base58 encoded public key
 * @param {number} expectedAmount - Expected amount in human units
 * @param {string} currency - Currency type (USDC, SOL, or any whitelisted symbol)
 * @returns {Promise<boolean>} - True if deposit confirmed
 */
export async function waitForDeposit(walletAddress, expectedAmount, currency = 'USDC') {
  const { getTokenBySymbol } = await import('../config/tokens.js');
  const token = getTokenBySymbol(currency);

  async function checkBalance() {
    if (!token) return 0;
    if (token.symbol === 'SOL') return checkSOLBalance(walletAddress);
    return checkSPLBalance(walletAddress, token.mint, token.decimals);
  }

  let attempts = 0;
  const maxAttempts = 60; // 5 minutes with 5 second intervals

  while (attempts < maxAttempts) {
    const balance = await checkBalance();
    if (balance >= expectedAmount) return true;
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  return false;
}

/**
 * Find the depositor address by looking at recent transactions
 * Looks for the transaction that funded the escrow wallet
 *
 * @param {string} escrowWalletAddress - The escrow wallet address
 * @param {number} expectedAmount - Expected deposit amount
 * @param {string} currency - Currency type (USDC, SOL, or other SPL symbol)
 * @param {string} [mintAddress] - SPL mint address (optional; if not set, uses USDC for 'USDC' or SOL logic for 'SOL')
 * @returns {Promise<string|null>} - Depositor address or null if not found
 */
export async function findDepositorAddress(escrowWalletAddress, expectedAmount, currency = 'USDC', mintAddress = null) {
  try {
    const walletPubkey = new PublicKey(escrowWalletAddress);
    const mintToUse = mintAddress || (currency === 'USDC' ? USDC_MINT.toBase58() : null);

    // Get recent transaction signatures for this wallet
    const signatures = await connection.getSignaturesForAddress(walletPubkey, { limit: 20 });

    // Look through transactions to find the deposit
    for (const sigInfo of signatures) {
      try {
        const tx = await connection.getParsedTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0
        });

        if (!tx || !tx.meta) continue;

        // Check token transfers for SPL (USDC or any other mint)
        if (mintToUse) {
          const preBalances = tx.meta.preTokenBalances || [];
          const postBalances = tx.meta.postTokenBalances || [];

          const escrowTokenAccount = await getAssociatedTokenAddress(new PublicKey(mintToUse), walletPubkey);
          const escrowTokenAccountStr = escrowTokenAccount.toBase58();
          
          for (const postBalance of postBalances) {
            if (postBalance.accountIndex !== undefined &&
                postBalance.mint === mintToUse) {

              const accountKeys = tx.transaction.message.accountKeys;
              const tokenAccountAddress = accountKeys[postBalance.accountIndex]?.pubkey?.toBase58();

              if (tokenAccountAddress === escrowTokenAccountStr) {
                const postAmount = postBalance.uiTokenAmount?.uiAmount || 0;

                if (Math.abs(postAmount - expectedAmount) < 0.01) {
                  for (const preBalance of preBalances) {
                    if (preBalance.mint === mintToUse &&
                        preBalance.accountIndex !== postBalance.accountIndex) {
                      const sourceAccount = accountKeys[preBalance.accountIndex];
                      if (sourceAccount && sourceAccount.pubkey) {
                        const sourceTokenAccount = sourceAccount.pubkey.toBase58();
                        try {
                          const tokenAccountInfo = await getAccount(connection, new PublicKey(sourceTokenAccount));
                          const ownerAddress = tokenAccountInfo.owner.toBase58();
                          new PublicKey(ownerAddress);
                          console.log(`✅ Found depositor wallet address: ${ownerAddress} (from token account: ${sourceTokenAccount})`);
                          return ownerAddress;
                        } catch (e) {
                          console.log(`⚠️  Could not get owner of token account ${sourceTokenAccount}:`, e.message);
                          continue;
                        }
                      }
                    }
                  }

                  if (tx.transaction.message.instructions) {
                    for (const instruction of tx.transaction.message.instructions) {
                      if (instruction.program === 'spl-token' && instruction.parsed?.type === 'transfer') {
                        const authority = instruction.parsed?.info?.authority;
                        if (authority) {
                          try {
                            new PublicKey(authority);
                            console.log(`✅ Found depositor from instruction authority: ${authority}`);
                            return authority;
                          } catch (e) {
                            continue;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (currency === 'SOL') {
          // For SOL, check balance changes
          const accountKeys = tx.transaction.message.accountKeys;
          const balanceChanges = tx.meta.preBalances.map((pre, i) => ({
            account: accountKeys[i]?.pubkey?.toBase58(),
            change: (tx.meta.postBalances[i] - pre) / LAMPORTS_PER_SOL
          }));
          
          // Find the account that received SOL matching the expected amount
          const recipientChange = balanceChanges.find(
            change => change.account === escrowWalletAddress && 
                      Math.abs(change.change - expectedAmount) < 0.001
          );
          
          if (recipientChange) {
            // Find the sender (account with negative balance change)
            const sender = balanceChanges.find(
              change => change.change < -0.0001 && change.account !== escrowWalletAddress
            );
            
            if (sender) {
              return sender.account;
            }
          }
        }
      } catch (error) {
        // Skip transactions we can't parse
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding depositor address:', error.message);
    return null;
  }
}

/**
 * Get connection instance
 * 
 * @returns {Connection}
 */
export function getConnection() {
  return connection;
}

export default {
  createEscrowWallet,
  getUSDCTokenAccount,
  checkUSDCBalance,
  checkSOLBalance,
  checkSPLBalance,
  waitForDeposit,
  findDepositorAddress,
  getConnection
};

