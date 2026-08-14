package th.mfu.order;

import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

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

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ---- GET (list) : worked example, already done -----------------------
    @GetMapping
    public ResponseEntity<Iterable<Order>> listOrders() {
        return new ResponseEntity<>(orderRepository.findAll(), HttpStatus.OK);
    }

<<<<<<< Updated upstream
=======
    // ---- GET (one user's orders) -----------------------------------------
    // This is "the orders of each person". They live HERE, on order-service,
    // keyed by userId - NOT inside user-service.
    @GetMapping("/user/{userId}")
    public ResponseEntity<Iterable<Order>> ordersOfUser(@PathVariable Long userId) {
        return new ResponseEntity<>(orderRepository.findByUserId(userId), HttpStatus.OK);
    }

>>>>>>> Stashed changes
    // ---- POST (place an order) : the main task ---------------------------
    // Example request body (design your own shape - this is only a suggestion):
    //   { "customerName": "Alice", "productId": 1, "quantity": 2 }
    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request) {
<<<<<<< Updated upstream
        // TODO [Feign]  (step 1) ask product-service for the product:
        //     ProductDTO product = productClient.getProduct(request.getProductId());
        //     LOGGER.info("product came from copy on port {}", product.getServedByPort());
        //     ^ log this - it is your load-balancer proof in the demo.
        //
        // TODO [JPA]    (step 2) build the Order + one OrderItem from the reply
        //     (copy product.getName() and product.getPrice() into the item),
        //     compute the total, then orderRepository.save(order).
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
=======
        // ---- step 1 [Feign]: ask product-service for the product -----------
        // Calling this method makes a real HTTP GET under the hood, resolved
        // through Eureka by the name "product-service" and load-balanced
        // between the two running copies.
        ProductDTO product = productClient.getProduct(request.getProductId());
        LOGGER.info("product came from copy on port {}", product.getServedByPort());

        // ---- step 2 [JPA]: build and save the Order + OrderItem ------------
        OrderItem item = new OrderItem();
        item.setProductId(product.getId());
        item.setProductName(product.getName());
        item.setPrice(product.getPrice());
        item.setQuantity(request.getQuantity());

        double totalPrice = product.getPrice() * request.getQuantity();

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setUserId(request.getUserId());
        order.setTotalPrice(totalPrice);
        order.setItems(Collections.singletonList(item));

        // cascade = ALL on Order.items means this one save() also saves the
        // OrderItem - we never call orderItemRepository (there isn't one).
        Order saved = orderRepository.save(order);

        // ---- step 3 [Kafka]: publish an event -------------------------------
        // notification-service only reads "customerName" and "productName"
        // (see OrderPlacedListener), the rest is extra context in the log.
        ObjectNode event = objectMapper.createObjectNode();
        event.put("orderId", saved.getId());
        event.put("customerName", saved.getCustomerName());
        event.put("productName", product.getName());
        event.put("quantity", request.getQuantity());

        String json;
        try {
            json = objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            LOGGER.error("failed to build Kafka event JSON", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // send() is fire-and-forget: it does not wait for anyone to read the
        // event, and it does not know who (if anyone) will. That is pub/sub -
        // order-service and notification-service never call each other directly.
        kafkaTemplate.send(topicName, json);
        LOGGER.info("published to topic {}: {}", topicName, json);

        return new ResponseEntity<>("Order #" + saved.getId() + " placed", HttpStatus.CREATED);
>>>>>>> Stashed changes
    }
}
