package com.reactor.persistence;

import com.reactor.domain.ExecutionResult;
import com.reactor.domain.FaultEvent;
import com.reactor.domain.RemediationPlan;
import io.smallrye.mutiny.Uni;
import io.vertx.mutiny.pgclient.PgPool;
import io.vertx.mutiny.sqlclient.Tuple;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class FaultEventRepository {

    private final PgPool pgPool;

    public FaultEventRepository(PgPool pgPool) {
        this.pgPool = pgPool;
    }

    public Uni<Void> insertFault(FaultEvent event) {
        String sql = """
            INSERT INTO fault_event(source, severity, cpu_usage, observed_at, payload_json, status)
            VALUES ($1, $2, $3, $4, $5, 'DETECTED')
            """;
        return pgPool.preparedQuery(sql)
            .execute(Tuple.of(event.source(), event.severity(), event.cpuUsage(), event.observedAt(), event.payloadJson()))
            .replaceWithVoid();
    }

    public Uni<Void> insertRemediation(RemediationPlan plan, ExecutionResult result) {
        String sql = """
            INSERT INTO remediation_run(id, fault_id, plan_json, state, started_at, completed_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            """;
        String state = result.success() ? "COMPLETED" : "FAILED";
        String planJson = "{\"language\":\"" + plan.language() + "\",\"target\":\"" + plan.executionTarget() + "\"}";
        return pgPool.preparedQuery(sql)
            .execute(Tuple.of(plan.runId(), plan.executionTarget(), planJson, state))
            .replaceWithVoid();
    }
}
