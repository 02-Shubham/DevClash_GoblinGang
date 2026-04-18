# 🔄 Agent Lifecycle

## 1. State Machine

Every agent follows a deterministic state machine with well-defined transitions.

```
                    ┌───────────┐
         ┌─────────│  CREATED   │
         │         └─────┬─────┘
         │               │ deploy
         │               ▼
         │         ┌───────────┐
         │    ┌───▶│  ACTIVE    │◄────┐
         │    │    └──┬──┬──┬──┘     │
         │    │       │  │  │        │
         │    │ resume│  │  │pause   │ resume
         │    │       │  │  │        │
         │    │       │  │  ▼        │
         │    │       │  │ ┌────────┴──┐
         │    │       │  │ │  PAUSED    │
         │    │       │  │ └───────────┘
         │    │       │  │
         │    │       │  │ execute (condition met)
         │    │       │  ▼
         │    │       │ ┌───────────┐
         │    │       │ │ EXECUTING  │
         │    │       │ └──┬────┬───┘
         │    │       │    │    │
         │    │  success   │    │ failure
         │    │       │    │    │
         │    │       │    ▼    ▼
         │    │       │ ┌────┐ ┌────────┐
         │    └───────┘ │DONE│ │ FAILED  │
         │              └────┘ └────┬───┘
         │                          │ retry/resume
         │                          │
         │    delete (from any)     │
         ▼                          │
    ┌───────────┐                   │
    │  DELETED   │◄─────────────────┘
    └───────────┘   (if max retries exceeded)
```

---

## 2. State Definitions

| State | Description | Execution Engine Behavior |
|-------|-------------|--------------------------|
| `CREATED` | Agent config saved, not yet deployed | Ignored |
| `ACTIVE` | Agent is live and being evaluated | Evaluated every cycle |
| `PAUSED` | Agent exists but evaluation is suspended | Skipped |
| `EXECUTING` | Condition was met, transaction is in progress | Locked — no concurrent execution |
| `DONE` | Execution completed successfully | Returned to `ACTIVE` (if recurring) or stays `DONE` (if one-shot) |
| `FAILED` | Execution failed | Retry logic applied; paused after max retries |
| `DELETED` | Agent soft-deleted | Permanently ignored |

---

## 3. Transition Rules

| From | To | Trigger | Authorization |
|------|----|---------|--------------|
| `CREATED` | `ACTIVE` | User confirms deployment | User |
| `ACTIVE` | `PAUSED` | User pauses agent | User |
| `ACTIVE` | `EXECUTING` | Condition evaluated as true | System (Execution Engine) |
| `ACTIVE` | `DELETED` | User deletes agent | User |
| `PAUSED` | `ACTIVE` | User resumes agent | User |
| `PAUSED` | `DELETED` | User deletes agent | User |
| `EXECUTING` | `DONE` | Transaction confirmed on-chain | System |
| `EXECUTING` | `FAILED` | Transaction reverted or error | System |
| `DONE` | `ACTIVE` | Recurring agent resets | System (automatic) |
| `FAILED` | `ACTIVE` | User retries or system auto-retries | User / System |
| `FAILED` | `DELETED` | Max retries exceeded or user deletes | System / User |

---

## 4. Execution Modes

### One-Shot Agent
Executes once when condition is met, then transitions to `DONE` permanently.

```
ACTIVE → EXECUTING → DONE (terminal)
```

**Use case:** "Transfer 1 ETH to 0xABC tomorrow at 3PM"

### Recurring Agent
Executes every time condition is met, then returns to `ACTIVE`.

```
ACTIVE → EXECUTING → DONE → ACTIVE → EXECUTING → ...
```

**Use case:** "Buy 0.1 ETH every time the price drops below $2000"

### Conditional Recurring Agent
Same as recurring, but with a max execution count or expiry.

```
ACTIVE → EXECUTING → DONE → ACTIVE → ... → DONE (max reached, terminal)
```

**Use case:** "Buy 0.1 ETH when price < $2000, max 5 times"

---

## 5. Agent Configuration Schema

```typescript
interface AgentConfig {
  // Identity
  agentId: string;              // UUID, auto-generated
  name: string;                 // User-defined or AI-generated name
  userWallet: string;           // Owner's wallet address
  
  // Intent
  rawIntent: string;            // Original natural language input
  parsedConfig: ParsedIntent;   // Structured output from Intent Engine
  
  // Execution
  mode: "one_shot" | "recurring";
  maxExecutions?: number;       // For recurring: max number of executions
  executionCount: number;       // Current count of completed executions
  cooldownSeconds?: number;     // Min time between executions (recurring)
  
  // Permissions
  permissions: {
    maxSpendPerTx: number;      // Max USD value per transaction
    maxTotalSpend: number;      // Max USD value lifetime
    totalSpent: number;         // Running total spent
    allowedActions: string[];   // ["swap", "transfer", "buy", "sell"]
    allowedTokens: string[];    // Whitelist of token addresses
  };
  
  // State
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
  lastCheckedAt?: Date;
  lastExecutedAt?: Date;
  
  // Network
  chainId: number;
  networkName: string;
}

type AgentStatus = 
  | "created" 
  | "active" 
  | "paused" 
  | "executing" 
  | "done" 
  | "failed" 
  | "deleted";
```

---

## 6. Retry Policy

| Failure Type | Max Retries | Backoff | After Max Retries |
|-------------|------------|---------|-------------------|
| Gas estimation failed | 3 | 30s, 60s, 120s | Pause agent, notify user |
| Transaction reverted | 2 | 60s, 300s | Pause agent, notify user |
| Price feed unavailable | 5 | 10s, 20s, 40s, 80s, 160s | Skip cycle, try next |
| RPC node error | 5 | 5s, 10s, 20s, 40s, 80s | Switch to fallback RPC |
| Unknown error | 1 | — | Pause agent, notify user |

---

## 7. Concurrency Guard

To prevent double-execution:

1. Before executing, atomically set `status: "executing"` with a MongoDB `findOneAndUpdate`
2. Use a `lockUntil` timestamp — if the current time exceeds `lockUntil`, the lock is considered stale
3. After execution (success or failure), release the lock and update status

```javascript
// Pseudo-code for atomic lock
const agent = await Agent.findOneAndUpdate(
  { 
    _id: agentId, 
    status: "active",
    $or: [
      { lockUntil: { $exists: false } },
      { lockUntil: { $lt: new Date() } }
    ]
  },
  { 
    $set: { 
      status: "executing", 
      lockUntil: new Date(Date.now() + 5 * 60 * 1000) // 5 min TTL
    } 
  },
  { new: true }
);

if (!agent) {
  // Another worker already picked this up — skip
  return;
}
```
