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

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_HEX = "0xaa36a7";

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

  const getProvider = (): BrowserProvider | null => {
    if (typeof window === "undefined" || !window.ethereum) return null;
    return new ethers.BrowserProvider(window.ethereum);
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
        isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
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

    if (!window.ethereum) return;

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

    window.ethereum.on("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [syncState]);

  // ----------------------------------------------------------------
  // Public actions
  // ----------------------------------------------------------------

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask not found. Please install it from metamask.io",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
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
   * Asks MetaMask to switch to Sepolia. If not added, adds it automatically.
   */
  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_HEX }],
      });
    } catch (err: any) {
      // 4902 = chain not added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_HEX,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
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
    switchToSepolia,
    getSigner,
    sendTransaction,
    refreshBalance,
  };
}
