import React, { useState, useEffect, useRef } from 'react';
import { CityGraph, TSPResult } from '../types';
import { Play, Pause, Sun, Sunset, Moon, ZoomIn, ZoomOut, RotateCcw, Navigation, Eye, Sparkles, AlertTriangle, CheckCircle2, Clock, Fuel, ShieldAlert } from 'lucide-react';

interface City3DMapProps {
  graph: CityGraph;
  tspResult: TSPResult;
  selectedDeliveryIds: string[];
  onToggleDeliverySelection: (id: string) => void;
  onRunOptimization: () => void;
}

type LightingMode = 'day' | 'evening' | 'night';

export const City3DMap: React.FC<City3DMapProps> = ({
  graph,
  tspResult,
  selectedDeliveryIds,
  onToggleDeliverySelection,
  onRunOptimization,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [zoom, setZoom] = useState<number>(1.0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [followVehicle, setFollowVehicle] = useState<boolean>(true);

  // Animation loop for delivery van & background traffic
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isAnimating) {
        setAnimProgress(prev => {
          const next = prev + delta * 0.25; // 4 seconds full tour
          if (next >= 1) {
            setIsAnimating(false);
            return 1;
          }
          return next;
        });
      }

      drawCityCanvas();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [graph, tspResult, lightingMode, zoom, panX, panY, animProgress, isAnimating]);

  const drawCityCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const width = canvas.parentElement?.clientWidth || 1200;
    const height = 750;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear background based on lighting mode
    let bgColor = '#090d16';
    if (lightingMode === 'day') bgColor = '#0f172a';
    else if (lightingMode === 'evening') bgColor = '#1e1b4b';
    else if (lightingMode === 'night') bgColor = '#020617';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(zoom, zoom);

    // Coordinate transformation offset
    const offsetX = -500;
    const offsetY = -500;

    // 1. Draw Ground Grass / Terrain Blocks
    ctx.fillStyle = lightingMode === 'night' ? '#061a14' : lightingMode === 'evening' ? '#14281f' : '#0f291e';
    ctx.fillRect(offsetX, offsetY, 1000, 1000);

    // Draw Parks / Landscaped areas
    ctx.fillStyle = lightingMode === 'night' ? '#09261b' : '#163827';
    ctx.fillRect(offsetX + 100, offsetY + 100, 250, 200);
    ctx.fillRect(offsetX + 650, offsetY + 600, 220, 250);

    // 2. Draw Asphalt Roads & Sidewalks
    graph.edges.forEach(edge => {
      const fromN = graph.nodes.find(n => n.id === edge.fromNodeId);
      const toN = graph.nodes.find(n => n.id === edge.toNodeId);
      if (!fromN || !toN) return;

      const x1 = fromN.x + offsetX;
      const y1 = fromN.y + offsetY;
      const x2 = toN.x + offsetX;
      const y2 = toN.y + offsetY;

      // Sidewalk
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Asphalt Road
      ctx.strokeStyle = edge.isBlocked ? '#ef4444' : '#1e293b';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Road Center Markings (Yellow/White dashed)
      ctx.strokeStyle = lightingMode === 'night' ? '#fbbf24' : '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Highlight Optimized Route on Roads
    const path = tspResult.fullExpandedPath;
    for (let i = 0; i < path.length - 1; i++) {
      const n1 = graph.nodes.find(n => n.id === path[i]);
      const n2 = graph.nodes.find(n => n.id === path[i + 1]);
      if (!n1 || !n2) continue;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(n1.x + offsetX, n1.y + offsetY);
      ctx.lineTo(n2.x + offsetX, n2.y + offsetY);
      ctx.stroke();
    }

    // 3. Draw Commercial Buildings & Residential Houses (3D Isometric / Extruded representation)
    const decorativeBuildings = [
      { x: 300, y: 200, w: 90, h: 70, type: 'commercial', name: 'Metro Supermarket' },
      { x: 650, y: 300, w: 110, h: 80, type: 'commercial', name: 'TechPark Tower' },
      { x: 150, y: 700, w: 80, h: 90, type: 'residential', name: 'Oakwood House' },
      { x: 800, y: 700, w: 95, h: 85, type: 'residential', name: 'Pinecrest Villa' },
      { x: 500, y: 200, w: 100, h: 60, type: 'commercial', name: 'Central Plaza' },
      { x: 200, y: 450, w: 75, h: 75, type: 'residential', name: 'Suburban Home' },
    ];

    decorativeBuildings.forEach(b => {
      const bx = b.x + offsetX;
      const by = b.y + offsetY;

      // Drop Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(bx - b.w / 2 + 10, by - b.h / 2 + 10, b.w, b.h);

      // Building Base Wall
      ctx.fillStyle = b.type === 'commercial' ? '#334155' : '#475569';
      ctx.fillRect(bx - b.w / 2, by - b.h / 2, b.w, b.h);

      // Roof
      ctx.fillStyle = b.type === 'commercial' ? '#1e293b' : '#991b1b';
      ctx.fillRect(bx - b.w / 2 + 6, by - b.h / 2 + 6, b.w - 12, b.h - 12);

      // Windows / Signage glow in night mode
      if (lightingMode === 'night') {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(bx - 20, by - 10, 10, 10);
        ctx.fillRect(bx + 10, by - 10, 10, 10);
        ctx.fillRect(bx - 20, by + 10, 10, 10);
      }

      // Label
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, bx, by + b.h / 2 + 14);
    });

    // 4. Draw Trees & Vegetation
    const trees = [
      { x: 380, y: 250 }, { x: 420, y: 280 }, { x: 120, y: 650 },
      { x: 720, y: 650 }, { x: 580, y: 350 }, { x: 250, y: 200 },
      { x: 850, y: 450 }, { x: 150, y: 350 }, { x: 600, y: 750 }
    ];

    trees.forEach(t => {
      const tx = t.x + offsetX;
      const ty = t.y + offsetY;
      // Trunk
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 3, ty - 3, 6, 12);
      // Foliage
      ctx.fillStyle = lightingMode === 'night' ? '#065f46' : '#047857';
      ctx.beginPath();
      ctx.arc(tx, ty - 6, 14, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Draw Actual Graph Nodes (Warehouse & Delivery Locations)
    graph.nodes.forEach(node => {
      const nx = node.x + offsetX;
      const ny = node.y + offsetY;
      const isWarehouse = node.type === 'warehouse';
      const isSelected = isWarehouse || selectedDeliveryIds.includes(node.id);

      // Node shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.arc(nx + 3, ny + 3, isWarehouse ? 24 : 18, 0, Math.PI * 2);
      ctx.fill();

      // Node circle
      ctx.fillStyle = isWarehouse ? '#1e40af' : isSelected ? '#065f46' : '#1e293b';
      ctx.strokeStyle = isWarehouse ? '#60a5fa' : isSelected ? '#34d399' : '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nx, ny, isWarehouse ? 22 : 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Icon / Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isWarehouse ? 'WH' : node.id.replace('del-', 'D'), nx, ny);

      // Name Banner
      ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const textWidth = ctx.measureText(node.name).width;
      ctx.fillRect(nx - textWidth / 2 - 8, ny + 22, textWidth + 16, 20);
      ctx.strokeRect(nx - textWidth / 2 - 8, ny + 22, textWidth + 16, 20);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px sans-serif';
      ctx.fillText(node.name, nx, ny + 32);
    });

    // 6. Draw Moving Delivery Van along optimized route
    const pathNodes = tspResult.fullExpandedPath;
    if (pathNodes.length >= 2) {
      const totalSegments = pathNodes.length - 1;
      const scaledProgress = animProgress * totalSegments;
      const segIdx = Math.min(Math.floor(scaledProgress), totalSegments - 1);
      const segFrac = scaledProgress - segIdx;

      const nFrom = graph.nodes.find(n => n.id === pathNodes[segIdx]);
      const nTo = graph.nodes.find(n => n.id === pathNodes[segIdx + 1]);

      if (nFrom && nTo) {
        const vx = (nFrom.x + (nTo.x - nFrom.x) * segFrac) + offsetX;
        const vy = (nFrom.y + (nTo.y - nFrom.y) * segFrac) + offsetY;

        // Van shadow
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.ellipse(vx, vy + 8, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Van Body
        ctx.fillStyle = '#f59e0b'; // amber delivery van
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.fillRect(vx - 14, vy - 10, 28, 18);
        ctx.strokeRect(vx - 14, vy - 10, 28, 18);

        // Windshield
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(vx + 4, vy - 8, 8, 14);

        // Van Icon / Emoji
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚚', vx, vy - 2);
      }
    }

    ctx.restore();
  };

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-400" />
            Realistic 3D City Delivery Environment
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immersive 3D neighborhood simulation with buildings, houses, roadside trees, traffic, and live delivery van routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Lighting Mode Selector */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setLightingMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                lightingMode === 'day' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Day
            </button>
            <button
              onClick={() => setLightingMode('evening')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                lightingMode === 'evening' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sunset className="w-3.5 h-3.5" />
              Evening
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                lightingMode === 'night' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Night
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoom(1.0); setPanX(0); setPanY(0); }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Animate Delivery Van CTA */}
          <button
            onClick={() => { setIsAnimating(true); setAnimProgress(0); }}
            disabled={isAnimating}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>{isAnimating ? 'Van En Route...' : 'Start Delivery Tour'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl relative overflow-hidden flex flex-col">
          <div
            className="w-full aspect-[4/3] max-h-[700px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Floating Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-4 shadow-lg pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-400" />
                <span>Warehouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400" />
                <span>Delivery Stop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 bg-emerald-500 rounded" />
                <span>Optimized Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🚚</span>
                <span>Delivery Van</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Active Deliveries & Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span>Delivery Stops ({selectedDeliveryIds.length})</span>
              <span className="text-[11px] text-emerald-400 font-mono">Live 3D City</span>
            </h3>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
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

          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 rounded-2xl border border-emerald-500/30 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Tour Statistics
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
    </div>
  );
};
