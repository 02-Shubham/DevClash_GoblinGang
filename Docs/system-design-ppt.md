# 📊 System Design Presentation: ChainPilot (Nexus)

This document provides the slide-by-slide content for a professional system design review.

---

## Slide 1: Title Slide
**Title:** ChainPilot: The Nexus Orchestrator  
**Subtitle:** Democratizing Blockchain Automation through Natural Language  
**Presented by:** [Your Name / Team Name]  
**Visual Suggestion:** A sleek, glassmorphic logo of an AI pulse overlapping a blockchain grid.

---

## Slide 2: The On-Chain Barrier
**Heading:** The Problem  
*   **Complexity:** Users must navigate fragmented DeFi protocols to perform simple tasks.
*   **Manual Monitoring:** Requires 24/7 attention to prices/conditions to execute at optimal times.
*   **UX Friction:** Traditional "if-this-then-that" bots are rigid and non-intuitive.
*   **Custodial Risk:** Most automation tools require private keys, creating a massive security single-point-of-failure.

---

## Slide 3: The Solution: Nexus
**Heading:** AI-First Blockchain Orchestration  
*   **Natural Language UI:** Chat-based interface that understands complex financial intent.
*   **Non-Custodial by Design:** The backend prepares signed instructions; the user remains in control of the keys.
*   **Autonomous Agents:** "Set and forget" bots that monitor conditions (price/time) in the background.
*   **Interoperable:** Designed to bridge various protocols (Transfers, Swaps, Checks) through a single AI brain.

---

## Slide 4: High-Level Architecture
**Heading:** The Layered System  
*   **Layer 1 (Presentation):** Next.js 16 + Tailwind v4 Dashboard.
*   **Layer 2 (API Gateway):** Express.js & Node.js 20 handling auth and routing.
*   **Layer 3 (AI Brain):** Nexus Orchestrator (LangChain + Gemini 1.5 Flash).
*   **Layer 4 (Execution):** Node.js Polling Engine + Ethers.js for blockchain interaction.
*   **Persistence:** Firebase Cloud Infrastructure (Auth & Firestore).

---

## Slide 5: The AI Brain: Nexus Orchestrator
**Heading:** Understanding Intent via Tool-Calling  
*   **Model:** Google Gemini 1.5 Flash (Latency & Accuracy optimized).
*   **Framework:** LangChain AgentExecutor (ReAct Pattern).
*   **Dynamic Toolset:**
    *   `PriceTool`: Live CoinGecko feeds.
    *   `BlockchainTool`: Prepare Raw Transactions.
    *   `AgentTool`: Firestore State Management.
*   **Structured Parsing:** Zod-enforced schemas ensure LLM output is always valid JSON.

---

## Slide 6: Technology Stack (Finalized)
**Heading:** Modern & Scalable Backend/Frontend  
*   **Codebase:** Next.js (App Router) + TypeScript.
*   **Styling:** Tailwind CSS v4 (Modernized Utility CSS).
*   **Database:** Firebase Firestore (Real-time NoSQL).
*   **Authentication:** Firebase Auth (Oauth via Google/GitHub).
*   **Web3 Tier:** `wagmi` / `viem` / `ethers.js` v6.
*   **Cloud:** Hosted on Vercel (Frontend) & Railway/Render (Backend).

---

## Slide 7: Data Strategy
**Heading:** Real-time Persistence with Firestore  
*   **Collection: `users`**: UID-linked profiles and settings.
*   **Collection: `agents`**: The "Intent Storage" — holds trigger conditions (price/time), status, and configuration.
*   **Collection: `executionLogs`**: Comprehensive audit trail of every evaluation cycle (Met vs. Not Met).
*   **Real-time UX:** Firestore Snapshots allow the dashboard to update instantly when an agent triggers or fails.

---

## Slide 8: Security & Non-Custodial Flow
**Heading:** Trustless Execution  
*   **Zero-Private-Key Policy:** The backend *never* touches a mnemonic or private key.
*   **The Approval Queue:**
    1.  AI prepares an unsigned transaction object.
    2.  User sees a "Pending Signature" notification on the dashboard.
    3.  User signs via MetaMask/Browser Wallet on the frontend.
*   **Ownership Integrity:** Every Firestore request is validated against the authenticated Firebase UID.

---

## Slide 10: Roadmap
**Heading:** The Future of ChainPilot  
*   **Multi-chain Expansion:** Support for Base, Arbitrum, and Optimism.
*   **Account Abstraction (ERC-4337):** Truly autonomous execution via smart accounts.
*   **SIWE Integration:** Moving toward native Ethereum-based logins.
*   **Social Agents:** Collaborative automation shared across communities.
*   **Advanced Triggers:** On-chain balance changes and NFT floor prices.
