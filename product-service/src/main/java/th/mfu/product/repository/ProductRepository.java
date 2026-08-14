package th.mfu.product.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import th.mfu.product.model.Product;

/**
 * Spring Data Repository for Product entity.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByCategoryId(Long categoryId);
}
