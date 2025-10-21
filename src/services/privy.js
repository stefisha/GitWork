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
    
    // Fund the wallet with SOL for transaction fees
    try {
      console.log(`💰 Funding escrow wallet with SOL for transaction fees...`);
      
      const faucetResponse = await fetch('https://api.devnet.solana.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'requestAirdrop',
          params: [walletAddress, 100000000], // 0.1 SOL in lamports (enough for many transactions)
        }),
      });
      
      const faucetResult = await faucetResponse.json();
      
      if (faucetResult.error) {
        console.warn(`⚠️  SOL airdrop failed: ${faucetResult.error.message}`);
        console.log(`⚠️  Wallet created but may need manual SOL funding for transaction fees`);
      } else {
        console.log(`✅ SOL airdrop successful: ${faucetResult.result}`);
        console.log(`💰 Escrow wallet funded with 0.1 SOL for transaction fees`);
      }
      
    } catch (error) {
      console.warn(`⚠️  Failed to fund escrow wallet with SOL: ${error.message}`);
      console.log(`⚠️  Wallet created but may need manual SOL funding for transaction fees`);
    }
    
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
 * @param {number} amount - Amount in USDC
 * @returns {Promise<string>} - Transaction signature
 */
export async function transferBountyFunds(escrowWalletAddress, recipientAddress, amount) {
  console.log(`💸 Transferring ${amount} USDC from ${escrowWalletAddress} to ${recipientAddress}`);

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
      Connection
    } = await import('@solana/web3.js');
    const {
      getAssociatedTokenAddress,
      createTransferInstruction,
      TOKEN_PROGRAM_ID
    } = await import('@solana/spl-token');

    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
    const USDC_MINT = process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

    // Check fee payer SOL balance
    const feePayerBalance = await connection.getBalance(feePayer.publicKey);
    console.log(`💰 Fee payer SOL balance: ${feePayerBalance / 1e9} SOL`);
    
    if (feePayerBalance < 5000) { // Less than 0.000005 SOL
      console.log(`⚠️  Fee payer needs SOL. Requesting from devnet faucet...`);
      
      const faucetResponse = await fetch('https://api.devnet.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'requestAirdrop',
          params: [feePayer.publicKey.toBase58(), 100000000], // 0.1 SOL
        }),
      });
      
      const faucetResult = await faucetResponse.json();
      if (faucetResult.error) {
        throw new Error(`Faucet request failed: ${faucetResult.error.message}`);
      }
      
      console.log(`✅ Fee payer SOL airdrop successful: ${faucetResult.result}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Get token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(USDC_MINT),
      new PublicKey(escrowWalletAddress)
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(USDC_MINT),
      new PublicKey(recipientAddress)
    );

    // Get recent blockhash
    const recentBlockhash = await connection.getLatestBlockhash();
    console.log(`📡 Got recent blockhash: ${recentBlockhash.blockhash}`);

    // Create USDC transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      new PublicKey(escrowWalletAddress),
      amount * 1_000_000, // USDC has 6 decimals
      [],
      TOKEN_PROGRAM_ID
    );

    // Create transaction message with fee payer
    const message = new TransactionMessage({
      payerKey: feePayer.publicKey, // Fee payer pays for transaction
      recentBlockhash: recentBlockhash.blockhash,
      instructions: [transferInstruction],
    });

    // Create versioned transaction
    const transaction = new VersionedTransaction(message.compileToV0Message());

    console.log(`📝 Created sponsored USDC transfer transaction`);
    console.log(`   From token account: ${senderTokenAccount.toString()}`);
    console.log(`   To token account: ${recipientTokenAccount.toString()}`);
    console.log(`   Amount: ${amount} USDC (${amount * 1_000_000} micro-USDC)`);
    console.log(`   Fee payer: ${feePayer.publicKey.toBase58()}`);

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
    console.log(`✅ Sponsored USDC transfer successful: ${signature}`);
    
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

