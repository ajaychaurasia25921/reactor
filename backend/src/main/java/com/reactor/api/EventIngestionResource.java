package com.reactor.api;

import com.reactor.domain.ExecutionResult;
import com.reactor.domain.FaultEvent;
import com.reactor.service.FaultPipelineService;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Path("/api/v1/events")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class EventIngestionResource {

    private final FaultPipelineService faultPipelineService;

    @ConfigProperty(name = "reactor.alert.default-msisdn")
    String defaultMsisdn;

    public EventIngestionResource(FaultPipelineService faultPipelineService) {
        this.faultPipelineService = faultPipelineService;
    }

    @POST
    @Path("/fault")
    public Uni<ExecutionResult> ingestFault(FaultEvent faultEvent) {
        return faultPipelineService.processFault(faultEvent, defaultMsisdn);
    }
}
