package com.reactor.machine;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class MachineResourceTest {

    @Test
    void shouldCreateMachineJob() {
        given()
            .contentType("application/json")
            .body("""
                {
                  "name": "quantum-simulation-node-01",
                  "type": "quantum",
                  "resources": {"cpuCores": 64, "memoryGb": 256}
                }
                """)
        .when()
            .post("/api/v1/machines")
        .then()
            .statusCode(201)
            .body("jobId", not(blankOrNullString()))
            .body("status", equalTo("enqueued"));
    }

    @Test
    void shouldPatchHardwareJob() {
        given()
            .contentType("application/json")
            .body("""
                {
                  "targetRamGb": 1024,
                  "scaleStorageBytes": 2199023255552,
                  "acceleratorClass": "NVIDIA_H100",
                  "microcodeVersions": ["mcode-2.1.9"],
                  "coprocessorArrays": ["fpga-x1"]
                }
                """)
        .when()
            .patch("/api/v1/machines/2d95f1fc-342a-4ba9-a3ad-7dece6c013b1/hardware")
        .then()
            .statusCode(202)
            .body("jobId", not(blankOrNullString()));
    }

    @Test
    void shouldRejectInvalidMachinePayload() {
        given()
            .contentType("application/json")
            .body("""
                {
                  "name": "",
                  "type": "quantum",
                  "resources": {"cpuCores": 0, "memoryGb": 0}
                }
                """)
        .when()
            .post("/api/v1/machines")
        .then()
            .statusCode(400)
            .body("code", equalTo("REQUEST_ERROR"));
    }
}
