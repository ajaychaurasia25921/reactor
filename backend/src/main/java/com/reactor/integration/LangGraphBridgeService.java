package com.reactor.integration;

import com.reactor.domain.FaultEvent;
import com.reactor.domain.RemediationPlan;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.UUID;

@ApplicationScoped
public class LangGraphBridgeService {

    @ConfigProperty(name = "reactor.ai.default-language", defaultValue = "python")
    String defaultLanguage;

    public Uni<RemediationPlan> startInvestigation(FaultEvent faultEvent) {
        String runId = UUID.randomUUID().toString();

        String script = faultEvent.cpuUsage() >= 95
            ? "result = {'action':'scale_out','units':2,'reason':'cpu_critical'}"
            : "result = {'action':'rebalance','reason':'cpu_high'}";

        String sms = "Fabric Engine remediation started for " + faultEvent.source() +
            " cpu=" + faultEvent.cpuUsage();

        RemediationPlan plan = new RemediationPlan(
            runId,
            defaultLanguage,
            script,
            sms,
            faultEvent.source()
        );

        return Uni.createFrom().item(plan);
    }
}
