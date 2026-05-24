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
  const [microcodeVersions, setMicrocodeVersions] = useState('');
  const [coprocessorArrays, setCoprocessorArrays] = useState('');

  async function submit(): Promise<void> {
    if (!machineId.trim()) {
      addLog('validation: machineId is required');
      return;
    }
    const payload: HardwareUpdateRequest = {
      targetRamGb: targetRamGb ? Number(targetRamGb) : undefined,
      scaleStorageBytes: scaleStorageBytes ? Number(scaleStorageBytes) : undefined,
      acceleratorClass,
      microcodeVersions: microcodeVersions ? microcodeVersions.split(',').map((v) => v.trim()).filter(Boolean) : undefined,
      coprocessorArrays: coprocessorArrays ? coprocessorArrays.split(',').map((v) => v.trim()).filter(Boolean) : undefined
    };
    const job = await patchMachineHardware(machineId.trim(), payload);
    addJob(job);
    addLog(`hardware patch queued: ${job.jobId}`);
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs">
      <h3 className="font-semibold tracking-wide text-cyan-300">Asset Control Hub · Patch Hardware</h3>
      <div className="space-y-1">
        <label className="text-slate-300">Machine ID</label>
        <input value={machineId} onChange={(e) => setMachineId(e.target.value)} placeholder="2d95f1fc-342a-4ba9-a3ad-7dece6c013b1" className="w-full rounded border border-slate-700 bg-slate-800 p-2" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-slate-300">Target RAM (GB)</label>
          <input value={targetRamGb} onChange={(e) => setTargetRamGb(e.target.value)} placeholder="1024" className="w-full rounded border border-slate-700 bg-slate-800 p-2" />
        </div>
        <div className="space-y-1">
          <label className="text-slate-300">Storage Bytes</label>
          <input value={scaleStorageBytes} onChange={(e) => setScaleStorageBytes(e.target.value)} placeholder="2199023255552" className="w-full rounded border border-slate-700 bg-slate-800 p-2" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-slate-300">Accelerator</label>
        <select value={acceleratorClass} onChange={(e) => setAcceleratorClass(e.target.value as HardwareUpdateRequest['acceleratorClass'])} className="w-full rounded border border-slate-700 bg-slate-800 p-2">
        <option value="NONE">NONE</option>
        <option value="NVIDIA_H100">NVIDIA_H100</option>
        <option value="AMD_MI300X">AMD_MI300X</option>
        <option value="GOOGLE_TPU_V5P">GOOGLE_TPU_V5P</option>
      </select>
      </div>
      <div className="space-y-1">
        <label className="text-slate-300">Microcode Versions (comma separated)</label>
        <input value={microcodeVersions} onChange={(e) => setMicrocodeVersions(e.target.value)} placeholder="mcode-2.1.9,mcode-2.2.0" className="w-full rounded border border-slate-700 bg-slate-800 p-2" />
      </div>
      <div className="space-y-1">
        <label className="text-slate-300">Coprocessor Arrays (comma separated)</label>
        <input value={coprocessorArrays} onChange={(e) => setCoprocessorArrays(e.target.value)} placeholder="fpga-x1,tpu-rack-2" className="w-full rounded border border-slate-700 bg-slate-800 p-2" />
      </div>
      <button onClick={submit} className="w-full rounded border border-amber-500 bg-amber-500/10 px-3 py-2 font-medium text-amber-300">Queue Hardware Patch</button>
    </div>
  );
}
