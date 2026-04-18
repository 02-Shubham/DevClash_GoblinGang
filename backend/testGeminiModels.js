const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
require("dotenv").config();

async function testModels() {
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const model of models) {
    console.log(`\n--- Testing model: ${model} ---`);
    try {
      const llm = new ChatGoogleGenerativeAI({
        modelName: model,
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0,
      });
      console.log("Invoking...");
      const res = await llm.invoke("Hello, respond with one word: Success");
      console.log(`✅ ${model} response:`, res.content);
    } catch (err) {
      console.log(`❌ ${model} failed!`);
      if (err.status) console.log(`Status: ${err.status}`);
      if (err.message) console.log(`Message: ${err.message}`);
    }
  }
}

testModels();
