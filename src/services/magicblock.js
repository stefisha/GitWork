import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  createDelegateInstruction, 
  createUndelegateInstruction,
  getEphemeralConnection
} from '@magicblock-labs/ephemeral-rollups-sdk';

// MagicBlock configuration
const MAGICBLOCK_RPC_URL = process.env.MAGICBLOCK_RPC_URL || 'https://devnet.magicblock.app';
const MAGICBLOCK_VALIDATOR_URL = process.env.MAGICBLOCK_VALIDATOR_URL || 'https://validator.magicblock.app';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Feature flag - MagicBlock SDK is now available
const MAGICBLOCK_ENABLED = process.env.MAGICBLOCK_ENABLED !== 'false';

// Connection instances
let magicBlockConnection = null;
let solanaConnection = null;
let ephemeralSessions = new Map(); // Track active ephemeral sessions

/**
 * Get MagicBlock connection (ephemeral rollup)
 * 
 * @returns {Connection}
 */
export function getMagicBlockConnection() {
  if (!magicBlockConnection) {
    // Use SDK's getEphemeralConnection if available, otherwise fallback to standard Connection
    try {
      magicBlockConnection = getEphemeralConnection ? 
        getEphemeralConnection(MAGICBLOCK_RPC_URL) : 
        new Connection(MAGICBLOCK_RPC_URL, 'confirmed');
      console.log('✅ MagicBlock ephemeral rollup connection initialized');
    } catch (error) {
      console.warn('⚠️  Failed to get ephemeral connection, using standard connection:', error.message);
      magicBlockConnection = new Connection(MAGICBLOCK_RPC_URL, 'confirmed');
    }
  }
  return magicBlockConnection;
}

/**
 * Get standard Solana connection (base layer)
 * 
 * @returns {Connection}
 */
export function getSolanaConnection() {
  if (!solanaConnection) {
    solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');
    console.log('✅ Solana base layer connection initialized');
  }
  return solanaConnection;
}

/**
 * Create an ephemeral session for a bounty
 * This delegates accounts to the ephemeral rollup for fast transactions
 * 
 * @param {string} bountyId - Unique bounty identifier
 * @param {string[]} accountAddresses - Accounts to delegate (e.g., escrow wallet, token accounts)
 * @param {Object} options - Session options (validUntil, autoCommit)
 * @returns {Promise<Object>} - Session info
 */
export async function createEphemeralSession(bountyId, accountAddresses, options = {}) {
  if (!MAGICBLOCK_ENABLED) {
    console.log(`ℹ️  MagicBlock disabled - skipping ephemeral session creation`);
    return null;
  }

  console.log(`🚀 Creating ephemeral session for bounty ${bountyId}`);
  console.log(`   Delegating ${accountAddresses.length} accounts to MagicBlock`);
  
  const {
    validUntil = Math.floor(Date.now() / 1000) + 3600, // 1 hour default
    autoCommit = true,
    commitFrequency = 10, // Auto-commit every 10 transactions
  } = options;

  try {
    const connection = getMagicBlockConnection();
    
    // Create delegation instructions for each account
    const delegationInstructions = accountAddresses.map(address => {
      return createDelegateInstruction({
        payer: new PublicKey(address),
        validUntil,
        commitFrequency: autoCommit ? commitFrequency : 0,
        validatorUrl: MAGICBLOCK_VALIDATOR_URL,
      });
    });

    const session = {
      id: `session-${bountyId}-${Date.now()}`,
      bountyId,
      accounts: accountAddresses,
      validUntil,
      autoCommit,
      commitFrequency,
      createdAt: Date.now(),
      active: true,
      transactionCount: 0,
    };

    // Store session info
    ephemeralSessions.set(session.id, session);
    
    console.log(`✅ Ephemeral session created: ${session.id}`);
    console.log(`   Valid until: ${new Date(validUntil * 1000).toISOString()}`);
    console.log(`   Auto-commit: ${autoCommit ? `every ${commitFrequency} transactions` : 'disabled'}`);

    return {
      sessionId: session.id,
      delegationInstructions,
      validUntil,
      rpcUrl: MAGICBLOCK_RPC_URL,
    };
  } catch (error) {
    console.error('❌ Failed to create ephemeral session:', error.message);
    throw new Error(`Ephemeral session creation failed: ${error.message}`);
  }
}

/**
 * Close an ephemeral session and commit final state
 * This undelegates accounts from the ephemeral rollup back to base layer
 * 
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} - Undelegation result
 */
export async function closeEphemeralSession(sessionId) {
  console.log(`🔒 Closing ephemeral session ${sessionId}`);
  
  const session = ephemeralSessions.get(sessionId);
  
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  try {
    const connection = getMagicBlockConnection();
    
    // Create undelegation instructions for each account
    const undelegationInstructions = session.accounts.map(address => {
      return createUndelegateInstruction({
        payer: new PublicKey(address),
      });
    });

    // Mark session as inactive
    session.active = false;
    session.closedAt = Date.now();
    
    console.log(`✅ Ephemeral session closed: ${sessionId}`);
    console.log(`   Final transaction count: ${session.transactionCount}`);
    console.log(`   Duration: ${((session.closedAt - session.createdAt) / 1000).toFixed(2)}s`);

    // Clean up session after some time
    setTimeout(() => {
      ephemeralSessions.delete(sessionId);
    }, 60000); // Keep for 1 minute for reference

    return {
      sessionId,
      undelegationInstructions,
      transactionCount: session.transactionCount,
      duration: session.closedAt - session.createdAt,
    };
  } catch (error) {
    console.error('❌ Failed to close ephemeral session:', error.message);
    throw new Error(`Ephemeral session closure failed: ${error.message}`);
  }
}

/**
 * Execute a transaction on the ephemeral rollup
 * Uses MagicBlock's fast execution for instant confirmation
 * 
 * @param {string} sessionId - Session identifier
 * @param {Transaction} transaction - Solana transaction to execute
 * @returns {Promise<string>} - Transaction signature
 */
export async function executeOnEphemeralRollup(sessionId, transaction) {
  const session = ephemeralSessions.get(sessionId);
  
  if (!session) {
    console.warn(`⚠️  Session ${sessionId} not found, falling back to base layer`);
    return executeOnBaseLLayer(transaction);
  }

  if (!session.active) {
    console.warn(`⚠️  Session ${sessionId} is inactive, falling back to base layer`);
    return executeOnBaseLLayer(transaction);
  }

  try {
    const connection = getMagicBlockConnection();
    
    console.log(`⚡ Executing transaction on ephemeral rollup (session: ${sessionId})`);
    const startTime = Date.now();
    
    // Send transaction to MagicBlock ephemeral rollup
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    // Wait for confirmation (should be instant on ephemeral rollup)
    await connection.confirmTransaction(signature, 'confirmed');
    
    const duration = Date.now() - startTime;
    session.transactionCount++;
    
    console.log(`✅ Transaction confirmed on ephemeral rollup in ${duration}ms`);
    console.log(`   Signature: ${signature}`);
    console.log(`   Session transactions: ${session.transactionCount}`);

    return signature;
  } catch (error) {
    console.error('❌ Ephemeral rollup transaction failed:', error.message);
    console.log('🔄 Falling back to base layer...');
    return executeOnBaseLLayer(transaction);
  }
}

/**
 * Execute a transaction on the base Solana layer (fallback)
 * 
 * @param {Transaction} transaction - Solana transaction to execute
 * @returns {Promise<string>} - Transaction signature
 */
export async function executeOnBaseLLayer(transaction) {
  try {
    const connection = getSolanaConnection();
    
    console.log(`🐢 Executing transaction on base layer`);
    const startTime = Date.now();
    
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    await connection.confirmTransaction(signature, 'confirmed');
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Transaction confirmed on base layer in ${duration}ms`);
    console.log(`   Signature: ${signature}`);

    return signature;
  } catch (error) {
    console.error('❌ Base layer transaction failed:', error.message);
    throw error;
  }
}

/**
 * Get session info
 * 
 * @param {string} sessionId - Session identifier
 * @returns {Object|null} - Session info or null
 */
export function getSessionInfo(sessionId) {
  const session = ephemeralSessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  return {
    id: session.id,
    bountyId: session.bountyId,
    active: session.active,
    transactionCount: session.transactionCount,
    validUntil: new Date(session.validUntil * 1000).toISOString(),
    createdAt: new Date(session.createdAt).toISOString(),
    closedAt: session.closedAt ? new Date(session.closedAt).toISOString() : null,
  };
}

/**
 * Get all active sessions
 * 
 * @returns {Array} - Array of active session info
 */
export function getActiveSessions() {
  const activeSessions = [];
  
  for (const [id, session] of ephemeralSessions.entries()) {
    if (session.active) {
      activeSessions.push(getSessionInfo(id));
    }
  }
  
  return activeSessions;
}

/**
 * Check if MagicBlock is available and healthy
 * 
 * @returns {Promise<boolean>} - True if MagicBlock is available
 */
export async function checkMagicBlockHealth() {
  if (!MAGICBLOCK_ENABLED) {
    return false;
  }
  
  try {
    const connection = getMagicBlockConnection();
    const version = await connection.getVersion();
    
    console.log('✅ MagicBlock ephemeral rollup is healthy');
    console.log(`   Version: ${JSON.stringify(version)}`);
    
    return true;
  } catch (error) {
    console.error('❌ MagicBlock health check failed:', error.message);
    return false;
  }
}

/**
 * Get connection based on environment or preference
 * Smart router that chooses between ephemeral rollup and base layer
 * 
 * @param {boolean} preferEphemeral - Prefer ephemeral rollup if available
 * @returns {Connection}
 */
export async function getSmartConnection(preferEphemeral = true) {
  if (preferEphemeral) {
    const isHealthy = await checkMagicBlockHealth();
    
    if (isHealthy) {
      console.log('🚀 Using MagicBlock ephemeral rollup for fast transactions');
      return getMagicBlockConnection();
    }
  }
  
  console.log('🐢 Using Solana base layer');
  return getSolanaConnection();
}

export default {
  getMagicBlockConnection,
  getSolanaConnection,
  createEphemeralSession,
  closeEphemeralSession,
  executeOnEphemeralRollup,
  executeOnBaseLLayer,
  getSessionInfo,
  getActiveSessions,
  checkMagicBlockHealth,
  getSmartConnection,
};

