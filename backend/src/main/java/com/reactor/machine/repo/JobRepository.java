package com.reactor.machine.repo;

import com.reactor.machine.domain.AsyncJobResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class JobRepository {

    private final Map<String, String> statusByJobId = new ConcurrentHashMap<>();

    public Uni<Void> create(String jobId) {
        statusByJobId.put(jobId, "enqueued");
        return Uni.createFrom().voidItem();
    }

    public Uni<Void> updateStatus(String jobId, String status) {
        statusByJobId.put(jobId, status);
        return Uni.createFrom().voidItem();
    }

    public Uni<AsyncJobResponse> read(String jobId) {
        String status = statusByJobId.getOrDefault(jobId, "unknown");
        return Uni.createFrom().item(new AsyncJobResponse(jobId, status, "/api/v1/operations/tasks/" + jobId));
    }
}
