"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "agent-card";
  metadata?: any;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your autonomous agent assistant. Tell me what you'd like to automate on-chain. For example: 'If ETH drops 5%, buy $50'." }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = { 
        role: "assistant", 
        content: "I've parsed your intent. I'm creating an agent with these parameters:",
        type: "agent-card",
        metadata: {
          condition: input.toLowerCase().includes("eth") ? "ETH drops 5%" : "Custom Condition",
          action: "Buy $50",
          status: "active"
        }
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 pt-8">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 pb-32 scrollbar-none"
      >
        {messages.map((message, i) => (
          <div key={i} className={cn(
            "flex gap-4",
            message.role === "assistant" ? "items-start" : "items-start flex-row-reverse"
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
              message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
            )}>
              {message.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            
            <div className={cn(
              "flex flex-col gap-4 max-w-[80%]",
              message.role === "user" && "items-end"
            )}>
              <div className={cn(
                "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === "assistant" 
                  ? "bg-card border border-border text-primary shadow-sm" 
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
              )}>
                {message.content}
              </div>

              {message.type === "agent-card" && (
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-xl w-full">
                  <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Agent Configured Successfully
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Condition</span>
                      <p className="text-sm font-medium">{message.metadata.condition}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Action</span>
                      <p className="text-sm font-medium">{message.metadata.action}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Status: Active
                    </span>
                    <button className="text-xs font-semibold text-primary hover:underline">View in Sidebar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-64 right-0 pb-8 px-8 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center bg-card border border-border rounded-2xl p-2 pl-5 shadow-2xl focus-within:border-primary/50 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g., 'Weekly: spend $100 to Buy WBTC'"
              className="bg-transparent border-none focus:ring-0 w-full text-sm py-2"
            />
            <button 
              onClick={handleSend}
              className="bg-primary text-primary-foreground p-2 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
              <Sparkles className="w-3 h-3 text-blue-500" /> Auto-detection: ON
            </span>
            <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors">
              <AlertCircle className="w-3 h-3 text-muted-foreground" /> Low gas detected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}