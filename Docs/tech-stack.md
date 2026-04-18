# 🧱 Tech Stack

## Overview

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | React 18 + Vite | Fast dev server, modern bundler, industry standard |
| Styling | Tailwind CSS v3 | Rapid UI development, utility-first, responsive |
| Wallet | wagmi + viem | Type-safe Ethereum interactions, WalletConnect support |
| Auth | SIWE (EIP-4361) | Wallet-based auth, no passwords, cryptographic |
| Backend | Node.js 20 + Express | Lightweight, excellent async handling, npm ecosystem |
| Database | MongoDB + Mongoose | Flexible schemas, great for evolving agent configs |
| AI | Google Gemini API / OpenAI GPT-4 | Natural language → structured intent parsing |
| Blockchain | ethers.js v6 | Most popular EVM library, excellent TypeScript support |
| Real-time | Socket.io | WebSocket abstraction with fallback, rooms support |
| Validation | Zod | TypeScript-first schema validation for API + AI output |
| Testing | Jest + Supertest | Unit + integration testing |

---

## Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "wagmi": "^2.x",
    "viem": "^2.x",
    "@walletconnect/web3-provider": "^2.x",
    "socket.io-client": "^4.x",
    "lucide-react": "^0.x",
    "date-fns": "^3.x",
    "sonner": "^1.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "@types/react": "^18.x",
    "typescript": "^5.x"
  }
}
```

---

## Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "mongoose": "^8.x",
    "jsonwebtoken": "^9.x",
    "siwe": "^2.x",
    "ethers": "^6.x",
    "socket.io": "^4.x",
    "zod": "^3.x",
    "node-cron": "^3.x",
    "dotenv": "^16.x",
    "cors": "^2.x",
    "helmet": "^7.x",
    "express-rate-limit": "^7.x",
    "winston": "^3.x",
    "uuid": "^9.x"
  },
  "devDependencies": {
    "jest": "^29.x",
    "supertest": "^6.x",
    "@types/express": "^4.x",
    "typescript": "^5.x",
    "tsx": "^4.x",
    "nodemon": "^3.x"
  }
}
```

---

## External Services

| Service | Purpose | Tier |
|---------|---------|------|
| **MongoDB Atlas** | Database hosting | Free (M0) for MVP |
| **Infura / Alchemy** | Ethereum RPC node provider | Free tier (100k requests/day) |
| **Google Gemini API** | Intent parsing (NLP → JSON) | Free tier / Pay-per-call |
| **CoinGecko API** | Price feeds (fallback) | Free tier (30 calls/min) |
| **Chainlink** | On-chain price oracles | Free (read-only) |
| **Vercel** | Frontend hosting | Free tier |
| **Railway / Render** | Backend hosting | Free/Starter tier |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary IDE |
| **Postman / Thunder Client** | API testing |
| **MongoDB Compass** | Database GUI |
| **Hardhat** | Smart contract dev (future) |
| **Git + GitHub** | Version control |
| **ESLint + Prettier** | Code quality |
| **Husky** | Git hooks (pre-commit lint) |

---

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# AI
GEMINI_API_KEY=your-gemini-key
# or
OPENAI_API_KEY=your-openai-key

# Blockchain
INFURA_PROJECT_ID=your-infura-id
# or
ALCHEMY_API_KEY=your-alchemy-key

# Chain
DEFAULT_CHAIN_ID=11155111
DEFAULT_NETWORK=sepolia

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AI_RATE_LIMIT_MAX=10
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
