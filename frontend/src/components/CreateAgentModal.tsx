"use client";

import React, { useState } from "react";
import { X, Bot, Sparkles, Loader2, Zap, Shield, AlertCircle } from "lucide-react";
import { agentApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAgentModal({ isOpen, onClose, onSuccess }: CreateAgentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    intent: "",
    maxSpend: 50,
    token: "ETH",
    frequency: "daily",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If user provided specific config but intent is generic, we can potentially augment it
    // but for now, we'll trust the natural language flow as per specs.
    
    try {
      const response = await agentApi.create({
        name: formData.name,
        intent: formData.intent,
        wallet: user?.email || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Fallback dev wallet
        permissions: {
          maxSpend: formData.maxSpend || 50,
        },
      });

      if (response.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: "",
          intent: "",
          maxSpend: 50,
          token: "ETH",
          frequency: "daily",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/90 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card w-full max-w-lg rounded-[2.5rem] border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Create New Agent</h2>
              <p className="text-sm text-muted-foreground">Define your autonomous on-chain goal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {/* Agent Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Agent Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Daily ETH Accumulator"
                className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Natural Language Intent */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Natural Language Intent
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Send 0.01 ETH to 0x123... every day"
                className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                value={formData.intent}
                onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground italic">
                Our AI will parse this into a structured execute rule.
              </p>
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  Max Spend (USD)
                </label>
                <input
                  type="number"
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.maxSpend}
                  onChange={(e) => setFormData({ ...formData, maxSpend: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  Asset
                </label>
                <select
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="WBTC">WBTC</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Intent...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Deploy Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
