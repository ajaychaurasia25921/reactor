package com.reactor.machine.domain;

public record AlertTrigger(
    String machineId,
    String reason,
    double thresholdValue
) {}
