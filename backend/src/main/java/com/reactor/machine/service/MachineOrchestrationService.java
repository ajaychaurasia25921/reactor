package com.reactor.machine.service;

import com.reactor.machine.domain.AlertTrigger;
import com.reactor.machine.domain.AsyncJobResponse;
import com.reactor.machine.domain.HardwareUpdateRequest;
import com.reactor.machine.domain.MachineProvisionRequest;
import com.reactor.machine.repo.JobRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@ApplicationScoped
public class MachineOrchestrationService {

    private final JobRepository jobRepository;
    private final LangGraphOllamaBridgeService langGraph;
    private final PolyglotSandboxService sandbox;
    private final SmppDispatchClient smpp;
    private final ExecutorService workerPool = Executors.newFixedThreadPool(8);

    public MachineOrchestrationService(
        JobRepository jobRepository,
        LangGraphOllamaBridgeService langGraph,
        PolyglotSandboxService sandbox,
        SmppDispatchClient smpp
    ) {
        this.jobRepository = jobRepository;
        this.langGraph = langGraph;
        this.sandbox = sandbox;
        this.smpp = smpp;
    }

    public Uni<AsyncJobResponse> provisionMachine(MachineProvisionRequest request) {
        validateProvisionRequest(request);
        String jobId = UUID.randomUUID().toString();
        return jobRepository.create(jobId)
            .invoke(() -> workerPool.submit(() -> runProvisionPipeline(jobId, request)))
            .replaceWith(new AsyncJobResponse(jobId, "enqueued", "/api/v1/operations/tasks/" + jobId));
    }

    public Uni<AsyncJobResponse> patchHardware(String machineId, HardwareUpdateRequest request) {
        validateHardwareRequest(machineId, request);
        String jobId = UUID.randomUUID().toString();
        return jobRepository.create(jobId)
            .invoke(() -> workerPool.submit(() -> runHardwarePipeline(jobId, machineId, request)))
            .replaceWith(new AsyncJobResponse(jobId, "enqueued", "/api/v1/operations/tasks/" + jobId));
    }

    public Uni<AsyncJobResponse> getJobStatus(String jobId) {
        return jobRepository.read(jobId);
    }

    private void runProvisionPipeline(String jobId, MachineProvisionRequest request) {
        jobRepository.updateStatus(jobId, "processing").await().indefinitely();
        AlertTrigger trigger = new AlertTrigger(request.name(), "cpu-threshold", 92.3);
        try {
            String script = langGraph.generateRemediationScript(trigger).await().indefinitely();
            sandbox.executePython(script).await().indefinitely();
            jobRepository.updateStatus(jobId, "finalized").await().indefinitely();
        } catch (Exception ex) {
            smpp.dispatchWithBackoff("+14155552671", "[CRITICAL] Provisioning remediation failed for " + request.name())
                .await().indefinitely();
            jobRepository.updateStatus(jobId, "failed").await().indefinitely();
        }
    }

    private void runHardwarePipeline(String jobId, String machineId, HardwareUpdateRequest request) {
        jobRepository.updateStatus(jobId, "processing").await().indefinitely();
        try {
            Thread.sleep(150);
            jobRepository.updateStatus(jobId, "finalized").await().indefinitely();
        } catch (Exception ex) {
            smpp.dispatchWithBackoff("+14155552671", "[CRITICAL] Hardware patch failed for " + machineId)
                .await().indefinitely();
            jobRepository.updateStatus(jobId, "failed").await().indefinitely();
        }
    }

    private void validateProvisionRequest(MachineProvisionRequest request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.resources() == null || request.resources().cpuCores() <= 0 || request.resources().memoryGb() <= 0) {
            throw new IllegalArgumentException("resources.cpuCores and resources.memoryGb must be > 0");
        }
    }

    private void validateHardwareRequest(String machineId, HardwareUpdateRequest request) {
        if (machineId == null || machineId.isBlank()) {
            throw new IllegalArgumentException("machineId is required");
        }
        if (request == null) {
            throw new IllegalArgumentException("request is required");
        }
    }
}
