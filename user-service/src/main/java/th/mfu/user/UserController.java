package th.mfu.user;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Accounts + log-in.
 * <p>
 * Log-in here is deliberately simple: no Spring Security, no JWT. POST
 * /users/login looks the username up, compares the password, and returns the
 * account (with its role) or 401. Enough to demo "admin vs user"; harden later.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * A password must NEVER leave the service in a response. This turns a User
     * into a plain map without the password field, used by every read below.
     */
    private Map<String, Object> toSafe(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("role", u.getRole());
        m.put("displayName", u.getDisplayName());
        return m;
    }

    // ---- GET (list) ------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            out.add(toSafe(u));
        }
        return new ResponseEntity<>(out, HttpStatus.OK);
    }

    // ---- POST (register / create an account) ----------------------------
    @PostMapping("/register")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        // Self sign-up is always a USER. We OVERWRITE whatever role was sent, so
        // nobody can make themselves an admin by putting role=ADMIN in the body.
        user.setRole(User.ROLE_USER);
        User saved = userRepository.save(user);
        return new ResponseEntity<>("User created with ID: " + saved.getId(), HttpStatus.CREATED);
    }

    // ---- POST /users/login : the simple log-in --------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        User found = userRepository.findByUsername(credentials.getUsername());

        // Wrong username, or wrong password -> 401. (Same message for both, so
        // an attacker cannot tell which one was wrong.)
        if (found == null || !found.getPassword().equals(credentials.getPassword())) {
            return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        // Success: return the account WITHOUT the password. The caller reads
        // "role" to decide ADMIN vs USER.
        return new ResponseEntity<>(toSafe(found), HttpStatus.OK);
    }
}
