/**
 * services/web3Service.js
 * -----------------------
 * ethers.js utilities for blockchain interactions.
 * This service PREPARES transaction data for the frontend to sign.
 * It also handles read-only operations like balance checks.
 *
 * NOTE: Private keys are NEVER stored here. All signing is done
 * by the user's wallet (MetaMask) on the frontend.
 */

const { ethers } = require("ethers");

// ----------------------------------------------------------------
// Provider Setup (Read-only connection to Ethereum/Sepolia)
// ----------------------------------------------------------------
let provider;

const getProvider = () => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    console.log("✅ Web3 provider initialized");
  }
  return provider;
};

// ----------------------------------------------------------------
// Read Operations
// ----------------------------------------------------------------

/**
 * Gets the ETH balance of a wallet address.
 * @param {string} address - Wallet address
 * @returns {string} - Balance in ETH (formatted)
 */
const getBalance = async (address) => {
  const rpc = getProvider();
  const balanceWei = await rpc.getBalance(address);
  return ethers.formatEther(balanceWei);
};

/**
 * Gets the current gas price from the network.
 * @returns {string} - Gas price in Gwei
 */
const getGasPrice = async () => {
  const rpc = getProvider();
  const feeData = await rpc.getFeeData();
  return ethers.formatUnits(feeData.gasPrice, "gwei");
};

// ----------------------------------------------------------------
// Transaction Preparation (Returns data for MetaMask to sign)
// ----------------------------------------------------------------

/**
 * Prepares an ETH transfer transaction object.
 * The frontend will pass this to MetaMask for signing.
 * @param {string} toAddress - Recipient wallet address
 * @param {string} amountEth - Amount in ETH as a string
 * @returns {object} - Unsigned transaction object
 */
const prepareTransfer = async (toAddress, amountEth) => {
  if (!ethers.isAddress(toAddress)) {
    throw new Error(`Invalid Ethereum address: ${toAddress}`);
  }

  const rpc = getProvider();
  const feeData = await rpc.getFeeData();

  // Build the unsigned transaction
  const txData = {
    to: toAddress,
    value: ethers.parseEther(amountEth).toString(), // in Wei
    gasLimit: "21000", // Standard ETH transfer gas limit
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    type: 2, // EIP-1559 transaction
  };

  return txData;
};

/**
 * Prepares a token swap transaction metadata.
 * In production, this would integrate with Uniswap/1inch SDK.
 * For MVP, this returns structured intent data that the frontend
 * can use with a DEX aggregator or a simple Uniswap router call.
 * @param {string} fromToken - Token to sell (e.g., "ETH")
 * @param {string} toToken - Token to buy (e.g., "USDC")
 * @param {string} amount - Amount to swap
 * @returns {object} - Swap intent data
 */
const prepareSwap = async (fromToken, toToken, amount) => {
  // MVP: Return structured swap intent. Frontend integrates with DEX.
  // Future: Integrate 1inch or Uniswap SDK here for full calldata.
  const swapIntent = {
    type: "swap",
    fromToken: fromToken.toUpperCase(),
    toToken: toToken.toUpperCase(),
    amount,
    // Placeholder: In production, fetch calldata from 1inch API
    note: "Frontend should use this intent to call DEX router (Uniswap/1inch)",
    // Uniswap v3 router on Sepolia (for reference)
    routerAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  };

  return swapIntent;
};

module.exports = {
  getProvider,
  getBalance,
  getGasPrice,
  prepareTransfer,
  prepareSwap,
};
