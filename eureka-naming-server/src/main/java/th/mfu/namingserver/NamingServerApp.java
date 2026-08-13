package th.mfu.namingserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka naming server. Port 8761.
 * <p>
 * The one annotation that matters is {@code @EnableEurekaServer}. After it
 * starts, open http://localhost:8761 in a browser to see every service that has
 * registered.
 * <p>
 * Given to you complete - nothing to change.
 */
@SpringBootApplication
@EnableEurekaServer
public class NamingServerApp {

    public static void main(String[] args) {
        SpringApplication.run(NamingServerApp.class, args);
    }
}
