package th.mfu.product;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Transient;
// TODO [JPA]: you will also need @ManyToOne for the category link

/**
 * Product = one thing that can be ordered, e.g. "Latte", 45 baht.
 * <p>
 * ENTITY 2 of 5. Worth 2 points.
 * <p>
 * The {@code servedByPort} field is a GIFT, already done: it is not stored in
 * the database (@Transient). ProductController fills it with the port that
 * answered the request. When order-service calls this service through the load
 * balancer, that value flips between 8100 and 8101 - that is how you SEE the
 * load balancer working during the demo.
 */
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO [JPA]: add the fields of a product and their getters/setters:
    //   - String name
    //   - double price
    //   - int stock
    //   - @ManyToOne Category category      (many products -> one category)

    /** Not persisted. Set by the controller to prove which copy answered. */
    @Transient
    private int servedByPort;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getServedByPort() {
        return servedByPort;
    }

    public void setServedByPort(int servedByPort) {
        this.servedByPort = servedByPort;
    }
}
