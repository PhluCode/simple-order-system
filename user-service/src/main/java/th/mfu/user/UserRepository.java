package th.mfu.user;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * findAll, findById, save provided for free. login uses findByUsername below -
 * Spring Data writes the query from the method name.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    User findByUsername(String username);
}
