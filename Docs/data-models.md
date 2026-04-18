# 📦 Data Models

## 1. Primary Database: Firebase Firestore

Firestore is the **finalized** database solution for ChainPilot, providing:
- **Real-time Sync:** Seamless integration with the dashboard via snapshots.
- **Serverless Scaling:** Zero-config scaling and maintenance.
- **Auth Integration:** Native integration with Firebase Auth UIDs.

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
