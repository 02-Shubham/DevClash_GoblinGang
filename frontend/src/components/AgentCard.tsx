"use client";

import React, { useState } from "react";
import { Play, Pause, MoreVertical, Zap, Clock, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  name: string;
  condition: string;
  action: string;
  status: "active" | "paused" | "triggered";
  lastExecuted?: string;
}

export function AgentCard({ name, condition, action, status: initialStatus, lastExecuted }: AgentCardProps) {
  const [status, setStatus] = useState(initialStatus);

  const toggleStatus = () => {
    setStatus(status === "active" ? "paused" : "active");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-xl hover:shadow-black/5 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl",
            status === "active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
          )}>
            <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">{name}</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
              <Clock className="w-3 h-3" />
              {lastExecuted || "Never executed"}
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
            <TrendingDown className="w-4 h-4 text-red-500" />
            {condition}
          </div>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
          <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Action</div>
          <div className="text-sm font-medium">{action}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", 
            status === "active" ? "bg-green-500" : "bg-yellow-500"
          )} />
          <span className="text-xs font-medium capitalize">{status}</span>
        </div>
        
        <button 
          onClick={toggleStatus}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
            status === "active" 
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
              : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
          )}
        >
          {status === "active" ? (
            <><Pause className="w-3 h-3" /> Pause Agent</>
          ) : (
            <><Play className="w-3 h-3" /> Resume Agent</>
          )}
        </button>
      </div>
    </div>
  );
}
