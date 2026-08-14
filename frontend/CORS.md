# Running without the dev proxy

During development the Vite dev server proxies `/api/*` to each service (see
`vite.config.ts`), so the browser only ever talks to `localhost:5173` and CORS
never comes up.

Deploying the built `dist/` somewhere else changes that: the browser will call
the services directly, they currently send no `Access-Control-Allow-Origin`
header, and every request will be blocked before it leaves the page.

Two ways to fix it.

## 1. Add a CORS config to each service

Drop this into `product-service`, `order-service`, `user-service` and
`notification-service` — one file each, next to the `*ServiceApp.java`, with
the package line changed to match.

```java
package th.mfu.product;   // change per service

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Lets the front end call this service from its own origin. Without it the
 * browser blocks every request; curl and Postman are unaffected, which is why
 * the API can look healthy while the page shows nothing.
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:4173")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
```

Then point the front end straight at the services instead of through the proxy,
by setting `VITE_API_BASE` at build time — but note the four services live on
four ports, so a single base URL only works if you put a gateway in front.

## 2. Put a gateway in front (what a real deployment does)

Add a Spring Cloud Gateway service that registers with Eureka and routes:

```
/products/**       -> lb://product-service
/orders/**         -> lb://order-service
/users/**          -> lb://user-service
/notifications/**  -> lb://notification-service
```

Then build the front end with `VITE_API_BASE=https://gateway.example` and the
whole app is one origin again. This is also where authentication would go —
right now `POST /users/login` returns a user object and no token, so nothing
downstream can verify who is calling.
