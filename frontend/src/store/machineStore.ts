import { create } from 'zustand';
import type { AsyncJobResponse, HardwareUpdateRequest, MachineProvisionRequest } from '../types/machine';

type MachineState = {
  machines: MachineProvisionRequest[];
  jobs: AsyncJobResponse[];
  infraLogs: string[];
  addMachine: (machine: MachineProvisionRequest) => void;
  addJob: (job: AsyncJobResponse) => void;
  addLog: (line: string) => void;
  setHardwareDraft: (draft: HardwareUpdateRequest) => void;
  hardwareDraft: HardwareUpdateRequest;
};

export const useMachineStore = create<MachineState>((set) => ({
  machines: [],
  jobs: [],
  infraLogs: [],
  hardwareDraft: {},
  addMachine: (machine) => set((s) => ({ machines: [machine, ...s.machines] })),
  addJob: (job) => set((s) => ({ jobs: [job, ...s.jobs].slice(0, 300) })),
  addLog: (line) => set((s) => ({ infraLogs: [line, ...s.infraLogs].slice(0, 500) })),
  setHardwareDraft: (draft) => set({ hardwareDraft: draft })
}));
