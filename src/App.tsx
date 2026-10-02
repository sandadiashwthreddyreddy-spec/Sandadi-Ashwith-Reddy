import React, { useState, useMemo } from 'react';
import { INITIAL_CITY_GRAPH } from './algorithms/graph';
import { solveTSP } from './algorithms/tsp';
import { CityGraph, LocationNode } from './types';
import { Navbar } from './components/Navbar';
import { RealisticNavigationMap } from './components/RealisticNavigationMap';
import { RouteComparison } from './components/RouteComparison';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import { VivaGuide } from './components/VivaGuide';
import { AddLocationModal } from './components/AddLocationModal';

export default function App() {
  const [graph, setGraph] = useState<CityGraph>(INITIAL_CITY_GRAPH);
  const [activeTab, setActiveTab] = useState<'map' | 'comparison' | 'visualizer' | 'viva'>('map');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Default select all delivery nodes
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<string[]>(() =>
    INITIAL_CITY_GRAPH.nodes.filter(n => n.type === 'delivery').map(n => n.id)
  );

  // Run TSP optimizer whenever graph or selected delivery stops change
  const tspResult = useMemo(() => {
    return solveTSP(graph, selectedDeliveryIds);
  }, [graph, selectedDeliveryIds]);

  const handleToggleDeliverySelection = (id: string) => {
    setSelectedDeliveryIds(prev => {
      if (prev.includes(id)) {
        // Keep at least 1 delivery node selected
        if (prev.length <= 1) return prev;
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleAddLocation = (newNode: LocationNode) => {
    // Add node
    const updatedNodes = [...graph.nodes, newNode];

    // Automatically connect new node to warehouse and closest existing delivery node with an edge
    const warehouse = graph.nodes.find(n => n.type === 'warehouse') || graph.nodes[0];
    const dx = newNode.x - warehouse.x;
    const dy = newNode.y - warehouse.y;
    const distToWh = Number(Math.sqrt(dx * dx + dy * dy).toFixed(1)) * 0.05; // scale to km

    const newEdges = [
      ...graph.edges,
      {
        id: `e-${warehouse.id}-${newNode.id}`,
        fromNodeId: warehouse.id,
        toNodeId: newNode.id,
        baseDistance: Math.max(2.0, distToWh),
        trafficMultiplier: 1.0,
        isBlocked: false,
        speedLimit: 45,
      },
    ];

    setGraph({ nodes: updatedNodes, edges: newEdges });
    setSelectedDeliveryIds(prev => [...prev, newNode.id]);
  };

  const handleResetGraph = () => {
    setGraph(INITIAL_CITY_GRAPH);
    setSelectedDeliveryIds(INITIAL_CITY_GRAPH.nodes.filter(n => n.type === 'delivery').map(n => n.id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddLocation={() => setIsAddModalOpen(true)}
        onResetGraph={handleResetGraph}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto py-6">
        {activeTab === 'map' && (
          <RealisticNavigationMap
            graph={graph}
            tspResult={tspResult}
            selectedDeliveryIds={selectedDeliveryIds}
            onToggleDeliverySelection={handleToggleDeliverySelection}
          />
        )}

        {activeTab === 'comparison' && (
          <RouteComparison
            graph={graph}
            tspResult={tspResult}
            selectedDeliveryIds={selectedDeliveryIds}
          />
        )}

        {activeTab === 'visualizer' && (
          <AlgorithmVisualizer
            graph={graph}
            tspResult={tspResult}
          />
        )}

        {activeTab === 'viva' && <VivaGuide />}
      </main>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLocation={handleAddLocation}
      />
    </div>
  );
}
