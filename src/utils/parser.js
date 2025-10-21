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
  
  return { currency, amount };
}

/**
 * Check if any label in the list is a bounty label
 * 
 * @param {Array} labels - Array of label objects from GitHub
 * @returns {Object|null} - Parsed bounty info or null
 */
export function findBountyLabel(labels) {
  for (const label of labels) {
    const parsed = parseBountyLabel(label.name);
    if (parsed) {
      return { ...parsed, labelName: label.name };
    }
  }
  return null;
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

