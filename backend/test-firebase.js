require("dotenv").config();
const { db, auth } = require("./firebaseAdmin");

async function test() {
  console.log("Testing Firebase Connection...");
  try {
    console.log("Checking Firestore...");
    const snapshot = await db.collection("agents").limit(1).get();
    console.log("✅ Firestore check successful. Count:", snapshot.size);
    
    console.log("Checking Auth...");
    // Just a dummy call to verify initialization
    await auth.listUsers(1);
    console.log("✅ Auth check successful.");
    
  } catch (error) {
    console.error("❌ Firebase Test Failed!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    if (error.stack) console.error("Stack Trace:", error.stack);
  }
}

test();
