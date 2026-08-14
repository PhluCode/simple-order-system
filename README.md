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
| 6 | `User` *(bonus)* | user-service | account with a `role`: ADMIN or USER |

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

> Every `TODO` in the code is tagged `[REST]`, `[JPA]`, `[Feign]`, `[Kafka]`
> or `[Auth]` so you can see which points it earns.

### Optional: user-service (accounts + roles)

Not required by the rubric — the required 5 entities are already covered — but
it makes the system realistic. It adds a **6th entity** (`User`) with a `role`
of `ADMIN` or `USER`, and a **simple** log-in (`POST /users/login` checks the
username + password against the database and returns the role; no Spring
Security, no JWT). The idea:

- **USER** places orders (order-service).
- **ADMIN** watches the notifications dashboard (:8300).

Enforcing "only admin sees notifications" is left as a later step (a note, not
code, so notification-service stays untouched for now). Since there are 3 of you
and now 4 services, let one member own two, or treat user-service as a shared
bonus. Port **8400**.

> ⚠️ The demo stores passwords as plain text for simplicity. Say so in the
> Q&A — a real app must hash them (e.g. BCrypt) and never return them in a
> response.

---

## 🚀 Quick Start Guide (สำหรับเพื่อนร่วมทีมที่ Clone โปรเจกต์ไปรัน)

### 1. คำสั่งรันระบบทั้งหมด (Docker Compose)

เปิด Terminal ในโฟลเดอร์ root ของโปรเจกต์ (`simple-order-system`) แล้วรันคำสั่ง:

```bash
# สั่ง Build และรันทุก Microservice + MySQL + Kafka + Eureka ใน Background
docker compose up -d --build
```

*(การรันครั้งแรก Docker จะทำการ Download Image และ Compile Maven ใน Container ใช้เวลาประมาณ 1–2 นาที)*

---

### 2. การเชื่อมต่อฐานข้อมูล MySQL ผ่าน DBeaver

ฐานข้อมูลที่ใช้คือ **MySQL 8.0** ธีมร้านกาแฟชื่อ **`coffee_shop`**:

- **Driver Type**: `MySQL`
- **Host / Server**: `localhost`
- **Port**: `3307` *(ตั้งค่าหลบ Port 3306 ในเครื่อง)*
- **Database**: `coffee_shop`
- **Username**: `root`
- **Password**: `root`

**⚠️ ตั้งค่าเพิ่มเติมใน DBeaver (แท็บ Driver Properties)**:
- `allowPublicKeyRetrieval` = `true`
- `useSSL` = `false`

---

### 3. ข้อมูลเริ่มต้นร้านกาแฟ (Data Seeding)

ระบบตั้งค่าให้ Spring Boot อ่านไฟล์ **`product-service/src/main/resources/seed.sql`** เพื่อนำเข้าข้อมูลหมวดหมู่สินค้า (`Hot Coffee`, `Iced Coffee`, `Tea & Non-Coffee`, `Bakery & Pastries`) และเมนูกาแฟตัวอย่าง 12 รายการเข้าฐานข้อมูล `coffee_shop` ใน MySQL โดยอัตโนมัติทันทีที่ Container เริ่มทำงาน

---

### 4. พอร์ตและ URLs สำหรับทดสอบระบบ

| Service / Dashboard | URL | รายละเอียด |
| :--- | :--- | :--- |
| 📍 **Eureka Dashboard** | [http://localhost:8761](http://localhost:8761) | หน้ารวม Microservices ที่ลงทะเบียนไว้ |
| 📍 **Product Service (Copy 1)** | [http://localhost:8100/products](http://localhost:8100/products) | REST API จัดการสินค้า (Port 8100) |
| 📍 **Product Service (Copy 2)** | [http://localhost:8101/products](http://localhost:8101/products) | REST API จัดการสินค้า (Port 8101 - Load Balancer) |
| 📍 **Order Service** | [http://localhost:8200/orders](http://localhost:8200/orders) | REST API สั่งซื้อสินค้า |
| 📍 **User Service** | [http://localhost:8400/users](http://localhost:8400/users) | REST API จัดการบัญชีผู้ใช้และ Login (Port 8400) |
| 📍 **Notification Live Dashboard** | [http://localhost:8300](http://localhost:8300) | หน้าจอ Live Dashboard แสดง Order จาก Kafka |

---

### 5. คำสั่งจัดการ Docker Useful Commands

```bash
# ตรวจสอบสถานะ Containers ทั้งหมด
docker compose ps

# ดู Log การทำงานของระบบ
docker compose logs -f

# ดู Log เฉพาะ product-service
docker compose logs -f product-service-1

# ปิดระบบ Container ทั้งหมด
docker compose down
```

---

### 6. วิธีทดสอบ REST API ของ product-service ด้วย Postman

Base URL: `http://localhost:8100/products`

#### 🟢 1. GET — ดึงรายการสินค้าทั้งหมด (และค้นหา)
* **HTTP Method**: `GET`
* **URL**: `http://localhost:8100/products`
* **ตัวเลือกค้นหา (Query Params)**:
  * ค้นหาตามชื่อ: `http://localhost:8100/products?name=latte`
  * กรองตามหมวดหมู่: `http://localhost:8100/products?categoryId=1`

#### 🟢 2. GET — ดึงข้อมูลสินค้าชิ้นเดียวตาม ID
* **HTTP Method**: `GET`
* **URL**: `http://localhost:8100/products/1`

#### 🟡 3. POST — เพิ่มสินค้าใหม่
* **HTTP Method**: `POST`
* **URL**: `http://localhost:8100/products`
* **Headers**: `Content-Type: application/json`
* **Body** (เลือก `raw` ➔ `JSON`):
  ```json
  {
    "name": "Iced Honey Lemon Espresso",
    "price": 80.0,
    "stock": 30,
    "categoryId": 2
  }
  ```

#### 🔵 4. PUT — แก้ไขข้อมูลสินค้าทั้งหมด (Replace)
* **HTTP Method**: `PUT`
* **URL**: `http://localhost:8100/products/1`
* **Headers**: `Content-Type: application/json`
* **Body** (เลือก `raw` ➔ `JSON`):
  ```json
  {
    "name": "Single Origin Espresso",
    "price": 50.0,
    "stock": 45,
    "categoryId": 1
  }
  ```

#### 🟠 5. PATCH — อัปเดตเฉพาะบางฟิลด์ (Partial Update)
* **HTTP Method**: `PATCH`
* **URL**: `http://localhost:8100/products/1`
* **Headers**: `Content-Type: application/json`
* **Body** (เลือก `raw` ➔ `JSON`):
  ```json
  {
    "price": 40.0,
    "stock": 60
  }
  ```

#### 🔴 6. DELETE — ลบสินค้าตาม ID
* **HTTP Method**: `DELETE`
* **URL**: `http://localhost:8100/products/1`

---

## How to run

### Option 1 — Docker (everything at once)

```bash
docker compose up --build -d
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
