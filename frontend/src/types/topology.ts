import type { Edge, Node } from 'reactflow';

export type TopologyNodeData = {
  label: string;
  role: 'leaf' | 'spine' | 'border' | 'service';
  cpuLoad: number;
  status: 'healthy' | 'warning' | 'critical';
  updatedAt: string;
};

export type TopologyNode = Node<TopologyNodeData>;
export type TopologyEdge = Edge;

export type TopologyDeltaPayload = {
  nodeId: string;
  cpuLoad: number;
  observedAt: string;
};
