# syntax=docker/dockerfile:1
#
# ZooKeeper: the coordinator Kafka needs to keep track of its brokers.
# Nothing to change here.

FROM confluentinc/cp-zookeeper:7.6.1

ENV ZOOKEEPER_CLIENT_PORT=2181 \
    ZOOKEEPER_TICK_TIME=2000 \
    ZOOKEEPER_SYNC_LIMIT=2

EXPOSE 2181 2888 3888
