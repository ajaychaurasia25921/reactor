package com.reactor.machine.service;

import com.reactor.machine.domain.AlertTrigger;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class LangGraphOllamaBridgeService {

    public Uni<String> generateRemediationScript(AlertTrigger trigger) {
        String script = trigger.thresholdValue() >= 90
            ? "result = {'action':'downscale_hot_processes','reason':'cpu_threshold_breach'}"
            : "result = {'action':'no_op','reason':'below_threshold'}";
        return Uni.createFrom().item(script);
    }
}
