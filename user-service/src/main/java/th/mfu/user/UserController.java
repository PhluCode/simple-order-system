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

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    private Map<String, Object> toSafe(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("role", u.getRole());
        m.put("displayName", u.getDisplayName());
        return m;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (User u : userRepository.findAll()) {
            out.add(toSafe(u));
        }
        return new ResponseEntity<>(out, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        // Self sign-up is always a USER. We OVERWRITE whatever role was sent, so
        // nobody can make themselves an admin by putting role=ADMIN in the body.
        user.setRole(User.ROLE_USER);
        User saved = userRepository.save(user);
        return new ResponseEntity<>("User created with ID: " + saved.getId(), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User credentials) {
        User found = userRepository.findByUsername(credentials.getUsername());

        if (found == null || !found.getPassword().equals(credentials.getPassword())) {
            return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        return new ResponseEntity<>(toSafe(found), HttpStatus.OK);
    }
}
