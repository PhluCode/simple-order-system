package th.mfu.notification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The read side. The live page at http://localhost:8300 calls this every two
 * seconds. Given to you complete.
 */
@RestController
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/notifications")
    public Iterable<Notification> listNotifications() {
        return notificationRepository.findAll();
    }
}
