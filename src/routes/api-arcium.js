import express from 'express';
import {
  isArciumAvailable,
  encryptBountyAmount,
  decryptBountyAmount,
  getEncryptedBountyInfo,
  checkArciumHealth,
} from '../services/arcium.js';
import { PublicKey } from '@solana/web3.js';

const router = express.Router();

/**
 * GET /api/arcium/health
 * Check Arcium service health
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await checkArciumHealth();
    const isAvailable = isArciumAvailable();

    res.json({
      success: true,
      arcium: {
        enabled: process.env.ARCIUM_ENABLED !== 'false',
        available: isAvailable,
        healthy: isHealthy,
        sdk_installed: isAvailable,
        status: isHealthy ? 'operational' : 'unavailable',
      },
      message: isHealthy 
        ? 'Arcium encrypted bounties are operational' 
        : 'Arcium not available - encrypted features disabled',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/arcium/encrypt-amount
 * Encrypt a bounty amount (for testing/admin)
 * Body: { amount: number, currency: string, ownerPubkey: string }
 */
router.post('/encrypt-amount', async (req, res) => {
  try {
    const { amount, currency, ownerPubkey } = req.body;

    if (!amount || !currency || !ownerPubkey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, currency, ownerPubkey',
      });
    }

    if (!isArciumAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'Arcium not available',
        message: 'Encrypted bounties require Arcium SDK to be installed',
      });
    }

    const ownerKey = new PublicKey(ownerPubkey);
    const encryptedData = await encryptBountyAmount(amount, currency, ownerKey);

    res.json({
      success: true,
      encrypted: encryptedData.encrypted,
      data: {
        currency: encryptedData.currency,
        ciphertext: encryptedData.ciphertext,
        nonce: encryptedData.nonce,
        ownerPubkey: encryptedData.ownerPubkey,
      },
      message: encryptedData.encrypted 
        ? 'Amount encrypted successfully' 
        : 'Fallback to plaintext (Arcium unavailable)',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Encryption failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/arcium/decrypt-amount
 * Decrypt a bounty amount (for authorized parties)
 * Body: { encryptedData: object, requesterPubkey: string }
 */
router.post('/decrypt-amount', async (req, res) => {
  try {
    const { encryptedData, requesterPubkey } = req.body;

    if (!encryptedData || !requesterPubkey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: encryptedData, requesterPubkey',
      });
    }

    if (!isArciumAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'Arcium not available',
      });
    }

    const requesterKey = new PublicKey(requesterPubkey);
    const amount = await decryptBountyAmount(encryptedData, requesterKey);

    if (amount === null) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You are not authorized to decrypt this bounty amount',
      });
    }

    res.json({
      success: true,
      amount,
      currency: encryptedData.currency,
      message: 'Amount decrypted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Decryption failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/arcium/bounty/:bountyId
 * Get encrypted bounty info
 * Query: ?requesterPubkey=xxx (optional, for decryption)
 */
router.get('/bounty/:bountyId', async (req, res) => {
  try {
    const { bountyId } = req.params;
    const { requesterPubkey } = req.query;

    if (!isArciumAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'Arcium not available',
      });
    }

    const requesterKey = requesterPubkey ? new PublicKey(requesterPubkey) : null;
    const bountyInfo = await getEncryptedBountyInfo(bountyId, requesterKey);

    res.json({
      success: true,
      bounty: bountyInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bounty info',
      message: error.message,
    });
  }
});

/**
 * GET /api/arcium/status
 * Get Arcium integration status and capabilities
 */
router.get('/status', async (req, res) => {
  try {
    const isAvailable = isArciumAvailable();
    const isHealthy = await checkArciumHealth();

    res.json({
      success: true,
      arcium: {
        enabled: process.env.ARCIUM_ENABLED !== 'false',
        available: isAvailable,
        healthy: isHealthy,
        features: {
          encrypted_amounts: isAvailable,
          encrypted_escrow: isAvailable,
          private_payments: isAvailable,
          mpc_computation: isAvailable,
        },
        benefits: [
          'Hidden bounty amounts until claim',
          'Private escrow balances',
          'Confidential payment processing',
          'Encrypted contributor data',
        ],
      },
      message: isAvailable 
        ? 'Arcium encrypted bounties are fully operational' 
        : 'Arcium SDK not installed - install with: npm install @arcium/sdk',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: error.message,
    });
  }
});

export default router;

