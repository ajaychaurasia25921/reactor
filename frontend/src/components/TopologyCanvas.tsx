import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useEdgesState,
  useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { gql, useSubscription } from '@apollo/client';
import { useTopologyStore } from '../store/store';
import type { TopologyDeltaPayload, TopologyEdge, TopologyNode } from '../types/topology';

const TOPOLOGY_DELTA_SUBSCRIPTION = gql`
  subscription TopologyDeltaStream {
    topologyDeltaStream {
      nodeId
      cpuLoad
      observedAt
    }
  }
`;

const initialNodes: TopologyNode[] = [
  {
    id: 'spine-01',
    position: { x: 420, y: 40 },
    data: { label: 'spine-01', role: 'spine', cpuLoad: 62, status: 'healthy', updatedAt: new Date().toISOString() },
    type: 'default'
  },
  {
    id: 'leaf-01',
    position: { x: 250, y: 220 },
    data: { label: 'leaf-01', role: 'leaf', cpuLoad: 78, status: 'warning', updatedAt: new Date().toISOString() },
    type: 'default'
  },
  {
    id: 'leaf-02',
    position: { x: 580, y: 220 },
    data: { label: 'leaf-02', role: 'leaf', cpuLoad: 64, status: 'healthy', updatedAt: new Date().toISOString() },
    type: 'default'
  }
];

const initialEdges: TopologyEdge[] = [
  { id: 'e1-2', source: 'spine-01', target: 'leaf-01', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-3', source: 'spine-01', target: 'leaf-02', markerEnd: { type: MarkerType.ArrowClosed } }
];

export function TopologyCanvas(): JSX.Element {
  const { nodes, edges, remediationLogs, setInitial, applyDelta, appendLog } = useTopologyStore();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setInitial(initialNodes, initialEdges);
  }, [setInitial]);

  useEffect(() => {
    setRfNodes(nodes);
  }, [nodes, setRfNodes]);

  useEffect(() => {
    setRfEdges(edges);
  }, [edges, setRfEdges]);

  useSubscription<{ topologyDeltaStream: TopologyDeltaPayload }>(TOPOLOGY_DELTA_SUBSCRIPTION, {
    onData: ({ data }) => {
      const delta = data.data?.topologyDeltaStream;
      if (!delta) {
        return;
      }
      applyDelta(delta);
      appendLog(`delta ${delta.nodeId} cpu=${delta.cpuLoad} at=${delta.observedAt}`);
    }
  });

  const minimapColor = useMemo(
    () => (node: TopologyNode) => {
      if (node.data.status === 'critical') return '#dc2626';
      if (node.data.status === 'warning') return '#f59e0b';
      return '#16a34a';
    },
    []
  );

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100">
      <div className="grid h-full grid-cols-12 gap-2 p-2">
        <section className="col-span-9 rounded-xl border border-slate-700 bg-slate-900">
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <Background gap={18} color="#1e293b" />
            <MiniMap nodeColor={minimapColor} pannable zoomable />
            <Controls />
          </ReactFlow>
        </section>
        <aside className="col-span-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-cyan-300">AI Remediation Log</h2>
          <div className="max-h-[92vh] space-y-2 overflow-y-auto text-xs">
            {remediationLogs.map((log, idx) => (
              <p key={`${log}-${idx}`} className="rounded border border-slate-700 bg-slate-800 p-2">
                {log}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
