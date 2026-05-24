package com.reactor.domain;

import java.time.Instant;

public record FaultEvent(
    String source,
    String severity,
    double cpuUsage,
    Instant observedAt,
    String payloadJson
) {}
