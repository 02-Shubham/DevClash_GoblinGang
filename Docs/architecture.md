# 🏗️ System Architecture

## 1. High-Level Overview

ChainPilot follows a **layered, event-driven architecture** with clear separation between user-facing, logic, and blockchain concerns.

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│  Wallet Connect · Agent Builder · Dashboard · Logs  │
└────────────────────────┬────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼────────────────────────────┐
│                   API GATEWAY                       │
│  Auth Middleware · Rate Limiting · Request Routing   │
└──┬──────────────┬───────────────┬───────────────────┘
   │              │               │
   ▼              ▼               ▼
┌──────┐   ┌───────────┐   ┌──────────────┐
│Intent│   │  Agent    │   │  Monitoring  │
│Engine│   │  Manager  │   │  Service     │
│ (AI) │   │  (CRUD)   │   │  (Logs/WS)   │
└──┬───┘   └─────┬─────┘   └──────┬───────┘
   │             │                 │
   └──────┬──────┘                 │
          ▼                        │
   ┌──────────────┐                │
   │  Execution   │◄───────────────┘
   │  Engine      │
   │  (Worker)    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Web3        │
   │  Service     │
   │  (ethers.js) │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Blockchain  │
   │  (EVM)       │
   └──────────────┘
```

---

## 2. Layer Descriptions

### Layer 1 — Presentation (Frontend)

| Concern | Detail |
|---------|--------|
| Framework | React + Tailwind CSS |
| Wallet | WalletConnect / MetaMask via `wagmi` + `viem` |
| State | React Context + React Query for server state |
| Real-time | WebSocket connection for live agent status updates |

**Pages:**
- `/` — Landing page
- `/dashboard` — Agent list, status overview
- `/agent/new` — Intent input + agent creation wizard
- `/agent/:id` — Agent detail, logs, controls
- `/logs` — Global execution log viewer

---

### Layer 2 — API Gateway (Express.js)

Responsibilities:
- **Authentication** — Verify wallet signature (SIWE — Sign-In with Ethereum)
- **Authorization** — Ensure requests match the authenticated wallet
- **Rate Limiting** — Protect AI endpoints from abuse
- **Request Routing** — Delegate to appropriate service module

All API routes are prefixed with `/api/v1/`.

---

### Layer 3 — Core Services

#### 3a. Intent Engine (AI Layer)

Converts natural language user input into a **structured agent configuration**.

```
User Input: "Buy 0.5 ETH if the price drops below $2000"
                    │
                    ▼
            ┌───────────────┐
            │  LLM API Call  │
            │  (GPT / Gemini)│
            └───────┬───────┘
                    │
                    ▼
            Structured Output:
            {
              "triggerType": "price_threshold",
              "condition": "lt",
              "asset": "ETH",
              "threshold": 2000,
              "action": "buy",
              "amount": 0.5,
              "currency": "USD"
            }
```

- **One-time operation** — intent is parsed once at agent creation
- **Validation layer** — output is validated against a JSON schema before saving
- **Fallback** — if AI output is ambiguous, user is prompted to clarify

---

#### 3b. Agent Manager

CRUD service for agent lifecycle. Backed by MongoDB.

- Create agent (from parsed intent)
- Read agent(s) for a wallet
- Update agent (modify rules, status)
- Delete agent (soft delete with audit trail)

---

#### 3c. Monitoring Service

- Pushes real-time status updates via WebSocket
- Aggregates execution logs
- Provides health metrics per agent

---

### Layer 4 — Execution Engine (Worker)

The **autonomous core** of the system. Runs as a persistent background process.

```
┌─────────────────────────────────────────┐
│            Execution Loop               │
│                                         │
│  1. Fetch all ACTIVE agents from DB     │
│  2. For each agent:                     │
│     a. Evaluate trigger condition       │
│     b. If condition met:               │
│        i.  Prepare transaction          │
│        ii. Request user signature       │
│             (or use pre-signed permit)  │
│        iii.Execute via Web3 Service     │
│        iv. Log result                   │
│     c. If condition NOT met:            │
│        - Log check, continue           │
│  3. Wait for next cycle (configurable) │
│  4. Repeat                             │
└─────────────────────────────────────────┘
```

**Cycle interval:** Configurable per agent (default: 30 seconds)

---

### Layer 5 — Web3 Service

Abstraction layer over blockchain interactions using `ethers.js`.

| Function | Description |
|----------|-------------|
| `getPrice(asset)` | Fetch current price from Chainlink / DEX oracle |
| `getBalance(wallet, token)` | Read token balance |
| `prepareSwapTx(params)` | Build swap transaction via DEX router |
| `prepareTransferTx(params)` | Build ERC-20 transfer transaction |
| `submitSignedTx(signedTx)` | Broadcast signed transaction to network |
| `getTxReceipt(txHash)` | Fetch transaction receipt and status |

---

### Layer 6 — Blockchain (EVM)

The final settlement layer. All state changes happen here.

- **Testnet (MVP):** Ethereum Sepolia
- **Future:** Polygon, Arbitrum, Base, Optimism

---

## 3. Data Flow — End to End

```
User creates agent
       │
       ▼
[Frontend] ──POST /api/v1/agent──▶ [API Gateway]
                                        │
                                        ▼
                                  [Intent Engine]
                                  Parse NL → JSON
                                        │
                                        ▼
                                  [Agent Manager]
                                  Save to MongoDB
                                  Status: ACTIVE
                                        │
                                        ▼
                                  [Execution Engine]
                                  Picks up agent in next cycle
                                        │
                                  ┌─────┴──────┐
                                  │  Evaluate   │
                                  │  Condition  │
                                  └─────┬──────┘
                                        │
                              ┌─────────┴─────────┐
                              │                   │
                         Condition MET      Condition NOT MET
                              │                   │
                              ▼                   ▼
                        [Web3 Service]       Log "checked,
                        Prepare + submit     no action"
                        transaction
                              │
                              ▼
                        [Blockchain]
                        Execute tx
                              │
                              ▼
                        [Monitoring]
                        Log result + notify
```

---

## 4. Communication Patterns

| From → To | Protocol | Purpose |
|-----------|----------|---------|
| Frontend → API Gateway | REST (HTTPS) | CRUD operations |
| Frontend ← Monitoring | WebSocket | Real-time status updates |
| API Gateway → Intent Engine | Internal function call | Intent parsing |
| API Gateway → Agent Manager | Internal function call | Agent CRUD |
| Execution Engine → Web3 Service | Internal function call | Tx preparation |
| Web3 Service → Blockchain | JSON-RPC | Tx submission + queries |
| Execution Engine → Monitoring | Event emitter | Execution logs |

---

## 5. Deployment Architecture (MVP)

```
┌─────────────┐     ┌─────────────────────────┐
│   Vercel /   │     │   Railway / Render       │
│   Frontend   │────▶│   Backend (API + Worker) │
│   (Static)   │     │   + MongoDB Atlas        │
└─────────────┘     └──────────┬──────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  Sepolia Testnet  │
                    │  (Ethereum)       │
                    └──────────────────┘
```

- Frontend: Static build deployed to Vercel or similar
- Backend: Node.js server on Railway/Render with persistent worker
- Database: MongoDB Atlas (free tier for MVP)
- Blockchain: Sepolia testnet via Infura/Alchemy RPC
