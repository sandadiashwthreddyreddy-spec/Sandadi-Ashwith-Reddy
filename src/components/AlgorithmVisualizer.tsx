import React, { useState } from 'react';
import { CityGraph, TSPResult } from '../types';
import { runDijkstra } from '../algorithms/dijkstra';
import { Cpu, Play, SkipForward, RotateCcw, Code, FileText, CheckCircle2 } from 'lucide-react';

interface AlgorithmVisualizerProps {
  graph: CityGraph;
  tspResult: TSPResult;
}

export const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({ graph, tspResult }) => {
  const [selectedAlgo, setSelectedAlgo] = useState<'dijkstra' | 'tsp'>('tsp');
  const [startNodeId, setStartNodeId] = useState(graph.nodes[0]?.id || '');
  const [endNodeId, setEndNodeId] = useState(graph.nodes[1]?.id || '');
  const [dijkstraStepIndex, setDijkstraStepIndex] = useState(0);

  const dijkstraRes = runDijkstra(graph, startNodeId, endNodeId);
  const currentDijkstraStep = dijkstraRes.steps[dijkstraStepIndex] || dijkstraRes.steps[dijkstraRes.steps.length - 1];

  return (
    <div className="max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Algorithm Selector Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            DAA Algorithm Execution & Trace Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Examine step-by-step state transitions, priority queue operations, and bitmask DP subproblems.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setSelectedAlgo('tsp')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              selectedAlgo === 'tsp' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            TSP Bitmask DP O(N² 2^N)
          </button>
          <button
            onClick={() => setSelectedAlgo('dijkstra')}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              selectedAlgo === 'dijkstra' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Dijkstra Shortest Path O((V+E) log V)
          </button>
        </div>
      </div>

      {selectedAlgo === 'tsp' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TSP DP State Explanation */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              Travelling Salesman Problem: Bitmask Dynamic Programming
            </h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 space-y-2">
                <p className="font-semibold text-white">Recurrence Relation:</p>
                <code className="block bg-slate-950 p-3 rounded-lg font-mono text-emerald-400 text-xs">
                  dp[mask][u] = min over v ( dp[mask ^ (1 &lt;&lt; u)][v] + dist(v, u) )
                </code>
                <p className="text-slate-400">
                  Where <code className="text-amber-400">mask</code> represents the bitset of visited delivery locations, and <code className="text-amber-400">u</code> is the current delivery stop.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Computation Time</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{tspResult.computationTimeMs} ms</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">DP States Evaluated</span>
                  <span className="text-xl font-bold font-mono text-blue-400">{tspResult.dpStatesCount}</span>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Dijkstra Runs</span>
                  <span className="text-xl font-bold font-mono text-purple-400">{tspResult.dijkstraRunsCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-white">Optimal Tour Sequence Computed:</p>
                <div className="flex flex-wrap gap-2">
                  {tspResult.optimizedNodeIds.map((id, idx) => {
                    const node = graph.nodes.find(n => n.id === id);
                    return (
                      <span key={idx} className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl font-mono text-xs text-emerald-300 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                        {node?.name || id}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pseudocode Panel */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Bitmask DP Pseudocode
            </h3>
            <pre className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
{`function solveTSP(graph):
  N = graph.deliveryCount
  dist = allPairsDijkstra()
  
  // dp[mask][u]
  dp = matrix(1 << N, N, Infinity)
  
  for u = 0 to N-1:
    dp[1 << u][u] = dist[0][u+1]
    
  for mask = 1 to (1 << N) - 1:
    for u = 0 to N-1:
      if not (mask & (1 << u)) continue
      for v = 0 to N-1:
        if mask & (1 << v) continue
        nextMask = mask | (1 << v)
        dp[nextMask][v] = min(
          dp[nextMask][v],
          dp[mask][u] + dist[u+1][v+1]
        )
        
  return minCostTour`}
            </pre>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dijkstra Trace Inspector */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Dijkstra Shortest Path Trace</h3>
              <div className="flex items-center gap-2">
                <select
                  value={startNodeId}
                  onChange={e => { setStartNodeId(e.target.value); setDijkstraStepIndex(0); }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono"
                >
                  {graph.nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
                <span className="text-slate-400 text-xs">to</span>
                <select
                  value={endNodeId}
                  onChange={e => { setEndNodeId(e.target.value); setDijkstraStepIndex(0); }}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs font-mono"
                >
                  {graph.nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step Controller Bar */}
            <div className="flex items-center justify-between bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDijkstraStepIndex(prev => Math.max(0, prev - 1))}
                  disabled={dijkstraStepIndex === 0}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs rounded-lg font-medium"
                >
                  Previous Step
                </button>
                <button
                  onClick={() => setDijkstraStepIndex(prev => Math.min(dijkstraRes.steps.length - 1, prev + 1))}
                  disabled={dijkstraStepIndex === dijkstraRes.steps.length - 1}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs rounded-lg font-medium"
                >
                  Next Step
                </button>
              </div>
              <span className="text-xs font-mono text-slate-300">
                Step {dijkstraStepIndex + 1} of {dijkstraRes.steps.length}
              </span>
            </div>

            {/* Current Step Details */}
            {currentDijkstraStep && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">Current Visited Node (Min Distance extracted from PQ):</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-1">
                    {graph.nodes.find(n => n.id === currentDijkstraStep.current)?.name || currentDijkstraStep.current}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-semibold text-white block mb-2">Distance Table State</span>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 font-mono text-xs">
                      {Object.entries(currentDijkstraStep.distances).map(([id, dist]) => {
                        const n = graph.nodes.find(node => node.id === id);
                        return (
                          <div key={id} className="flex justify-between text-slate-300">
                            <span>{n?.name || id}:</span>
                            <span className="text-emerald-400 font-bold">
                              {dist === Infinity ? '∞' : `${dist.toFixed(1)} km`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-semibold text-white block mb-2">Priority Queue Status</span>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 font-mono text-xs">
                      {currentDijkstraStep.queue.length === 0 ? (
                        <p className="text-slate-500 italic">Queue empty / search completed</p>
                      ) : (
                        currentDijkstraStep.queue.map((item, idx) => {
                          const n = graph.nodes.find(node => node.id === item.nodeId);
                          return (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span>{n?.name || item.nodeId}</span>
                              <span className="text-amber-400 font-bold">{item.dist.toFixed(1)} km</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dijkstra Pseudocode */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Dijkstra Pseudocode
            </h3>
            <pre className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
{`function dijkstra(graph, start, end):
  dist = map(node -> Infinity)
  prev = map(node -> null)
  dist[start] = 0
  pq = MinHeap([(0, start)])
  
  while pq is not empty:
    (uDist, u) = pq.extractMin()
    if u == end: break
    if uDist > dist[u]: continue
    
    for neighbor in graph.adj(u):
      alt = dist[u] + weight(u, neighbor)
      if alt < dist[neighbor]:
        dist[neighbor] = alt
        prev[neighbor] = u
        pq.push((alt, neighbor))
        
  return reconstructPath(prev, end)`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
