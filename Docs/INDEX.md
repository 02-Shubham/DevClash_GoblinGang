# 📚 Documentation Index — ChainPilot

> **Intent-Based Autonomous Onchain Agent Infrastructure**

This folder contains all project documentation, organized by concern. Start here to navigate.

---

## 📁 Directory Structure (Current)

```text
DevClash_GoblinGang/
├── Docs/                       # 📚 System Documentation
│   ├── INDEX.md                # 📍 Navigation Hub
│   ├── ...                     # Specialized documents
│
├── frontend/                   # 💻 Next.js 16 Application (App Router)
│   ├── src/
│   │   ├── app/                # Page routes and layouts
│   │   ├── components/         # UI Elements
│   │   ├── context/            # Global State (Auth, UI)
│   │   └── lib/                # Firebase & Web3 Client
│
├── backend/                    # 🚀 Express.js API & Services
│   ├── src/
│   │   ├── routes/             # API Endpoints
│   │   ├── controllers/        # Request Handlers
│   │   └── services/           # Core Logic (Nexus, Execution)
│   ├── workers/                # Background Execution Workers
│   └── server.js               # Main Entry Point
│
└── README.md                   # 🏁 High-level overview
```

---

## 📁 Document Map

| File | Purpose |
|------|---------|
| [context.md](./context.md) | Problem statement, objectives, constraints, and project scope |
| [architecture.md](./architecture.md) | System architecture, data flow, and module breakdown |
| [modules.md](./modules.md) | Detailed specification of each core module and its API surface |
| [agent-lifecycle.md](./agent-lifecycle.md) | Agent states, transitions, and lifecycle management |
| [security.md](./security.md) | Security model, permissioning, non-custodial design |
| [data-models.md](./data-models.md) | Database schemas, data structures, and type definitions |
| [api-reference.md](./api-reference.md) | REST API endpoints, request/response contracts |
| [tech-stack.md](./tech-stack.md) | Technology choices, justifications, and dependency list |
| [mvp-scope.md](./mvp-scope.md) | MVP feature set, phased delivery, and success criteria |
| [glossary.md](./glossary.md) | Domain-specific terminology and definitions |

---

## 🧭 Reading Order (Recommended)

1. **context.md** — Understand *why* we're building this
2. **architecture.md** — Understand *how* the system is shaped
3. **modules.md** — Understand *what* each piece does
4. **agent-lifecycle.md** — Understand *how agents behave*
5. **security.md** — Understand *how we keep it safe*
6. **data-models.md** + **api-reference.md** — Implementation contracts
7. **tech-stack.md** + **mvp-scope.md** — Execution specifics

---

## 🏷️ Naming Convention

- **ChainPilot** — Working project name
- **Agent / Bot** — An autonomous execution unit deployed by a user
- **Intent** — A user-defined goal expressed in natural language or structured form
