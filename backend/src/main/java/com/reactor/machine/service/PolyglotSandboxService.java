package com.reactor.machine.service;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;

@ApplicationScoped
public class PolyglotSandboxService {

    public Uni<String> executePython(String script) {
        return Uni.createFrom().item(() -> {
            try (Context context = Context.newBuilder("python")
                .allowHostAccess(HostAccess.NONE)
                .allowHostClassLookup(c -> false)
                .allowIO(false)
                .build()) {
                context.eval("python", script);
                return context.getBindings("python").getMember("result").toString();
            }
        });
    }
}
