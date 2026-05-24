import { useState } from 'react';
import { patchMachineHardware } from '../graphql/machineApi';
import { useMachineStore } from '../store/machineStore';
import type { HardwareUpdateRequest } from '../types/machine';

export function HardwareUpdateForm(): JSX.Element {
  const addJob = useMachineStore((s) => s.addJob);
  const addLog = useMachineStore((s) => s.addLog);
  const [machineId, setMachineId] = useState('');
  const [targetRamGb, setTargetRamGb] = useState('');
  const [scaleStorageBytes, setScaleStorageBytes] = useState('');
  const [acceleratorClass, setAcceleratorClass] = useState<HardwareUpdateRequest['acceleratorClass']>('NONE');

  async function submit(): Promise<void> {
    if (!machineId.trim()) {
      addLog('validation: machineId is required');
      return;
    }
    const payload: HardwareUpdateRequest = {
      targetRamGb: targetRamGb ? Number(targetRamGb) : undefined,
      scaleStorageBytes: scaleStorageBytes ? Number(scaleStorageBytes) : undefined,
      acceleratorClass
    };
    const job = await patchMachineHardware(machineId.trim(), payload);
    addJob(job);
    addLog(`hardware patch queued: ${job.jobId}`);
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs">
      <h3 className="font-semibold text-cyan-300">Hardware Update</h3>
      <input value={machineId} onChange={(e) => setMachineId(e.target.value)} placeholder="machineId" className="w-full rounded bg-slate-800 p-2" />
      <input value={targetRamGb} onChange={(e) => setTargetRamGb(e.target.value)} placeholder="targetRamGb" className="w-full rounded bg-slate-800 p-2" />
      <input value={scaleStorageBytes} onChange={(e) => setScaleStorageBytes(e.target.value)} placeholder="scaleStorageBytes" className="w-full rounded bg-slate-800 p-2" />
      <select value={acceleratorClass} onChange={(e) => setAcceleratorClass(e.target.value as HardwareUpdateRequest['acceleratorClass'])} className="w-full rounded bg-slate-800 p-2">
        <option value="NONE">NONE</option>
        <option value="NVIDIA_H100">NVIDIA_H100</option>
        <option value="AMD_MI300X">AMD_MI300X</option>
        <option value="GOOGLE_TPU_V5P">GOOGLE_TPU_V5P</option>
      </select>
      <button onClick={submit} className="rounded border border-cyan-500 px-3 py-2">Queue Patch</button>
    </div>
  );
}
