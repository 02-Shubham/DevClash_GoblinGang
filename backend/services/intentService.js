/**
 * services/intentService.js
 * -------------------------
 * Uses Google Gemini (via LangChain) to parse natural language intents
 * into structured JSON that the autonomous engine can understand.
 */

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

/**
 * Parses user natural language intent into a structured JSON.
 * @param {string} intentText - The user's input (e.g., "Send 0.1 ETH daily")
 * @returns {Promise<object>} - Structured intent JSON
 */
const parseIntent = async (intentText) => {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-pro", 
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a professional Web3 Operations AI. Your task is to convert user natural language intents into a structured JSON "Execution Rule".

### RULES:
1. Identify the TRIGGER:
   - "time": For scheduled tasks (daily, hourly, etc.)
   - "price": For market-based tasks (if ETH drops below...)
2. Identify the CONDITION:
   - For "time": interval can be "daily", "hourly", "once".
   - For "price": operator can be ">", "<", "==" and value is the target price.
3. Identify the ACTION:
   - type: "transfer" (sending funds) or "swap" (exchanging funds).
   - asset: Must be a ticker like "ETH", "USDC", "WBTC".
   - amount: The numerical value of the asset.

### OUTPUT FORMAT:
Return ONLY the JSON object. No markdown, no explanations.

{{
  "trigger": "time" | "price",
  "condition": {{
    "interval": "daily" | "hourly" | "once" | "threshold",
    "operator": ">" | "<" | "==" (optional),
    "value": number (optional)
  }},
  "action": {{
    "type": "transfer" | "swap",
    "asset": string,
    "amount": number
  }}
}}

### EXAMPLES:
- "Send 0.01 ETH daily" -> {{"trigger": "time", "condition": {{"interval": "daily"}}, "action": {{"type": "transfer", "asset": "ETH", "amount": 0.01}}}}
- "Buy 50 USDC worth of ETH if price < 2500" -> {{"trigger": "price", "condition": {{"interval": "threshold", "operator": "<", "value": 2500}}, "action": {{"type": "swap", "asset": "ETH", "amount": 50}}}}
`],
    ["human", "{input}"]
  ]);

  const chain = prompt.pipe(llm);
  
  try {
    const response = await chain.invoke({ input: intentText });
    // Strip markdown formatting if present
    const cleanContent = response.content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("parseIntent error:", error);
    throw new Error("Failed to parse intent. Our AI could not structure your request. Please try: 'Send [amount] [asset] [frequency]'");
  }
};

module.exports = { parseIntent };
