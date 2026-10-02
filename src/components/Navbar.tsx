import React from 'react';
import { Navigation, Route, Cpu, BookOpen, Layers, PlusCircle, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'comparison' | 'visualizer' | 'viva';
  setActiveTab: (tab: 'map' | 'comparison' | 'visualizer' | 'viva') => void;
  onOpenAddLocation: () => void;
  onResetGraph: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddLocation,
  onResetGraph,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white shrink-0 sticky top-0 z-30 shadow-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-inner">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Smart Delivery Route Planner
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              DAA Engine v2.4
            </span>
          </h1>
        </div>
      </div>

      {/* Zone 2: 4 clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'map'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          3D Delivery City
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'comparison'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Route className="w-4 h-4" />
          Route Savings
        </button>
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'visualizer'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Algorithm Simulation
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === 'viva'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Viva Guide
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAddLocation}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Stop</span>
        </button>
        <button
          onClick={onResetGraph}
          title="Reset Graph Data & Traffic"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
