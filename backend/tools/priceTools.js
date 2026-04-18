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
        message: `The current price of ${coinId} is $${price} USD.`,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "get_crypto_price",
    description:
      "Fetches the current USD price of a cryptocurrency. " +
      "Use when the user asks 'what is the price of ETH', 'how much is BTC', etc. " +
      "coinId should be the CoinGecko ID (e.g. 'ethereum', 'bitcoin', 'usd-coin').",
    schema: z.object({
      coinId: z
        .string()
        .describe(
          "The CoinGecko coin ID to look up (e.g. 'ethereum', 'bitcoin', 'usd-coin', 'tether')"
        ),
    }),
  }
);

module.exports = { getPriceTool };
