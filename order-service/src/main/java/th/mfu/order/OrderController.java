package th.mfu.order;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The heart of the project. STUDENT B.
 * <p>
 * Placing an order ties three graded features together:
 *   1. Feign  - ask product-service for the product (name + price).
 *   2. JPA    - save the Order and its OrderItems.
 *   3. Kafka  - publish an "orders" event so notification-service reacts.
 * <p>
 * Everything you need is autowired below. GET is a worked example; the work is
 * in {@code placeOrder}.
 */
@RestController
@RequestMapping("/orders")
public class OrderController {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderRepository orderRepository;

    /** The Feign client - calling a method on it makes an HTTP call. */
    @Autowired
    private ProductClient productClient;

    /** The one Kafka class a producer needs: send(topic, message). */
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Value("${app.kafka.topic:orders}")
    private String topicName;

    // ---- GET (list) : worked example, already done -----------------------
    @GetMapping
    public ResponseEntity<Iterable<Order>> listOrders() {
        return new ResponseEntity<>(orderRepository.findAll(), HttpStatus.OK);
    }

    // ---- GET (one user's orders) -----------------------------------------
    // This is "the orders of each person". They live HERE, on order-service,
    // keyed by userId - NOT inside user-service.
    @GetMapping("/user/{userId}")
    public ResponseEntity<Iterable<Order>> ordersOfUser(@PathVariable Long userId) {
        // TODO [JPA]: return orderRepository.findByUserId(userId) with 200 OK.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    // ---- POST (place an order) : the main task ---------------------------
    // Example request body (design your own shape - this is only a suggestion):
    //   { "customerName": "Alice", "productId": 1, "quantity": 2 }
    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request) {
        // TODO [Feign]  (step 1) ask product-service for the product:
        //     ProductDTO product = productClient.getProduct(request.getProductId());
        //     LOGGER.info("product came from copy on port {}", product.getServedByPort());
        //     ^ log this - it is your load-balancer proof in the demo.
        //
        // TODO [JPA]    (step 2) build the Order + one OrderItem from the reply
        //     (copy product.getName() and product.getPrice() into the item),
        //     compute the total, then orderRepository.save(order).
        //     Also copy request.getUserId() onto the order, so it can be found
        //     later by GET /orders/user/{userId}.
        //
        // TODO [Kafka]  (step 3) publish an event so notification-service reacts.
        //     Build a small JSON string, e.g.
        //       {"orderId":..,"customerName":"..","productName":"..","quantity":..}
        //     then:  kafkaTemplate.send(topicName, json);
        //     Note what send() does NOT do: it does not wait for anyone to read
        //     it, and it does not know who will. That is pub/sub.
        //
        // Then return 201 CREATED.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }
}
