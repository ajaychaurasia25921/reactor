package com.reactor.machine.api;

import com.reactor.machine.domain.AsyncJobResponse;
import com.reactor.machine.service.MachineOrchestrationService;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/v1/operations/tasks")
@Produces(MediaType.APPLICATION_JSON)
public class OperationTaskResource {

    private final MachineOrchestrationService orchestrationService;

    public OperationTaskResource(MachineOrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    @GET
    @Path("/{jobId}")
    public Uni<AsyncJobResponse> getTaskStatus(@PathParam("jobId") String jobId) {
        return orchestrationService.getJobStatus(jobId);
    }
}
