# DOI — front end for simple-order-system

A coffee counter for the four Spring Boot services in this repository. It sells
drinks, and while it does, it shows the order moving through the mesh: which
`product-service` replica answered, when the order was written, when the event
went onto the Kafka topic, and when `notification-service` consumed it.

```
npm install
npm run dev          # http://localhost:5173
```

Nothing else to configure. The dev server proxies `/api/*` to the services on
their default ports, so no CORS setup is needed while developing. To work on
the interface with the backend switched off:

```
VITE_USE_MOCK=true npm run dev
```

## What talks to what

| Front end calls        | Proxied to              | Service              |
| ---------------------- | ----------------------- | -------------------- |
| `/api/products`        | `localhost:8100`        | product-service      |
| `/api/orders`          | `localhost:8200`        | order-service        |
| `/api/notifications`   | `localhost:8300`        | notification-service |
| `/api/users`           | `localhost:8400`        | user-service         |

Copy `.env.example` to `.env` to move any of them.

## Three places the backend is not what you might assume

These caught the build out, so they are worth stating plainly.

**There is no `GET /categories`.** `ProductController` exposes `/products` and
nothing else. The category rail is derived from the `categoryId` and
`categoryName` fields on each product (`src/lib/categories.ts`), and filtering
uses `GET /products?categoryId=`, which the controller does support.

**`POST /orders` takes one product, not a basket.** The body is
`{ customerName, userId, productId, quantity }`, and the reply is plain text —
`"Order #7 placed"` — not JSON. A cart with three drinks therefore becomes
three sequential requests, and the checkout reports each one separately, because
a partial success is a real outcome (`src/hooks/usePlaceOrder.ts`).

**No service sends CORS headers.** Fine behind the dev proxy, fatal without it.
See `CORS.md` for the config to add before deploying the built output anywhere.

Two smaller ones: `ProductDTO` has no `description` field, so the cards are
built from the name, price, stock and category the service actually sends
rather than invented copy; and neither `Order` nor `Notification` carries a
timestamp, so both lists are ordered by id and say so.

## Editing the menu (admin)

Sign in as an **ADMIN** and two things appear: a **New product** button in the
menu header, and an **Edit this product** link at the bottom of any product
panel. Both open the same form, which reaches all four write endpoints:

| What you do            | Request                |
| ---------------------- | ---------------------- |
| Add a product          | `POST /products`       |
| Change some fields     | `PATCH /products/{id}` |
| Change a field PATCH cannot express | `PUT /products/{id}` |
| Remove a product       | `DELETE /products/{id}`|

The form shows which request it is about to send, and says why when it has to
fall back to `PUT`. That is not decoration — **`patchProduct` cannot set a price
or a stock count to zero, and cannot clear a category.** It decides whether a
field was supplied by testing `dto.getPrice() != 0.0` and `dto.getStock() != 0`,
and those are Java primitives: a field omitted from the JSON arrives as `0`,
which is indistinguishable from "set this to 0". Same for a null `categoryId`.
So the form diffs your edit against the original, sends `PATCH` with only the
changed fields when that is safe, and switches to `PUT` — which replaces every
field unconditionally — when it is not. Without that, setting something to zero
would appear to succeed and change nothing.

Two more things the interface takes care of:

- **Never send `id` when creating.** `ProductMapper.toEntity` copies `dto.id`
  onto the entity, so a supplied id turns the insert into an update of a row
  that does not exist.
- **The cart is reconciled after a write.** Editing a product refreshes the
  snapshot sitting in the cart (and pulls the quantity back if stock dropped
  below it); deleting one takes it out, since ordering it would come back 404.
  Orders already placed are untouched — `OrderItem` copied the name and price
  at the time, so history does not move.

`UserServiceApp` seeds two accounts on start-up:

| Username | Password   | Role  |
| -------- | ---------- | ----- |
| `admin`  | `admin123` | ADMIN |
| `user`   | `user123`  | USER  |

**This is not access control.** `POST /users/login` returns a user object and no
token, so the role only exists in this browser tab, and every write endpoint on
product-service accepts an unauthenticated request from anyone who can reach
`:8100`:

```
curl -X POST localhost:8100/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Free Coffee","price":0,"stock":999,"categoryId":1}'
```

Hiding these controls keeps the counter tidy for people ordering drinks; it does
not protect the endpoints — `PUT`, `PATCH` and `DELETE` are just as open.
Making it real means issuing something the services can verify — see the end of
`CORS.md`, where the gateway would be the place to check it.


## Layout

```
src/
  api/          one module per service, matching the real endpoints
  hooks/        TanStack Query wrappers, plus the order fan-out
  store/        cart, session, and the pipeline state machine
  three/        procedural geometry — no model files to download
  components/   interface
  lib/          types mirroring the Java DTOs, formatting, mock menu
```

`src/lib/types.ts` is the contract. Every interface there matches a Java class;
if a field is missing it is because the backend does not send it.

## The rail

The strip under the header is not decoration. Each station moves because
something real happened:

- **product-service** — the menu loaded, and the ports shown are the replicas
  that answered. Reload a few times and watch `:8100` and `:8101` alternate.
- **order-service** — `POST /orders` returned 201 for each cart line, and the
  note shows the order numbers it gave back.
- **kafka · orders** — the event has been published. A browser cannot watch a
  Kafka topic, so this station stays in flight until a notification appears,
  and fails after 15 seconds with `no consumer` if none does.
- **notification-service** — `GET /notifications` returned more rows than
  before the order was placed.

That last failure state is a working diagnostic: if orders are being written
but the rail stalls at `kafka · orders`, the consumer is down or reading a
different topic.

## 3D

Every object is generated at runtime from lathe profiles and primitives
(`src/three/geometry.ts`) — there are no `.glb` files to fetch, so the canvases
start instantly and work with no network. The hero is a 180° lathe: half the
cup is missing, so you see the drink in section. The product viewer is a full
model with orbit controls.

Reflections come from three's bundled `RoomEnvironment` rather than a
downloaded HDR. Glass uses plain transparency, not `transmission` — refraction
needs something behind the object to refract, and these canvases render on a
transparent background, which makes a transmission material come out as a flat
grey slab.

`prefers-reduced-motion` stops the hero's motion, the product turntable, and
the steam.

## Notes for the demo

- Open a product and look at **answered by** — that is the load balancer,
  visible. Close and reopen it a few times.
- Put two different drinks in the cart. The cart footer will tell you it is
  about to become two orders, and the checkout will list both replies.
- Place an order, then watch the rail. The last station lights up when
  notification-service has actually consumed the event, usually within a
  couple of seconds.
