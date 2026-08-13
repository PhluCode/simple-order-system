package th.mfu.order;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * findAll, findById, save, deleteById provided for free. Given complete.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {
}
