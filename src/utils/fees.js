import config from '../config.js';

/**
 * Calculate platform fee and net amount for contributor
 * 
 * @param {number} bountyAmount - Total bounty amount
 * @returns {Object} - { fee, netAmount, feePercentage }
 */
export function calculateFee(bountyAmount) {
  const feePercentage = config.PLATFORM_FEE_PERCENTAGE;
  
  // During alpha (fee = 0), contributor gets full amount
  if (feePercentage === 0) {
    return {
      fee: 0,
      netAmount: bountyAmount,
      feePercentage: 0,
      isAlpha: true
    };
  }
  
  const fee = bountyAmount * feePercentage;
  const netAmount = bountyAmount - fee;
  
  return {
    fee: parseFloat(fee.toFixed(6)), // Round to 6 decimals
    netAmount: parseFloat(netAmount.toFixed(6)),
    feePercentage: feePercentage * 100, // Convert to percentage for display
    isAlpha: false
  };
}

/**
 * Get fee display text for UI
 */
export function getFeeText(bountyAmount, currency) {
  const { fee, netAmount, feePercentage, isAlpha } = calculateFee(bountyAmount);
  
  if (isAlpha) {
    return {
      text: 'No fees during alpha',
      netAmount: bountyAmount,
      displayAmount: `${bountyAmount} ${currency}`,
      feeAmount: '0',
      showFee: false
    };
  }
  
  return {
    text: `${feePercentage}% platform fee`,
    netAmount,
    displayAmount: `${netAmount} ${currency}`,
    feeAmount: `${fee} ${currency}`,
    showFee: true
  };
}

export default {
  calculateFee,
  getFeeText
};

