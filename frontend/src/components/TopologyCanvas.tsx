import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, MarkerType, Node, NodeChange, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { gql, useSubscription } from '@apollo/client';
import { useTopologyStore } from '../store/store';
import type { TopologyDeltaPayload, TopologyEdge, TopologyNode } from '../types/topology';
import { MachineProvisionForm } from './MachineProvisionForm';
import { HardwareUpdateForm } from './HardwareUpdateForm';
import { useMachineStore } from '../store/machineStore';

type TabKey =
  | 'dashboard'
  | 'servers'
  | 'sms'
  | 'terminal'
  | 'security'
  | 'packet'
  | 'file'
  | 'quantum'
  | 'networking';

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
  { id: 'spine-01', position: { x: 420, y: 40 }, data: { label: 'spine-01', role: 'spine', cpuLoad: 62, status: 'healthy', updatedAt: new Date().toISOString() }, type: 'default' },
  { id: 'leaf-01', position: { x: 250, y: 220 }, data: { label: 'leaf-01', role: 'leaf', cpuLoad: 78, status: 'warning', updatedAt: new Date().toISOString() }, type: 'default' },
  { id: 'leaf-02', position: { x: 580, y: 220 }, data: { label: 'leaf-02', role: 'leaf', cpuLoad: 64, status: 'healthy', updatedAt: new Date().toISOString() }, type: 'default' }
];

const initialEdges: TopologyEdge[] = [
  { id: 'e1-2', source: 'spine-01', target: 'leaf-01', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-3', source: 'spine-01', target: 'leaf-02', markerEnd: { type: MarkerType.ArrowClosed } }
];

export function TopologyCanvas(): JSX.Element {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [fabricLayer, setFabricLayer] = useState<'VXLAN' | 'MPLS' | 'QUANTUM_FABRIC'>('VXLAN');
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [terminalBuffer, setTerminalBuffer] = useState<string[]>(['Connected to core fabric shell. Type help']);
  const [terminalCmd, setTerminalCmd] = useState('');
  const [files, setFiles] = useState<Array<{ name: string; progress: number }>>([]);

  const { nodes, edges, remediationLogs, setInitial, applyDelta, appendLog } = useTopologyStore();
  const jobs = useMachineStore((s) => s.jobs);
  const infraLogs = useMachineStore((s) => s.infraLogs);

  const [rfNodes, setRfNodes] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => setInitial(initialNodes, initialEdges), [setInitial]);
  useEffect(() => setRfNodes(nodes), [nodes, setRfNodes]);
  useEffect(() => setRfEdges(edges), [edges, setRfEdges]);

  useSubscription<{ topologyDeltaStream: TopologyDeltaPayload }>(TOPOLOGY_DELTA_SUBSCRIPTION, {
    onData: ({ data }) => {
      const delta = data.data?.topologyDeltaStream;
      if (!delta) return;
      applyDelta(delta);
      appendLog(`delta ${delta.nodeId} cpu=${delta.cpuLoad} at=${delta.observedAt}`);
    }
  });

  const minimapColor = useMemo(() => (node: TopologyNode) => {
    if (node.data.status === 'critical') return '#ef4444';
    if (node.data.status === 'warning') return '#f59e0b';
    return '#10b981';
  }, []);

  function handleNodeChanges(changes: NodeChange[]): void {
    setRfNodes((prev) => prev.map((node) => {
      const c = changes.find((x) => x.type === 'position' && x.id === node.id && x.position);
      if (c?.type === 'position' && c.position) {
        if (!c.dragging) appendLog(`node moved ${node.id} -> (${c.position.x.toFixed(0)}, ${c.position.y.toFixed(0)})`);
        return { ...node, position: c.position };
      }
      return node;
    }));
  }

  async function copyNode(): Promise<void> {
    if (!selectedNode) return;
    await navigator.clipboard.writeText(selectedNode.id);
    appendLog(`copied node ${selectedNode.id}`);
  }

  function runTerminalCommand(): void {
    if (!terminalCmd.trim()) return;
    const cmd = terminalCmd.trim();
    const lines = [...terminalBuffer, `$ ${cmd}`];
    if (cmd === 'help') lines.push('show interface brief | show runtime architecture | clear');
    else if (cmd === 'show interface brief') lines.push('Ethernet0/0 up up 10.194.24.102');
    else if (cmd === 'show runtime architecture') lines.push('Quarkus + GraphQL + gRPC + AsyncJob orchestrator');
    else if (cmd === 'clear') setTerminalBuffer([]);
    else lines.push(`invalid command: ${cmd}`);
    if (cmd !== 'clear') setTerminalBuffer(lines);
    setTerminalCmd('');
  }

  function stageFile(name: string): void {
    setFiles((s) => [...s, { name, progress: 0 }]);
    appendLog(`staged file ${name}`);
    let progress = 0;
    const timer = setInterval(() => {
      progress += 20;
      setFiles((s) => s.map((f) => (f.name === name ? { ...f, progress: Math.min(progress, 100) } : f)));
      if (progress >= 100) clearInterval(timer);
    }, 250);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 bg-gray-950 p-4">
        <h1 className="mb-4 text-sm font-bold uppercase tracking-widest text-cyan-300">Fabric Engine v2.1.0</h1>
        {[
          ['dashboard', 'Main Dashboard'],
          ['servers', 'Enterprise Provisioning'],
          ['sms', 'SMS Gateway Hub'],
          ['terminal', 'SSH / Telnet Terminals'],
          ['security', 'Firewall & Honeypots'],
          ['packet', 'CCNP Packet Tracing'],
          ['file', 'File Transport Plane'],
          ['quantum', 'Quantum Core'],
          ['networking', 'L7 Sockets']
        ].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k as TabKey)} className={`mb-1 w-full rounded px-3 py-2 text-left text-xs ${tab === k ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-900/80 px-5 py-3">
          <div>
            <h2 className="text-lg font-semibold text-white">System Infrastructure Control Room</h2>
            <p className="text-xs text-gray-400">Unified master plane lifecycle interface</p>
          </div>
          <span className="rounded border border-green-700 bg-green-900/40 px-2 py-1 text-[10px] font-bold text-green-400">mTLS + OAuth2 CONNECTED</span>
        </header>

        <main className="space-y-4 p-5">
          {tab === 'dashboard' && (
            <>
              <div className="grid gap-3 md:grid-cols-5">
                {['Hypervisor VMs 2/3', 'Honeypots 3', 'Firewall Drops 1842', 'CCNP Links 4', 'Quantum Volume 2048'].map((m) => (
                  <div key={m} className="rounded-xl border border-gray-800 bg-gray-900 p-3 text-xs font-semibold">{m}</div>
                ))}
              </div>
              <section className="grid gap-3 lg:grid-cols-[2fr_1fr]">
                <div className="rounded-xl border border-blue-800/40 bg-gray-900 p-2">
                  <div className="mb-2 flex items-center justify-between text-xs text-gray-300">
                    <span>Real-Time Topology Canvas ({fabricLayer})</span>
                    <div className="flex gap-2">
                      <select value={fabricLayer} onChange={(e) => setFabricLayer(e.target.value as any)} className="rounded border border-gray-700 bg-gray-950 px-2 py-1">
                        <option>VXLAN</option><option>MPLS</option><option>QUANTUM_FABRIC</option>
                      </select>
                      <button onClick={copyNode} className="rounded border border-cyan-500 px-2 py-1 text-cyan-300">Copy Node ID</button>
                    </div>
                  </div>
                  <div className="h-[60vh] rounded border border-gray-800 bg-gray-950">
                    <ReactFlow
                      nodes={rfNodes}
                      edges={rfEdges}
                      onNodesChange={handleNodeChanges}
                      onEdgesChange={onEdgesChange}
                      onNodeClick={(_, n) => setSelectedNode(n as Node<any> as TopologyNode)}
                      fitView
                    >
                      <Background gap={18} color="#1e293b" />
                      <MiniMap nodeColor={minimapColor} pannable zoomable />
                      <Controls />
                    </ReactFlow>
                  </div>
                </div>
                <aside className="space-y-3">
                  <MachineProvisionForm />
                  <HardwareUpdateForm />
                  <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 text-xs">
                    <h3 className="mb-2 font-semibold text-cyan-300">Deployment Status Tracker</h3>
                    {jobs.slice(0, 8).map((j) => <p key={j.jobId} className="mb-1 rounded bg-gray-950 p-1">{j.jobId.slice(0, 8)}... {j.status}</p>)}
                  </div>
                </aside>
              </section>
            </>
          )}

          {tab === 'servers' && <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">Enterprise Provisioning forms live in Asset Control Hub on Dashboard.</div>}
          {tab === 'sms' && <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">SMS Gateway Hub operational panel: queue status, transceiver health, and dispatch telemetry.</div>}

          {tab === 'terminal' && (
            <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <h3 className="mb-2 text-sm font-semibold text-white">Remote VTY Session Terminal</h3>
              <div className="mb-2 h-60 overflow-y-auto rounded border border-gray-800 bg-black p-2 font-mono text-xs text-green-400">
                {terminalBuffer.map((line, i) => <p key={`${line}-${i}`}>{line}</p>)}
              </div>
              <div className="flex gap-2">
                <input value={terminalCmd} onChange={(e) => setTerminalCmd(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runTerminalCommand()} className="w-full rounded border border-gray-700 bg-gray-950 px-2 py-1 font-mono text-xs" placeholder="show interface brief" />
                <button onClick={runTerminalCommand} className="rounded border border-blue-500 px-3 py-1 text-xs text-blue-300">Run</button>
              </div>
            </section>
          )}

          {tab === 'security' && <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">Security Plane: firewall rule matrix and honeypot incident feed.</div>}
          {tab === 'packet' && <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">Packet Trace: source to gateway to destination hop chain with diagnostic dump.</div>}

          {tab === 'file' && (
            <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <h3 className="mb-3 text-sm font-semibold">File Transport Plane</h3>
              <button onClick={() => stageFile(`diagnostic-${Date.now()}.bin`)} className="mb-3 rounded border border-blue-500 px-3 py-1 text-xs text-blue-300">Stage Synthetic Payload</button>
              {files.map((f) => (
                <div key={f.name} className="mb-2 rounded border border-gray-800 bg-gray-950 p-2 text-xs">
                  <div className="mb-1 flex justify-between"><span>{f.name}</span><span>{f.progress}%</span></div>
                  <div className="h-1 w-full rounded bg-gray-800"><div className="h-1 rounded bg-blue-500" style={{ width: `${f.progress}%` }} /></div>
                </div>
              ))}
            </section>
          )}

          {tab === 'quantum' && <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">Quantum Core: submit circuit jobs and inspect histogram/volume outputs.</div>}
          {tab === 'networking' && <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm">L7 Sockets: listener bindings, proxy target selections, and runtime state.</div>}

          <section className="rounded-xl border border-gray-800 bg-gray-900 p-3 text-xs">
            <h3 className="mb-2 font-semibold text-cyan-300">Telemetry Stream</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {remediationLogs.map((l, i) => <p key={`${l}-${i}`} className="rounded bg-gray-950 p-1">{l}</p>)}
              {infraLogs.map((l, i) => <p key={`${l}-${i}`} className="rounded bg-gray-950 p-1 text-cyan-200">{l}</p>)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
