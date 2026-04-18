/**
 * services/priceService.js
 * ------------------------
 * Fetches real-time cryptocurrency prices using the Binance public REST API.
 * ✅ No API key required — completely free with generous rate limits.
 *
 * Binance API docs: https://api.binance.com/api/v3/ticker/price
 */

const axios = require("axios");

const BINANCE_BASE_URL = "https://api.binance.com/api/v3";
const CACHE_TTL_MS = 30 * 1000; // Cache for 30 seconds

// Simple in-memory cache: { symbol: { price, timestamp } }
const priceCache = {};

// Map common coin names → Binance trading pairs (always vs USDT)
const SYMBOL_MAP = {
  ETH:       "ETHUSDT",
  ETHEREUM:  "ETHUSDT",
  BTC:       "BTCUSDT",
  BITCOIN:   "BTCUSDT",
  WBTC:      "WBTCUSDT",
  SOL:       "SOLUSDT",
  SOLANA:    "SOLUSDT",
  USDC:      "USDCUSDT",
  MATIC:     "MATICUSDT",
  POLYGON:   "MATICUSDT",
  BNB:       "BNBUSDT",
  AVAX:      "AVAXUSDT",
  LINK:      "LINKUSDT",
  UNI:       "UNIUSDT",
  ARB:       "ARBUSDT",
  OP:        "OPUSDT",
};

/**
 * Resolves a human-readable coin name to a Binance trading pair symbol.
 * @param {string} coin - e.g. "ETH", "ethereum", "bitcoin"
 * @returns {string} - e.g. "ETHUSDT"
 */
const resolveSymbol = (coin) => {
  const upper = coin.toUpperCase().trim();
  // If the user already gave a pair like "ETHUSDT", use it directly
  if (upper.endsWith("USDT")) return upper;
  return SYMBOL_MAP[upper] || `${upper}USDT`;
};

/**
 * Fetches the current USD price of a given coin.
 * @param {string} coin - e.g. "ETH", "ethereum", "BTC"
 * @returns {number} - price in USD
 */
const getPrice = async (coin) => {
  const symbol = resolveSymbol(coin);

  // Return from cache if still fresh
  const cached = priceCache[symbol];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.price;
  }

  const response = await axios.get(`${BINANCE_BASE_URL}/ticker/price`, {
    params: { symbol },
  });

  const price = parseFloat(response.data.price);

  if (isNaN(price)) {
    throw new Error(`Could not get price for ${coin} (symbol: ${symbol})`);
  }

  // Cache it
  priceCache[symbol] = { price, timestamp: Date.now() };

  return price;
};

/**
 * Fetches prices for multiple coins at once using Binance batch endpoint.
 * @param {string[]} coins - Array of coin names/symbols
 * @returns {object} - { coin: price }
 */
const getPrices = async (coins) => {
  const symbols = coins.map(resolveSymbol);

  // Binance returns all prices when no symbol param is given
  const response = await axios.get(`${BINANCE_BASE_URL}/ticker/price`);
  const allPrices = response.data; // Array of { symbol, price }

  const result = {};
  const priceMap = {};
  allPrices.forEach((item) => {
    priceMap[item.symbol] = parseFloat(item.price);
  });

  coins.forEach((coin, idx) => {
    const symbol = symbols[idx];
    const price = priceMap[symbol];
    if (price) {
      result[coin.toUpperCase()] = price;
      priceCache[symbol] = { price, timestamp: Date.now() };
    }
  });

  return result;
};

module.exports = { getPrice, getPrices, resolveSymbol };
