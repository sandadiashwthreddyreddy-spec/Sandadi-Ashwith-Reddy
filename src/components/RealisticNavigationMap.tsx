import React, { useState, useEffect, useRef } from 'react';
import { CityGraph, LocationNode, TSPResult } from '../types';
import { Play, Pause, ZoomIn, ZoomOut, RotateCcw, Navigation, MapPin, Search, Layers, Clock, Fuel, ShieldAlert, CheckCircle2, ChevronRight, Package, AlertCircle } from 'lucide-react';

interface RealisticNavigationMapProps {
  graph: CityGraph;
  tspResult: TSPResult;
  selectedDeliveryIds: string[];
  onToggleDeliverySelection: (id: string) => void;
}

export const RealisticNavigationMap: React.FC<RealisticNavigationMapProps> = ({
  graph,
  tspResult,
  selectedDeliveryIds,
  onToggleDeliverySelection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<LocationNode | null>(graph.nodes[1]); // Default select first delivery
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Animation loop for realistic delivery van
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isAnimating) {
        setAnimProgress(prev => {
          const next = prev + delta * 0.2; // 5 seconds tour
          if (next >= 1) {
            setIsAnimating(false);
            return 1;
          }
          return next;
        });
      }

      drawNavigationMap();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [graph, tspResult, zoom, panX, panY, animProgress, isAnimating, selectedNode]);

  const drawNavigationMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 1200;
    const height = 750;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Modern Navigation Map Light Palette (Google/Apple Maps style)
    ctx.fillStyle = '#f8fafc'; // soft map land background
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(zoom, zoom);

    const offsetX = -500;
    const offsetY = -500;

    // 1. Draw Parks & Water Features
    ctx.fillStyle = '#dcfce7'; // soft green park
    ctx.beginPath();
    ctx.roundRect(offsetX + 80, offsetY + 80, 280, 220, 20);
    ctx.roundRect(offsetX + 620, offsetY + 580, 300, 260, 20);
    ctx.fill();

    // 2. Draw Realistic City Roads & Sidewalks
    graph.edges.forEach(edge => {
      const fromN = graph.nodes.find(n => n.id === edge.fromNodeId);
      const toN = graph.nodes.find(n => n.id === edge.toNodeId);
      if (!fromN || !toN) return;

      const x1 = fromN.x + offsetX;
      const y1 = fromN.y + offsetY;
      const x2 = toN.x + offsetX;
      const y2 = toN.y + offsetY;

      // Sidewalk / Curb
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Asphalt Road
      ctx.strokeStyle = edge.isBlocked ? '#fca5a5' : '#64748b';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Center Lane Dashes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 3. Highlight Optimized Navigation Route (Snapping cleanly along roads)
    const path = tspResult.fullExpandedPath;
    for (let i = 0; i < path.length - 1; i++) {
      const n1 = graph.nodes.find(n => n.id === path[i]);
      const n2 = graph.nodes.find(n => n.id === path[i + 1]);
      if (!n1 || !n2) continue;

      ctx.strokeStyle = '#0284c7'; // Navigation Blue
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(n1.x + offsetX, n1.y + offsetY);
      ctx.lineTo(n2.x + offsetX, n2.y + offsetY);
      ctx.stroke();
    }

    // 4. Draw Realistic Buildings, Universities, Malls & Houses
    const realBuildings = [
      { x: 220, y: 220, w: 100, h: 70, name: 'Malla Reddy Tech Campus', type: 'campus' },
      { x: 780, y: 160, w: 110, h: 75, name: 'Malla Reddy University', type: 'campus' },
      { x: 340, y: 760, w: 100, h: 80, name: 'Malla Reddy Deemed Univ', type: 'campus' },
      { x: 820, y: 720, w: 90, h: 70, name: 'Sunrise Apartments', type: 'apartment' },
      { x: 260, y: 520, w: 80, h: 65, name: 'Vijetha Supermarket', type: 'shop' },
      { x: 840, y: 440, w: 100, h: 75, name: 'Yashoda Hospital', type: 'hospital' },
      { x: 500, y: 440, w: 90, h: 70, name: 'Kompally Hub Warehouse', type: 'warehouse' },
    ];

    realBuildings.forEach(b => {
      const bx = b.x + offsetX;
      const by = b.y + offsetY;

      // Building footprint shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(bx - b.w / 2 + 4, by - b.h / 2 + 4, b.w, b.h);

      // Building base
      ctx.fillStyle = b.type === 'campus' ? '#fed7aa' : b.type === 'hospital' ? '#fee2e2' : b.type === 'shop' ? '#fef08a' : '#e2e8f0';
      ctx.strokeStyle = b.type === 'campus' ? '#ea580c' : b.type === 'hospital' ? '#dc2626' : b.type === 'shop' ? '#ca8a04' : '#475569';
      ctx.lineWidth = 2;
      ctx.fillRect(bx - b.w / 2, by - b.h / 2, b.w, b.h);
      ctx.strokeRect(bx - b.w / 2, by - b.h / 2, b.w, b.h);

      // Roof Accent
      ctx.fillStyle = b.type === 'campus' ? '#c2410c' : b.type === 'hospital' ? '#b91c1c' : '#334155';
      ctx.fillRect(bx - b.w / 2 + 8, by - b.h / 2 + 8, b.w - 16, 12);

      // Label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.name, bx, by + b.h / 2 + 16);
    });

    // 5. Draw Trees
    const mapTrees = [
      { x: 180, y: 250 }, { x: 330, y: 220 }, { x: 740, y: 190 },
      { x: 300, y: 780 }, { x: 880, y: 750 }, { x: 220, y: 550 },
      { x: 900, y: 480 }, { x: 550, y: 460 }, { x: 450, y: 550 }
    ];

    mapTrees.forEach(t => {
      const tx = t.x + offsetX;
      const ty = t.y + offsetY;
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tx, ty, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(tx, ty - 2, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Draw Delivery Location Markers (Pins)
    graph.nodes.forEach(node => {
      const nx = node.x + offsetX;
      const ny = node.y + offsetY;
      const isWarehouse = node.type === 'warehouse';
      const isSelected = selectedNode?.id === node.id;

      // Pin drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(nx, ny + 4, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pin head
      ctx.fillStyle = isWarehouse ? '#2563eb' : isSelected ? '#16a34a' : '#0284c7';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nx, ny - 10, isSelected ? 16 : 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pin Icon text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isWarehouse ? 'WH' : node.id.replace('del-', 'D'), nx, ny - 10);
    });

    // 7. Draw Moving Delivery Van
    if (path.length >= 2) {
      const totalSegments = path.length - 1;
      const scaledProgress = animProgress * totalSegments;
      const segIdx = Math.min(Math.floor(scaledProgress), totalSegments - 1);
      const segFrac = scaledProgress - segIdx;

      const nFrom = graph.nodes.find(n => n.id === path[segIdx]);
      const nTo = graph.nodes.find(n => n.id === path[segIdx + 1]);

      if (nFrom && nTo) {
        const vx = (nFrom.x + (nTo.x - nFrom.x) * segFrac) + offsetX;
        const vy = (nFrom.y + (nTo.y - nFrom.y) * segFrac) + offsetY;

        // Van shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(vx, vy + 6, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Van body
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.fillRect(vx - 14, vy - 10, 28, 16);
        ctx.strokeRect(vx - 14, vy - 10, 28, 16);

        // Windshield
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(vx + 4, vy - 8, 8, 12);

        // Emoji
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚚', vx, vy - 2);
      }
    }

    ctx.restore();
  };

  // Canvas click handler to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const offsetX = -500;
    const offsetY = -500;

    // Transform click to world coordinates
    const worldX = (clickX - (width / 2 + panX)) / zoom - offsetX;
    const worldY = (clickY - (height / 2 + panY)) / zoom - offsetY;

    // Find clicked node
    const clicked = graph.nodes.find(n => {
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (clicked) {
      setSelectedNode(clicked);
    }
  };

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
      {/* Search & Navigation Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-sky-600" />
            Hyderabad Urban Delivery Navigation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-world route planning centered around Kompally, Maisammaguda, Suraram, and Secunderabad campuses.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search campuses, apartments..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={() => { setIsAnimating(true); setAnimProgress(0); }}
            disabled={isAnimating}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-sky-600/20 transition-all whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            <span>{isAnimating ? 'Navigating...' : 'Start Route'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Map Viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xl relative overflow-hidden flex flex-col">
          <div
            className="w-full aspect-[4/3] max-h-[700px] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-full block"
            />

            {/* Map Controls Floating Bar */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md">
              <button
                onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoom(1.1); setPanX(0); setPanY(0); }}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-4 shadow-md pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
                <span>Warehouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-600 border border-white" />
                <span>Delivery Stop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1.5 bg-sky-500 rounded" />
                <span>Optimized Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🚚</span>
                <span>Van</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Location Inspection Card & Delivery Queue */}
        <div className="space-y-6">
          {/* Selected Location Card */}
          {selectedNode ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-semibold">Selected Location</span>
                    <h3 className="text-sm font-bold text-slate-900">{selectedNode.name}</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Address</span>
                  <span className="font-medium text-slate-800 text-right">{selectedNode.address}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Package Count</span>
                  <span className="font-semibold text-slate-900 font-mono">14 Parcels</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Priority Level</span>
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    selectedNode.priority === 'urgent' ? 'bg-red-50 text-red-700 border border-red-200' :
                    selectedNode.priority === 'express' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    {selectedNode.priority || 'Normal'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Delivery Status</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> En Route
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Estimated ETA</span>
                  <span className="font-mono font-bold text-slate-900">12:45 PM</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl text-center text-slate-400 text-xs py-8">
              Click any pin on the realistic map to inspect customer and package details.
            </div>
          )}

          {/* Delivery Queue Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Optimized Stops ({tspResult.optimizedNodeIds.length - 2})</span>
              <span className="text-[11px] text-sky-600 font-mono">TSP Bitmask DP</span>
            </h3>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {tspResult.optimizedNodeIds.slice(0, -1).map((nodeId, idx) => {
                const node = graph.nodes.find(n => n.id === nodeId);
                if (!node) return null;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedNode(node)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-sky-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{node.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{node.address}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
