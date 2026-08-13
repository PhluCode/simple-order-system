package th.mfu.notification;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Reacts to "orders" events by saving a notification. THE SUBSCRIBER. STUDENT C.
 * <p>
 * Nobody calls this class. The broker delivers every event on the topic to your
 * method - once you add the annotation. This is where the Kafka pub/sub score
 * (5 points) is earned, so be ready to explain it in the demo.
 */
@Component
public class OrderPlacedListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderPlacedListener.class);

    /** Jackson - the same JSON library used all course. */
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private NotificationRepository notificationRepository;

    // TODO [Kafka] (step 1) subscribe this method to the topic by adding, right
    //   above onOrderPlaced:
    //
    //     @KafkaListener(topics = "${app.kafka.topic:orders}",
    //                    groupId = "notification-group")
    //
    //   topics  = which channel to read.
    //   groupId = who is reading. Each group gets its own copy of every event.
    public void onOrderPlaced(ConsumerRecord<String, String> record) throws Exception {
        LOGGER.info("received from topic {}: {}", record.topic(), record.value());

        // TODO [Kafka] (step 2) turn the event JSON back into data and save a
        //   notification. The fields must match what order-service published:
        //
        //     JsonNode event = objectMapper.readTree(record.value());
        //     String customerName = event.get("customerName").asText();
        //     String productName  = event.get("productName").asText();
        //
        //     Notification n = new Notification();
        //     n.setCustomerName(customerName);
        //     n.setMessage("Dear " + customerName + ", your order for "
        //                  + productName + " was placed.");
        //     notificationRepository.save(n);
        //
        //   Then watch http://localhost:8300 while you POST orders.
    }
}
