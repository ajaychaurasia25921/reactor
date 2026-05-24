package com.reactor.sandbox;

import com.reactor.domain.ExecutionResult;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;
import org.graalvm.polyglot.Value;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.*;

@ApplicationScoped
public class GraalSandboxExecutionService {

    @ConfigProperty(name = "reactor.sandbox.timeout-ms", defaultValue = "800")
    long timeoutMs;

    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    public Uni<ExecutionResult> execute(String language, String script) {
        return Uni.createFrom().completionStage(() -> {
            CompletableFuture<ExecutionResult> future = new CompletableFuture<>();
            executor.submit(() -> runScript(language, script, future));
            return future.orTimeout(timeoutMs, TimeUnit.MILLISECONDS)
                .exceptionally(ex -> new ExecutionResult(false, "", ex.getMessage(), timeoutMs));
        });
    }

    private void runScript(String language, String script, CompletableFuture<ExecutionResult> future) {
        Instant start = Instant.now();
        try (Context context = Context.newBuilder(language)
            .allowIO(false)
            .allowHostAccess(HostAccess.NONE)
            .allowHostClassLookup(className -> false)
            .build()) {

            context.eval(language, script);
            Value result = context.getBindings(language).getMember("result");
            String output = result == null ? "{}" : result.toString();
            long elapsed = Duration.between(start, Instant.now()).toMillis();
            future.complete(new ExecutionResult(true, output, "", elapsed));
        } catch (Exception ex) {
            long elapsed = Duration.between(start, Instant.now()).toMillis();
            future.complete(new ExecutionResult(false, "", ex.getMessage(), elapsed));
        }
    }
}
