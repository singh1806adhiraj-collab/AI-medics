import React from 'react';
import {
  Activity,
  BarChart3,
  Network,
  SlidersHorizontal,
  Bot,
  AlertCircle,
  ArrowRightLeft,
  RotateCcw,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  activeTab: 'command' | 'inventory' | 'network' | 'simulator' | 'assistant';
  setActiveTab: (tab: 'command' | 'inventory' | 'network' | 'simulator' | 'assistant') => void;
  criticalCount: number;
  transferOpportunityCount: number;
  session: UserSession;
  onResetData: () => void;
  onOpenManifests: () => void;
  onOpenUserSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  criticalCount,
  transferOpportunityCount,
  session,
  onResetData,
  onOpenManifests,
  onOpenUserSession,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Hackathon Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center shadow-lg shadow-teal-900/30 ring-1 ring-teal-400/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">AI-Medics</span>
                <span className="text-[11px] font-medium text-teal-400 tracking-wider uppercase bg-teal-950/70 border border-teal-800/60 px-1.5 py-0.2 rounded">
                  Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Smart Health & Supply Chain Resilience · Code for Communities 2.0
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('command')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'command'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Command Center</span>
              {criticalCount > 0 && (
                <span className="ml-0.5 bg-rose-500/90 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {criticalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Inventory Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('network')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'network'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Resource Network</span>
              {transferOpportunityCount > 0 && (
                <span className="ml-0.5 bg-cyan-500/90 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {transferOpportunityCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Scenario Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === 'assistant'
                  ? 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Operations</span>
            </button>
          </nav>

          {/* Quick Action Tools & User Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenManifests}
              title="View Authorized Transfer Manifests"
              className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
              <span>Dispatch Manifests</span>
            </button>

            <button
              onClick={onResetData}
              title="Reset inventory to initial baseline"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>

            {/* User Session & Role Profile Pill */}
            <button
              onClick={onOpenUserSession}
              title="Manage User Role & Authentication"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-950 border border-teal-800/80 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-semibold text-white leading-tight truncate max-w-[130px]">
                  {session.name}
                </div>
                <div className="text-[9px] text-teal-300 font-mono leading-tight truncate max-w-[130px]">
                  {session.role.replace('Director of Pharmacy Supply Chain', 'Pharmacy Director').replace('Regional Health Logistics Officer', 'Logistics Officer')}
                </div>
              </div>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  session.authenticated ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              ></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

