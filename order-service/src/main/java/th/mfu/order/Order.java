package th.mfu.order;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.Table;

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

    private String customerName;

    // WHICH user placed it - stored here on the order, not on User.
    // Fetch them later with GET /orders/user/{userId}.
    private Long userId;

    private double totalPrice;

    // One Order has many OrderItems. cascade = ALL means: save/update/delete
    // the Order and Hibernate automatically does the same to its items - you
    // never have to save each OrderItem yourself.
    // @JoinColumn puts the foreign key (order_id) on the order_item table.
    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}
