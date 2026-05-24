package com.reactor.machine.service;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Duration;

@ApplicationScoped
public class SmppDispatchClient {

    public Uni<Boolean> dispatchWithBackoff(String msisdn, String message) {
        return attempt(msisdn, message, 1, 4);
    }

    private Uni<Boolean> attempt(String msisdn, String message, int attempt, int max) {
        return send(msisdn, message)
            .onFailure().recoverWithUni(err -> {
                if (attempt >= max) {
                    return Uni.createFrom().item(false);
                }
                long delayMs = (long) (250 * Math.pow(2, attempt - 1));
                return Uni.createFrom().voidItem()
                    .onItem().delayIt().by(Duration.ofMillis(delayMs))
                    .flatMap(v -> attempt(msisdn, message, attempt + 1, max));
            });
    }

    private Uni<Boolean> send(String msisdn, String message) {
        if (msisdn == null || msisdn.isBlank()) {
            return Uni.createFrom().failure(new IllegalArgumentException("targetMobileEndpoint is required"));
        }
        return Uni.createFrom().item(true);
    }
}
