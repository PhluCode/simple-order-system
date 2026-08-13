package th.mfu.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * notification-service. Port 8300. STUDENT C. THE SUBSCRIBER.
 * <p>
 * It registers with Eureka only so it shows up on the dashboard - nobody calls
 * it by name. Its real link to the system is the Kafka topic. Given complete.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class NotificationServiceApp {

    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApp.class, args);
    }
}
