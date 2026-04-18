"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Circle, 
  MessageSquare, 
  Database, 
  Cpu, 
  Globe, 
  Zap,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const SlackIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.527 2.527 0 0 1-2.522-2.523 2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.268 0a2.527 2.527 0 0 1 2.52-2.52 2.527 2.527 0 0 1 2.522 2.52v6.313A2.528 2.528 0 0 1 8.83 24a2.528 2.528 0 0 1-2.52-2.522v-6.313zM8.83 5.042a2.528 2.528 0 0 1-2.523-2.52 2.527 2.527 0 0 1 2.523-2.522 2.527 2.527 0 0 1 2.52 2.522v2.52H8.83zm0 1.268a2.527 2.527 0 0 1 2.52 2.52 2.527 2.527 0 0 1-2.52 2.522H2.515A2.528 2.528 0 0 1 0 8.83a2.528 2.528 0 0 1 2.515-2.52h6.315zm9.889 3.846a2.528 2.528 0 0 1 2.522-2.52 2.527 2.527 0 0 1 2.52 2.52 2.527 2.527 0 0 1-2.52 2.522h-2.522v-2.522zm-1.268 0a2.527 2.527 0 0 1-2.52 2.522 2.527 2.527 0 0 1-2.522-2.522V3.853A2.528 2.528 0 0 1 15.17 1.33a2.528 2.528 0 0 1 2.522 2.522v6.315zM15.17 18.958a2.528 2.528 0 0 1 2.523 2.52 2.527 2.527 0 0 1-2.523 2.522 2.527 2.527 0 0 1-2.52-2.522v-2.52h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.52 2.527 2.527 0 0 1 2.52-2.522h6.315A2.528 2.528 0 0 1 24 15.17a2.528 2.528 0 0 1-2.515 2.52h-6.315z" />
  </svg>
);

interface OrbitingItemProps {
  radius: number;
  duration: number;
  delay?: number;
  reverse?: boolean;
  children: React.ReactNode;
  iconBg?: string;
}

const OrbitingItem = ({ radius, duration, delay = 0, reverse = false, children, iconBg }: OrbitingItemProps) => {
  return (
    <motion.div
      className="absolute flex items-center justify-center pointer-events-none"
      animate={{
        rotate: reverse ? -360 : 360,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
      style={{
        width: radius * 2,
        height: radius * 2,
      }}
    >
      <div 
        className={cn(
          "absolute p-2 rounded-full border border-border shadow-sm flex items-center justify-center pointer-events-auto transition-transform hover:scale-110",
          iconBg || "bg-card"
        )}
        style={{
          transform: `translateY(-${radius}px)`,
        }}
      >
        <motion.div
          animate={{
            rotate: reverse ? 360 : -360,
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
            delay,
          }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export function OrbitingIcons() {
  return (
    <div className="relative flex items-center justify-center w-full h-[600px] overflow-hidden">
      {/* Background radial gradients for that blurred look - MUCH LIGHTER */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-sky-300/5 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Concentric Circles */}
      <div className="absolute border border-dashed border-border/40 rounded-full w-[250px] h-[250px]" />
      <div className="absolute border border-dashed border-border/30 rounded-full w-[450px] h-[450px]" />
      <div className="absolute border border-dashed border-border/20 rounded-full w-[650px] h-[650px]" />

      {/* Centerpiece */}
      {/* <div className="z-10 bg-background border border-border p-6 rounded-3xl shadow-2xl flex items-center justify-center">
        <Bot className="w-12 h-12 text-primary" />
      </div> */}

      {/* Orbiting Icons */}
      {/* Inner Tier */}
      <OrbitingItem radius={125} duration={15}>
        <GithubIcon className="w-5 h-5 text-[#24292f]" />
      </OrbitingItem>
      <OrbitingItem radius={125} duration={15} delay={7.5}>
        <SlackIcon className="w-5 h-5 text-[#4a154b]" />
      </OrbitingItem>

      {/* Middle Tier */}
      <OrbitingItem radius={225} duration={25} reverse>
        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">H</div>
      </OrbitingItem>
      <OrbitingItem radius={225} duration={25} delay={8.3} reverse>
        <Globe className="w-5 h-5 text-blue-500" />
      </OrbitingItem>
      <OrbitingItem radius={225} duration={25} delay={16.6} reverse>
        <Zap className="w-5 h-5 text-yellow-500" />
      </OrbitingItem>

      {/* Outer Tier */}
      <OrbitingItem radius={325} duration={40}>
        <Database className="w-6 h-6 text-slate-600" />
      </OrbitingItem>
      <OrbitingItem radius={325} duration={40} delay={10}>
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">f</div>
      </OrbitingItem>
      <OrbitingItem radius={325} duration={40} delay={20}>
        <Cpu className="w-6 h-6 text-purple-500" />
      </OrbitingItem>
      <OrbitingItem radius={325} duration={40} delay={30}>
        <MessageSquare className="w-6 h-6 text-green-500" />
      </OrbitingItem>
    </div>
  );
}
