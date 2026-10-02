import React from 'react';
import { CityGraph, TSPResult } from '../types';
import { computeUnoptimizedRoute } from '../algorithms/tsp';
import { TrendingDown, Zap, Clock, Fuel, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RouteComparisonProps {
  graph: CityGraph;
  tspResult: TSPResult;
  selectedDeliveryIds: string[];
}

export const RouteComparison: React.FC<RouteComparisonProps> = ({
  graph,
  tspResult,
  selectedDeliveryIds,
}) => {
  const unoptimized = computeUnoptimizedRoute(graph, selectedDeliveryIds);

  const savingsDist = Number((unoptimized.totalDistance - tspResult.totalDistance).toFixed(2));
  const savingsDistPct = unoptimized.totalDistance > 0 
    ? Math.round((savingsDist / unoptimized.totalDistance) * 100) 
    : 0;

  const savingsTime = unoptimized.estimatedTimeMinutes - tspResult.estimatedTimeMinutes;
  const savingsFuel = Number((unoptimized.fuelUsedLiters - tspResult.fuelUsedLiters).toFixed(2));
  const savingsCo2 = Number((savingsFuel * 2.31).toFixed(2));

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Algorithmic Impact Analysis</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Unoptimized vs. TSP Bitmask DP Optimized Route
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Demonstrating how exact combinatorial optimization reduces fleet mileage, fuel expenditure, and carbon emissions compared to naive sequential routing.
          </p>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-center min-w-[200px]">
          <span className="text-xs text-emerald-300 uppercase tracking-wider block font-medium">Efficiency Gain</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-400">+{Math.max(0, savingsDistPct)}%</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Route Cost Minimized</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-400">
            <TrendingDown className="w-16 h-16" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Distance Saved</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{Math.max(0, savingsDist)}</span>
            <span className="text-sm font-medium text-emerald-400">km ({savingsDistPct}%)</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Unoptimized: {unoptimized.totalDistance} km → Optimized: {tspResult.totalDistance} km
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-400">
            <Clock className="w-16 h-16" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Time Saved</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{Math.max(0, savingsTime)}</span>
            <span className="text-sm font-medium text-amber-400">mins</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Estimated driver delivery turnaround time reduction.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-400">
            <Fuel className="w-16 h-16" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fuel Saved</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{Math.max(0, savingsFuel)}</span>
            <span className="text-sm font-medium text-blue-400">Liters</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Direct fleet operating cost reduction per trip.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-purple-400">
            <ShieldCheck className="w-16 h-16" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">CO2 Emissions Reduced</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{Math.max(0, savingsCo2)}</span>
            <span className="text-sm font-medium text-purple-400">kg</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Environmental impact mitigation using green algorithms.
          </p>
        </div>
      </div>

      {/* Side-by-Side Tour Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unoptimized Route Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Naive Sequential Route</h3>
              <p className="text-xs text-slate-400">Unoptimized order (Visited in insertion sequence)</p>
            </div>
            <div className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs font-mono font-semibold">
              {unoptimized.totalDistance} km
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {unoptimized.nodeIds.map((nodeId, idx) => {
              const node = graph.nodes.find(n => n.id === nodeId);
              if (!node) return null;
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{node.name}</p>
                    <p className="text-[10px] text-slate-400">{node.address}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimized TSP Route Card */}
        <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 p-6 shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                TSP Bitmask DP Optimized Tour
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Optimal
                </span>
              </h3>
              <p className="text-xs text-slate-400">Solved in {tspResult.computationTimeMs}ms via O(N² 2^N)</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-mono font-semibold">
              {tspResult.totalDistance} km
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {tspResult.optimizedNodeIds.map((nodeId, idx) => {
              const node = graph.nodes.find(n => n.id === nodeId);
              if (!node) return null;
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white">{node.name}</p>
                    <p className="text-[10px] text-slate-400">{node.address}</p>
                  </div>
                  {idx < tspResult.optimizedNodeIds.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-emerald-400 opacity-60" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
