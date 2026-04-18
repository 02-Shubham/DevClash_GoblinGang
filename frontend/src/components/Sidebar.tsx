"use client";
import React, { useState, useEffect } from "react";
import { PlusCircle, LayoutDashboard, History, Settings, Bot, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
  onCreateAgent?: () => void;
}

export function Sidebar({ className, onCreateAgent }: SidebarProps) {
  const { user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAgents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await agentApi.list();
      setAgents(res.agents || []);
    } catch (err) {
      console.error("Failed to fetch sidebar agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();

    // Re-fetch logic when an agent is created elsewhere (e.g. Dashboard root)
    const handleRefresh = () => fetchAgents();
    window.addEventListener('agent-created', handleRefresh);
    return () => window.removeEventListener('agent-created', handleRefresh);
  }, [user]);

  return (
    <div className={cn("flex flex-col h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">Intentional</span>
        </div>

        <button 
          onClick={onCreateAgent}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium hover:opacity-90 transition-all mb-8 shadow-lg shadow-primary/20"
        >
          <PlusCircle className="w-4 h-4" />
          Create Agent
        </button>

        <nav className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Menu</div>
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-secondary text-primary">
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

      <div className="mt-auto p-6 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">Your Agents</div>
        <div className="space-y-2">
          {loading && agents.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading...
            </div>
          ) : agents.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground italic">No agents yet</div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id || agent.agentId} className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-secondary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", agent.status === "active" ? "bg-green-500" : "bg-yellow-500")} />
                  <span className="text-muted-foreground group-hover:text-primary truncate max-w-[120px]">{agent.name}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
