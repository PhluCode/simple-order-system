# Simple Order System

A microservices backend for a tiny online shop, built for the *Backend
Development* group project. Placing an order asks a product service for the
price (Feign, over a load balancer), stores the order (JPA), and announces it on
Kafka so a notification service reacts.

This repository is a **template**: the infrastructure is finished and runs as
is; the three business services are skeletons with `TODO` markers for the team
to complete. Every graded feature has an owner.

---

## Architecture

```
                         ┌───────────────────────┐
                         │  Eureka naming server │   (given, done)
                         │        :8761          │
                         └───────────┬───────────┘
              register / discover     │
        ┌───────────────┬─────────────┴───────────────┐
        │               │                             │
 ┌──────┴──────┐  ┌──────┴──────┐              ┌───────┴────────┐
 │  product-   │  │  product-   │   Feign +    │    order-      │
 │ service :8100│ │ service :8101│◀─load bal.──│  service :8200 │
 │  (copy 1)   │  │  (copy 2)   │              │                │
 └─────────────┘  └─────────────┘              └───────┬────────┘
   Student A: JPA + REST + load balancer                │ publish "orders"
                                                        ▼
                                                 ┌──────────────┐
                                                 │    Kafka     │ (given, done)
                                                 │  :9092/9094  │
                                                 └──────┬───────┘
                                                        │ subscribe "orders"
                                                        ▼
                                              ┌────────────────────┐
                                              │ notification-      │
                                              │  service :8300     │
                                              │  live page + JPA   │
                                              └────────────────────┘
                                                Student C: Kafka consumer
```

- **Feign + Eureka**: order-service calls product-service by the *name*
  `product-service`, not an address. Eureka resolves the name.
- **Load balancer**: two copies of product-service run. The caller alternates
  between them automatically. Each reply carries the port that answered
  (`servedByPort`), so you can watch it flip between 8100 and 8101.
- **Kafka pub/sub**: order-service publishes to the `orders` topic and moves on;
  notification-service subscribes and reacts. Neither knows about the other.

---

## Domain model — 5 related entities (10 pts)

| # | Entity | Service | Relationship |
|---|--------|---------|--------------|
| 1 | `Category` | product-service | one Category has many Products (`@OneToMany`) |
| 2 | `Product` | product-service | many Products belong to one Category (`@ManyToOne`) |
| 3 | `Order` | order-service | one Order has many OrderItems (`@OneToMany`) |
| 4 | `OrderItem` | order-service | many OrderItems belong to one Order (`@ManyToOne`) |
| 5 | `Notification` | notification-service | filled from `orders` Kafka events |

```
Category 1 ───< Product          OrderItem >─── 1 Order
(product-service)                (order-service)

Order (orders topic) ──▶ Kafka ──▶ Notification (notification-service)
```

---

## Who does what (everyone writes backend)

| Member | Service | You implement | Graded feature you explain in the demo |
|--------|---------|---------------|----------------------------------------|
| **A** | product-service | `Category`, `Product`, the 5 REST methods in `ProductController` | REST (5), JPA (4), **Load balancer (5)** |
| **B** | order-service | `Order`, `OrderItem`, `OrderController` (Feign call + Kafka publish) | **Feign + Eureka (5)**, Kafka producer, JPA (4) |
| **C** | notification-service | `Notification`, the `@KafkaListener` in `OrderPlacedListener` | **Kafka pub/sub (5)**, JPA (2) |

> Every `TODO` in the code is tagged `[REST]`, `[JPA]`, `[Feign]` or `[Kafka]`
> so you can see which points it earns.

---

## How to run

### Option 1 — Docker (everything at once)

```bash
docker compose up --build
```

First boot is slow (Maven builds four jars inside Docker). Then open:

- Eureka dashboard: http://localhost:8761
- Notifications live page: http://localhost:8300

Stop with `docker compose down` (add `-v` to also wipe the databases and Kafka
events).

### Option 2 — Local, one service at a time (best while coding)

Start the infrastructure in Docker, run the Java services on your machine so a
restart is fast:

```bash
docker compose up zookeeper kafka eureka-naming-server
```

Then, in separate terminals from the repo root:

```bash
mvn -pl eureka-naming-server spring-boot:run
mvn -pl product-service spring-boot:run
mvn -pl product-service spring-boot:run -Dspring-boot.run.arguments=--server.port=8101
mvn -pl order-service spring-boot:run
mvn -pl notification-service spring-boot:run
```

(The two `product-service` lines are the two copies that make the load balancer
visible.)

---

## Demo checklist — how to show each feature earns its points

1. **REST (5)** — hit product-service with all five verbs:
   ```bash
   curl -X POST   localhost:8100/products -H "Content-Type: application/json" -d '{"name":"Latte","price":45,"stock":10}'
   curl           localhost:8100/products
   curl           localhost:8100/products/1
   curl -X PUT    localhost:8100/products/1 -H "Content-Type: application/json" -d '{"name":"Latte","price":50,"stock":8}'
   curl -X PATCH  localhost:8100/products/1 -H "Content-Type: application/json" -d '{"price":40}'
   curl -X DELETE localhost:8100/products/1
   ```
2. **JPA (10)** — show the 5 entities and their relationships; GET returns
   nested data (a Product with its Category, an Order with its OrderItems).
3. **Feign + Eureka (5)** — show the Eureka dashboard listing every service;
   show `ProductClient` calling by name; place an order and see it fetch the
   product.
4. **Load balancer (5)** — POST several orders and watch order-service's log:
   `servedByPort` alternates 8100 → 8101 → 8100 …
5. **Kafka pub/sub (5)** — POST an order, then watch a row appear on
   http://localhost:8300 within two seconds. Kill order-service and the page
   still works: proof the services are decoupled.

```bash
curl -X POST localhost:8200/orders -H "Content-Type: application/json" \
     -d '{"customerName":"Alice","productId":1,"quantity":2}'
```

---

## Build tooling

- Spring Boot 2.5.0, Spring Cloud 2020.0.3, Java 11 (matches the course labs)
- JPA uses `javax.persistence` (not `jakarta`) because of the Boot version
- H2 in-memory database per service
- Multi-module Maven — run `mvn` from the repo root

---

## AI usage

*(Required by the assignment. Fill this in honestly before you submit.)*

- **Tool(s):** e.g. Claude / ChatGPT / GitHub Copilot
- **What it did:** scaffolded this template — the folder layout, `pom.xml` files,
  `docker-compose.yml`, Dockerfiles, `application.properties`, the Eureka server,
  the Feign client and Kafka wiring, and the `TODO` skeletons — based on the
  course's own sample projects.
- **What the team wrote themselves:** the entities, the REST methods, the order
  workflow (Feign call + Kafka publish), and the Kafka listener — every `TODO`.
- **How we checked it:** *(describe your testing — curl, the live page, reading
  the code so each member can explain their own service.)*
```
