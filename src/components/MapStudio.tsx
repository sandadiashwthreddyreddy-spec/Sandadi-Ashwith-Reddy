import React, { useState } from 'react';
import { CityGraph, LocationNode, Edge, TSPResult } from '../types';
import { Play, AlertTriangle, CheckCircle2, Clock, Fuel, ShieldAlert, Sparkles, Navigation, MapPin } from 'lucide-react';

interface MapStudioProps {
  graph: CityGraph;
  onUpdateGraph: (newGraph: CityGraph) => void;
  tspResult: TSPResult;
  onRunOptimization: () => void;
  selectedDeliveryIds: string[];
  onToggleDeliverySelection: (id: string) => void;
}

export const MapStudio: React.FC<MapStudioProps> = ({
  graph,
  onUpdateGraph,
  tspResult,
  onRunOptimization,
  selectedDeliveryIds,
  onToggleDeliverySelection,
}) => {
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  // Handle traffic update on an edge
  const handleUpdateTraffic = (edgeId: string, multiplier: number, isBlocked: boolean) => {
    const updatedEdges = graph.edges.map(e => {
      if (e.id === edgeId) {
        return { ...e, trafficMultiplier: multiplier, isBlocked };
      }
      return e;
    });
    onUpdateGraph({ ...graph, edges: updatedEdges });
  };

  // Handle global traffic multiplier slider change (1.0 to 5.0)
  const [globalTraffic, setGlobalTraffic] = useState<number>(1.0);
  const handleGlobalTrafficChange = (val: number) => {
    setGlobalTraffic(val);
    const updatedEdges = graph.edges.map(e => {
      if (e.isBlocked) return e;
      return { ...e, trafficMultiplier: val };
    });
    onUpdateGraph({ ...graph, edges: updatedEdges });
  };

  // Start delivery van animation along fullExpandedPath
  const handleStartAnimation = () => {
    if (tspResult.fullExpandedPath.length < 2) return;
    setIsAnimating(true);
    setAnimProgress(0);

    const startTime = performance.now();
    const duration = 4000; // 4 seconds tour animation

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animateFrame);
  };

  // Compute animated vehicle position based on animProgress along fullExpandedPath
  const getVehicleCoordinates = () => {
    const path = tspResult.fullExpandedPath;
    if (path.length < 2) {
      const wh = graph.nodes.find(n => n.type === 'warehouse') || graph.nodes[0];
      return { x: wh.x, y: wh.y };
    }

    const totalSegments = path.length - 1;
    const scaledProgress = animProgress * totalSegments;
    const currentSegmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentFraction = scaledProgress - currentSegmentIndex;

    const fromNode = graph.nodes.find(n => n.id === path[currentSegmentIndex]);
    const toNode = graph.nodes.find(n => n.id === path[currentSegmentIndex + 1]);

    if (!fromNode || !toNode) {
      const wh = graph.nodes.find(n => n.type === 'warehouse') || graph.nodes[0];
      return { x: wh.x, y: wh.y };
    }

    const x = fromNode.x + (toNode.x - fromNode.x) * segmentFraction;
    const y = fromNode.y + (toNode.y - fromNode.y) * segmentFraction;

    return { x, y };
  };

  const vehiclePos = getVehicleCoordinates();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6 max-w-[1600px] mx-auto">
      {/* Left 3 Columns: Interactive Map Canvas */}
      <div className="xl:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              City Road Network & TSP Bitmask DP Solver
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Interactive node graph with Dijkstra shortest-path edge weights and real-time traffic simulation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRunOptimization}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run TSP DP Optimizer</span>
            </button>
            <button
              onClick={handleStartAnimation}
              disabled={isAnimating || tspResult.optimizedNodeIds.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl font-medium text-sm transition-all border border-slate-700"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span>{isAnimating ? 'Simulating Route...' : 'Animate Delivery Van'}</span>
            </button>
          </div>
        </div>

        {/* SVG Graph Canvas */}
        <div className="relative w-full aspect-[4/3] max-h-[700px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              </pattern>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="1000" height="1000" fill="url(#grid)" />

            {/* Render Edges (Roads) */}
            {graph.edges.map(edge => {
              const fromN = graph.nodes.find(n => n.id === edge.fromNodeId);
              const toN = graph.nodes.find(n => n.id === edge.toNodeId);
              if (!fromN || !toN) return null;

              // Check if edge is part of the optimized path
              const path = tspResult.fullExpandedPath;
              let isPartOfOptimizedPath = false;
              for (let i = 0; i < path.length - 1; i++) {
                if (
                  (path[i] === edge.fromNodeId && path[i + 1] === edge.toNodeId) ||
                  (path[i] === edge.toNodeId && path[i + 1] === edge.fromNodeId)
                ) {
                  isPartOfOptimizedPath = true;
                  break;
                }
              }

              const midX = (fromN.x + toN.x) / 2;
              const midY = (fromN.y + toN.y) / 2;

              let strokeColor = 'rgba(100, 116, 139, 0.3)';
              let strokeWidth = 3;

              if (edge.isBlocked) {
                strokeColor = 'rgba(239, 68, 68, 0.8)';
                strokeWidth = 4;
              } else if (isPartOfOptimizedPath) {
                strokeColor = '#10b981'; // emerald
                strokeWidth = 6;
              } else if (edge.trafficMultiplier > 1.5) {
                strokeColor = 'rgba(245, 158, 11, 0.7)'; // amber
                strokeWidth = 4;
              }

              return (
                <g key={edge.id} className="cursor-pointer group" onClick={() => setActiveEdgeId(edge.id)}>
                  <line
                    x1={fromN.x}
                    y1={fromN.y}
                    x2={toN.x}
                    y2={toN.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={edge.isBlocked ? '6,6' : undefined}
                    className="transition-all duration-300 hover:stroke-emerald-400"
                  />
                  {/* Edge Label / Weight */}
                  <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                    <rect
                      x="-24"
                      y="-12"
                      width="48"
                      height="24"
                      rx="6"
                      fill="#0f172a"
                      stroke={edge.isBlocked ? '#ef4444' : isPartOfOptimizedPath ? '#10b981' : '#334155'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      fill="#e2e8f0"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="font-semibold"
                    >
                      {edge.isBlocked ? 'BLOCKED' : `${(edge.baseDistance * edge.trafficMultiplier).toFixed(1)}km`}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Render Nodes */}
            {graph.nodes.map(node => {
              const isWarehouse = node.type === 'warehouse';
              const isSelected = isWarehouse || selectedDeliveryIds.includes(node.id);
              const isHovered = hoveredNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform"
                  onClick={() => !isWarehouse && onToggleDeliverySelection(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Outer Pulse ring if selected or hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={isWarehouse ? 36 : 28}
                      fill="none"
                      stroke={isWarehouse ? '#3b82f6' : '#10b981'}
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}

                  {/* Node Background Circle */}
                  <circle
                    r={isWarehouse ? 26 : 20}
                    fill={isWarehouse ? '#1e40af' : isSelected ? '#065f46' : '#1e293b'}
                    stroke={isWarehouse ? '#60a5fa' : isSelected ? '#34d399' : '#475569'}
                    strokeWidth="3"
                    filter={isHovered ? 'url(#glow)' : undefined}
                  />

                  {/* Node Icon / Text */}
                  <text
                    x="0"
                    y="6"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none select-none font-mono"
                  >
                    {isWarehouse ? 'WH' : node.id.replace('del-', 'D')}
                  </text>

                  {/* Node Label Card */}
                  <g transform="translate(0, 32)" className="pointer-events-none">
                    <rect
                      x="-70"
                      y="0"
                      width="140"
                      height="26"
                      rx="6"
                      fill="#020617"
                      fillOpacity="0.85"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="16"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                      className="truncate px-2"
                    >
                      {node.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Animated Delivery Van */}
            {isAnimating && (
              <g transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`} className="transition-all">
                <circle r="16" fill="#f59e0b" filter="url(#glow)" className="animate-ping opacity-75" />
                <circle r="14" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="5" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">
                  🚚
                </text>
              </g>
            )}
          </svg>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-4 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-400" />
              <span>Warehouse</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400" />
              <span>Active Stop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1.5 bg-emerald-500 rounded" />
              <span>Optimized Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1.5 bg-red-500 border border-dashed border-red-300 rounded" />
              <span>Blocked Road</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Stops Management & Traffic Control Panel */}
      <div className="space-y-6">
        {/* Delivery Stops Selector */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
            <span>Delivery Stops ({selectedDeliveryIds.length} Active)</span>
            <span className="text-[11px] text-emerald-400 font-mono">TSP Bitmask DP</span>
          </h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {graph.nodes
              .filter(n => n.type === 'delivery')
              .map(node => {
                const isSelected = selectedDeliveryIds.includes(node.id);
                return (
                  <div
                    key={node.id}
                    onClick={() => onToggleDeliverySelection(node.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : '+'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{node.name}</p>
                        <p className="text-[10px] text-slate-400">{node.address}</p>
                      </div>
                    </div>
                    {node.priority && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          node.priority === 'urgent'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : node.priority === 'express'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {node.priority}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Global Traffic Multiplier Slider */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Global Traffic Multiplier
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {globalTraffic.toFixed(1)}x
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Adjust city-wide traffic congestion factor. Scales travel times across all active roads dynamically.
          </p>
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={globalTraffic}
              onChange={e => handleGlobalTrafficChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1.0x (Clear)</span>
              <span>3.0x (Rush Hour)</span>
              <span>5.0x (Gridlock)</span>
            </div>
          </div>
        </div>

        {/* Selected Road Traffic Inspector */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Road Traffic & Simulation
          </h3>
          {activeEdgeId ? (() => {
            const edge = graph.edges.find(e => e.id === activeEdgeId);
            if (!edge) return <p className="text-xs text-slate-400">Road not found</p>;
            const fromN = graph.nodes.find(n => n.id === edge.fromNodeId);
            const toN = graph.nodes.find(n => n.id === edge.toNodeId);

            return (
              <div className="space-y-4">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <p className="text-xs font-semibold text-white">
                    {fromN?.name} ⇄ {toN?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Base Distance: <span className="font-mono text-emerald-400">{edge.baseDistance} km</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-medium">Traffic Condition</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleUpdateTraffic(edge.id, 1.0, false)}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border transition-all ${
                        !edge.isBlocked && edge.trafficMultiplier === 1.0
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      Clear (1.0x)
                    </button>
                    <button
                      onClick={() => handleUpdateTraffic(edge.id, 1.8, false)}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border transition-all ${
                        !edge.isBlocked && edge.trafficMultiplier > 1.0 && edge.trafficMultiplier <= 2.0
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      Heavy (1.8x)
                    </button>
                    <button
                      onClick={() => handleUpdateTraffic(edge.id, 1.0, true)}
                      className={`py-2 px-2 text-xs rounded-lg font-medium border transition-all ${
                        edge.isBlocked
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      Block Road
                    </button>
                  </div>
                </div>
              </div>
            );
          })() : (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              Click any road line on the map to modify traffic conditions or simulate road closures.
            </p>
          )}
        </div>

        {/* Live Metrics Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 rounded-2xl border border-emerald-500/30 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Optimized Tour Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Distance</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{tspResult.totalDistance} km</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Time</span>
              <span className="text-lg font-bold font-mono text-amber-400">{tspResult.estimatedTimeMinutes} mins</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fuel Used</span>
              <span className="text-sm font-bold font-mono text-blue-400">{tspResult.fuelUsedLiters} L</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">DP States</span>
              <span className="text-sm font-bold font-mono text-purple-400">{tspResult.dpStatesCount} states</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
