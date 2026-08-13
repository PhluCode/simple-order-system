package th.mfu.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * product-service. Ports 8100 / 8101 (two copies). STUDENT A.
 * <p>
 * {@code @EnableDiscoveryClient} registers this service with Eureka so that
 * order-service can reach it by the name "product-service" instead of a fixed
 * address. Given to you complete.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ProductServiceApp {

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApp.class, args);
    }
}
