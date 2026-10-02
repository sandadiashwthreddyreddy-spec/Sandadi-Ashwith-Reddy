import React from 'react';
import { BookOpen, CheckCircle2, Layers, Cpu, ShieldCheck } from 'lucide-react';

export const VivaGuide: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>DAA Hackathon Viva & Technical Documentation</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Smart Delivery Route Planner: Algorithmic Architecture
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl">
          Designed to demonstrate rigorous Design and Analysis of Algorithms (DAA) principles, combining Graph Theory, Greedy Single-Source Shortest Paths, and Exact Combinatorial Optimization.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Dijkstra's Algorithm */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              01
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dijkstra's Algorithm (Shortest Path)</h3>
              <p className="text-xs text-slate-400">Single-Source Shortest Path on Weighted Graphs</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Used to calculate the shortest road distance between any two intersections or hubs on the city grid, taking into account base distance, traffic multipliers, and road blockages.
            </p>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
              <p className="font-semibold text-white">Complexity Analysis:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                <li>Time Complexity: <span className="text-emerald-400 font-bold">O((V + E) log V)</span> using a Min-Priority Queue (Binary Heap).</li>
                <li>Space Complexity: <span className="text-emerald-400 font-bold">O(V + E)</span> for adjacency list representation and distance arrays.</li>
              </ul>
            </div>
            <p>
              <strong className="text-white">Greedy Choice Property:</strong> At every step, Dijkstra greedily selects the unvisited node with the smallest tentative distance from the start node, guaranteeing optimality for non-negative edge weights.
            </p>
          </div>
        </div>

        {/* Section 2: Travelling Salesman Problem (TSP) */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              02
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Travelling Salesman Problem (Bitmask DP)</h3>
              <p className="text-xs text-slate-400">Exact Combinatorial Optimization</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              To visit all delivery locations and return to the warehouse with minimum total distance, naive brute-force checks <span className="font-mono text-amber-400">O(N!)</span> permutations. We implement Dynamic Programming with Bitmask to eliminate redundant subproblems.
            </p>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
              <p className="font-semibold text-white">Complexity Analysis:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono">
                <li>Time Complexity: <span className="text-emerald-400 font-bold">O(N² · 2ᴺ)</span> where N is the number of delivery stops.</li>
                <li>Space Complexity: <span className="text-emerald-400 font-bold">O(N · 2ᴺ)</span> for the DP state table <code className="text-emerald-400">dp[mask][u]</code>.</li>
              </ul>
            </div>
            <p>
              <strong className="text-white">Optimal Substructure:</strong> A sub-tour of an optimal tour is itself an optimal tour between its endpoints visiting the subset of nodes in the submask.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Viva Questions */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Frequently Asked Viva Questions & Answers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-white">Q: Why use Bitmask DP instead of Greedy Nearest Neighbor for TSP?</p>
            <p className="text-xs text-slate-300">
              A: Greedy Nearest Neighbor is fast (<span className="font-mono text-emerald-400">O(N²)</span>) but can get trapped in local optima resulting in suboptimal routes. Bitmask DP guarantees finding the <span className="font-semibold text-emerald-400">exact global minimum</span> tour.
            </p>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-white">Q: How do negative edge weights affect Dijkstra's algorithm?</p>
            <p className="text-xs text-slate-300">
              A: Dijkstra relies on the assumption that adding an edge never decreases path distance (non-negative weights). If negative weights exist, Bellman-Ford or SPFA must be used to detect negative cycles.
            </p>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-white">Q: What is the Vehicle Routing Problem (VRP) extension?</p>
            <p className="text-xs text-slate-300">
              A: VRP extends TSP by adding fleet capacity constraints, time windows for deliveries, and multiple vehicles operating concurrently from the warehouse.
            </p>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-white">Q: How is real-time traffic simulated in this graph?</p>
            <p className="text-xs text-slate-300">
              A: Edge weights are dynamically multiplied by a traffic factor (1.0x to 3.0x) or set to Infinity if blocked, immediately triggering path recalculation without changing graph topology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
