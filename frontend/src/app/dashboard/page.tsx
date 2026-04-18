"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { AgentCard } from "@/components/AgentCard";
import { useAuth } from "@/context/AuthContext";
import { agentApi } from "@/lib/api";
import { CreateAgentModal } from "@/components/CreateAgentModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await agentApi.list();
      setAgents(res.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user === null && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAgents();
    }

    // Listen for creation events from Sidebar
    const handleRefresh = () => fetchAgents();
    window.addEventListener('agent-created', handleRefresh);
    return () => window.removeEventListener('agent-created', handleRefresh);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar onCreateAgent={() => setIsCreateModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">My Agents</h1>
                <p className="text-muted-foreground">Monitor and manage your active autonomous agents.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
              >
                <PlusCircle className="w-5 h-5" />
                New Agent
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-6 rounded-3xl">
                <div className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Active Agents</div>
                <div className="text-3xl font-bold">{agents.filter(a => a.status === 'active').length}</div>
              </div>
              <div className="bg-card border border-border p-6 rounded-3xl">
                <div className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Actions</div>
                <div className="text-3xl font-bold">{agents.reduce((acc, a) => acc + (a.totalRuns || 0), 0)}</div>
              </div>
              <div className="bg-card border border-border p-6 rounded-3xl">
                <div className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Success Rate</div>
                <div className="text-3xl font-bold text-green-500">100%</div>
              </div>
            </div>

            {/* Agents Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold px-1">Active Agents</h2>
              {agents.length === 0 ? (
                <div className="bg-card/50 border border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <PlusCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No agents yet</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">Create your first autonomous agent to start automating your workflow.</p>
                  </div>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-primary font-bold hover:underline"
                  >
                    Create Agent →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  {agents.map((agent) => (
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateAgentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchAgents} 
      />
    </div>
  );
}
