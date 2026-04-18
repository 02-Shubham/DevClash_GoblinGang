"use client";

import React from "react";
import { Wallet, Globe, Bell, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { WalletButton } from "./WalletButton";
import { SettingsModal } from "./SettingsModal";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <>
      <div className="h-16 flex items-center justify-between px-8 border-b border-border bg-card/30 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* The static Sepolia Testnet element was removed from here because WalletButton handles network display dynamically */}
        </div>

        <div className="flex items-center gap-4">
          <button 
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-border mx-2" />

          {/* Dynamic MetaMask Wallet Button */}
          <WalletButton />

          {/* User Info */}
          <div className="flex items-center gap-3 ml-2">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <span className="text-sm font-medium text-muted-foreground max-w-[150px] truncate hidden sm:block">
              {user?.displayName || user?.email || "Anonymous"}
            </span>
          </div>

          <button
            onClick={signOut}
            className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}
