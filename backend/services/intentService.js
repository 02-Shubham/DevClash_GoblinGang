/**
 * services/intentService.js
 * -------------------------
 * Uses Google Gemini (via LangChain) to parse natural language intents
 * into structured JSON that the autonomous engine can understand.
 * Includes a robust Regex-based fallback for reliability.
 */

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

/**
 * Fallback parser using Regex for common intents.
 * Handles "Send [amount] [asset] [frequency]" type requests.
 */
const fallbackParse = (text) => {
  console.log("🛠️ Using fallback regex parser...");
  const cleanInput = text.toLowerCase();
  
  // 1. Identify Action & Amount (e.g., "send 0.1 eth")
  const transferMatch = cleanInput.match(/(?:send|transfer|pay)\s+([\d.]+)\s*([a-z]+)/i);
  // 2. Identify Frequency (e.g., "daily", "hourly")
  const frequencyMatch = cleanInput.match(/(daily|hourly|once|weekly)/i);

  if (transferMatch) {
    const amount = parseFloat(transferMatch[1]);
    const asset = transferMatch[2].toUpperCase();
    const interval = frequencyMatch ? frequencyMatch[1].toLowerCase() : "once";

    return {
      trigger: "time",
      condition: {
        interval: interval === "once" ? "once" : interval,
        value: interval === "daily" ? "24h" : (interval === "hourly" ? "1h" : "24h")
      },
      action: {
        type: "transfer",
        asset: asset,
        amount: amount
      }
    };
  }

  // Handle "Buy/Swap" intents
  const swapMatch = cleanInput.match(/(?:buy|swap|exchange)\s+([\d.]+)\s*([a-z]+)/i);
  if (swapMatch) {
    const amount = parseFloat(swapMatch[1]);
    const asset = swapMatch[2].toUpperCase();
    return {
      trigger: "time",
      condition: { interval: "once", value: "once" },
      action: { type: "swap", asset: asset, amount: amount }
    };
  }

  return null;
};

/**
 * Parses user natural language intent into a structured JSON.
 * @param {string} intentText - The user's input (e.g., "Send 0.1 ETH daily")
 * @returns {Promise<object>} - Structured intent JSON
 */
const parseIntent = async (intentText) => {
  console.log(`🔍 Parsing intent: "${intentText}"`);

  // Try the AI parser first, but wrap the whole thing in try/catch to ensure fallback always works
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey || apiKey === "your-google-api-key") {
      throw new Error("Missing or invalid GOOGLE_API_KEY");
    }

    const llm = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash", 
      apiKey: apiKey,
      temperature: 0,
      maxRetries: 1,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a professional Web3 Operations AI. Your task is to convert user natural language intents into a structured JSON "Execution Rule".
### SCHEMA:
{{
  "trigger": "time" | "price",
  "condition": {{ "interval": "daily" | "hourly" | "once" | "threshold", "value": string | number }},
  "action": {{ "type": "transfer" | "swap", "asset": string, "amount": number }}
}}
`],
      ["human", "{input}"]
    ]);

    const chain = prompt.pipe(llm);
    const response = await chain.invoke({ input: intentText });
    const cleanContent = response.content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanContent);

  } catch (error) {
    console.warn("⚠️ AI parse failed (Key error or Model error). Attempting fallback...");
    console.error("Original Error:", error.message);
    
    // Attempt fallback parsing
    const fallbackResult = fallbackParse(intentText);
    if (fallbackResult) {
      console.log("✅ Fallback parser succeeded!");
      return fallbackResult;
    }

    // If both fail, throw a descriptive error
    throw new Error("Failed to parse intent. Please try a simpler format like: 'Send 0.1 ETH daily'");
  }
};

module.exports = { parseIntent };
