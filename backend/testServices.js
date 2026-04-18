/**
 * scratch/testServices.js
 * -----------------------
 * Manual test for intent and validation services.
 */

require("dotenv").config({ path: ".env" });
const intentService = require("./services/intentService");
const validationService = require("./services/validationService");

async function runTests() {
  const tests = [
    "Send 0.01 ETH daily",
    "Buy $50 ETH if price drops below 2500",
    "Send 1000 ETH every second",
    "Swap 100 USDC to SOL weekly"
  ];

  for (const text of tests) {
    console.log(`\n--- Testing: "${text}" ---`);
    try {
      const parsed = await intentService.parseIntent(text);
      console.log("Parsed:", JSON.stringify(parsed, null, 2));
      
      const validation = validationService.validateIntent(parsed);
      console.log("Validation:", validation.valid ? "✅ VALID" : `❌ INVALID (${validation.error})`);
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
}

runTests();
