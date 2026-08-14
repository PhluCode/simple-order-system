package th.mfu.user;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * User = one account. Its {@code role} decides what it may do:
 * ADMIN - opens the notifications dashboard (:8300).
 * USER - places orders.
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

    private String username;
    private String password;
    private String role;
    private String displayName;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

}
