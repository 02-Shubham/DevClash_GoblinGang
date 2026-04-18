"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wallet, Mail, Triangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    stroke="none"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"wallet" | "email">("wallet");

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -ml-64 -mb-64" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-white/10">
              I
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">Intentional</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400">Choose your preferred login method</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex bg-slate-950/50 rounded-2xl p-1 mb-8">
            <button 
              onClick={() => setActiveTab("wallet")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === "wallet" ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-white"
              )}
            >
              <Wallet className="w-4 h-4" />
              Wallet
            </button>
            <button 
              onClick={() => setActiveTab("email")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === "email" ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-white"
              )}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "wallet" ? (
              <>
                <button className="w-full bg-[#f8fafc] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-colors group">
                  <div className="w-6 h-6 relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-lg blur-sm opacity-0 group-hover:opacity-40 transition-opacity" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" className="w-6 h-6 relative z-10" alt="MetaMask" />
                  </div>
                  Connect MetaMask
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-700 transition-colors border border-slate-700">
                  <Triangle className="rotate-180 w-5 h-5 text-blue-500 fill-blue-500" />
                  WalletConnect
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                     <input 
                       type="email" 
                       placeholder="name@example.com" 
                       className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 text-white"
                     />
                   </div>
                   <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 transition-colors shadow-xl shadow-blue-600/10">
                     Continue with Email
                   </button>
                </div>
              </>
            )}

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                <span className="bg-[#020817] px-4 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-800 py-3 rounded-xl hover:bg-slate-800 transition-colors">
                <GithubIcon className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">Github</span>
              </button>
              <button className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-800 py-3 rounded-xl hover:bg-slate-800 transition-colors">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.92 3.36-2.08 4.48-1.52 1.52-3.84 2.76-7.84 2.76-6.4 0-11.56-5.2-11.56-11.56s5.16-11.56 11.56-11.56c3.48 0 6.04 1.36 7.92 3.16l2.32-2.32c-2.48-2.32-5.72-3.64-10.24-3.64-7.92 0-14.48 6.56-14.48 14.48s6.56 14.48 14.48 14.48c4.32 0 7.6-1.4 10.12-4 2.6-2.6 3.44-6.28 3.44-8.96 0-.84-.08-1.48-.16-2.12z"/></svg>
                <span className="text-sm font-bold text-white">Google</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Don't have an account? <a href="#" className="text-blue-500 font-bold hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}
