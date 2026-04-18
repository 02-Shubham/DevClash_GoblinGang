/**
 * tools/blockchainTools.js
 * ------------------------
 * LangChain-compatible tools for on-chain actions.
 * Each tool prepares a transaction object for the frontend to sign.
 * These tools do NOT submit transactions — they return structured tx data.
 */

const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const web3Service = require("../services/web3Service");

// ----------------------------------------------------------------
// Tool: Transfer ETH
// ----------------------------------------------------------------
const transferTool = tool(
  async ({ toAddress, amountEth }) => {
    try {
      const txData = await web3Service.prepareTransfer(toAddress, amountEth);
      return JSON.stringify({
        status: "pending_signature",
        message: `Ready to send ${amountEth} ETH to ${toAddress}`,
        transactionData: txData,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "transfer_eth",
    description:
      "Prepares a transaction to transfer ETH to a specific wallet address. " +
      "Use this when the user says 'send', 'transfer', or 'pay'. " +
      "Returns transaction data for the user to sign in their wallet.",
    schema: z.object({
      toAddress: z
        .string()
        .describe("The recipient Ethereum wallet address (0x...)"),
      amountEth: z
        .string()
        .describe("The amount of ETH to send (as a string, e.g. '0.1')"),
    }),
  }
);

// ----------------------------------------------------------------
// Tool: Swap Tokens (Prepares swap intent data)
// ----------------------------------------------------------------
const swapTool = tool(
  async ({ fromToken, toToken, amount }) => {
    try {
      const txData = await web3Service.prepareSwap(fromToken, toToken, amount);
      return JSON.stringify({
        status: "pending_signature",
        message: `Ready to swap ${amount} ${fromToken} to ${toToken}`,
        transactionData: txData,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "swap_tokens",
    description:
      "Prepares a token swap transaction (e.g., ETH to USDC). " +
      "Use when the user says 'swap', 'exchange', or 'convert'. " +
      "Returns swap transaction data for the user to sign.",
    schema: z.object({
      fromToken: z
        .string()
        .describe("The token to swap FROM (e.g., 'ETH', 'USDC', 'WBTC')"),
      toToken: z
        .string()
        .describe("The token to swap TO (e.g., 'ETH', 'USDC', 'WBTC')"),
      amount: z
        .string()
        .describe("The amount to swap as a string (e.g., '0.5')"),
    }),
  }
);

// ----------------------------------------------------------------
// Tool: Check ETH Balance
// ----------------------------------------------------------------
const checkBalanceTool = tool(
  async ({ walletAddress }) => {
    try {
      const balance = await web3Service.getBalance(walletAddress);
      return JSON.stringify({
        status: "success",
        address: walletAddress,
        balanceEth: balance,
        message: `Your wallet has ${balance} ETH`,
      });
    } catch (error) {
      return JSON.stringify({ status: "error", message: error.message });
    }
  },
  {
    name: "check_balance",
    description:
      "Checks the ETH balance of a given wallet address. " +
      "Use when the user asks 'what is my balance', 'how much ETH do I have', etc.",
    schema: z.object({
      walletAddress: z
        .string()
        .describe("The Ethereum wallet address to check balance for"),
    }),
  }
);

module.exports = { transferTool, swapTool, checkBalanceTool };
