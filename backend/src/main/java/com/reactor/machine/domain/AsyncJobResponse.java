package com.reactor.machine.domain;

public record AsyncJobResponse(
    String jobId,
    String status,
    String checkStatusUrl
) {}
