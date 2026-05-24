import { useState } from 'react';
import { createMachine } from '../graphql/machineApi';
import { useMachineStore } from '../store/machineStore';
import type { MachineProvisionRequest } from '../types/machine';

export function MachineProvisionForm(): JSX.Element {
  const addMachine = useMachineStore((s) => s.addMachine);
  const addJob = useMachineStore((s) => s.addJob);
  const addLog = useMachineStore((s) => s.addLog);

  const [name, setName] = useState('');
  const [type, setType] = useState<MachineProvisionRequest['type']>('classical');
  const [cpuCores, setCpuCores] = useState('16');
  const [memoryGb, setMemoryGb] = useState('64');

  async function submit(): Promise<void> {
    const cores = Number(cpuCores);
    const memory = Number(memoryGb);
    if (!name.trim()) {
      addLog('validation: machine name is required');
      return;
    }
    if (!Number.isFinite(cores) || !Number.isFinite(memory) || cores <= 0 || memory <= 0) {
      addLog('validation: cpuCores and memoryGb must be positive numbers');
      return;
    }

    const payload: MachineProvisionRequest = {
      name: name.trim(),
      type,
      resources: { cpuCores: cores, memoryGb: memory }
    };

    const job = await createMachine(payload);
    addMachine(payload);
    addJob(job);
    addLog(`machine provisioning scheduled: ${job.jobId}`);
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs">
      <h3 className="font-semibold text-cyan-300">Machine Provisioning</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" className="w-full rounded bg-slate-800 p-2" />
      <select value={type} onChange={(e) => setType(e.target.value as MachineProvisionRequest['type'])} className="w-full rounded bg-slate-800 p-2">
        <option value="classical">classical</option>
        <option value="quantum">quantum</option>
        <option value="ai_optimized">ai_optimized</option>
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input value={cpuCores} onChange={(e) => setCpuCores(e.target.value)} placeholder="cpuCores" className="rounded bg-slate-800 p-2" />
        <input value={memoryGb} onChange={(e) => setMemoryGb(e.target.value)} placeholder="memoryGb" className="rounded bg-slate-800 p-2" />
      </div>
      <button onClick={submit} className="rounded border border-cyan-500 px-3 py-2">Queue Provisioning</button>
    </div>
  );
}
