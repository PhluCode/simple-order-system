package th.mfu.product;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data builds the implementation for you: findAll, findById, save,
 * deleteById are all there for free. Given complete.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
