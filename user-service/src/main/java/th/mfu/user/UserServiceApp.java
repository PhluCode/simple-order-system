package th.mfu.user;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * user-service. Port 8400.
 * <p>
 * Registers with Eureka so it appears on the dashboard and so other services
 * could reach it by name (e.g. order-service could Feign-call it to check who
 * is placing an order). Given to you complete.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApp {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApp.class, args);
    }
}
