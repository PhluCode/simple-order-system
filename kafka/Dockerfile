# syntax=docker/dockerfile:1
#
# The Kafka broker: the message channel between order-service (publisher) and
# notification-service (subscriber). Nothing to change here.
#
# The broker has two doors:
#   - programs INSIDE docker knock on   kafka:9092
#   - programs on YOUR machine knock on localhost:9094
# Same broker, two addresses.

FROM confluentinc/cp-kafka:7.6.1

ENV KAFKA_BROKER_ID=1 \
    KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
    KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT \
    KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9094 \
    KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,PLAINTEXT_HOST://0.0.0.0:9094 \
    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
    KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0

EXPOSE 9092 9094
