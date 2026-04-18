# 📡 API Reference

Base URL: `http://localhost:5000` (Current) / `/api/v1` (Versioned)

All endpoints require authentication:
- **Immediate:** Firebase ID Token (`Authorization: Bearer <ID_TOKEN>`)
- **Planned/Legacy:** JWT (obtained through SIWE)

---

## Authentication

### `POST /auth/register` (Current)
Ensures the authenticated user exists in the Firestore `users` collection. Automatically called by frontend on successful Firebase login.

**Access:** Authenticated (Firebase)

**Response:** `200 OK`
```json
{
  "message": "User registered successfully",
  "user": { "uid": "...", "email": "..." }
}
```

---

## ~~Authentication (Legacy/Planned)~~

### ~~`POST /auth/nonce` (Alternative)~~
~~Get a nonce for SIWE message signing.~~

**~~Access:~~** ~~Public~~

**~~Request:~~**
```json
{
  "wallet": "0x1234...abcd"
}
```

**~~Response:~~**
```json
{
  "nonce": "a1b2c3d4e5f6"
}
```

---

### ~~`POST /auth/login`~~
~~Verify SIWE signature and obtain JWT.~~

**~~Access:~~** ~~Public~~

**~~Request:~~**
```json
{
  "message": "chainpilot.xyz wants you to sign in...",
  "signature": "0xsig..."
}
```

**~~Response:~~**
```json
{
  "token": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "wallet": "0x1234...abcd",
  "expiresIn": 3600
}
```

---

### ~~`POST /auth/refresh`~~
~~Refresh an expired JWT.~~

**~~Access:~~** ~~Public (requires valid refresh token)~~

**~~Request:~~**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**~~Response:~~**
```json
{
  "token": "eyJhbG...(new)",
  "expiresIn": 3600
}
```

---

## Agents

### `POST /agents`
Create a new agent from natural language intent.

**Request:**
```json
{
  "rawIntent": "Buy 0.5 ETH if the price drops below $2000",
  "name": "ETH Dip Buyer",
  "mode": "recurring",
  "maxExecutions": 5,
  "permissions": {
    "maxSpendPerTx": 50,
    "maxTotalSpend": 250,
    "allowedActions": ["buy", "swap"]
  },
  "chainId": 11155111
}
```

**Response:** `201 Created`
```json
{
  "agentId": "uuid-1234",
  "name": "ETH Dip Buyer",
  "status": "created",
  "parsedConfig": {
    "triggerType": "price_threshold",
    "condition": "lt",
    "asset": "ETH",
    "threshold": 2000,
    "action": "buy",
    "amount": 0.5,
    "currency": "USD"
  },
  "explanation": "This agent will buy 0.5 ETH whenever ETH/USD drops below $2000, up to 5 times.",
  "createdAt": "2026-04-18T12:00:00Z"
}
```

**Errors:**
| Code | Description |
|------|------------|
| 400 | Intent could not be parsed — clarifications needed |
| 422 | Invalid permissions or config |

---

### `GET /agents`
List all agents for the authenticated wallet.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | all | Filter by status |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `sort` | string | `-createdAt` | Sort field (prefix `-` for descending) |

**Response:** `200 OK`
```json
{
  "agents": [
    {
      "agentId": "uuid-1234",
      "name": "ETH Dip Buyer",
      "status": "active",
      "executionCount": 2,
      "lastExecutedAt": "2026-04-18T11:30:00Z",
      "createdAt": "2026-04-17T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### `GET /agents/:id`
Get full details of a single agent.

**Response:** `200 OK`
```json
{
  "agentId": "uuid-1234",
  "name": "ETH Dip Buyer",
  "rawIntent": "Buy 0.5 ETH if the price drops below $2000",
  "parsedConfig": { "..." },
  "mode": "recurring",
  "maxExecutions": 5,
  "executionCount": 2,
  "permissions": { "..." },
  "status": "active",
  "chainId": 11155111,
  "createdAt": "2026-04-17T09:00:00Z",
  "updatedAt": "2026-04-18T11:30:00Z",
  "lastCheckedAt": "2026-04-18T12:00:00Z",
  "lastExecutedAt": "2026-04-18T11:30:00Z"
}
```

---

### `PATCH /agents/:id`
Update an agent's configuration or permissions.

**Request:**
```json
{
  "name": "Updated Name",
  "permissions": {
    "maxSpendPerTx": 100
  },
  "parsedConfig": {
    "threshold": 1800
  }
}
```

**Response:** `200 OK` — Updated agent object

**Rules:**
- Cannot modify agent while in `executing` status
- Modifying `parsedConfig` resets the AI explanation

---

### `POST /agents/:id/deploy`
Deploy a `created` agent (transition to `active`).

**Response:** `200 OK`
```json
{
  "agentId": "uuid-1234",
  "status": "active",
  "message": "Agent deployed and monitoring started."
}
```

---

### `POST /agents/:id/toggle`
Toggle agent between `active` and `paused`.

**Response:** `200 OK`
```json
{
  "agentId": "uuid-1234",
  "status": "paused",
  "message": "Agent paused."
}
```

---

### `DELETE /agents/:id`
Soft-delete an agent.

**Response:** `200 OK`
```json
{
  "agentId": "uuid-1234",
  "status": "deleted",
  "message": "Agent deleted."
}
```

---

## Execution Logs

### `GET /agents/:id/logs`
Get execution logs for a specific agent.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Items per page |
| `executed` | boolean | all | Filter: only executed |

**Response:** `200 OK`
```json
{
  "logs": [
    {
      "logId": "log-uuid",
      "evaluatedAt": "2026-04-18T12:00:00Z",
      "conditionChecked": "ETH/USD < 2000",
      "conditionResult": true,
      "currentValue": 1985.50,
      "executed": true,
      "action": "buy",
      "txHash": "0xabc...def",
      "explanation": "ETH price ($1985.50) dropped below threshold ($2000). Executed buy order for 0.5 ETH.",
      "txStatus": "confirmed"
    }
  ],
  "pagination": { "..." }
}
```

---

### `GET /logs`
Get all execution logs for the authenticated wallet (cross-agent).

Same query parameters and response shape as agent-specific logs.

---

## Transactions

### `GET /transactions/pending`
Get pending transactions awaiting user signature.

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "txId": "tx-uuid",
      "agentId": "uuid-1234",
      "action": "swap",
      "description": "Swap 0.5 ETH → USDC on Uniswap",
      "estimatedValueUSD": 985.25,
      "unsignedTx": {
        "to": "0x...",
        "data": "0x...",
        "value": "0x...",
        "gasLimit": "0x..."
      },
      "expiresAt": "2026-04-18T12:10:00Z"
    }
  ]
}
```

---

### `POST /transactions/:txId/submit`
Submit a signed transaction.

**Request:**
```json
{
  "signedTx": "0x..."
}
```

**Response:** `200 OK`
```json
{
  "txId": "tx-uuid",
  "txHash": "0xabc...def",
  "status": "submitted"
}
```

---

## ~~WebSocket Events (Legacy/Planned)~~

~~Connect: `ws://host/ws?token=JWT`~~

### ~~Server → Client Events~~

| ~~Event~~ | ~~Payload~~ |
|-------|---------|
| ~~`agent_status`~~ | ~~`{ agentId, status, timestamp }`~~ |
| ~~`execution_complete`~~ | ~~`{ agentId, logId, txHash, success, explanation }`~~ |
| ~~`execution_failed`~~ | ~~`{ agentId, logId, error, errorCode }`~~ |
| ~~`tx_pending`~~ | ~~`{ txId, agentId, description, expiresAt }`~~ |
| ~~`tx_confirmed`~~ | ~~`{ txId, txHash, status }`~~ |

---

## Error Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "Agent with ID uuid-1234 not found.",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Not the agent owner |
| `AGENT_NOT_FOUND` | 404 | Agent doesn't exist |
| `INTENT_PARSE_FAILED` | 400 | AI couldn't parse intent |
| `INVALID_TRANSITION` | 409 | Invalid status transition |
| `PERMISSION_EXCEEDED` | 422 | Action exceeds permission limits |
| `RATE_LIMITED` | 429 | Too many requests |
