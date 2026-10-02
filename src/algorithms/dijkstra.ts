import { CityGraph, DijkstraResult } from '../types';
import { buildAdjacencyList } from './graph';

export function runDijkstra(graph: CityGraph, startId: string, endId: string): DijkstraResult {
  const adj = buildAdjacencyList(graph);
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const steps: DijkstraResult['steps'] = [];

  graph.nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });

  distances[startId] = 0;
  const queue: { nodeId: string; dist: number }[] = [{ nodeId: startId, dist: 0 }];

  while (queue.length > 0) {
    // Sort queue by distance (min-heap simulation)
    queue.sort((a, b) => a.dist - b.dist);
    const currentObj = queue.shift()!;
    const u = currentObj.nodeId;

    if (visited.has(u)) continue;
    visited.add(u);

    // Record step for algorithm visualizer
    steps.push({
      visited: Array.from(visited),
      distances: { ...distances },
      current: u,
      queue: [...queue],
    });

    if (u === endId) break;

    const neighbors = adj.get(u) || [];
    for (const neighbor of neighbors) {
      if (neighbor.weight === Infinity) continue; // blocked road

      const alt = distances[u] + neighbor.weight;
      if (alt < distances[neighbor.node] && !visited.has(neighbor.node)) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = u;
        queue.push({ nodeId: neighbor.node, dist: alt });
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endId;

  if (distances[endId] !== Infinity) {
    while (curr !== null) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  return {
    path,
    distance: distances[endId],
    steps,
  };
}
