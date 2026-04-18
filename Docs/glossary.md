# 📖 Glossary

Domain-specific terms used throughout this project's documentation and codebase.

---

## Blockchain & Web3

| Term | Definition |
|------|-----------|
| **EVM** | Ethereum Virtual Machine — the runtime that executes smart contracts on Ethereum and compatible chains (Polygon, Arbitrum, Base, etc.) |
| **Onchain** | Actions or data that exist on a blockchain (as opposed to off-chain, which exists on traditional servers) |
| **Wallet** | A cryptographic key pair (public + private) used to sign transactions and prove identity. Common wallets: MetaMask, WalletConnect |
| **Transaction (Tx)** | A signed instruction sent to the blockchain to transfer value or execute a smart contract function |
| **Gas** | The unit of computation on EVM chains. Every transaction costs gas, paid in the native token (ETH) |
| **Gas Price** | The price per unit of gas, denominated in Gwei (1 Gwei = 10⁻⁹ ETH). Higher gas price = faster confirmation |
| **Nonce** | A sequential counter for each address, used to order transactions and prevent replay attacks |
| **Smart Contract** | Self-executing code deployed on the blockchain that runs when called by a transaction |
| **DEX** | Decentralized Exchange — a protocol for swapping tokens without a central intermediary (e.g., Uniswap, SushiSwap) |
| **Slippage** | The difference between expected price and actual execution price during a swap |
| **Sepolia** | Ethereum's primary test network, used for development and testing with free test ETH |
| **RPC** | Remote Procedure Call — the protocol used to communicate with blockchain nodes (e.g., via Infura, Alchemy) |
| **ERC-20** | A token standard on EVM chains that defines how fungible tokens behave |
| **EIP-4361 (SIWE)** | Sign-In with Ethereum — a standard for using wallet signatures for web authentication |
| **EIP-2612** | Permit — allows ERC-20 token approvals via signatures instead of transactions |
| **ERC-4337** | Account Abstraction — a standard for smart contract wallets with advanced features (session keys, social recovery) |
| **Chainlink** | A decentralized oracle network that provides reliable price feeds and off-chain data to smart contracts |

---

## Project-Specific

| Term | Definition |
|------|-----------|
| **ChainPilot** | Working name for this project — the autonomous onchain agent infrastructure |
| **Agent / Bot** | An autonomous execution unit deployed by a user. Monitors conditions and executes onchain actions |
| **Intent** | A user-defined goal, typically expressed in natural language. Example: "Buy ETH if price drops 5%" |
| **Parsed Intent** | The structured JSON output after processing an intent through the AI layer |
| **Trigger** | The condition that must be met for an agent to execute its action |
| **Trigger Type** | The category of condition: `price_threshold`, `time_based`, `balance_threshold` |
| **Action** | What the agent does when its trigger condition is met: `buy`, `sell`, `transfer`, `swap` |
| **Execution Cycle** | One iteration of the execution engine's polling loop — evaluates all active agents |
| **Cycle ID** | A unique identifier for a single execution cycle, used to group log entries |
| **Approval Queue** | A list of unsigned transactions waiting for the user to review and sign |
| **Spend Cap** | Maximum amount (in USD) that an agent is allowed to spend per transaction or in total |
| **Explainability** | The practice of logging human-readable reasons for every agent decision |

---

## Architecture

| Term | Definition |
|------|-----------|
| **Intent Engine** | The AI-powered module that converts natural language to structured agent configurations |
| **Agent Manager** | The CRUD service responsible for creating, reading, updating, and deleting agents |
| **Execution Engine** | The background worker that continuously evaluates agent conditions and triggers actions |
| **Web3 Service** | The abstraction layer that handles all blockchain interactions (price feeds, tx building, etc.) |
| **Monitoring Service** | The real-time notification layer that pushes status updates to connected frontends |
| **Non-Custodial** | Architecture where the platform never holds or has access to user private keys |
| **SIWE** | Sign-In with Ethereum — wallet-based authentication without passwords |
| **JWT** | JSON Web Token — a signed token used for stateless API authentication |

---

## Status Values

| Status | Meaning |
|--------|---------|
| `created` | Agent config saved but not yet deployed |
| `active` | Agent is live and being evaluated by the execution engine |
| `paused` | Agent is temporarily suspended by the user |
| `executing` | Agent's condition was met and a transaction is in progress |
| `done` | Execution completed successfully |
| `failed` | Execution failed (transaction reverted or error occurred) |
| `deleted` | Agent has been soft-deleted by the user |
