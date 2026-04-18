# 🎯 MVP Scope & Delivery Plan

## 1. MVP Definition

The Minimum Viable Product demonstrates the **complete flow** from intent to execution:

> User connects wallet → defines intent → agent is created → agent monitors conditions → condition met → transaction prepared → user signs → transaction executed → logs displayed

---

## 2. MVP Feature Matrix

### ✅ In Scope

| Feature | Priority | Complexity |
|---------|----------|-----------|
| Wallet connection (MetaMask) | P0 | Low |
| SIWE authentication | P0 | Medium |
| Natural language intent input | P0 | Medium |
| AI intent parsing (Gemini) | P0 | Medium |
| Parsed intent review + confirmation | P0 | Low |
| Agent CRUD (create, read, update, delete) | P0 | Medium |
| Agent dashboard (list + status) | P0 | Medium |
| Pause / Resume / Delete controls | P0 | Low |
| Execution engine (polling loop) | P0 | High |
| Price-based trigger evaluation | P0 | Medium |
| Time-based trigger evaluation | P1 | Low |
| Transaction preparation (swap) | P0 | High |
| Approval queue (pending tx → sign) | P0 | High |
| Execution logging | P0 | Medium |
| Explainability per execution | P0 | Medium |
| Agent detail view with logs | P1 | Medium |
| Real-time status via WebSocket | P1 | Medium |
| Permission enforcement (spend caps) | P1 | Medium |

### ❌ Out of Scope (MVP)

| Feature | Reason |
|---------|--------|
| Multi-chain | Simplify to Sepolia only |
| Account abstraction (ERC-4337) | Complex; post-MVP |
| Pre-signed permits | Requires smart contract work |
| Agent-to-agent coordination | Advanced feature |
| On-chain agent identity (NFT) | Nice-to-have |
| Mobile app | Web-first |
| Mainnet deployment | Safety; testnet first |
| Balance-based triggers | Lower priority for MVP |

---

## 3. Supported Agent Types (MVP)

### Type 1: Price-Triggered Buy/Sell
- **Trigger:** Asset price crosses threshold
- **Action:** Buy or sell token
- **Example:** "Buy 0.5 ETH if price drops below $2000"

### Type 2: Time-Based Transfer
- **Trigger:** Specific time or interval
- **Action:** Transfer tokens to address
- **Example:** "Send 10 USDC to 0xABC every Monday"

### Type 3: Simple Token Swap
- **Trigger:** Price threshold
- **Action:** Swap token A → token B via DEX
- **Example:** "Swap all USDC to ETH when ETH < $1500"

---

## 4. Delivery Phases

### Phase 1 — Foundation (Days 1-2)
- [ ] Project scaffolding (Vite + Express + MongoDB)
- [ ] Environment setup (.env, config, linting)
- [ ] MongoDB Atlas provisioning
- [ ] Basic Express server with health endpoint
- [ ] Mongoose models (User, Agent, ExecutionLog)
- [ ] SIWE authentication flow

### Phase 2 — Intent & Agents (Days 3-4)
- [ ] Intent Engine — Gemini API integration
- [ ] System prompt engineering for reliable JSON output
- [ ] Zod schema validation for parsed intents
- [ ] Agent CRUD API endpoints
- [ ] Agent status transitions (state machine)
- [ ] Frontend: Wallet connect + landing page

### Phase 3 — Dashboard & Control (Days 4-5)
- [ ] Frontend: Agent builder page (intent input + review)
- [ ] Frontend: Dashboard (agent list with status)
- [ ] Frontend: Agent detail page (config + logs)
- [ ] Frontend: Control panel (pause/resume/delete)
- [ ] API: Toggle, update, delete endpoints
- [ ] WebSocket setup for real-time updates

### Phase 4 — Execution Engine (Days 5-7)
- [ ] Web3 Service — ethers.js setup with Sepolia
- [ ] Price feed integration (CoinGecko / Chainlink)
- [ ] Execution engine polling loop
- [ ] Trigger condition evaluators
- [ ] Transaction preparation (swap via Uniswap router)
- [ ] Approval queue (pending transactions)
- [ ] Transaction signing flow (frontend)
- [ ] Execution logging with explainability

### Phase 5 — Polish & Demo (Days 7-8)
- [ ] UI polish — animations, loading states, error handling
- [ ] Permission enforcement
- [ ] End-to-end testing on Sepolia
- [ ] README update
- [ ] Demo recording

---

## 5. Success Criteria

| Criterion | Metric |
|-----------|--------|
| Intent parsing works | ≥ 80% of test sentences correctly parsed |
| Agent lifecycle works | All 7 states reachable, transitions enforced |
| Execution works | At least 1 successful swap on Sepolia |
| Control works | Pause/resume correctly stops/starts evaluation |
| Logs work | Every evaluation cycle produces a log entry |
| Explainability works | Logs contain human-readable explanation |
| Non-custodial | Zero private keys stored anywhere on server |
| UI is functional | All pages load, all controls work |

---

## 6. Demo Script (2 minutes)

1. **Connect wallet** — MetaMask on Sepolia (10s)
2. **Create agent** — Type: "Buy 0.1 ETH when price drops below $2500" (15s)
3. **Review parsed intent** — Show AI output, confirm (10s)
4. **Deploy agent** — Show it appear on dashboard as "Active" (5s)
5. **Show monitoring** — Agent checking conditions every 30s (15s)
6. **Trigger execution** — Manually adjust price threshold to trigger (10s)
7. **Sign transaction** — MetaMask popup, user approves (10s)
8. **View result** — Transaction on Etherscan, log with explanation (15s)
9. **Pause agent** — Toggle to paused, show it stops checking (5s)
10. **Show logs** — Scroll through execution history (10s)
11. **Closing slide** — Architecture overview + future scope (15s)
