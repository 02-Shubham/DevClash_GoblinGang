# 🧱 Tech Stack

## Overview

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Next.js 16 (App Router) | SEO-friendly, fast SSR, industry standard |
| Styling | Tailwind CSS v4 | Rapid UI development, modernized utility-first styling |
| Wallet | wagmi + viem | Type-safe Ethereum interactions |
| Auth | Firebase Auth (Implemented) / ~~SIWE (Planned)~~ | Multi-method login + Cryptographic identity |
| Backend | Node.js 20 + Express | Lightweight, excellent async handling |
| Database | Firebase Firestore (Implemented) / ~~MongoDB (Alternative)~~ | Real-time document store |
| AI Core | LangChain.js + Gemini 1.5 Flash | Natural language → structured intent parsing |
| Blockchain | ethers.js v6 | EVM interaction library |
| Real-time | Firebase / ~~Socket.io~~ | Real-time updates and WebSocket support |
| Validation | Zod | TypeScript-first schema validation |
| Testing | Jest + Supertest | Unit + integration testing |

---

## Frontend Dependencies

```json
{
  "dependencies": {
    "next": "16.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "firebase": "^12.x",
    "@tanstack/react-query": "^5.x",
    "wagmi": "^2.x",
    "viem": "^2.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "tailwindcss": "^4.x",
    "typescript": "^5.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

---

## Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.x",
    "firebase-admin": "^12.x",
    "langchain": "^0.3.x",
    "@langchain/google-genai": "^0.1.x",
    "ethers": "^6.x",
    "zod": "^3.x",
    "dotenv": "^16.x",
    "cors": "^2.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "typescript": "^4.x"
  }
}
```

---

## External Services

| Service | Purpose | Tier |
|---------|---------|------|
| **Firebase** | Auth & Firestore Database | Free (Spark) |
| ~~**MongoDB Atlas**~~ | ~~Alternative/Legacy DB~~ | ~~Free (M0)~~ |
| **Infura / Alchemy** | Ethereum RPC node provider | Free tier |
| **Google Gemini API** | AI Orchestrator (Nexus) | Free/Pay-as-you-go |
| **CoinGecko API** | Price feeds | Free tier |
| **Chainlink** | On-chain oracles | Free (read-only) |
| **Vercel** | Frontend hosting | Free tier |
| **Railway / Render** | Backend hosting | Starter tier |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **Postman / Thunder Client** | API testing |
| ~~**MongoDB Compass**~~ | ~~Database GUI~~ |
| **Hardhat** | Smart contract dev (future) |
| **Git + GitHub** | Version control |
| **ESLint + Prettier** | Code quality |
| **Husky** | Git hooks (pre-commit lint) |

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI (LangChain / Gemini)
GOOGLE_GENAI_API_KEY=your-gemini-key

# Blockchain
INFURA_PROJECT_ID=your-infura-id
ALCHEMY_API_KEY=your-alchemy-key

# App Config
EXECUTION_INTERVAL_MS=30000
DEFAULT_CHAIN_ID=11155111
```

---

## Project Structure

```
DevClash_GoblinGang/
├── Docs/                       # Documentation (this folder)
│   ├── INDEX.md
│   ├── context.md
│   ├── architecture.md
│   ├── modules.md
│   ├── agent-lifecycle.md
│   ├── security.md
│   ├── data-models.md
│   ├── api-reference.md
│   ├── tech-stack.md           # (this file)
│   ├── mvp-scope.md
│   └── glossary.md
│
├── frontend/                   # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client functions
│   │   ├── context/            # React context providers
│   │   ├── utils/              # Helper functions
│   │   ├── types/              # TypeScript type definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                    # Node.js + Express application
│   ├── src/
│   │   ├── routes/             # Express route handlers
│   │   ├── controllers/        # Business logic controllers
│   │   ├── models/             # Mongoose schemas
│   │   ├── services/           # Core service modules
│   │   │   ├── intentService.ts
│   │   │   ├── agentManager.ts
│   │   │   ├── executionEngine.ts
│   │   │   ├── web3Service.ts
│   │   │   └── monitoringService.ts
│   │   ├── middleware/         # Auth, validation, rate limiting
│   │   ├── utils/              # Helpers, logger, constants
│   │   ├── types/              # Shared TypeScript types
│   │   ├── config/             # Environment config
│   │   └── server.ts           # Entry point
│   ├── tests/                  # Jest test files
│   └── package.json
│
├── .env.example                # Template for environment variables
├── .gitignore
└── README.md
```
