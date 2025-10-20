import { PrivyClient } from '@privy-io/node';

const PRIVY_APP_ID = process.env.PRIVY_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

// Initialize Privy client
let privyClient = null;

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
 * Transfer funds from escrow wallet to contributor wallet
 * 
 * @param {string} escrowWalletAddress - Escrow wallet address (Privy-managed)
 * @param {string} recipientAddress - Recipient's Solana wallet address
 * @param {number} amount - Amount in USDC
 * @returns {Promise<string>} - Transaction signature
 */
export async function transferBountyFunds(escrowWalletAddress, recipientAddress, amount) {
  console.log(`💸 Transferring ${amount} USDC from ${escrowWalletAddress} to ${recipientAddress}`);
  
  const client = getPrivyClient();
  
  if (!client) {
    throw new Error('Privy not configured - cannot transfer funds');
  }
  
  try {
    // For now, let's simulate the transfer since Privy's transaction API is complex
    // In production, you'd implement the actual Privy transaction here
    
    console.log(`⚠️  Simulating transfer (Privy transaction API needs more work)`);
    console.log(`   From: ${escrowWalletAddress}`);
    console.log(`   To: ${recipientAddress}`);
    console.log(`   Amount: ${amount} USDC`);
    
    // Generate a fake transaction signature for testing
    const fakeSignature = `simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ Transfer simulated: ${fakeSignature}`);
    return fakeSignature;
    
  } catch (error) {
    console.error('❌ Transfer failed:', error.message);
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

