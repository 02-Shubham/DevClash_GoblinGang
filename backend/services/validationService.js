/**
 * services/validationService.js
 * ----------------------------
 * Handles safety and business logic validation for parsed intents.
 * Ensures that agents operate within safe bounds and supported configurations.
 */

const SUPPORTED_TOKENS = ["ETH", "USDC", "WBTC", "SOL"];

// Safety Limits
const LIMITS = {
  ETH: 10,
  USDC: 5000,
  WBTC: 0.1,
  SOL: 100
};

/**
 * Validates the structured intent.
 * @param {object} parsedIntent - The JSON from intentService
 * @returns {object} - { valid: boolean, error?: string }
 */
const validateIntent = (parsedIntent) => {
  const { trigger, condition, action } = parsedIntent;

  if (!trigger || !condition || !action) {
    return { valid: false, error: "Incomplete intent structure." };
  }

  // 1. Validate Action Type
  if (!["transfer", "swap"].includes(action.type)) {
    return { valid: false, error: `Action type '${action.type}' is not supported yet.` };
  }

  // 2. Validate Asset
  const asset = action.asset?.toUpperCase();
  if (!SUPPORTED_TOKENS.includes(asset)) {
    return { valid: false, error: `Asset '${asset}' is not supported. Supported: ${SUPPORTED_TOKENS.join(", ")}` };
  }

  // 3. Validate Amount
  if (action.amount <= 0) {
    return { valid: false, error: "Amount must be greater than zero." };
  }

  const limit = LIMITS[asset];
  if (limit !== undefined && action.amount > limit) {
    return { valid: false, error: `Exceeds safety limit of ${limit} ${asset} per action.` };
  }

  // 4. Validate Trigger/Condition
  if (trigger === "time") {
    if (!["daily", "hourly", "once"].includes(condition.interval)) {
      return { valid: false, error: "Unsupported frequency interval. Please use 'daily', 'hourly', or 'once'." };
    }
  } else if (trigger === "price") {
    if (!condition.operator || !condition.value) {
      return { valid: false, error: "Price triggers require an operator (<, >) and a target value." };
    }
    if (condition.value <= 0) {
      return { valid: false, error: "Target price must be greater than zero." };
    }
  } else {
    return { valid: false, error: `Trigger type '${trigger}' is not recognized.` };
  }

  return { valid: true };
};

module.exports = { validateIntent };
