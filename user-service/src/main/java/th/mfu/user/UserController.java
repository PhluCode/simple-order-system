package th.mfu.user;

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
 * Log-in here is deliberately simple: no Spring Security, no JWT. POST /login
 * looks the username up, compares the password, and returns the account (with
 * its role) or 401. That is enough to demo "admin vs user"; harden it later.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ---- GET (list) : worked example ------------------------------------
    // NOTE: this currently returns passwords too. Before the demo, hide the
    // password (e.g. set it to null on each user, or return a DTO without it).
    @GetMapping
    public ResponseEntity<Iterable<User>> listUsers() {
        return new ResponseEntity<>(userRepository.findAll(), HttpStatus.OK);
    }

    // ---- POST (register / create an account) ----------------------------
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody User user) {
        // TODO [REST]: save the account and return 201 CREATED.
        //   (Set a default role of ROLE_USER if none was sent, so a normal
        //    sign-up cannot make itself an admin.)
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    // ---- POST /users/login : the simple log-in --------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        // TODO [Auth]:
        //   1. User found = userRepository.findByUsername(credentials.getUsername());
        //   2. if found == null OR password does not match -> 401 UNAUTHORIZED
        //   3. otherwise return the account (hide the password first!) with 200.
        //      The caller reads found.getRole() to decide ADMIN vs USER.
        //
        //   Later, order-service could Feign-call this before accepting an order,
        //   and the notifications page could allow only ROLE_ADMIN. Not required
        //   for the demo - a note in the README is enough for now.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }
}
