/**
 * Whitelist of SPL tokens (and native SOL) supported for bounties.
 * Only tokens listed here can be used in labels like gitwork:BONK:1000.
 * Add new tokens by appending to SUPPORTED_TOKENS (and set env for mint if needed).
 *
 * - displayDecimals: how many decimals to show in UI (avoids 0.00000001 or 1234567.89)
 * - coingeckoId: CoinGecko API id for USD price (null = no price fetch, e.g. USDC we use 1)
 */

const USDC_MINT = process.env.USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

/** @type {{ symbol: string, mint: string | null, decimals: number, displayDecimals: number, coingeckoId: string | null }[]} */
const SUPPORTED_TOKENS = [
  { symbol: 'USDC', mint: USDC_MINT, decimals: 6, displayDecimals: 2, coingeckoId: 'usd-coin' },
  { symbol: 'SOL', mint: null, decimals: 9, displayDecimals: 4, coingeckoId: 'solana' },
  { symbol: 'BONK', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, displayDecimals: 0, coingeckoId: 'bonk' },
  // Popular SPL tokens (mainnet mints)
  { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, displayDecimals: 2, coingeckoId: 'tether' },
  { symbol: 'JUP', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6, displayDecimals: 2, coingeckoId: 'jupiter-exchange-solana' },
  { symbol: 'WIF', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6, displayDecimals: 2, coingeckoId: 'dogwifhat' },
  { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6, displayDecimals: 2, coingeckoId: 'raydium' },
  { symbol: 'PYTH', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6, displayDecimals: 2, coingeckoId: 'pyth-network' },
  { symbol: 'JTO', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', decimals: 9, displayDecimals: 2, coingeckoId: 'jito-governance-token' },
  { symbol: 'mSOL', mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', decimals: 9, displayDecimals: 4, coingeckoId: 'msol' },
  { symbol: 'JITOSOL', mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', decimals: 9, displayDecimals: 4, coingeckoId: 'jito-staked-sol' },
  { symbol: 'POPCAT', mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', decimals: 6, displayDecimals: 0, coingeckoId: 'popcat' },
  { symbol: 'RENDER', mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof', decimals: 8, displayDecimals: 2, coingeckoId: 'render-token' },
];

/**
 * Get token config by symbol (case-insensitive).
 * @param {string} symbol - e.g. 'USDC', 'SOL', 'BONK'
 * @returns {{ symbol: string, mint: string | null, decimals: number, displayDecimals?: number, coingeckoId?: string | null } | null}
 */
export function getTokenBySymbol(symbol) {
  const upper = (symbol || '').toUpperCase();
  return SUPPORTED_TOKENS.find(t => t.symbol === upper) || null;
}

/**
 * Tokens with displayDecimals for frontend (and optional coingeckoId for prices).
 * Safe to expose from API.
 */
export function getTokensForDisplay() {
  return SUPPORTED_TOKENS.map(t => ({
    symbol: t.symbol,
    displayDecimals: t.displayDecimals ?? 2,
    coingeckoId: t.coingeckoId ?? null
  }));
}

/**
 * Check if a currency symbol is supported for bounties.
 * @param {string} currency - Currency code
 * @returns {boolean}
 */
export function isSupportedCurrency(currency) {
  return getTokenBySymbol(currency) !== null;
}

/**
 * List all supported token symbols (for docs / API).
 * @returns {string[]}
 */
export function getSupportedSymbols() {
  return SUPPORTED_TOKENS.map(t => t.symbol);
}

export default { getTokenBySymbol, isSupportedCurrency, getSupportedSymbols, SUPPORTED_TOKENS };
