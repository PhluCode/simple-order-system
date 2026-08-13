package th.mfu.notification;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

/**
 * Notification = one "your order was placed" message for one customer.
 * <p>
 * ENTITY 5 of 5. Worth 2 points.
 * <p>
 * This table belongs to THIS service only. It is filled in by the Kafka
 * listener, not by anyone calling in.
 */
@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO [JPA]: add the fields of a notification and their getters/setters:
    //   - String customerName
    //   - String message
    // (Whatever fields you add, remember the live page and the /notifications
    //  endpoint read them through the GETTERS.)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
