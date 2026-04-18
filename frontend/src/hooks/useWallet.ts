/**
 * hooks/useWallet.ts
 * ------------------
 * Manages MetaMask wallet connection state.
 * Features:
 *  - Connect / disconnect
 *  - Auto-reconnect if the user already connected previously
 *  - Listen for account/chain switches
 *  - Enforce Sepolia testnet (chainId 11155111)
 *  - Expose address, balance, chainId, and a tx signer
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider, JsonRpcSigner } from "ethers";

export interface WalletState {
  address: string | null;
  balance: string | null;          // ETH balance formatted
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;       // true if on Sepolia
  error: string | null;
}

const TARGET_CHAIN_ID = 1337;
const TARGET_HEX = "0x539";

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    isCorrectNetwork: false,
    error: null,
  });

  // ----------------------------------------------------------------
  // Internal helpers
  // ----------------------------------------------------------------

  const getMetaMaskProvider = (): any => {
    if (typeof window === "undefined" || !window.ethereum) return null;
    
    // Handle EIP-1193 providers array (Multiple extensions)
    const ethAny = window.ethereum as any;
    if (ethAny.providers?.length) {
      const mm = ethAny.providers.find((p: any) => p.isMetaMask && !p.isPhantom);
      if (mm) return mm;
    }
    
    return window.ethereum;
  };

  const getProvider = (): BrowserProvider | null => {
    const provider = getMetaMaskProvider();
    if (!provider) return null;
    return new ethers.BrowserProvider(provider);
  };

  const refreshBalance = useCallback(async (address: string) => {
    const provider = getProvider();
    if (!provider) return;
    try {
      const balanceWei = await provider.getBalance(address);
      const formatted = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
      setState((prev) => ({ ...prev, balance: formatted }));
    } catch (_) {}
  }, []);

  const syncState = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;

    try {
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        setState((prev) => ({ ...prev, isConnected: false, address: null, balance: null }));
        return;
      }

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const address = accounts[0].address;
      const balanceWei = await provider.getBalance(address);
      const balance = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);

      setState({
        address,
        balance,
        chainId,
        isConnected: true,
        isConnecting: false,
        isCorrectNetwork: chainId === TARGET_CHAIN_ID,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, isConnecting: false }));
    }
  }, []);

  // ----------------------------------------------------------------
  // Auto-reconnect on mount (if user previously connected)
  // ----------------------------------------------------------------
  useEffect(() => {
    syncState();

    const extProvider = getMetaMaskProvider();
    if (!extProvider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState((prev) => ({
          ...prev,
          address: null,
          balance: null,
          isConnected: false,
        }));
      } else {
        syncState();
      }
    };

    const handleChainChanged = () => {
      // Reload is recommended by MetaMask on chain switch
      syncState();
    };

    extProvider.on("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
    extProvider.on("chainChanged", handleChainChanged);

    return () => {
      extProvider.removeListener("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
      extProvider.removeListener("chainChanged", handleChainChanged);
    };
  }, [syncState]);

  // ----------------------------------------------------------------
  // Public actions
  // ----------------------------------------------------------------

  const connect = useCallback(async () => {
    const extProvider = getMetaMaskProvider();
    if (!extProvider) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask not found. Please install it from metamask.io",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(extProvider);
      // Request accounts — triggers MetaMask popup
      await provider.send("eth_requestAccounts", []);
      await syncState();
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error:
          err.code === 4001
            ? "Connection rejected by user."
            : err.message,
      }));
    }
  }, [syncState]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      isCorrectNetwork: false,
      error: null,
    });
  }, []);

  /**
   * Asks MetaMask to switch to Hardhat. If not added, adds it automatically.
   */
  const switchToHardhat = useCallback(async () => {
    const extProvider = getMetaMaskProvider();
    if (!extProvider) return;
    try {
      await extProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TARGET_HEX }],
      });
    } catch (err: any) {
      // 4902 = chain not added to MetaMask
      if (err.code === 4902) {
        await extProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: TARGET_HEX,
              chainName: "Hardhat Local",
              nativeCurrency: { name: "HardhatETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["http://127.0.0.1:8545"],
              blockExplorerUrls: [],
            },
          ],
        });
      }
    }
  }, []);

  /**
   * Returns an ethers.js Signer attached to the connected wallet.
   * Use this to send transactions from the frontend.
   */
  const getSigner = useCallback(async (): Promise<JsonRpcSigner | null> => {
    const provider = getProvider();
    if (!provider) return null;
    return provider.getSigner();
  }, []);

  /**
   * Sends a transaction using MetaMask.
   * @param txData - Unsigned transaction object from the backend
   */
  const sendTransaction = useCallback(
    async (txData: object): Promise<string | null> => {
      const signer = await getSigner();
      if (!signer) return null;
      const tx = await signer.sendTransaction(txData as any);
      await tx.wait();
      return tx.hash;
    },
    [getSigner]
  );

  // Short address helper
  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null;

  return {
    ...state,
    shortAddress,
    connect,
    disconnect,
    switchToHardhat,
    getSigner,
    sendTransaction,
    refreshBalance,
  };
}
