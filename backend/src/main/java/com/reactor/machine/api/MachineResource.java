package com.reactor.machine.api;

import com.reactor.machine.domain.AsyncJobResponse;
import com.reactor.machine.domain.HardwareUpdateRequest;
import com.reactor.machine.domain.MachineProvisionRequest;
import com.reactor.machine.service.MachineOrchestrationService;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/v1/machines")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class MachineResource {

    private final MachineOrchestrationService orchestrationService;

    public MachineResource(MachineOrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    @POST
    public Uni<Response> createMachine(MachineProvisionRequest request) {
        return orchestrationService.provisionMachine(request)
            .map(job -> Response.status(Response.Status.CREATED).entity(job).build());
    }

    @PATCH
    @Path("/{machineId}/hardware")
    public Uni<Response> updateHardware(@PathParam("machineId") String machineId, HardwareUpdateRequest request) {
        return orchestrationService.patchHardware(machineId, request)
            .map(job -> Response.accepted(job).build());
    }

    @GET
    @Path("/jobs/{jobId}")
    public Uni<AsyncJobResponse> getJobStatus(@PathParam("jobId") String jobId) {
        return orchestrationService.getJobStatus(jobId);
    }
}
