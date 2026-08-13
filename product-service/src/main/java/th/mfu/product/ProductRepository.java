package th.mfu.product;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * findAll, findById, save, deleteById are provided for free.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    // TODO [optional, nice for the demo]: add a derived query, e.g.
    //   List<Product> findByNameContainingIgnoreCase(String name);
    // Spring Data writes the SQL from the method name - you write nothing else.
}
