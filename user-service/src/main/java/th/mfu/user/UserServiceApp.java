package th.mfu.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;

/**
 * user-service. Port 8400.
 * <p>
 * Registers with Eureka so it appears on the dashboard and so other services
 * could reach it by name (e.g. order-service could Feign-call it to check who
 * is placing an order).
 */
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApp {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApp.class, args);
    }

    /**
     * Seed one admin and one normal user on start-up, so you can log in
     * immediately during the demo. (Passwords are plain text FOR THE DEMO ONLY -
     * a real app must hash them.)
     * <p>
     *   admin / admin123  -> role ADMIN  (watches the notifications dashboard)
     *   user  / user123   -> role USER   (places orders)
     */
    @Bean
    CommandLineRunner seedUsers(UserRepository repository) {
        return args -> {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setRole(User.ROLE_ADMIN);
            admin.setDisplayName("Admin");
            repository.save(admin);

            User user = new User();
            user.setUsername("user");
            user.setPassword("user123");
            user.setRole(User.ROLE_USER);
            user.setDisplayName("Normal User");
            repository.save(user);

            System.out.println("Seeded users: admin/admin123 (ADMIN), user/user123 (USER)");
        };
    }
}
