/**
 * Fetch token prices in USD (CoinGecko) with in-memory cache.
 * Used to show "≈ $X.XX" value for bounties in the UI.
 */

import { getTokensForDisplay } from '../config/tokens.js';

const CACHE_MS = 5 * 60 * 1000; // 5 minutes
let cache = null;
let cacheTime = 0;

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Get USD price per token symbol. Uses cache.
 * USDC is always 1. Other tokens from CoinGecko (when coingeckoId set).
 * @returns {Promise<Record<string, number>>} e.g. { USDC: 1, SOL: 150.5, BONK: 0.00002 }
 */
export async function getPricesUsd() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_MS) {
    return cache;
  }

  const tokens = getTokensForDisplay();
  const ids = tokens.filter(t => t.coingeckoId).map(t => t.coingeckoId);
  const byId = Object.fromEntries(tokens.filter(t => t.coingeckoId).map(t => [t.coingeckoId, t.symbol]));

  const result = { USDC: 1 }; // USDC = 1 USD

  if (ids.length === 0) {
    cache = result;
    cacheTime = now;
    return result;
  }

  try {
    const url = `${COINGECKO_BASE}/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      console.warn('⚠️ CoinGecko price fetch failed:', res.status);
      cache = result;
      cacheTime = now;
      return result;
    }
    const data = await res.json();
    for (const [id, sym] of Object.entries(byId)) {
      const price = data[id]?.usd;
      if (typeof price === 'number') result[sym] = price;
    }
  } catch (err) {
    console.warn('⚠️ CoinGecko price fetch error:', err.message);
  }

  cache = result;
  cacheTime = now;
  return result;
}

/**
 * Get value in USD for an amount of a given currency.
 * @param {number} amount - Human amount (e.g. 1000 BONK)
 * @param {string} currency - Symbol (e.g. 'BONK')
 * @param {Record<string, number>} [prices] - Optional pre-fetched prices
 * @returns {Promise<number | null>} USD value or null if unknown
 */
export async function getValueUsd(amount, currency, prices = null) {
  const p = prices ?? await getPricesUsd();
  const price = p[(currency || '').toUpperCase()];
  if (price == null || typeof price !== 'number') return null;
  return amount * price;
}
