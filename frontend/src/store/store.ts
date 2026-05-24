import { create } from 'zustand';
import type { TopologyDeltaPayload, TopologyEdge, TopologyNode } from '../types/topology';

type TopologyState = {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  remediationLogs: string[];
  setInitial: (nodes: TopologyNode[], edges: TopologyEdge[]) => void;
  applyDelta: (delta: TopologyDeltaPayload) => void;
  appendLog: (message: string) => void;
};

function cpuStatus(cpuLoad: number): 'healthy' | 'warning' | 'critical' {
  if (cpuLoad >= 90) return 'critical';
  if (cpuLoad >= 75) return 'warning';
  return 'healthy';
}

export const useTopologyStore = create<TopologyState>((set) => ({
  nodes: [],
  edges: [],
  remediationLogs: [],
  setInitial: (nodes, edges) => set({ nodes, edges }),
  applyDelta: (delta) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === delta.nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                cpuLoad: delta.cpuLoad,
                status: cpuStatus(delta.cpuLoad),
                updatedAt: delta.observedAt
              }
            }
          : node
      )
    })),
  appendLog: (message) =>
    set((state) => ({ remediationLogs: [message, ...state.remediationLogs].slice(0, 200) }))
}));
