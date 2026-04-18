# 📦 Data Models

## 1. Primary Database: [Implemented] Firebase Firestore

Firestore is utilized for its:
- **Real-time Sync:** Seamless integration with the dashboard via snapshots.
- **Serverless Scaling:** Zero-config scaling and maintenance.
- **Auth Integration:** Native integration with Firebase Auth UIDs.

*~~Alternative Storage (Planned):~~* ~~**MongoDB** remains a candidate for high-volume execution logs or specialized querying needs.~~

---

## 2. Implemented: Firestore Collections

### 2.1 `users` Collection
Stores profile and linked wallet association.

```javascript
{
  uid: String,              // Firebase Auth UID
  email: String,
  walletAddress: String,    // Linked wallet 
  createdAt: Timestamp,
  lastLoginAt: Timestamp
}
```

---

### 2.2 `agents` Collection
Primary agent configuration source.

```javascript
{
  id: String,
  userId: String,
  name: String,
  rawIntent: String,
  config: {
    triggerType: "price_threshold" | "time_based",
    condition: "lt" | "gt",
    asset: String,
    threshold: Number,
    action: "transfer" | "swap",
    amount: String
  },
  status: "active" | "paused" | "deleted",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## ~~3. Planned/Alternative: MongoDB Schemas~~

### ~~3.1 `users` (Legacy/Planned)~~

Stores authenticated wallet sessions.

```javascript
{
  _id: ObjectId,
  wallet: String,           // "0x1234...abcd" — primary identifier
  chainId: Number,          // 11155111 (Sepolia)
  nonce: String,            // Current SIWE nonce (single-use)
  createdAt: Date,
  lastLoginAt: Date,
  settings: {
    defaultMaxSpend: Number, // Default max spend for new agents
    notificationsEnabled: Boolean,
  }
}
```

**Indexes:**
- `{ wallet: 1 }` — unique
- `{ nonce: 1 }` — unique, sparse

---

### 2.2 `agents` Collection

Core collection — stores all agent configurations and state.

```javascript
{
  _id: ObjectId,
  agentId: String,          // UUID v4
  name: String,             // "ETH Price Watcher" (user or AI-generated)
  userWallet: String,       // Owner's wallet address
  
  // Intent
  rawIntent: String,        // "Buy 0.5 ETH if price drops below $2000"
  parsedConfig: {
    triggerType: String,    // "price_threshold" | "time_based" | "balance_threshold"
    condition: String,      // "lt" | "gt" | "eq" | "gte" | "lte"
    asset: String,          // "ETH"
    threshold: Number,      // 2000
    action: String,         // "buy" | "sell" | "transfer" | "swap"
    amount: Number,         // 0.5
    currency: String,       // "USD"
    recipient: String,      // (for transfer actions)
    fromToken: String,      // (for swap actions)
    toToken: String,        // (for swap actions)
    maxSlippage: Number,    // 0.01 (1%)
    schedule: String,       // Cron expression (for time_based)
  },
  
  // Execution
  mode: String,             // "one_shot" | "recurring"
  maxExecutions: Number,    // null = unlimited
  executionCount: Number,   // starts at 0
  cooldownSeconds: Number,  // 300 (5 min default)
  
  // Permissions
  permissions: {
    maxSpendPerTx: Number,
    maxTotalSpend: Number,
    totalSpent: Number,
    allowedActions: [String],
    allowedTokens: [String],
    expiresAt: Date,
  },
  
  // State
  status: String,           // "created"|"active"|"paused"|"executing"|"done"|"failed"|"deleted"
  lockUntil: Date,          // Concurrency lock expiry
  
  // Network
  chainId: Number,
  networkName: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastCheckedAt: Date,
  lastExecutedAt: Date,
  deletedAt: Date,          // Soft delete timestamp
  
  // Error tracking
  consecutiveFailures: Number,
  lastError: String,
}
```

**Indexes:**
- `{ agentId: 1 }` — unique
- `{ userWallet: 1, status: 1 }` — compound for dashboard queries
- `{ status: 1, lastCheckedAt: 1 }` — for execution engine polling
- `{ userWallet: 1, deletedAt: 1 }` — for filtering soft-deleted agents

---

### 2.3 `execution_logs` Collection

Immutable audit trail of every agent evaluation and execution.

```javascript
{
  _id: ObjectId,
  logId: String,            // UUID v4
  agentId: String,          // FK to agents.agentId
  userWallet: String,       // Denormalized for query performance
  
  // Evaluation
  evaluatedAt: Date,
  triggerType: String,
  conditionChecked: String,  // "ETH/USD < 2000"
  conditionResult: Boolean,  // true = condition met
  currentValue: Mixed,       // The actual value at evaluation time (e.g., 1985.50)
  
  // Execution (only if conditionResult === true)
  executed: Boolean,
  action: String,
  txHash: String,           // null if not executed
  txStatus: String,         // "pending" | "confirmed" | "reverted"
  gasUsed: Number,
  gasPriceGwei: Number,
  valueUSD: Number,         // USD value of the transaction
  
  // Explainability
  explanation: String,      // "ETH price ($1985.50) dropped below threshold ($2000). Executed buy order for 0.5 ETH."
  
  // Error (only on failure)
  error: String,
  errorCode: String,
  
  // Metadata
  engineVersion: String,    // Version of execution engine
  cycleId: String,          // Groups all evaluations in a single tick
}
```

**Indexes:**
- `{ agentId: 1, evaluatedAt: -1 }` — agent log timeline
- `{ userWallet: 1, evaluatedAt: -1 }` — user-wide log view
- `{ cycleId: 1 }` — group by execution cycle
- `{ evaluatedAt: 1 }` — TTL index for auto-expiry (90 days)

---

### 2.4 `pending_transactions` Collection

Queue of unsigned transactions awaiting user signature (MVP signing strategy).

```javascript
{
  _id: ObjectId,
  txId: String,             // UUID v4
  agentId: String,
  userWallet: String,
  
  // Transaction
  unsignedTx: {
    to: String,
    from: String,
    data: String,
    value: String,          // hex-encoded
    gasLimit: String,
    chainId: Number,
  },
  
  // Context
  action: String,           // "swap" | "transfer" | etc.
  description: String,      // Human-readable: "Swap 0.5 ETH → USDC on Uniswap"
  estimatedValueUSD: Number,
  
  // Status
  status: String,           // "pending" | "signed" | "submitted" | "confirmed" | "expired"
  createdAt: Date,
  expiresAt: Date,          // Auto-expire after 10 minutes
  signedAt: Date,
  submittedAt: Date,
  confirmedAt: Date,
  txHash: String,
}
```

**Indexes:**
- `{ userWallet: 1, status: 1 }` — fetch pending txs for a user
- `{ expiresAt: 1 }` — TTL index for auto-cleanup

---

## 3. Type Definitions (TypeScript)

```typescript
// Enums
type TriggerType = "price_threshold" | "time_based" | "balance_threshold";
type Condition = "lt" | "gt" | "eq" | "gte" | "lte";
type Action = "buy" | "sell" | "transfer" | "swap";
type AgentStatus = "created" | "active" | "paused" | "executing" | "done" | "failed" | "deleted";
type AgentMode = "one_shot" | "recurring";
type TxStatus = "pending" | "signed" | "submitted" | "confirmed" | "reverted" | "expired";

// Core Types
interface ParsedIntent {
  triggerType: TriggerType;
  condition: Condition;
  asset: string;
  threshold: number;
  action: Action;
  amount: number;
  currency: string;
  recipient?: string;
  fromToken?: string;
  toToken?: string;
  maxSlippage?: number;
  schedule?: string;
}

interface AgentPermissions {
  maxSpendPerTx: number;
  maxTotalSpend: number;
  totalSpent: number;
  allowedActions: Action[];
  allowedTokens: string[];
  expiresAt?: Date;
}

interface ExecutionLog {
  logId: string;
  agentId: string;
  evaluatedAt: Date;
  conditionChecked: string;
  conditionResult: boolean;
  currentValue: number | string;
  executed: boolean;
  action?: Action;
  txHash?: string;
  explanation: string;
  error?: string;
}
```

---

## 4. Relationships

```
users (1) ──────────────▶ (N) agents
agents (1) ─────────────▶ (N) execution_logs
agents (1) ─────────────▶ (N) pending_transactions
```

No foreign key enforcement (MongoDB) — consistency maintained at application level via `userWallet` and `agentId` as join keys.
