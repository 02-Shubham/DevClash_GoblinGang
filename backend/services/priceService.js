/**
 * services/priceService.js
 * ------------------------
 * Fetches real-time cryptocurrency prices from CoinGecko.
 * Includes basic in-memory caching to avoid API rate limits.
 */

const axios = require("axios");

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const CACHE_TTL_MS = 60 * 1000; // Cache prices for 60 seconds

// Simple in-memory price cache: { coinId: { price, timestamp } }
const priceCache = {};

/**
 * Fetches the current USD price of a given CoinGecko coin ID.
 * @param {string} coinId - e.g. "ethereum", "bitcoin", "usd-coin"
 * @returns {number} - price in USD
 */
const getPrice = async (coinId) => {
  const normalized = coinId.toLowerCase().trim();

  // Return cached value if fresh
  const cached = priceCache[normalized];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.price;
  }

  const headers = {};
  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
    headers,
    params: {
      ids: normalized,
      vs_currencies: "usd",
    },
  });

  const data = response.data;
  if (!data[normalized] || !data[normalized].usd) {
    throw new Error(`Could not find price for coin: ${coinId}`);
  }

  const price = data[normalized].usd;

  // Update cache
  priceCache[normalized] = { price, timestamp: Date.now() };

  return price;
};

/**
 * Fetches prices for multiple coins at once.
 * @param {string[]} coinIds - Array of CoinGecko IDs
 * @returns {object} - { coinId: price }
 */
const getPrices = async (coinIds) => {
  const ids = coinIds.map((id) => id.toLowerCase().trim()).join(",");

  const headers = {};
  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
    headers,
    params: { ids, vs_currencies: "usd" },
  });

  const result = {};
  for (const id of coinIds) {
    const normalized = id.toLowerCase().trim();
    if (response.data[normalized]) {
      result[normalized] = response.data[normalized].usd;
      priceCache[normalized] = {
        price: response.data[normalized].usd,
        timestamp: Date.now(),
      };
    }
  }
  return result;
};

module.exports = { getPrice, getPrices };
