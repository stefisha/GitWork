import { PrivyClient } from '@privy-io/node';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { getTokenBySymbol } from '../config/tokens.js';

const PRIVY_APP_ID = process.env.PRIVY_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

// Initialize Privy client
let privyClient = null;
let feePayerWallet = null;

function getPrivyClient() {
  if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
    console.warn('⚠️  Privy credentials not configured. Wallets will not be created.');
    return null;
  }

  if (!privyClient) {
    privyClient = new PrivyClient({
      appId: PRIVY_APP_ID,
      appSecret: PRIVY_APP_SECRET
    });
    console.log('✅ Privy client initialized');
  }

  return privyClient;
}

/**
 * Get or create fee payer wallet for transaction sponsorship
 */
function getFeePayerWallet() {
  if (feePayerWallet) {
    return feePayerWallet;
  }

  // Check if we have a stored private key
  const storedPrivateKey = process.env.SOLANA_FEE_PAYER_PRIVATE_KEY;
  
  if (storedPrivateKey) {
    try {
      feePayerWallet = Keypair.fromSecretKey(bs58.decode(storedPrivateKey));
      console.log(`✅ Fee payer wallet loaded: ${feePayerWallet.publicKey.toBase58()}`);
      return feePayerWallet;
    } catch (error) {
      console.error('❌ Failed to load fee payer wallet:', error.message);
    }
  }

  // Generate new fee payer wallet
  feePayerWallet = new Keypair();
  
  console.log('🔑 Generated new fee payer wallet:');
  console.log(`   Address: ${feePayerWallet.publicKey.toBase58()}`);
  console.warn('Configure a persistent SOLANA_FEE_PAYER_PRIVATE_KEY in your environment before using this service.');
  
  return feePayerWallet;
}

/**
 * Create an embedded Solana wallet for a bounty via Privy
 * 
 * @param {string} bountyId - Unique identifier for the bounty
 * @returns {Promise<Object>} - { address: string, id: string }
 */
export async function createBountyWallet(bountyId) {
  console.log(`📬 Creating Privy embedded wallet for bounty ${bountyId}...`);
  
  const client = getPrivyClient();
  
  if (!client) {
    console.warn('⚠️  Privy not configured, falling back to local keypair');
    const { Keypair } = await import('@solana/web3.js');
    const keypair = Keypair.generate();
    const walletAddress = keypair.publicKey.toString();
    console.log(`✅ Local Solana wallet created: ${walletAddress}`);
    return { 
      address: walletAddress, 
      id: `local-${bountyId}` // Fallback ID for local wallets
    };
  }

  try {
    console.log(`🔐 Creating server-controlled Solana wallet for bounty: ${bountyId}`);
    
    // Create a server-controlled wallet (no owner = server controls it)
    const wallet = await client.wallets().create({
      chain_type: 'solana'
      // No owner specified = this is a server-controlled wallet
    });
    
    console.log(`✅ Privy Solana wallet created: ${wallet.address}`);
    console.log(`🔑 Wallet ID: ${wallet.id}`);
    console.log(`📬 Escrow wallet created: ${wallet.address}`);
    console.log(`ℹ️  Note: Transaction fees will be paid by the fee payer wallet`);
    
    return {
      address: wallet.address,
      id: wallet.id  // Return the actual Privy wallet ID (clmXXX format)
    };
    
  } catch (error) {
    console.error('❌ Privy wallet creation failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.log('⚠️  Falling back to local keypair generation');
    
    // Fallback to local keypair
    const { Keypair } = await import('@solana/web3.js');
    const keypair = Keypair.generate();
    const walletAddress = keypair.publicKey.toString();
    console.log(`✅ Local Solana wallet created: ${walletAddress}`);
    return { 
      address: walletAddress, 
      id: `local-${bountyId}` // Fallback ID for local wallets
    };
  }
}

/**
 * Transfer funds from escrow wallet to contributor wallet using custom sponsorship
 * 
 * @param {string} escrowWalletAddress - Escrow wallet address (Privy-managed)
 * @param {string} recipientAddress - Recipient's Solana wallet address
 * @param {number} amount - Amount to transfer
 * @param {string} currency - Currency type (USDC, SOL, or any whitelisted SPL symbol)
 * @returns {Promise<string>} - Transaction signature
 */
export async function transferBountyFunds(escrowWalletAddress, recipientAddress, amount, currency = 'USDC') {
  const token = getTokenBySymbol(currency);
  if (!token) {
    throw new Error(`Unsupported currency: ${currency}. Use a whitelisted token.`);
  }
  console.log(`💸 Transferring ${amount} ${currency} from ${escrowWalletAddress} to ${recipientAddress}`);

  const client = getPrivyClient();
  const feePayer = getFeePayerWallet();

  if (!client) {
    throw new Error('Privy not configured - cannot transfer funds');
  }

  if (!feePayer) {
    throw new Error('Fee payer wallet not available - cannot sponsor transaction');
  }

  try {
    // Get the wallet from Privy
    const walletsResponse = await client.wallets().list();
    const wallets = walletsResponse.data || walletsResponse;
    const wallet = Array.isArray(wallets) ? wallets.find(w => w.address === escrowWalletAddress) : null;

    if (!wallet) {
      throw new Error(`Escrow wallet ${escrowWalletAddress} not found in Privy`);
    }

    console.log(`✅ Found Privy wallet: ${wallet.id}`);
    console.log(`💰 Fee payer wallet: ${feePayer.publicKey.toBase58()}`);

    // Import Solana libraries
    const {
      PublicKey,
      VersionedTransaction,
      TransactionMessage,
      Connection,
      SystemProgram
    } = await import('@solana/web3.js');

    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');

    // Check fee payer SOL balance
    const feePayerBalance = await connection.getBalance(feePayer.publicKey);
    console.log(`💰 Fee payer SOL balance: ${feePayerBalance / 1e9} SOL`);
    
    // MAINNET: Alert if fee payer balance is low
    if (feePayerBalance < 5000000) { // Less than 0.005 SOL
      console.error(`🚨 WARNING: Fee payer SOL balance is LOW: ${feePayerBalance / 1e9} SOL`);
      console.error(`   Please fund wallet: ${feePayer.publicKey.toBase58()}`);
      console.error(`   Minimum recommended: 0.01 SOL`);
    }
    
    if (feePayerBalance < 5000) { // Less than 0.000005 SOL (critical)
      console.error(`🚨 CRITICAL: Fee payer out of SOL!`);
      throw new Error(`Insufficient SOL for transaction fees. Fee payer has ${feePayerBalance / 1e9} SOL. Please fund: ${feePayer.publicKey.toBase58()}`);
    }

    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    console.log(`📡 Got recent blockhash: ${recentBlockhash.blockhash}`);

    let transferInstruction;
    let instructions = []; // Declare here at the top level
    let logDetails = '';

    if (token.symbol === 'SOL') {
      // Native SOL transfer
      transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(escrowWalletAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: Math.floor(amount * Math.pow(10, token.decimals)),
      });

      console.log(`📝 Created sponsored SOL transfer transaction`);
      console.log(`   From: ${escrowWalletAddress}`);
      console.log(`   To: ${recipientAddress}`);
      console.log(`   Amount: ${amount} SOL`);
      console.log(`   Fee payer: ${feePayer.publicKey.toBase58()}`);

      logDetails = `SOL transfer: ${amount} SOL`;
    } else {
      // SPL token transfer (USDC or any whitelisted token)
      const {
        getAssociatedTokenAddress,
        createTransferInstruction,
        createAssociatedTokenAccountInstruction,
        getAccount,
        TOKEN_PROGRAM_ID
      } = await import('@solana/spl-token');

      const mint = new PublicKey(token.mint);
      const divisor = Math.pow(10, token.decimals);
      const rawAmount = Math.floor(amount * divisor);

      const senderTokenAccount = await getAssociatedTokenAddress(
        mint,
        new PublicKey(escrowWalletAddress)
      );

      try {
        const senderAccount = await getAccount(connection, senderTokenAccount);
        const senderBalance = Number(senderAccount.amount) / divisor;
        console.log(`💰 Escrow wallet ${token.symbol} balance: ${senderBalance}`);

        if (senderBalance < amount) {
          throw new Error(`Insufficient ${token.symbol} in escrow. Required: ${amount}, Available: ${senderBalance}`);
        }
      } catch (error) {
        if (error.name === 'TokenAccountNotFoundError') {
          throw new Error(`Escrow wallet has no ${token.symbol} token account. Balance is 0.`);
        }
        throw error;
      }

      let recipientPubkey;
      try {
        recipientPubkey = new PublicKey(recipientAddress);
      } catch (error) {
        throw new Error(`Invalid recipient address: ${recipientAddress}. Error: ${error.message}`);
      }

      const recipientTokenAccount = await getAssociatedTokenAddress(
        mint,
        recipientPubkey
      );

      try {
        await getAccount(connection, recipientTokenAccount);
        console.log(`✅ Recipient token account exists: ${recipientTokenAccount.toString()}`);
      } catch (error) {
        console.log(`⚠️ Recipient token account doesn't exist, creating...`);
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          feePayer.publicKey,
          recipientTokenAccount,
          recipientPubkey,
          mint
        );
        instructions.push(createATAInstruction);
      }

      transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        new PublicKey(escrowWalletAddress),
        rawAmount,
        [],
        TOKEN_PROGRAM_ID
      );
      instructions.push(transferInstruction);

      console.log(`📝 Created sponsored ${token.symbol} transfer transaction`);
      console.log(`   From: ${senderTokenAccount.toString()}`);
      console.log(`   To: ${recipientTokenAccount.toString()}`);
      console.log(`   Amount: ${amount} ${token.symbol} (raw: ${rawAmount})`);

      logDetails = `${token.symbol} transfer: ${amount} ${token.symbol}`;
    }

    // For SOL transfers, instructions array doesn't exist, so create it
    if (currency === 'SOL') {
      instructions = [transferInstruction];
    }
    
    // Create transaction message with fee payer
    const message = new TransactionMessage({
      payerKey: feePayer.publicKey, // Fee payer pays for transaction
      recentBlockhash: recentBlockhash.blockhash,
      instructions: instructions, // Use the instructions array (may include ATA creation)
    });

    // Create versioned transaction
    const transaction = new VersionedTransaction(message.compileToV0Message());

    // Sign with escrow wallet using Privy
    const serializedMessage = Buffer.from(transaction.message.serialize()).toString('base64');
    const { signature: serializedSignature } = await client.wallets().solana().signMessage(wallet.id, {
      message: serializedMessage
    });

    // Add escrow wallet signature
    const escrowSignature = Buffer.from(serializedSignature, 'base64');
    transaction.addSignature(new PublicKey(escrowWalletAddress), escrowSignature);

    // Add fee payer signature
    transaction.sign([feePayer]);

    // Simulate transaction first to catch errors early
    try {
      const simulation = await connection.simulateTransaction(transaction, {
        replaceRecentBlockhash: true,
        sigVerify: false
      });
      
      if (simulation.value.err) {
        console.error('❌ Transaction simulation failed:', simulation.value.err);
        console.error('Simulation logs:', simulation.value.logs);
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
      
      console.log(`✅ Transaction simulation successful (compute units: ${simulation.value.unitsConsumed})`);
    } catch (simError) {
      console.error('❌ Transaction simulation error:', simError);
      throw simError;
    }

    // Send transaction
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      maxRetries: 3
    });
    
    console.log(`📡 Transaction sent: ${signature}`);
    console.log(`🔗 View on Explorer: https://explorer.solana.com/tx/${signature}`);
    
    // Don't wait for confirmation - transaction is sent, it will process
    // If simulation passed, the transaction will succeed
    console.log(`✅ Transaction sent successfully: ${signature}`);
    console.log(`   (Transaction will process on-chain - check Explorer to verify)`);
    
    return signature;

  } catch (error) {
    console.error('❌ Transfer failed:');
    console.error('Error message:', error.message || 'No error message');
    console.error('Error type:', error.constructor?.name || typeof error);
    console.error('Full error:', error);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    if (error.logs) {
      console.error('Transaction logs:', error.logs);
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw new Error(`Failed to transfer funds: ${error.message || error.toString() || 'Unknown error'}`);
  }
}

/**
 * Refund escrowed funds to the original depositor
 * Falls back to fee payer wallet if depositor address is not available
 * 
 * @param {Object} bounty - Bounty object
 * @returns {Promise<Object>} - Refund transaction details
 */
export async function refundEscrowedFunds(bounty) {
  console.log(`💸 Refunding ${bounty.bounty_amount} ${bounty.currency} from bounty ${bounty.id}`);
  
  // Use depositor address if available, otherwise fall back to fee payer
  let refundAddress;
  
  if (bounty.depositor_address) {
    refundAddress = bounty.depositor_address;
    console.log(`🔄 Refunding to original depositor: ${refundAddress}`);
  } else {
    // Fall back to fee payer wallet if depositor not tracked
    const feePayer = getFeePayerWallet();
    if (!feePayer) {
      throw new Error('Fee payer wallet not available for refund');
    }
    
    refundAddress = feePayer.publicKey.toBase58();
    console.log(`⚠️  Depositor address not found, refunding to fee payer wallet: ${refundAddress}`);
  }
  
  try {
    const transactionSignature = await transferBountyFunds(
      bounty.escrow_wallet_address,
      refundAddress,
      bounty.bounty_amount,
      bounty.currency
    );
    
    console.log(`✅ Refund successful: ${transactionSignature}`);
    
    return {
      transactionSignature,
      refundAddress,
      amount: bounty.bounty_amount,
      currency: bounty.currency
    };
  } catch (error) {
    console.error('❌ Refund failed:', error.message || error.toString() || 'Unknown error');
    console.error('Full error:', error);
    throw new Error(`Failed to refund funds: ${error.message || error.toString() || 'Unknown error'}`);
  }
}

/**
 * Authenticate a user with GitHub via Privy
 * This would be used in the dashboard/claim flow
 * 
 * @param {string} githubUsername - GitHub username
 * @returns {Promise<Object>} - User data
 */
export async function authenticateWithGitHub(githubUsername) {
  const client = getPrivyClient();
  
  if (!client) {
    throw new Error('Privy credentials not configured');
  }

  try {
    // Find or create user by GitHub username
    const user = await client.getUserByLinkedAccount({
      linkedAccountType: 'github',
      linkedAccountId: githubUsername,
    });

    return user;
  } catch (error) {
    console.error('Privy authentication error:', error.message);
    throw error;
  }
}

export default {
  createBountyWallet,
  transferBountyFunds,
  authenticateWithGitHub,
};

