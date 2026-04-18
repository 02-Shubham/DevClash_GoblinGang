/**
 * tools/priceTools.js
 * -------------------
 * LangChain-compatible tool for fetching real-time crypto prices.
 * Uses the CoinGecko public API.
 */

const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const priceService = require("../services/priceService");

const getPriceTool = tool(
  async ({ coinId }) => {
    try {
      const price = await priceService.getPrice(coinId);
      return JSON.stringify({
        status: "success",
        coin: coinId,
        priceUsd: price,
        message: `The current price of ${coinId} is $${price.toLocaleString()} USD.`,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "get_crypto_price",
    description:
      "Fetches the current USD price of a cryptocurrency using the Binance public API (no key required). " +
      "Use when the user asks 'what is the price of ETH', 'how much is BTC', 'ETH price', etc. " +
      "coinId should be the token symbol (e.g. 'ETH', 'BTC', 'SOL', 'USDC', 'MATIC').",
    schema: z.object({
      coinId: z
        .string()
        .describe(
          "The cryptocurrency symbol to look up (e.g. 'ETH', 'BTC', 'SOL', 'LINK', 'UNI')"
        ),
    }),
  }
);

module.exports = { getPriceTool };
