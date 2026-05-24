export type MachineProvisionRequest = {
  name: string;
  type: 'classical' | 'quantum' | 'ai_optimized';
  resources: {
    cpuCores: number;
    memoryGb: number;
  };
};

export type HardwareUpdateRequest = {
  targetRamGb?: number;
  scaleStorageBytes?: number;
  acceleratorClass?: 'NVIDIA_H100' | 'AMD_MI300X' | 'GOOGLE_TPU_V5P' | 'NONE';
  microcodeVersions?: string[];
  coprocessorArrays?: string[];
};

export type AsyncJobResponse = {
  jobId: string;
  status: 'enqueued' | 'processing' | 'finalized' | 'failed' | 'unknown';
  checkStatusUrl: string;
};
