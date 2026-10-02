import { CityGraph } from '../types';

export const INITIAL_CITY_GRAPH: CityGraph = {
  nodes: [
    {
      id: 'wh-0',
      name: 'Central Logistics Hub (Kompally Depot)',
      type: 'warehouse',
      x: 500,
      y: 500,
      address: 'NH-44 Bypass, Kompally, Hyderabad',
    },
    {
      id: 'del-1',
      name: 'Malla Reddy Technical Campus',
      type: 'delivery',
      x: 220,
      y: 280,
      address: 'Maisammaguda, Dhulapally, Secunderabad',
      priority: 'urgent',
      timeWindow: '09:00 - 11:00',
    },
    {
      id: 'del-2',
      name: 'Malla Reddy University',
      type: 'delivery',
      x: 780,
      y: 220,
      address: 'Main Campus Road, Maisammaguda',
      priority: 'express',
      timeWindow: '10:00 - 12:00',
    },
    {
      id: 'del-3',
      name: 'Malla Reddy Deemed to be University',
      type: 'delivery',
      x: 340,
      y: 820,
      address: 'Suraram Main Road, Hyderabad',
      priority: 'urgent',
      timeWindow: 'Anytime',
    },
    {
      id: 'del-4',
      name: 'Sunrise Apartment Complex',
      type: 'delivery',
      x: 820,
      y: 780,
      address: 'Near CinePlanet, Kompally',
      priority: 'normal',
      timeWindow: '14:00 - 17:00',
    },
    {
      id: 'del-5',
      name: 'Vijetha Supermarket',
      type: 'delivery',
      x: 260,
      y: 580,
      address: 'Petbasheerabad, Medchal Road',
      priority: 'normal',
      timeWindow: '11:00 - 15:00',
    },
    {
      id: 'del-6',
      name: 'Yashoda Hospital Campus',
      type: 'delivery',
      x: 840,
      y: 500,
      address: 'SP Road, Secunderabad',
      priority: 'express',
      timeWindow: '12:00 - 16:00',
    },
  ],
  edges: [
    {
      id: 'e-wh-del1',
      fromNodeId: 'wh-0',
      toNodeId: 'del-1',
      baseDistance: 4.8,
      trafficMultiplier: 1.0,
      isBlocked: false,
      speedLimit: 50,
    },
    {
      id: 'e-wh-del2',
      fromNodeId: 'wh-0',
      toNodeId: 'del-2',
      baseDistance: 6.2,
      trafficMultiplier: 1.2,
      isBlocked: false,
      speedLimit: 60,
    },
    {
      id: 'e-wh-del3',
      fromNodeId: 'wh-0',
      toNodeId: 'del-3',
      baseDistance: 5.5,
      trafficMultiplier: 1.0,
      isBlocked: false,
      speedLimit: 40,
    },
    {
      id: 'e-wh-del4',
      fromNodeId: 'wh-0',
      toNodeId: 'del-4',
      baseDistance: 7.1,
      trafficMultiplier: 1.8,
      isBlocked: false,
      speedLimit: 50,
    },
    {
      id: 'e-wh-del5',
      fromNodeId: 'wh-0',
      toNodeId: 'del-5',
      baseDistance: 3.5,
      trafficMultiplier: 1.0,
      isBlocked: false,
      speedLimit: 40,
    },
    {
      id: 'e-wh-del6',
      fromNodeId: 'wh-0',
      toNodeId: 'del-6',
      baseDistance: 5.9,
      trafficMultiplier: 1.4,
      isBlocked: false,
      speedLimit: 60,
    },
    {
      id: 'e-del1-del5',
      fromNodeId: 'del-1',
      toNodeId: 'del-5',
      baseDistance: 3.2,
      trafficMultiplier: 1.0,
      isBlocked: false,
      speedLimit: 40,
    },
    {
      id: 'e-del1-del3',
      fromNodeId: 'del-1',
      toNodeId: 'del-3',
      baseDistance: 6.8,
      trafficMultiplier: 1.1,
      isBlocked: false,
      speedLimit: 45,
    },
    {
      id: 'e-del2-del6',
      fromNodeId: 'del-2',
      toNodeId: 'del-6',
      baseDistance: 4.1,
      trafficMultiplier: 1.0,
      isBlocked: false,
      speedLimit: 50,
    },
    {
      id: 'e-del2-del4',
      fromNodeId: 'del-2',
      toNodeId: 'del-4',
      baseDistance: 7.5,
      trafficMultiplier: 1.5,
      isBlocked: false,
      speedLimit: 55,
    },
    {
      id: 'e-del3-del5',
      fromNodeId: 'del-3',
      toNodeId: 'del-5',
      baseDistance: 4.2,
      trafficMultiplier: 1.0,
      isBlocked: false,
      speedLimit: 40,
    },
    {
      id: 'e-del3-del4',
      fromNodeId: 'del-3',
      toNodeId: 'del-4',
      baseDistance: 5.9,
      trafficMultiplier: 1.2,
      isBlocked: false,
      speedLimit: 45,
    },
    {
      id: 'e-del4-del6',
      fromNodeId: 'del-4',
      toNodeId: 'del-6',
      baseDistance: 4.6,
      trafficMultiplier: 1.1,
      isBlocked: false,
      speedLimit: 50,
    },
    {
      id: 'e-del5-del6',
      fromNodeId: 'del-5',
      toNodeId: 'del-6',
      baseDistance: 8.2,
      trafficMultiplier: 1.6,
      isBlocked: false,
      speedLimit: 60,
    },
  ],
};

export function getEffectiveWeight(edge: Edge): number {
  if (edge.isBlocked) return Infinity;
  return edge.baseDistance * edge.trafficMultiplier;
}

export function buildAdjacencyList(graph: CityGraph): Map<string, { node: string; weight: number; edgeId: string }[]> {
  const adj = new Map<string, { node: string; weight: number; edgeId: string }[]>();
  
  graph.nodes.forEach(n => adj.set(n.id, []));

  graph.edges.forEach(e => {
    const weight = getEffectiveWeight(e);
    if (adj.has(e.fromNodeId)) {
      adj.get(e.fromNodeId)!.push({ node: e.toNodeId, weight, edgeId: e.id });
    }
    if (adj.has(e.toNodeId)) {
      adj.get(e.toNodeId)!.push({ node: e.fromNodeId, weight, edgeId: e.id });
    }
  });

  return adj;
}
