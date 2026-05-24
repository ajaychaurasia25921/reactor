package com.reactor.machine.domain;

import java.util.List;

public record HardwareUpdateRequest(
    Integer targetRamGb,
    Long scaleStorageBytes,
    String acceleratorClass,
    List<String> microcodeVersions,
    List<String> coprocessorArrays
) {}
