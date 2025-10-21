/**
 * Parse a bounty label to extract currency and amount
 * Expected format: Octavian:USDC:50
 * 
 * @param {string} label - The label to parse
 * @returns {Object|null} - { currency, amount } or null if invalid
 */
export function parseBountyLabel(label) {
  const pattern = /^Octavian:([A-Z]+):(\d+(?:\.\d+)?)$/i;
  const match = label.match(pattern);
  
  if (!match) {
    return null;
  }
  
  const currency = match[1].toUpperCase();
  const amount = parseFloat(match[2]);
  
  if (isNaN(amount) || amount <= 0) {
    return null;
  }
  
  // Validate currency is supported
  if (!isSupportedCurrency(currency)) {
    return {
      error: 'UNSUPPORTED_CURRENCY',
      currency,
      amount,
      message: `Unsupported currency: ${currency}. Only USDC and SOL are supported.`
    };
  }
  
  return { currency, amount };
}

/**
 * Check if any label in the list is a bounty label
 * Rejects multiple bounty labels and returns error info
 * 
 * @param {Array} labels - Array of label objects from GitHub
 * @returns {Object|null} - Parsed bounty info or error info
 */
export function findBountyLabel(labels) {
  const bountyLabels = [];
  const errorLabels = [];
  
  // Find all bounty labels
  for (const label of labels) {
    const parsed = parseBountyLabel(label.name);
    if (parsed) {
      if (parsed.error) {
        errorLabels.push({ ...parsed, labelName: label.name });
      } else {
        bountyLabels.push({ ...parsed, labelName: label.name });
      }
    }
  }
  
  // Check for unsupported currency errors first
  if (errorLabels.length > 0) {
    const unsupportedCurrency = errorLabels.find(e => e.error === 'UNSUPPORTED_CURRENCY');
    if (unsupportedCurrency) {
      return {
        error: 'UNSUPPORTED_CURRENCY',
        currency: unsupportedCurrency.currency,
        amount: unsupportedCurrency.amount,
        labelName: unsupportedCurrency.labelName,
        message: unsupportedCurrency.message
      };
    }
  }
  
  if (bountyLabels.length === 0) {
    return null;
  }
  
  if (bountyLabels.length === 1) {
    return bountyLabels[0];
  }
  
  // Multiple bounty labels found - return error info
  console.log(`❌ Found ${bountyLabels.length} bounty labels:`, bountyLabels.map(b => `${b.amount} ${b.currency}`));
  
  return {
    error: 'MULTIPLE_BOUNTY_LABELS',
    labels: bountyLabels,
    message: `Multiple bounty labels detected. Please use only one bounty label per issue. Found: ${bountyLabels.map(b => b.labelName).join(', ')}`
  };
}

/**
 * Validate that the currency is supported
 * 
 * @param {string} currency - Currency code
 * @returns {boolean}
 */
export function isSupportedCurrency(currency) {
  const supported = ['USDC', 'SOL'];
  return supported.includes(currency.toUpperCase());
}

