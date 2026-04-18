# ⚙️ Core Modules — Detailed Specification

Each module is a self-contained service with defined inputs, outputs, and responsibilities.

---

## Module 1: Frontend — [Implemented] Next.js 16 (App Router)

### Responsibility
Direct user engagement layer. The current implementation uses Next.js 16 for server-side stability and Tailwind CSS v4 for styling.

### Sub-Components

#### 1.1 Auth & Connection
- **[Implemented]:** Firebase Auth with Google/GitHub providers.
- **[Implemented]:** Native MetaMask connection via standard injection.
- ~~**[Planned]:** Full SIWE (Sign-In with Ethereum) with `wagmi`.~~

#### 1.2 Agent Builder
- **Input:** Natural language text field + optional structured form
- **Validation:** Client-side basic validation (non-empty, length limits)
- **Submission:** Sends raw intent text to Intent Engine via API
- **Confirmation:** Displays parsed intent for user review before deploying

#### 1.3 Dashboard
- **Content:** Agent cards showing name, status, last execution, next check
- **Real-time:** WebSocket subscription for live status updates
- **Filters:** By status (active / paused / completed / failed)

#### 1.4 Agent Detail View
- **Content:** Full agent config, execution log timeline, performance metrics
- **Controls:** Pause / Resume / Modify / Delete buttons
- **Logs:** Scrollable, filterable execution log with explainability

#### 1.5 Control Panel
- **Pause:** Immediately stops the execution engine from evaluating this agent
- **Resume:** Re-activates the agent
- **Modify:** Opens agent builder pre-filled with current config
- **Delete:** Soft-deletes with confirmation dialog

---

## Module 2: Intent Engine — [Implemented] Nexus Orchestrator

### Responsibility
The "brain" of ChainPilot. The current implementation uses the **Nexus Orchestrator**, a LangChain-powered ReAct agent that decodes intent and uses tools to act on the system.

### Input
```json
{
  "rawIntent": "Buy 0.5 ETH when price drops below $2000",
  "userWallet": "0x..."
}
```

### Processing Pipeline
```
Raw Text
   │
   ▼
LLM API Call (with system prompt + schema constraint)
   │
   ▼
JSON Response Extraction
   │
   ▼
Schema Validation (Zod / Joi)
   │
   ▼
Ambiguity Check
   │
   ├─ Clear → Return structured config
   └─ Ambiguous → Return clarification request
```

### Output (Success)
```json
{
  "parsed": true,
  "config": {
    "triggerType": "price_threshold",
    "condition": "lt",
    "asset": "ETH",
    "threshold": 2000,
    "action": "buy",
    "amount": 0.5,
    "currency": "USD"
  },
  "confidence": 0.95,
  "explanation": "Agent will buy 0.5 ETH when ETH/USD price falls below $2000"
}
```

### Output (Ambiguous)
```json
{
  "parsed": false,
  "clarifications": [
    "Which trading pair should be used? ETH/USD or ETH/USDC?",
    "Should this be a one-time action or recurring?"
  ]
}
```

### Supported Trigger Types (MVP)
| Type | Description | Parameters |
|------|-------------|------------|
| `price_threshold` | Asset price crosses a value | `asset`, `condition` (lt/gt/eq), `threshold` |
| `time_based` | Scheduled execution | `schedule` (cron expression or interval) |
| `balance_threshold` | Wallet balance crosses a value | `token`, `condition`, `threshold` |

### Supported Actions (MVP)
| Action | Description | Parameters |
|--------|-------------|------------|
| `buy` | Purchase a token | `asset`, `amount`, `maxSlippage` |
| `sell` | Sell a token | `asset`, `amount`, `minPrice` |
| `transfer` | Send tokens to address | `token`, `amount`, `recipient` |
| `swap` | Exchange token A for token B | `fromToken`, `toToken`, `amount` |

---

## Module 3: Agent Manager

### Responsibility
Lifecycle management of agents. 
- **[Implemented]:** Backed by **Firebase Firestore** for real-time dashboard sync.
- ~~**[Planned]:** Support for **MongoDB** for high-performance archiving.~~

### Operations

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Create | POST | `/api/v1/agents` | Create new agent from parsed intent |
| List | GET | `/api/v1/agents` | List all agents for authenticated wallet |
| Get | GET | `/api/v1/agents/:id` | Get single agent details |
| Update | PATCH | `/api/v1/agents/:id` | Modify agent config or status |
| Delete | DELETE | `/api/v1/agents/:id` | Soft-delete agent |
| Toggle | POST | `/api/v1/agents/:id/toggle` | Pause or resume agent |

### Business Rules
- Only the owning wallet can modify/delete an agent
- Deleted agents are soft-deleted (marked `status: "deleted"`)
- Status transitions are validated (see [agent-lifecycle.md](./agent-lifecycle.md))

---

## Module 4: Execution Engine (Worker)

### Responsibility
Continuously evaluate active agents and execute actions when conditions are met.

### Architecture
```
┌───────────────────────────────────────┐
│          Execution Engine             │
│                                       │
│  ┌─────────────┐  ┌───────────────┐  │
│  │ Scheduler    │  │ Condition     │  │
│  │ (tick loop)  │──▶ Evaluator     │  │
│  └─────────────┘  └───────┬───────┘  │
│                           │          │
│                    ┌──────▼──────┐   │
│                    │ Action      │   │
│                    │ Executor    │   │
│                    └──────┬──────┘   │
│                           │          │
│                    ┌──────▼──────┐   │
│                    │ Result      │   │
│                    │ Logger      │   │
│                    └─────────────┘   │
└───────────────────────────────────────┘
```

### Evaluation Cycle
1. **Fetch** all agents with `status: "active"` from DB
2. **Evaluate** each agent's trigger condition:
   - `price_threshold` → call price oracle
   - `time_based` → compare against current time
   - `balance_threshold` → query wallet balance
3. **Execute** if condition is met:
   - Prepare unsigned transaction via Web3 Service
   - Request user signature (delegated signing or queued for approval)
   - Submit signed transaction
4. **Log** result with full context:
   - Condition checked
   - Condition result (true/false)
   - Action taken (if any)
   - Transaction hash (if executed)
   - Error (if failed)

### Error Handling
| Error Type | Strategy |
|-----------|----------|
| Price API unavailable | Retry with exponential backoff (3 attempts) |
| Transaction reverted | Log error, mark execution as failed, notify user |
| Gas estimation failed | Log warning, skip cycle, retry next tick |
| Agent config invalid | Pause agent, notify user to reconfigure |

---

## Module 5: Web3 Service

### Responsibility
Abstract all blockchain interactions behind a clean API.

### Core Functions

```javascript
// Price Feeds
getPrice(asset: string, currency: string): Promise<number>

// Wallet Queries  
getBalance(wallet: string, token?: string): Promise<BigNumber>
getNonce(wallet: string): Promise<number>

// Transaction Building
prepareSwapTx(params: SwapParams): Promise<UnsignedTx>
prepareTransferTx(params: TransferParams): Promise<UnsignedTx>

// Transaction Execution
submitSignedTx(signedTx: string): Promise<TxReceipt>
getTxReceipt(txHash: string): Promise<TxReceipt>
waitForConfirmation(txHash: string, confirmations: number): Promise<TxReceipt>

// Gas Estimation
estimateGas(tx: UnsignedTx): Promise<BigNumber>
getGasPrice(): Promise<GasPrice>
```

### Provider Configuration
```javascript
{
  "networks": {
    "sepolia": {
      "chainId": 11155111,
      "rpcUrl": "https://sepolia.infura.io/v3/${INFURA_KEY}",
      "explorer": "https://sepolia.etherscan.io"
    }
  },
  "priceFeeds": {
    "provider": "chainlink",
    "fallback": "coingecko-api"
  }
}
```

---

## Module 6: Monitoring Service

### Responsibility
Real-time agent monitoring, log aggregation, and user notifications.

### Features
| Feature | Implementation |
|---------|---------------|
| Live status | WebSocket push on agent status change |
| Execution logs | Stored in MongoDB, queryable by agent/wallet/time |
| Health checks | Periodic heartbeat for execution engine |
| Notifications | WebSocket events for: execution complete, agent paused, error |

### WebSocket Events
```javascript
// Server → Client
{ "type": "agent_status", "agentId": "...", "status": "active" }
{ "type": "execution_complete", "agentId": "...", "txHash": "0x...", "success": true }
{ "type": "execution_failed", "agentId": "...", "error": "Insufficient balance" }
{ "type": "agent_paused", "agentId": "...", "reason": "user_action" }
```
