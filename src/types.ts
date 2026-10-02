export type NodeType = 'warehouse' | 'delivery';

export type PriorityType = 'normal' | 'express' | 'urgent';

export interface LocationNode {
  id: string;
  name: string;
  type: NodeType;
  x: number; // coordinates for map canvas (0-1000)
  y: number; // coordinates for map canvas (0-1000)
  address: string;
  priority?: PriorityType;
  timeWindow?: string;
}

export interface Edge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  baseDistance: number; // km
  trafficMultiplier: number; // 1.0 (normal), 1.5 (moderate), 2.5 (heavy traffic)
  isBlocked: boolean;
  speedLimit: number; // km/h
}

export interface CityGraph {
  nodes: LocationNode[];
  edges: Edge[];
}

export interface DijkstraResult {
  path: string[]; // node IDs
  distance: number;
  steps: {
    visited: string[];
    distances: Record<string, number>;
    current: string;
    queue: { nodeId: string; dist: number }[];
  }[];
}

export interface TSPResult {
  optimizedNodeIds: string[]; // start warehouse -> delivery stops -> warehouse
  fullExpandedPath: string[]; // full node path including intermediate Dijkstra hops
  totalDistance: number;
  estimatedTimeMinutes: number;
  fuelUsedLiters: number;
  co2EmissionsKg: number;
  computationTimeMs: number;
  dpStatesCount: number;
  dijkstraRunsCount: number;
}

export interface ComparisonResult {
  unoptimized: {
    nodeIds: string[];
    totalDistance: number;
    estimatedTimeMinutes: number;
    fuelUsedLiters: number;
  };
  optimized: TSPResult;
  savings: {
    distanceKm: number;
    distancePercent: number;
    timeMinutes: number;
    timePercent: number;
    fuelLiters: number;
    co2Kg: number;
  };
}
