package th.mfu.user;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * findAll, findById, save provided for free.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    // TODO [JPA]: login needs to look an account up by its username. Add:
    //   User findByUsername(String username);
    // Spring Data writes the query from the method name - you add nothing else.
}
