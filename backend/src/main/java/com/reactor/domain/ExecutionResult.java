package com.reactor.domain;

public record ExecutionResult(
    boolean success,
    String output,
    String error,
    long durationMillis
) {}
