"use client";
import React, { useState } from "react";
import { Play, Pause, MoreVertical, Zap, Clock, TrendingDown, Loader2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentApi } from "@/lib/api";

interface AgentCardProps {
  id: string;
  name: string;
  condition: string;
  action: string;
  status: "active" | "paused" | "triggered";
  lastExecuted?: string;
  createdAt?: string;
}

export function AgentCard({ id, name, condition, action, status: initialStatus, lastExecuted, createdAt }: AgentCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [toggling, setToggling] = useState(false);

  const toggleStatus = async () => {
    const newStatus = status === "active" ? "paused" : "active";
    setToggling(true);
    try {
      await agentApi.toggle(id, newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setToggling(false);
    }
  };

  const statusColors = {
    active: "bg-green-500",
    paused: "bg-yellow-500",
    triggered: "bg-blue-500",
  };

  const statusBgColors = {
    active: "bg-green-500/10 text-green-500",
    paused: "bg-yellow-500/10 text-yellow-500",
    triggered: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl hover:shadow-black/5 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl transition-all",
            statusBgColors[status] || "bg-muted text-muted-foreground"
          )}>
            <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">{name}</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              <Calendar className="w-3 h-3" />
              Created {createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown"}
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Condition</div>
          <div className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary/70" />
            {condition}
          </div>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Current Intent</div>
          <div className="text-sm font-medium italic opacity-80">{action}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", 
            statusColors[status] || "bg-gray-500"
          )} />
          <span className="text-xs font-medium capitalize">{status}</span>
        </div>
        
        <button 
          onClick={toggleStatus}
          disabled={toggling}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 min-w-[120px] justify-center",
            status === "active" 
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
              : "bg-green-500/10 text-green-500 hover:bg-green-500/20",
            toggling && "opacity-50 cursor-not-allowed"
          )}
        >
          {toggling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : status === "active" ? (
            <><Pause className="w-3 h-3" /> Pause Agent</>
          ) : (
            <><Play className="w-3 h-3" /> Resume Agent</>
          )}
        </button>
      </div>
    </div>
  );
}
