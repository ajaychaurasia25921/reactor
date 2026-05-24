FROM gradle:8.10.2-jdk21 AS build
WORKDIR /workspace
COPY . .
RUN gradle --no-daemon quarkusBuild

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/build/quarkus-app/ /app/
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/quarkus-run.jar"]
