package th.mfu.product;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
// TODO [JPA]: you will also need @OneToMany and java.util.List

/**
 * Category = one group of products, e.g. "Drinks", "Snacks".
 * <p>
 * ENTITY 1 of 5. Worth 2 points, and you must be able to explain it in the demo.
 * <p>
 * Relationship: one Category has many Products (@OneToMany), which is the other
 * side of the @ManyToOne you will write in {@link Product}.
 */
@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO [JPA]: add the fields of a category and their getters/setters:
    //   - String name
    //   - String description
    //   - @OneToMany(mappedBy = "category") List<Product> products
    //
    // Remember: Jackson turns an object into JSON through its GETTERS. Without
    // getters the REST response is an empty {}.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
