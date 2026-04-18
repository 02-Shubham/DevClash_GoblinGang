# 🔐 Security Model

## 1. Design Principle: Non-Custodial by Default

**The platform NEVER has access to user private keys.**

All transaction signing happens client-side in the user's wallet (MetaMask, WalletConnect). The backend only ever constructs *unsigned* transactions and presents them for signing.

```
┌──────────────┐     unsigned tx      ┌──────────────┐
│   Backend    │ ────────────────────▶ │   Frontend   │
│  (prepares)  │                      │  (displays)  │
└──────────────┘                      └──────┬───────┘
                                             │
                                      User reviews
                                      & signs in wallet
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │   Wallet     │
                                      │  (MetaMask)  │
                                      └──────┬───────┘
                                             │
                                      signed tx sent
                                      back to backend
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │  Blockchain  │
                                      └──────────────┘
```

---

## 2. Authentication — SIWE (Sign-In with Ethereum)

### Flow
1. Frontend requests a nonce from backend
2. User signs a structured message containing the nonce
3. Backend verifies the signature against the claimed wallet address
4. Backend issues a JWT (short-lived, 1h expiry) + refresh token (7d)

### Why SIWE?
- No passwords, no email — wallet IS the identity
- Cryptographically verifiable
- Standard (EIP-4361)

### JWT Payload
```json
{
  "wallet": "0x1234...abcd",
  "chainId": 11155111,
  "iat": 1713440000,
  "exp": 1713443600,
  "scope": "user"
}
```

---

## 3. Authorization — Ownership-Based Access Control

Every API request that targets a specific agent validates:

```javascript
// Middleware: verifyOwnership
const agent = await Agent.findById(req.params.id);

if (agent.userWallet !== req.user.wallet) {
  return res.status(403).json({ error: "Not your agent" });
}
```

### Rules
| Action | Authorization |
|--------|--------------|
| Create agent | Authenticated wallet |
| View agent | Owner wallet only |
| Modify agent | Owner wallet only |
| Pause/Resume | Owner wallet only |
| Delete agent | Owner wallet only |
| View logs | Owner wallet only |

---

## 4. Permission System — Agent-Level Constraints

Every agent has a `permissions` object that constrains what it can do:

```json
{
  "permissions": {
    "maxSpendPerTx": 50,
    "maxTotalSpend": 500,
    "totalSpent": 0,
    "allowedActions": ["swap", "transfer"],
    "allowedTokens": ["0xETH_ADDRESS", "0xUSDC_ADDRESS"],
    "expiresAt": "2026-05-01T00:00:00Z"
  }
}
```

### Enforcement Points

| Check | When | What Happens on Violation |
|-------|------|--------------------------|
| `maxSpendPerTx` | Before tx preparation | Tx rejected, logged, agent continues |
| `maxTotalSpend` | Before tx preparation | Agent paused, user notified |
| `allowedActions` | Before action dispatch | Action rejected, logged |
| `allowedTokens` | Before tx preparation | Tx rejected, logged |
| `expiresAt` | During evaluation cycle | Agent auto-paused |

---

## 5. Transaction Security

### 5.1 Transaction Simulation
Before submitting any transaction, the system:
1. Simulates the transaction using `eth_call`
2. Checks for revert conditions
3. Estimates gas and validates affordability
4. Only proceeds if simulation succeeds

### 5.2 Slippage Protection
For swap transactions:
- Default max slippage: 1%
- User-configurable per agent
- Transaction reverts on-chain if slippage exceeds limit

### 5.3 Gas Guards
- Transactions are rejected if gas price exceeds a configurable threshold
- Prevents execution during gas spikes that would be uneconomical

---

## 6. Signing Strategies

### Strategy A: Approval Queue (MVP)
- Backend prepares unsigned tx
- Frontend polls for pending transactions
- User manually approves and signs each transaction
- **Pro:** Maximum security — every tx is user-approved
- **Con:** Not truly autonomous — requires user presence

### Strategy B: Pre-Signed Permits (Future)
- User signs EIP-2612 permits granting the agent contract limited spending
- Agent can execute within permit bounds without per-tx approval
- **Pro:** True autonomy within bounds
- **Con:** More complex, requires smart contract

### Strategy C: Session Keys (Future)
- Ephemeral keys with scoped permissions and time limits
- Inspired by ERC-4337 session key modules
- **Pro:** Best UX, true autonomy
- **Con:** Requires account abstraction infrastructure

---

## 7. Threat Model

| Threat | Mitigation |
|--------|-----------|
| **Server compromise** | No private keys on server; worst case = unauthorized agent creation (no funds at risk) |
| **Database leak** | Agent configs contain no secrets; wallet addresses are public anyway |
| **Malicious intent injection** | LLM output is validated against strict JSON schema; unrecognized actions are rejected |
| **Unauthorized agent modification** | Ownership-based access control on all endpoints |
| **Excessive spending** | Per-tx and total spend caps enforced before every execution |
| **Replay attacks** | SIWE nonces are single-use; JWTs have short expiry |
| **Front-running** | DEX swaps use slippage protection; private mempools as future enhancement |
| **AI hallucination** | Parsed intent is always shown to user for review before deployment |

---

## 8. Audit Logging

Every security-relevant event is logged immutably:

```json
{
  "timestamp": "2026-04-18T12:00:00Z",
  "event": "AGENT_EXECUTION",
  "agentId": "abc-123",
  "wallet": "0x1234...abcd",
  "details": {
    "trigger": "price_threshold",
    "conditionMet": true,
    "action": "swap",
    "txHash": "0xdef...789",
    "gasUsed": 150000,
    "valueUSD": 45.20,
    "status": "success"
  }
}
```

### Log Retention
- Execution logs: 90 days (MVP)
- Auth logs: 30 days
- Error logs: 180 days
