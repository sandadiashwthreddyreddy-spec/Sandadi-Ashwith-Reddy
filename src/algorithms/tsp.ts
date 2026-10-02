import { CityGraph, TSPResult } from '../types';
import { runDijkstra } from './dijkstra';

export function solveTSP(graph: CityGraph, deliveryNodeIds?: string[]): TSPResult {
  const startTime = performance.now();
  
  // Find warehouse
  const warehouse = graph.nodes.find(n => n.type === 'warehouse') || graph.nodes[0];
  const deliveries = deliveryNodeIds 
    ? graph.nodes.filter(n => deliveryNodeIds.includes(n.id) && n.type === 'delivery')
    : graph.nodes.filter(n => n.type === 'delivery');

  // All nodes to visit: [Warehouse, d1, d2, ..., dn]
  const allNodes = [warehouse, ...deliveries];
  const N = allNodes.length; // 1 + number of deliveries

  // Compute all-pairs shortest paths using Dijkstra
  let dijkstraRunsCount = 0;
  const distMatrix: number[][] = Array.from({ length: N }, () => Array(N).fill(Infinity));
  const pathMatrix: Record<string, string[]> = {};

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i === j) {
        distMatrix[i][j] = 0;
        pathMatrix[`${i}-${j}`] = [allNodes[i].id];
        continue;
      }
      dijkstraRunsCount++;
      const res = runDijkstra(graph, allNodes[i].id, allNodes[j].id);
      distMatrix[i][j] = res.distance;
      pathMatrix[`${i}-${j}`] = res.path;
    }
  }

  // If only 1 delivery or 0 deliveries
  if (deliveries.length === 0) {
    const endTime = performance.now();
    return {
      optimizedNodeIds: [warehouse.id, warehouse.id],
      fullExpandedPath: [warehouse.id],
      totalDistance: 0,
      estimatedTimeMinutes: 0,
      fuelUsedLiters: 0,
      co2EmissionsKg: 0,
      computationTimeMs: Math.round(endTime - startTime),
      dpStatesCount: 1,
      dijkstraRunsCount,
    };
  }

  // Bitmask DP for TSP: dp[mask][i]
  // mask is a bitmask of visited delivery nodes (excluding warehouse index 0)
  // i is the current delivery node index (1 to N-1)
  const numDeliveries = deliveries.length;
  const TOTAL_MASKS = 1 << numDeliveries;
  
  // dp table: TOTAL_MASKS x numDeliveries
  // Initialize with Infinity
  const dp: number[][] = Array.from({ length: TOTAL_MASKS }, () => Array(numDeliveries).fill(Infinity));
  const parent: number[][] = Array.from({ length: TOTAL_MASKS }, () => Array(numDeliveries).fill(-1));

  // Base cases: from warehouse (index 0) to each delivery i (index 1 to N-1, delivery index i-1)
  for (let i = 0; i < numDeliveries; i++) {
    const nodeIdx = i + 1;
    dp[1 << i][i] = distMatrix[0][nodeIdx];
  }

  let dpStatesCount = numDeliveries;

  for (let mask = 1; mask < TOTAL_MASKS; mask++) {
    for (let u = 0; u < numDeliveries; u++) {
      if (!(mask & (1 << u))) continue;
      if (dp[mask][u] === Infinity) continue;

      for (let v = 0; v < numDeliveries; v++) {
        if (mask & (1 << v)) continue; // already visited

        const nextMask = mask | (1 << v);
        const weight = distMatrix[u + 1][v + 1];
        if (weight === Infinity) continue;

        dpStatesCount++;
        const newCost = dp[mask][u] + weight;
        if (newCost < dp[nextMask][v]) {
          dp[nextMask][v] = newCost;
          parent[nextMask][v] = u;
        }
      }
    }
  }

  // Find best ending delivery node and add return trip to warehouse
  const finalMask = TOTAL_MASKS - 1;
  let minCost = Infinity;
  let lastDeliveryIdx = -1;

  for (let i = 0; i < numDeliveries; i++) {
    const returnCost = distMatrix[i + 1][0]; // return to warehouse
    const totalCost = dp[finalMask][i] + returnCost;
    if (totalCost < minCost) {
      minCost = totalCost;
      lastDeliveryIdx = i;
    }
  }

  // Reconstruct TSP tour sequence of delivery indices
  const deliveryTourIndices: number[] = [];
  let currMask = finalMask;
  let currU = lastDeliveryIdx;

  while (currU !== -1 && currMask > 0) {
    deliveryTourIndices.unshift(currU);
    const prevU = parent[currMask][currU];
    currMask ^= (1 << currU);
    currU = prevU;
  }

  // Build full node sequence: Warehouse -> d_tour[0] -> d_tour[1] ... -> Warehouse
  const sequenceNodeIds: string[] = [warehouse.id];
  deliveryTourIndices.forEach(idx => {
    sequenceNodeIds.push(deliveries[idx].id);
  });
  sequenceNodeIds.push(warehouse.id);

  // Expand full path with intermediate Dijkstra hops
  const fullExpandedPath: string[] = [];
  let totalDistance = 0;

  for (let i = 0; i < sequenceNodeIds.length - 1; i++) {
    const fromId = sequenceNodeIds[i];
    const toId = sequenceNodeIds[i + 1];
    const fromIdx = allNodes.findIndex(n => n.id === fromId);
    const toIdx = allNodes.findIndex(n => n.id === toId);
    
    const segmentPath = pathMatrix[`${fromIdx}-${toIdx}`] || [fromId, toId];
    const segmentDist = distMatrix[fromIdx][toIdx];
    totalDistance += segmentDist === Infinity ? 0 : segmentDist;

    if (i === 0) {
      fullExpandedPath.push(...segmentPath);
    } else {
      // avoid duplicating connecting node
      fullExpandedPath.push(...segmentPath.slice(1));
    }
  }

  const endTime = performance.now();
  const estimatedTimeMinutes = Math.round((totalDistance / 35) * 60); // assuming average speed 35 km/h
  const fuelUsedLiters = Number((totalDistance * 0.12).toFixed(2)); // ~12L per 100km
  const co2EmissionsKg = Number((fuelUsedLiters * 2.31).toFixed(2)); // ~2.31 kg CO2 per liter diesel

  return {
    optimizedNodeIds: sequenceNodeIds,
    fullExpandedPath,
    totalDistance: Number(totalDistance.toFixed(2)),
    estimatedTimeMinutes,
    fuelUsedLiters,
    co2EmissionsKg,
    computationTimeMs: Math.round(endTime - startTime),
    dpStatesCount,
    dijkstraRunsCount,
  };
}

export function computeUnoptimizedRoute(graph: CityGraph, deliveryNodeIds?: string[]): {
  nodeIds: string[];
  totalDistance: number;
  estimatedTimeMinutes: number;
  fuelUsedLiters: number;
} {
  const warehouse = graph.nodes.find(n => n.type === 'warehouse') || graph.nodes[0];
  const deliveries = deliveryNodeIds 
    ? graph.nodes.filter(n => deliveryNodeIds.includes(n.id) && n.type === 'delivery')
    : graph.nodes.filter(n => n.type === 'delivery');

  // Naive order (just as added or sorted by ID)
  const nodeIds = [warehouse.id, ...deliveries.map(d => d.id), warehouse.id];
  let totalDistance = 0;

  for (let i = 0; i < nodeIds.length - 1; i++) {
    const res = runDijkstra(graph, nodeIds[i], nodeIds[i + 1]);
    totalDistance += res.distance === Infinity ? 15 : res.distance;
  }

  const estimatedTimeMinutes = Math.round((totalDistance / 30) * 60); // slightly slower unoptimized
  const fuelUsedLiters = Number((totalDistance * 0.15).toFixed(2));

  return {
    nodeIds,
    totalDistance: Number(totalDistance.toFixed(2)),
    estimatedTimeMinutes,
    fuelUsedLiters,
  };
}
