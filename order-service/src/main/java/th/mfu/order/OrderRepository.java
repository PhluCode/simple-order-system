package th.mfu.order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * findAll, findById, save, deleteById provided for free. Given complete.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Spring Data reads the method name and builds the SQL for you:
    // "findByUserId" -> SELECT * FROM orders WHERE user_id = ?
    // No implementation needed - Spring generates it at startup.
    List<Order> findByUserId(Long userId);
}
