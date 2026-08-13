# syntax=docker/dockerfile:1
#
# Two-stage build. Stage 1 builds the jar with Maven; stage 2 keeps only the
# jar on a small Java runtime.
#
# Because the modules share a parent pom, the build context is the REPO ROOT
# (see docker-compose.yml: context is ".").

FROM maven:3.9.6-eclipse-temurin-11 AS build
WORKDIR /app
# The parent pom lists every module, so Maven needs every module's pom to read
# the build - but only THIS module's source.
COPY pom.xml .
COPY eureka-naming-server/pom.xml eureka-naming-server/
COPY product-service/pom.xml product-service/
COPY order-service/pom.xml order-service/
COPY notification-service/pom.xml notification-service/
COPY user-service/pom.xml user-service/
COPY eureka-naming-server/src eureka-naming-server/src
RUN mvn -q -B -DskipTests -pl eureka-naming-server -am package

FROM eclipse-temurin:11-jre
WORKDIR /app
ENV JAVA_OPTS=""
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/eureka-naming-server/target/*.jar /app/app.jar
EXPOSE 8761
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
