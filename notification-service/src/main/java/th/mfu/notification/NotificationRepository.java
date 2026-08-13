package th.mfu.notification;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * findAll, save, etc. provided for free. Given complete.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
