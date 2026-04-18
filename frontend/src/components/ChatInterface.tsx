"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../hooks/useWallet";

import { PromptInputBox } from "@/components/ui/ai-prompt-box";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "agent-card";
  metadata?: any;
}

export function ChatInterface() {
  const { user } = useAuth();
  const { sendTransaction } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your autonomous agent assistant. Tell me what you'd like to automate on-chain. For example: 'If ETH drops 5%, buy $50'." }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiLoading]);

  const handleSend = async (input: string, files?: File[]) => {
    if ((!input.trim() && (!files || files.length === 0)) || !user) return;

    const userInput = input;
    const userMessage: Message = { role: "user", content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    const loadingMessage: Message = { role: "assistant", content: "Thinking..." };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userInput })
      });

      if (!res.ok) {
        throw new Error("Failed to get response from Nexus Orchestrator.");
      }

      const data = await res.json();
      
      // Replace 'Thinking...' with actual response
      setMessages(prev => {
        const withoutLoading = prev.slice(0, -1);
        const assistantMessage: Message = { 
          role: "assistant", 
          content: data.response
        };

        // If there's an agent card returned in data, we can optionally parse it
        // Or if there's a transaction, prompt signing
        let transactionMessage: Message | undefined;
        if (data.transactionData) {
          transactionMessage = {
            role: "assistant",
            content: "Transaction prepared by Orchestrator. Please review and sign in MetaMask.",
            type: "agent-card", // Reusing this UI block for tx prompt
            metadata: {
              condition: "Immediate Execution",
              action: `Target: ${data.transactionData.to}`,
            }
          };
        }

        if (transactionMessage) {
           return [...withoutLoading, assistantMessage, transactionMessage];
        }
        return [...withoutLoading, assistantMessage];
      });

      // Handle raw transaction if Orchestrator prepared one (e.g., Transfer/Swap)
      if (data.transactionData) {
        try {
          const txHash = await sendTransaction(data.transactionData);
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `Transaction successfully submitted to blockchain! TX Hash: ${txHash}`
          }]);
        } catch (txError: any) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `Transaction failed or rejected: ${txError.message}`
          }]);
        }
      }

    } catch (error: any) {
      setMessages(prev => {
        const withoutLoading = prev.slice(0, -1);
        return [...withoutLoading, { role: "assistant", content: `Error: ${error.message}` }];
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto w-full p-4 md:p-8 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scrollbar-track-transparent"
      >
        <div className="max-w-4xl mx-auto space-y-8 pb-4">
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
                {message.content && (
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                    message.role === "assistant" 
                      ? "bg-card border border-border text-primary shadow-sm" 
                      : "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                  )}>
                    {message.content}
                  </div>
                )}

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

          {isAiLoading && (
            <div className="flex gap-4 items-start">
               <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 bg-primary text-primary-foreground">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-card border border-border text-primary shadow-sm px-5 py-3 rounded-2xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 w-full pt-2 pb-6 px-4 md:px-8 bg-background relative z-10">
        <div className="max-w-4xl mx-auto w-full group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <PromptInputBox 
            onSend={handleSend}
            isLoading={isAiLoading}
            placeholder="e.g., 'Weekly: spend $100 to Buy WBTC'"
            className="shadow-2xl"
          />
        </div>
        <div className="mt-3 text-center">
          <p className="text-[11px] text-muted-foreground tracking-wide font-medium">Intentional AI can make mistakes. Verify critical transactions.</p>
        </div>
      </div>
    </div>
  );
}
