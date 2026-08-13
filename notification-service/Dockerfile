# syntax=docker/dockerfile:1
FROM maven:3.9.6-eclipse-temurin-11 AS build
WORKDIR /app
COPY pom.xml .
COPY eureka-naming-server/pom.xml eureka-naming-server/
COPY product-service/pom.xml product-service/
COPY order-service/pom.xml order-service/
COPY notification-service/pom.xml notification-service/
COPY notification-service/src notification-service/src
RUN mvn -q -B -DskipTests -pl notification-service -am package

FROM eclipse-temurin:11-jre
WORKDIR /app
ENV JAVA_OPTS=""
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/notification-service/target/*.jar /app/app.jar
EXPOSE 8300
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
