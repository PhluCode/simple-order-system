package th.mfu.order;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * How order-service asks product-service for a product. THE FEIGN CLIENT.
 * <p>
 * You do not write the HTTP code. Feign reads these annotations and builds the
 * call for you. The important detail is {@code name = "product-service"}: it is
 * a NAME, not a URL. Feign asks Eureka where product-service is, and because we
 * run two copies, Spring Cloud's load balancer alternates between them - you get
 * load balancing for free, just by asking for a name.
 * <p>
 * Given to you complete. In the demo you must be able to explain how it works.
 */
@FeignClient(name = "product-service")
public interface ProductClient {

    @GetMapping("/products/{id}")
    ProductDTO getProduct(@PathVariable("id") Long id);
}
