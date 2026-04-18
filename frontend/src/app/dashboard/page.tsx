"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { AgentCard } from "@/components/AgentCard";

export default function Dashboard() {
  return (
    <div className="flex bg-background min-h-screen text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          <div className="flex-1 relative border-r border-border">
            <ChatInterface />
          </div>

          {/* Right Info/Agent Panel - Only visible on larger screens */}
          <div className="w-[400px] bg-secondary/10 overflow-y-auto p-8 hidden xl:block">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold tracking-tight">Active Agents</h2>
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">3 Total</span>
            </div>

            <div className="space-y-6">
              <AgentCard 
                name="ETH Dip Buyer"
                condition="ETH Drops 5%"
                action="Buy $50 ETH"
                status="active"
                lastExecuted="2 hours ago"
              />
              <AgentCard 
                name="Weekly BTC DCA"
                condition="Every Monday"
                action="Buy $100 WBTC"
                status="active"
                lastExecuted="5 days ago"
              />
              <AgentCard 
                name="SOL Profit Taker"
                condition="SOL Hits $150"
                action="Sell 2 SOL into USDC"
                status="paused"
                lastExecuted="Never"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
