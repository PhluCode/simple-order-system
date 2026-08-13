package th.mfu.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * order-service. Port 8200. STUDENT B.
 * <p>
 * Three annotations, three jobs:
 * <ul>
 *   <li>{@code @EnableDiscoveryClient} - register with Eureka.</li>
 *   <li>{@code @EnableFeignClients} - scan for {@link ProductClient} and build
 *       a real HTTP client from that interface.</li>
 * </ul>
 * Given to you complete.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class OrderServiceApp {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApp.class, args);
    }
}
