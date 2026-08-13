package th.mfu.order;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 * OrderItem = one line of an order: "2 x Latte at 45 each".
 * <p>
 * ENTITY 4 of 5. Worth 2 points.
 * <p>
 * It copies the product's name and price at the moment of ordering (so a later
 * price change does not rewrite old orders). It does NOT hold a JPA link to the
 * Product entity - that lives in another service and another database. It only
 * keeps the productId.
 */
@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO [JPA]: add the fields of a line item and their getters/setters:
    //   - Long productId       (which product, from product-service)
    //   - String productName   (copied from the Feign reply)
    //   - double price         (copied from the Feign reply)
    //   - int quantity

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
