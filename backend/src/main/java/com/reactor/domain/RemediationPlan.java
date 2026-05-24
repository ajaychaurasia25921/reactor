package com.reactor.domain;

public record RemediationPlan(
    String runId,
    String language,
    String script,
    String smsMessage,
    String executionTarget
) {}
