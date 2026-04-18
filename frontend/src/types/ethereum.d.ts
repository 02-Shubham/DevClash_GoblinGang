/**
 * types/ethereum.d.ts
 * --------------------
 * Global TypeScript declarations for window.ethereum (MetaMask / EIP-1193).
 */

interface EthereumProvider {
  isMetaMask?: boolean;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener(event: string, handler: (...args: unknown[]) => void): void;
  selectedAddress?: string;
  chainId?: string;
}

interface Window {
  ethereum?: EthereumProvider;
}
