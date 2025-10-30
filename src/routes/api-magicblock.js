import express from 'express';
import { 
  checkMagicBlockHealth, 
  getActiveSessions,
  getSessionInfo 
} from '../services/magicblock.js';

const router = express.Router();

/**
 * Health check for MagicBlock ephemeral rollup
 * GET /api/magicblock/health
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await checkMagicBlockHealth();
    
    res.json({
      healthy: isHealthy,
      service: 'MagicBlock Ephemeral Rollup',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get all active ephemeral sessions
 * GET /api/magicblock/sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = getActiveSessions();
    
    res.json({
      count: sessions.length,
      sessions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get specific session info
 * GET /api/magicblock/sessions/:sessionId
 */
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSessionInfo(sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        sessionId,
      });
    }
    
    res.json({
      session,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Get MagicBlock statistics
 * GET /api/magicblock/stats
 */
router.get('/stats', (req, res) => {
  try {
    const sessions = getActiveSessions();
    
    const stats = {
      activeSessions: sessions.length,
      totalTransactions: sessions.reduce((sum, s) => sum + (s.transactionCount || 0), 0),
      averageTransactionsPerSession: sessions.length > 0 
        ? (sessions.reduce((sum, s) => sum + (s.transactionCount || 0), 0) / sessions.length).toFixed(2)
        : 0,
    };
    
    res.json({
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

