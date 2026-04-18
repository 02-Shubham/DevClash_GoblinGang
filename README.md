# ⚡ ChainPilot — Autonomous Onchain Agent Infrastructure

> Deploy, manage, and control autonomous onchain agents using natural language intents.

## 🎯 What is this?

ChainPilot is a modular infrastructure platform that lets users:
- **Define intents** in natural language (e.g., *"Buy ETH if price drops 5%"*)
- **Deploy autonomous agents** that monitor conditions and execute onchain actions
- **Retain full control** — pause, modify, override, or delete agents anytime
- **See explainable logs** — every decision is logged with reasoning

## 🏗️ Architecture

```text
Current [Implemented]:
Frontend (Next.js) ──▶ Nexus Orchestrator (LangChain AI) ──▶ Execution Engine ──▶ Blockchain
                          (Backend / Firebase)

Visionary [Planned]:
Frontend (React) → API Gateway (Express) → Intent Engine (AI)
                                        → Agent Manager (MongoDB)
                                        → Execution Engine (Worker)
                                        → Web3 Service (ethers.js)
                                        → Blockchain (EVM / Sepolia)
```

## 📚 Documentation

All detailed documentation lives in the [`Docs/`](./Docs/INDEX.md) folder:

| Document | What it covers |
|----------|---------------|
| [Context](./Docs/context.md) | Problem, objectives, constraints, scope |
| [Architecture](./Docs/architecture.md) | System design, data flow, deployment |
| [Modules](./Docs/modules.md) | Detailed spec for every component |
| [Agent Lifecycle](./Docs/agent-lifecycle.md) | State machine, transitions, retry policy |
| [Security](./Docs/security.md) | Non-custodial design, auth, permissions, threat model |
| [Data Models](./Docs/data-models.md) | MongoDB schemas, TypeScript types |
| [API Reference](./Docs/api-reference.md) | REST endpoints, WebSocket events |
| [Tech Stack](./Docs/tech-stack.md) | Dependencies, env vars, project structure |
| [MVP Scope](./Docs/mvp-scope.md) | Feature matrix, delivery phases, demo script |
| [Glossary](./Docs/glossary.md) | Domain terminology |

## 🧱 Tech Stack

| Layer | **Current [Implemented]** | Visionary [Planned/Alternative] |
|-------|--------------------------|-------------------------------|
| **Frontend** | Next.js 16 + Tailwind v4 | React + Vite + Tailwind v3 |
| **Backend** | Node.js + Firebase Admin | Node.js + Express |
| **Auth** | Firebase Auth (Oauth) | SIWE (Sign-In with Ethereum) |
| **Database** | Firebase Firestore | MongoDB Atlas |
| **AI** | LangChain + Gemini 1.5 Flash | Google Gemini API (Direct) |
| **Network** | Sepolia Testnet | L2 Support (Base, Arbitrum) |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/your-org/DevClash_GoblinGang.git
cd DevClash_GoblinGang

# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## 👥 Team GoblinGang

Built for DevClash hackathon.

## 📄 License

MIT
