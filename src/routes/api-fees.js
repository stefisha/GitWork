import express from 'express';
import { getFeeText } from '../utils/fees.js';
import config from '../config.js';

const router = express.Router();

/**
 * GET /api/fees/info
 * Get current fee information
 */
router.get('/info', (req, res) => {
  const feePercentage = config.PLATFORM_FEE_PERCENTAGE;
  const isAlpha = feePercentage === 0;
  
  res.json({
    feePercentage: feePercentage * 100, // Convert to percentage for display
    isAlpha,
    message: isAlpha ? 'No fees during alpha' : `${feePercentage * 100}% platform fee`
  });
});

/**
 * GET /api/fees/calculate?amount=100&currency=USDC
 * Calculate fee for a specific bounty amount
 */
router.get('/calculate', (req, res) => {
  const { amount, currency = 'USDC' } = req.query;
  
  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Valid amount parameter required' });
  }
  
  const bountyAmount = parseFloat(amount);
  const feeInfo = getFeeText(bountyAmount, currency);
  
  res.json({
    totalAmount: bountyAmount,
    currency,
    ...feeInfo
  });
});

export default router;

