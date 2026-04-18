"use client";

/**
 * components/WalletButton.tsx
 * ---------------------------
 * A self-contained wallet connect button.
 * Shows: Connect → Connecting... → Address + Balance → Wrong Network warning
 * Clicking while connected shows a dropdown with copy address and disconnect.
 */

import React, { useState } from "react";
import { Wallet, ChevronDown, Copy, LogOut, AlertTriangle, Check, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

export function WalletButton() {
  const {
    isConnected,
    isConnecting,
    isCorrectNetwork,
    shortAddress,
    balance,
    chainId,
    error,
    connect,
    disconnect,
    switchToSepolia,
  } = useWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { address } = useWallet();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Not connected ──────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={connect}
          disabled={isConnecting}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all border",
            isConnecting
              ? "bg-secondary/50 border-border text-muted-foreground cursor-wait"
              : "bg-secondary/50 hover:bg-secondary border-border text-primary hover:scale-105"
          )}
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
        {error && (
          <span className="text-[10px] text-red-400 font-medium max-w-[200px] text-right">
            {error}
          </span>
        )}
      </div>
    );
  }

  // ── Wrong network ──────────────────────────────────────────────
  if (!isCorrectNetwork) {
    return (
      <button
        onClick={switchToSepolia}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
      >
        <AlertTriangle className="w-4 h-4" />
        Switch to Sepolia
      </button>
    );
  }

  // ── Connected ──────────────────────────────────────────────────
  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary border border-border px-4 py-1.5 rounded-full transition-all group"
      >
        {/* Green dot */}
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <Wallet className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-medium">{shortAddress}</span>
        {balance && (
          <span className="text-xs text-muted-foreground font-medium border-l border-border pl-2">
            {balance} ETH
          </span>
        )}
        <ChevronDown
          className={cn("w-3 h-3 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-wide">Connected</span>
              </div>
              <p className="font-mono text-sm font-medium text-primary truncate">{address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {balance} ETH · Sepolia Testnet
              </p>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={copyAddress}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-xl hover:bg-secondary transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
                {copied ? "Copied!" : "Copy Address"}
              </button>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-xl hover:bg-secondary transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                View on Etherscan
              </a>
              <div className="border-t border-border my-2" />
              <button
                onClick={() => {
                  disconnect();
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
