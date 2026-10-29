FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S pixelcraft && adduser -S pixelcraft -G pixelcraft && mkdir -p /data/uploads && chown -R pixelcraft:pixelcraft /data
COPY --from=build /workspace/target/backend-1.0.0.jar app.jar
USER pixelcraft
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

