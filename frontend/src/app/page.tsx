"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, Zap, Shield, Sparkles, MoveRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[#020817] text-[#f8fafc] min-h-screen selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f8fafc] text-[#020817] rounded-xl flex items-center justify-center font-bold text-xl">
            I
          </div>
          <span className="font-bold text-xl tracking-tight">Intentional</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How it works</a>
          <a href="#" className="hover:text-white transition-colors">Showcase</a>
        </div>
        <Link 
          href="/login" 
          className="bg-[#f8fafc] text-[#020817] px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform active:scale-95"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-32 pb-40 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-blue-600/20 via-transparent to-transparent -z-10 blur-[120px]" />
        
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering the next billion on-chain
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]">
            Automate your crypto <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
               actions with AI agents
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed">
            Intentional is the lightweight infrastructure for autonomous agents. 
            Define your goals in plain English, and let our agents execute on-chain for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link 
              href="/dashboard" 
              className="group bg-[#f8fafc] text-[#020817] px-10 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
            >
              Launch Dashboard
              <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-10 py-4 rounded-2xl text-lg font-bold border border-slate-700 hover:bg-slate-800 transition-colors">
              Read Docs
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview (Visual Placeholder) */}
      <section className="px-8 -mt-20 relative z-10 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-[#0f172a] border border-slate-800 rounded-[2rem] overflow-hidden aspect-video shadow-2xl flex">
              {/* Fake Sidebar */}
              <div className="w-64 border-r border-slate-800 p-6 hidden md:block">
                <div className="w-32 h-4 bg-slate-800 rounded mb-8" />
                <div className="w-full h-10 bg-blue-600/20 rounded-xl mb-8" />
                <div className="space-y-4">
                  <div className="w-full h-8 bg-slate-800/50 rounded-lg" />
                  <div className="w-full h-8 bg-slate-800/50 rounded-lg" />
                  <div className="w-full h-8 bg-slate-800/50 rounded-lg" />
                </div>
              </div>
              {/* Fake Main Area */}
              <div className="flex-1 p-8 space-y-8">
                 <div className="flex justify-between items-center">
                   <div className="w-48 h-8 bg-slate-800 rounded" />
                   <div className="w-32 h-8 bg-slate-800 rounded-full" />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="h-48 bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6">
                       <div className="w-12 h-12 bg-blue-500/20 rounded-xl mb-4" />
                       <div className="w-32 h-4 bg-slate-700 rounded mb-2" />
                       <div className="w-full h-3 bg-slate-800 rounded" />
                    </div>
                    <div className="h-48 bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6">
                       <div className="w-12 h-12 bg-purple-500/20 rounded-xl mb-4" />
                       <div className="w-32 h-4 bg-slate-700 rounded mb-2" />
                       <div className="w-full h-3 bg-slate-800 rounded" />
                    </div>
                 </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 font-bold tracking-wide italic">
              "If ETH drops 5%, buy $50"
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 py-32 grid md:grid-cols-3 gap-12">
        <div className="space-y-4 group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold">Intent-First Design</h3>
          <p className="text-slate-400">Focus on what you want to achieve, not the complex on-chain transaction steps.</p>
        </div>
        <div className="space-y-4 group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-colors">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold">Autonomous Monitoring</h3>
          <p className="text-slate-400">Our backend constantly monitors price, time, and events to trigger your agents.</p>
        </div>
        <div className="space-y-4 group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 transition-colors">
          <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold">Secure Execution</h3>
          <p className="text-slate-400">Transactions are executed via safe smart contracts only when conditions are met.</p>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-8 py-20 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-lg" />
          <span className="font-bold tracking-tight">Intentional</span>
        </div>
        <div className="text-slate-500 text-sm">
          © 2026 Intentional Platform. Built for the Decentralized Future.
        </div>
      </footer>
    </div>
  );
}
