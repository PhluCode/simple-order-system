package th.mfu.order;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Creates the "orders" topic on start-up if it does not exist. A topic is a
 * named channel in the broker: order-service writes events in one end,
 * notification-service reads them out the other.
 * <p>
 * 1 partition, 1 replica - fine for a classroom. Given to you complete.
 */
@Configuration
public class KafkaConfig {

    @Value("${app.kafka.topic:orders}")
    private String topicName;

    @Bean
    public NewTopic ordersTopic() {
        return new NewTopic(topicName, 1, (short) 1);
    }
}
