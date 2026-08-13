package th.mfu.notification;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class OrderPlacedListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderPlacedListener.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private NotificationRepository notificationRepository;

    @KafkaListener(topics = "${app.kafka.topic:orders}", groupId = "notification-group")
    public void onOrderPlaced(ConsumerRecord<String, String> record) throws Exception {
        LOGGER.info("received from topic {}: {}", record.topic(), record.value());

        JsonNode event = objectMapper.readTree(record.value());
        String customerName = event.get("customerName").asText();
        String productName = event.get("productName").asText();

        Notification n = new Notification();
        n.setCustomerName(customerName);
        n.setMessage("New order from " + customerName + " — " + productName);
        notificationRepository.save(n);

        // Then watch http://localhost:8300 while you POST orders.
    }
}
