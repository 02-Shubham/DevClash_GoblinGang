"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { AgentCard } from "@/components/AgentCard";
import { useAuth } from "@/context/AuthContext";
import { agentApi } from "@/lib/api";
import { CreateAgentModal } from "@/components/CreateAgentModal";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch agents logic
  const fetchAgents = async () => {
    try {
      const res = await agentApi.list();
      setAgents(res.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setFetching(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Initial fetch and refresh listener
  useEffect(() => {
    if (user) {
      fetchAgents();
    }

    const handleRefresh = () => fetchAgents();
    window.addEventListener('agent-created', handleRefresh);
    return () => window.removeEventListener('agent-created', handleRefresh);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen text-foreground overflow-hidden">
      {/* Sidebar - Integrated with central modal state */}
      <Sidebar onCreateAgent={() => setIsCreateModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 flex overflow-hidden relative">
          {/* Chat Panel */}
          <div className="flex-1 relative border-r border-border">
            <ChatInterface />
          </div>

          {/* Right Info/Agent Panel - Dynamic Data Integration */}
          <div className="w-[400px] bg-secondary/10 overflow-y-auto p-8 hidden xl:block">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold tracking-tight">Active Agents</h2>
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all">
                {fetching ? "..." : agents.length} Total
              </span>
            </div>

            <div className="space-y-6">
              {fetching && agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-sm font-medium">Syncing agents...</span>
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-12 bg-card/50 rounded-3xl border border-dashed border-border px-4">
                  <p className="text-sm text-muted-foreground mb-4">No agents found</p>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    + Create First Agent
                  </button>
                </div>
              ) : (
                agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    id={agent.id}
                    name={agent.name}
                    condition={agent.parsedIntent?.trigger?.condition || "Continuous"}
                    action={agent.intentText}
                    status={agent.status}
                    lastExecuted={agent.lastRun ? new Date(agent.lastRun).toLocaleDateString() : "Never"}
                    createdAt={agent.createdAt}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Global Modals - Shared by Sidebar and Main UI */}
      <CreateAgentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchAgents} 
      />
    </div>
  );
}
