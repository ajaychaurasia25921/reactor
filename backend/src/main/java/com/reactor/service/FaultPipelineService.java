package com.reactor.service;

import com.reactor.domain.ExecutionResult;
import com.reactor.domain.FaultEvent;
import com.reactor.domain.RemediationPlan;
import com.reactor.integration.LangGraphBridgeService;
import com.reactor.integration.SmppAlertService;
import com.reactor.persistence.FaultEventRepository;
import com.reactor.sandbox.GraalSandboxExecutionService;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class FaultPipelineService {

    private final FaultEventRepository repository;
    private final LangGraphBridgeService langGraphBridgeService;
    private final GraalSandboxExecutionService sandboxExecutionService;
    private final SmppAlertService smppAlertService;

    public FaultPipelineService(
        FaultEventRepository repository,
        LangGraphBridgeService langGraphBridgeService,
        GraalSandboxExecutionService sandboxExecutionService,
        SmppAlertService smppAlertService
    ) {
        this.repository = repository;
        this.langGraphBridgeService = langGraphBridgeService;
        this.sandboxExecutionService = sandboxExecutionService;
        this.smppAlertService = smppAlertService;
    }

    public Uni<ExecutionResult> processFault(FaultEvent event, String alertMsisdn) {
        return repository.insertFault(event)
            .flatMap(ignored -> langGraphBridgeService.startInvestigation(event))
            .flatMap(plan -> runRemediation(plan, alertMsisdn));
    }

    private Uni<ExecutionResult> runRemediation(RemediationPlan plan, String alertMsisdn) {
        return sandboxExecutionService.execute(plan.language(), plan.script())
            .flatMap(result -> repository.insertRemediation(plan, result).replaceWith(result))
            .flatMap(result -> smppAlertService.sendWithBackoff(alertMsisdn, plan.smsMessage())
                .replaceWith(result));
    }
}
