package th.mfu.order;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * findAll, findById, save, deleteById provided for free. Given complete.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {

    // TODO [JPA]: "orders of one user" is just a derived query. Add:
    //   List<Order> findByUserId(Long userId);
    // Used by GET /orders/user/{userId} in OrderController.
}
