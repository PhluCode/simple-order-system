package th.mfu.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import th.mfu.product.model.Category;

/**
 * Spring Data Repository for Category entity.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
