import { PrivyClient } from '@privy-io/node';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

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
  const privateKey = bs58.encode(feePayerWallet.secretKey);
  
  console.log('🔑 Generated new fee payer wallet:');
  console.log(`   Address: ${feePayerWallet.publicKey.toBase58()}`);
  console.log(`   Private Key: ${privateKey}`);
  console.log('⚠️  IMPORTANT: Add this to your .env file as SOLANA_FEE_PAYER_PRIVATE_KEY');
  
  return feePayerWallet;
}

/**
 * Create an embedded Solana wallet for a bounty via Privy
 * 
 * @param {string} bountyId - Unique identifier for the bounty
 * @returns {Promise<string>} - Solana wallet address
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
    return walletAddress;
  }

  try {
    console.log(`🔐 Creating server-controlled Solana wallet for bounty: ${bountyId}`);
    
    // Create a server-controlled wallet (no owner = server controls it)
    const wallet = await client.wallets().create({
      chain_type: 'solana'
      // No owner specified = this is a server-controlled wallet
    });
    
    const walletAddress = wallet.address;
    console.log(`✅ Privy Solana wallet created: ${walletAddress}`);
    console.log(`🔑 Wallet ID: ${wallet.id}`);
    console.log(`📬 Escrow wallet created: ${walletAddress}`);
    console.log(`ℹ️  Note: Transaction fees will be paid by the fee payer wallet`);
    
    return walletAddress;
    
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
    return walletAddress;
  }
}

/**
 * Transfer funds from escrow wallet to contributor wallet using custom sponsorship
 * 
 * @param {string} escrowWalletAddress - Escrow wallet address (Privy-managed)
 * @param {string} recipientAddress - Recipient's Solana wallet address
 * @param {number} amount - Amount to transfer
 * @param {string} currency - Currency type (USDC or SOL)
 * @returns {Promise<string>} - Transaction signature
 */
export async function transferBountyFunds(escrowWalletAddress, recipientAddress, amount, currency = 'USDC') {
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
    let logDetails = '';

    if (currency === 'SOL') {
      // Native SOL transfer
      transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(escrowWalletAddress),
        toPubkey: new PublicKey(recipientAddress),
        lamports: Math.floor(amount * 1_000_000_000), // SOL has 9 decimals
      });

      console.log(`📝 Created sponsored SOL transfer transaction`);
      console.log(`   From: ${escrowWalletAddress}`);
      console.log(`   To: ${recipientAddress}`);
      console.log(`   Amount: ${amount} SOL (${Math.floor(amount * 1_000_000_000)} lamports)`);
      console.log(`   Fee payer: ${feePayer.publicKey.toBase58()}`);
      
      logDetails = `SOL transfer: ${amount} SOL`;
    } else {
      // USDC (SPL token) transfer
      const {
        getAssociatedTokenAddress,
        createTransferInstruction,
        TOKEN_PROGRAM_ID
      } = await import('@solana/spl-token');

      const USDC_MINT = process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

      const senderTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(USDC_MINT),
        new PublicKey(escrowWalletAddress)
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(USDC_MINT),
        new PublicKey(recipientAddress)
      );

      transferInstruction = createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        new PublicKey(escrowWalletAddress),
        amount * 1_000_000, // USDC has 6 decimals
        [],
        TOKEN_PROGRAM_ID
      );

      console.log(`📝 Created sponsored USDC transfer transaction`);
      console.log(`   From token account: ${senderTokenAccount.toString()}`);
      console.log(`   To token account: ${recipientTokenAccount.toString()}`);
      console.log(`   Amount: ${amount} USDC (${amount * 1_000_000} micro-USDC)`);
      console.log(`   Fee payer: ${feePayer.publicKey.toBase58()}`);
      
      logDetails = `USDC transfer: ${amount} USDC`;
    }

    // Create transaction message with fee payer
    const message = new TransactionMessage({
      payerKey: feePayer.publicKey, // Fee payer pays for transaction
      recentBlockhash: recentBlockhash.blockhash,
      instructions: [transferInstruction],
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

    // Send transaction
    const signature = await connection.sendTransaction(transaction);
    console.log(`✅ Sponsored ${currency} transfer successful: ${signature}`);
    
    return signature;

  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw new Error(`Failed to transfer funds: ${error.message}`);
  }
}

/**
 * Refund escrowed funds to the fee payer wallet
 * This is a reasonable default since the fee payer is the system wallet
 * In production, you might want to track the original depositor
 * 
 * @param {Object} bounty - Bounty object
 * @returns {Promise<Object>} - Refund transaction details
 */
export async function refundEscrowedFunds(bounty) {
  console.log(`💸 Refunding ${bounty.bounty_amount} ${bounty.currency} from bounty ${bounty.id}`);
  
  // Use the fee payer wallet as the refund address
  const feePayer = getFeePayerWallet();
  if (!feePayer) {
    throw new Error('Fee payer wallet not available for refund');
  }
  
  const refundAddress = feePayer.publicKey.toBase58();
  console.log(`🔄 Refunding to fee payer wallet: ${refundAddress}`);
  
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
    console.error('❌ Refund failed:', error.message);
    throw new Error(`Failed to refund funds: ${error.message}`);
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

