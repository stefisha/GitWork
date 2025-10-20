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
  authenticateWithGitHub,
};

