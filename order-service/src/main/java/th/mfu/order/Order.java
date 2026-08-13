package th.mfu.order;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
// TODO [JPA]: you will also need @OneToMany, @JoinColumn / cascade, and List

/**
 * Order = one customer's order, made up of one or more OrderItems.
 * <p>
 * ENTITY 3 of 5. Worth 2 points.
 * <p>
 * Note {@code @Table(name = "orders")} - given on purpose: ORDER is a reserved
 * word in SQL, so the table cannot be called "order". This one line saves you a
 * confusing error.
 * <p>
 * Relationship: one Order has many OrderItems (@OneToMany), the other side of
 * the @ManyToOne in {@link OrderItem}.
 */
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO [JPA]: add the fields of an order and their getters/setters:
    //   - String customerName
    //   - double totalPrice
    //   - @OneToMany(cascade = CascadeType.ALL) List<OrderItem> items
    //     (cascade = ALL so saving the order also saves its items)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
