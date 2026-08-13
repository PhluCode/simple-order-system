package th.mfu.user;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * User = one account. Its {@code role} decides what it may do:
 *   ADMIN - opens the notifications dashboard (:8300).
 *   USER  - places orders.
 * <p>
 * ENTITY 6 (bonus - the required 5 are already covered). Note
 * {@code @Table(name = "users")}: USER is a reserved word in some databases,
 * so the table is called "users". Given on purpose.
 */
@Entity
@Table(name = "users")
public class User {

    /** Handy constants so you don't mistype the role strings. */
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_USER = "USER";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TODO [JPA]: add the fields of an account and their getters/setters:
    //   - String username     (unique in practice)
    //   - String password     (see the warning below)
    //   - String role         (use ROLE_ADMIN / ROLE_USER)
    //   - String displayName
    //
    // SECURITY NOTE: storing a password as plain text is fine ONLY for this
    // classroom demo. A real app must HASH it (e.g. BCrypt) and never return it
    // in a REST response. Leave a comment saying so - your demo Q&A may ask.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
