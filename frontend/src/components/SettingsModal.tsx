"use client";

import React, { useState } from "react";
import { 
  X, 
  MessageSquare, 
  Blocks, 
  Brain, 
  Wand2, 
  ShieldCheck, 
  Settings,
  Send,
  MessageCircle,
  Smartphone,
  Search,
  Link2,
  Database,
  ListTodo,
  CalendarDays,
  GitBranch,
  Mail,
  Calendar,
  FileText,
  HardDrive
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "Channels" | "Integrations" | "Memory" | "Skills" | "Permissions" | "Settings";

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Channels");

  if (!isOpen) return null;

  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: "Channels", icon: <MessageSquare className="w-4 h-4" />, label: "Channels" },
    { id: "Integrations", icon: <Blocks className="w-4 h-4" />, label: "Integrations" },
    { id: "Memory", icon: <Brain className="w-4 h-4" />, label: "Memory" },
    { id: "Skills", icon: <Wand2 className="w-4 h-4" />, label: "Skills" },
    { id: "Permissions", icon: <ShieldCheck className="w-4 h-4" />, label: "Permissions" },
    { id: "Settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl min-h-[600px] flex overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Navigation Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col py-6 px-4">
          <div className="text-xs font-semibold text-slate-400 mb-4 px-3 tracking-wider uppercase">Setup</div>
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full text-left",
                  activeTab === tab.id 
                    ? "bg-slate-200 text-slate-900" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-8 py-10 border-b border-transparent">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeTab}</h2>
              {activeTab === "Channels" && (
                <p className="text-sm text-slate-500 font-medium">Connect app channel to chat from anywhere</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors -mt-4 mr-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Views */}
          <div className="p-8 flex-1 overflow-y-auto">
            {activeTab === "Channels" && <ChannelsView />}
            {activeTab === "Integrations" && <IntegrationsView />}
            {activeTab === "Memory" && <PlaceholderView title="Memory" desc="User preferences and persistent agent memory state." />}
            {activeTab === "Skills" && <PlaceholderView title="Skills" desc="Explore and acquire skills or agents created by the community." />}
            {activeTab === "Permissions" && <PlaceholderView title="Permissions" desc="Basic access control and data visibility settings." />}
            {activeTab === "Settings" && <PlaceholderView title="Settings" desc="General application settings." />}
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-views
function ChannelsView() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Telegram Card */}
      <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-blue-500/30 transition-colors">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Telegram</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Chat with your wingman through Telegram bot messages.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
            Connect &gt;
          </button>
        </div>
      </div>

      {/* WhatsApp Card */}
      <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-green-500/30 transition-colors">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
             <MessageCircle className="w-5 h-5 text-green-500 fill-green-500/20" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">WhatsApp</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Interact with your wingman via WhatsApp messages.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
            Connect &gt;
          </button>
        </div>
      </div>

      {/* iMessage Card */}
      <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-colors">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
             <Smartphone className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">iMessage</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Send and receive iMessages through your wingman.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
            Connect &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceholderView({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title} Configuration</h3>
      <p className="text-slate-500 max-w-sm">{desc}</p>
      <div className="mt-8 text-sm font-semibold text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-200">
        Coming Soon
      </div>
    </div>
  );
}

function IntegrationsView() {
  const integrations = [
    {
      name: "Airtable",
      desc: "Airtable merges spreadsheet functionality with database power, enabling teams to...",
      icon: <Database className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      name: "Asana",
      desc: "Tool to help teams organize, track, and manage their work.",
      icon: <ListTodo className="w-5 h-5 text-rose-500" />,
      bg: "bg-rose-50",
    },
    {
      name: "Calendly",
      desc: "Calendly is an appointment scheduling tool that automates meeting invitations,...",
      icon: <CalendarDays className="w-5 h-5 text-sky-500" />,
      bg: "bg-sky-50",
    },
    {
      name: "GitHub",
      desc: "GitHub is a code hosting platform for version control and collaboration, offeri...",
      icon: <GitBranch className="w-5 h-5 text-slate-700" />,
      bg: "bg-slate-100",
    },
    {
      name: "Gmail",
      desc: "Gmail is Google's email service, featuring spam protection, search functions, and...",
      icon: <Mail className="w-5 h-5 text-red-500" />,
      bg: "bg-red-50",
    },
    {
      name: "Google Calendar",
      desc: "Google Calendar is a time management tool providing scheduling features, even...",
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      name: "Google Docs",
      desc: "Google Docs is a cloud-based word processor with real-time collaboration,...",
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50",
    },
    {
      name: "Google Drive",
      desc: "Google Drive is a cloud storage solution for uploading, sharing, and collaboratin...",
      icon: <HardDrive className="w-5 h-5 text-green-500" />,
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Search Bar */}
      <div className="relative shrink-0">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search integrations..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-200 transition-all shadow-sm"
        />
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-2 gap-4 pb-8">
        {integrations.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow group"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100", item.bg)}>
              {item.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-slate-900 truncate">
                {item.name}
              </h3>
              <p className="text-[13px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <button className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
              <Link2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
