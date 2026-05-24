package com.reactor.machine.domain;

public record MachineProvisionRequest(
    String name,
    String type,
    ResourceSpec resources
) {
    public record ResourceSpec(int cpuCores, int memoryGb) {}
}
