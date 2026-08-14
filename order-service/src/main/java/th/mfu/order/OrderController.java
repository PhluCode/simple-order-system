package th.mfu.order;

import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import feign.FeignException;

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

    // ---- GET (one order by ID) -------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(order -> new ResponseEntity<>(order, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // ---- GET (one user's orders) -----------------------------------------
    // This is "the orders of each person". They live HERE, on order-service,
    // keyed by userId - NOT inside user-service.
    @GetMapping("/user/{userId}")
    public ResponseEntity<Iterable<Order>> ordersOfUser(@PathVariable Long userId) {
        return new ResponseEntity<>(orderRepository.findByUserId(userId), HttpStatus.OK);
    }

    // ---- DELETE (cancel / delete order) ----------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // ---- POST (place an order) : the main task ---------------------------
    // Example request body:
    //   { "customerName": "Alice", "userId": 1, "productId": 1, "quantity": 2 }
    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request) {
        if (request == null || request.getProductId() == null) {
            return new ResponseEntity<>("Product ID is required", HttpStatus.BAD_REQUEST);
        }

        int quantity = request.getQuantity() > 0 ? request.getQuantity() : 1;

        // ---- step 1 [Feign]: ask product-service for the product -----------
        // Calling this method makes a real HTTP GET under the hood, resolved
        // through Eureka by the name "product-service" and load-balanced
        // between the two running copies.
        ProductDTO product;
        try {
            product = productClient.getProduct(request.getProductId());
        } catch (FeignException.NotFound e) {
            return new ResponseEntity<>("Product not found with ID: " + request.getProductId(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            LOGGER.error("failed to fetch product from product-service", e);
            return new ResponseEntity<>("Failed to communicate with product-service", HttpStatus.SERVICE_UNAVAILABLE);
        }

        if (product == null) {
            return new ResponseEntity<>("Product not found with ID: " + request.getProductId(), HttpStatus.NOT_FOUND);
        }

        LOGGER.info("product came from copy on port {}", product.getServedByPort());

        // ---- step 2 [JPA]: build and save the Order + OrderItem ------------
        OrderItem item = new OrderItem();
        item.setProductId(product.getId());
        item.setProductName(product.getName());
        item.setPrice(product.getPrice());
        item.setQuantity(quantity);

        double totalPrice = product.getPrice() * quantity;

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
        event.put("quantity", quantity);

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
    }
}
