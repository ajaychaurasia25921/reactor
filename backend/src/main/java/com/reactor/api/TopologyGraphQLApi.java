package com.reactor.api;

import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.Query;

import java.time.Instant;
import java.util.List;

@GraphQLApi
@ApplicationScoped
public class TopologyGraphQLApi {

    @Query
    @Description("Fetch current topology nodes")
    public Uni<List<TopologyNode>> topologyNodes() {
        return Uni.createFrom().item(List.of(
            new TopologyNode("leaf-01", "leaf", 78.2),
            new TopologyNode("spine-01", "spine", 62.5)
        ));
    }

    @Query
    @Description("Realtime remediation and topology updates")
    public Multi<TopologyDelta> topologyDeltaStream() {
        return Multi.createFrom().ticks().every(java.time.Duration.ofMillis(500))
            .onItem().transform(i -> new TopologyDelta(
                "leaf-01",
                70 + (i % 20),
                Instant.now().toString()
            ));
    }

    public record TopologyNode(String id, String role, double cpuLoad) {}
    public record TopologyDelta(String nodeId, long cpuLoad, String observedAt) {}
}
