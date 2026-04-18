"use client";

import React from "react";
import { PlusCircle, LayoutDashboard, History, Settings, Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const agents = [
  { name: "ETH Dip Buyer", status: "active" },
  { name: "Weekly BTC DCA", status: "active" },
  { name: "SOL Profit Taker", status: "paused" },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("flex flex-col h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Intentional</span>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:opacity-90 transition-all mb-8 shadow-lg shadow-primary/20">
          <PlusCircle className="w-4 h-4" />
          Create Agent
        </button>

        <nav className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Menu</div>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-secondary text-primary">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors">
            <History className="w-4 h-4" />
            Action Logs
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </a>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">Your Agents</div>
        <div className="space-y-2">
          {agents.map((agent) => (
            <div key={agent.name} className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-secondary/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", agent.status === "active" ? "bg-green-500" : "bg-yellow-500")} />
                <span className="text-muted-foreground group-hover:text-primary">{agent.name}</span>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
