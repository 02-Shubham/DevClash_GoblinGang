# 🎯 Context — Problem, Objectives & Scope

## 1. Problem Statement

With the emergence of AI-driven systems and decentralized applications, autonomous agents are increasingly expected to perform onchain actions — trading, governance participation, asset management, and portfolio rebalancing. However, today's landscape has critical gaps:

| Gap | Impact |
|-----|--------|
| **No standardized infrastructure** | Every project reinvents agent deployment from scratch |
| **Lack of reliability** | Agents fail silently; no retry, no fallback |
| **Zero transparency** | Users can't see *why* an agent did something |
| **No control mechanisms** | Once deployed, agents are fire-and-forget — no pause, no override |
| **Security risks** | Custodial key management, unbounded permissions, no spend limits |

These problems make autonomous onchain execution **risky, opaque, and inefficient**.

---

## 2. Objective

Build a **robust, modular infrastructure** that enables:

1. **Deployment** of autonomous onchain agents (bots)
2. **Definition of intents** — users describe goals in natural language (e.g., *"buy ETH if price drops 5%"*)
3. **Autonomous execution** — agents independently evaluate conditions and act
4. **Monitoring & control** — pause, modify, override, and delete agents at any time
5. **Secure execution** — non-custodial, permissioned, with spend limits
6. **Explainability** — every decision is logged with reasoning

---

## 3. Core Requirements

### Functional
- Deploy autonomous onchain agents from a web dashboard
- Allow users to define intents via natural language or structured forms
- Agents evaluate trigger conditions (price, time, balance) and execute actions
- Full control layer: pause / resume / modify / delete / override
- Transaction logs with explainability (why the agent acted)

### Non-Functional
- **EVM-compatible** — must work on Ethereum, Polygon, Arbitrum, Base, etc.
- **Non-custodial** — the platform never holds user private keys
- **Scalable** — support many agents per user, many users concurrently
- **Secure** — minimize unauthorized actions via permissioning and spend caps
- **Responsive** — sub-second UI feedback; agent evaluation cycles ≤ 30s

---

## 4. Constraints

| Constraint | Rationale |
|-----------|-----------|
| EVM-only (MVP) | Standardized tooling (ethers.js, Solidity), largest DeFi ecosystem |
| Non-custodial | Regulatory safety + user trust; all tx signing happens in user's wallet |
| No private key storage | Platform never sees private keys — wallet-connect + signing only |
| Testnet-first | MVP deployed on Sepolia; mainnet after audit |
| Rate-limited AI | LLM calls are expensive; intent parsing is a one-time operation per agent |

---

## 5. Target Users

| Persona | Description |
|---------|-------------|
| **DeFi Trader** | Wants automated buy/sell based on price conditions |
| **DAO Participant** | Wants automated governance voting based on proposal criteria |
| **Portfolio Manager** | Wants periodic rebalancing of token allocations |
| **Yield Farmer** | Wants automated compounding and position management |

---

## 6. Success Criteria (MVP)

- [ ] User can connect wallet, create an agent via natural language, and see it on dashboard
- [ ] Agent correctly evaluates a price-based trigger on Sepolia testnet
- [ ] User can pause, resume, and delete an agent
- [ ] Every execution produces a log entry explaining what happened and why
- [ ] No private keys are ever stored server-side

---

## 7. Out of Scope (MVP)

- Multi-chain support (only Sepolia in MVP)
- Account abstraction (ERC-4337)
- Agent-to-agent coordination
- On-chain agent identity (NFT-based)
- Mobile app
- Mainnet deployment
