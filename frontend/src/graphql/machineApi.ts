import type { AsyncJobResponse, HardwareUpdateRequest, MachineProvisionRequest } from '../types/machine';

const BASE_URL = 'http://localhost:8080/api/v1';

export async function createMachine(payload: MachineProvisionRequest): Promise<AsyncJobResponse> {
  const res = await fetch(`${BASE_URL}/machines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`createMachine failed: ${res.status}`);
  return res.json();
}

export async function patchMachineHardware(machineId: string, payload: HardwareUpdateRequest): Promise<AsyncJobResponse> {
  const res = await fetch(`${BASE_URL}/machines/${machineId}/hardware`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`patchMachineHardware failed: ${res.status}`);
  return res.json();
}
