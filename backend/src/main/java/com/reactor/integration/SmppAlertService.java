package com.reactor.integration;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;

@ApplicationScoped
public class SmppAlertService {

    @ConfigProperty(name = "reactor.smpp.max-attempts", defaultValue = "5")
    int maxAttempts;

    @ConfigProperty(name = "reactor.smpp.base-delay-ms", defaultValue = "300")
    long baseDelayMs;

    public Uni<Boolean> sendWithBackoff(String destinationMsisdn, String message) {
        return attempt(destinationMsisdn, message, 1);
    }

    private Uni<Boolean> attempt(String destinationMsisdn, String message, int attempt) {
        return sendSms(destinationMsisdn, message)
            .onFailure()
            .recoverWithUni(err -> {
                if (attempt >= maxAttempts) {
                    return Uni.createFrom().item(false);
                }
                long delay = (long) (baseDelayMs * Math.pow(2, attempt - 1));
                return Uni.createFrom().voidItem()
                    .onItem().delayIt().by(Duration.ofMillis(delay))
                    .flatMap(v -> attempt(destinationMsisdn, message, attempt + 1));
            });
    }

    private Uni<Boolean> sendSms(String destinationMsisdn, String message) {
        if (destinationMsisdn == null || destinationMsisdn.isBlank()) {
            return Uni.createFrom().failure(new IllegalArgumentException("destination required"));
        }
        if (message == null || message.isBlank()) {
            return Uni.createFrom().failure(new IllegalArgumentException("message required"));
        }
        return Uni.createFrom().item(true);
    }
}
