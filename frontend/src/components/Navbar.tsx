"use client";

import React from "react";
import { Wallet, Globe, User, Bell } from "lucide-react";

export function Navbar() {
  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-border bg-card/30 backdrop-blur-lg sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Arbitrum Sepolia</span>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-border mx-2" />
        <button className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary border border-border px-4 py-1.5 rounded-full transition-all group">
          <Wallet className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-mono font-medium">0x7a...4e2d</span>
        </button>
        <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border overflow-hidden">
          <User className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
