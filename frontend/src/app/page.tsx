"use client";

import React from "react";
import Link from "next/link";
import { MoveRight, Zap, Bot, Shield, Sparkles } from "lucide-react";
import { OrbitingIcons } from "@/components/OrbitingIcons";

export default function LandingPage() {
  return (
    <div className="text-foreground min-h-screen bg-noise">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-110">
            I
          </div>
          <span className="font-bold text-xl tracking-tight">Intentional</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Platform</a>
          <a href="#" className="hover:text-primary transition-colors">Marketplace</a>
          <a href="#" className="hover:text-primary transition-colors">Docs</a>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 w-full relative">
          
          {/* Background Illustration */}
          <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1600px] opacity-100 pointer-events-none">
            <OrbitingIcons />
          </div>

          {/* Hero Content */}
          <div className="relative  text-center space-y-8 max-w-4xl mx-auto py-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
              AI Agent Marketplace
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-[#111827]">
              Access the largest library of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                 enterprise-grade AI agents
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
              Build AI agents ten times faster with 200+ agent templates. 
              The lightweight infrastructure for autonomous on-chain actions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link 
                href="/dashboard" 
                className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20"
              >
                Try Now
                <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 rounded-xl text-base font-bold bg-white border border-border hover:bg-slate-50 transition-colors shadow-sm">
                Explore Templates
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof (Matching the reference feel) */}
      <section className="max-w-7xl mx-auto px-8 py-20 border-y border-border/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary">200+</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Templates</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary">50k+</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Agents Live</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary">10x</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Faster Build</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 py-32 space-y-20">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need to automate</h2>
          <p className="text-slate-500 font-medium">Native integrations with the tools you already use, powered by AI.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-10 rounded-3xl bg-white border border-border hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Intent-First Design</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Focus on what you want to achieve, not the complex on-chain transaction steps.</p>
          </div>

          <div className="p-10 rounded-3xl bg-white border border-border hover:border-purple-500/30 transition-all hover:shadow-2xl hover:shadow-purple-500/5 group">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Autonomous AI</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Our backend constantly monitors price, time, and events to trigger your agents automatically.</p>
          </div>

          <div className="p-10 rounded-3xl bg-white border border-border hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-4">Enterprise Security</h3>
            <p className="text-slate-500 font-medium leading-relaxed">Multi-sig execution and audited safe contracts protect your assets in every automated step.</p>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-8 py-20 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="w-8 h-8 bg-slate-800 rounded-lg" />
          <span className="font-bold tracking-tight">Intentional</span>
        </div>
        <div className="text-slate-400 text-sm font-medium">
          © 2026 Intentional Platform. Built for the Decentralized Future.
        </div>
      </footer>
    </div>
  );
}
