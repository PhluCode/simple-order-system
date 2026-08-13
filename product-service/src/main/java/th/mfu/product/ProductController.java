package th.mfu.product;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The REST API of product-service. STUDENT A.
 * <p>
 * The whole "REST" score (5 points, one per method) lives in this file. GET is
 * done as a worked example; you write POST, PUT, PATCH and DELETE the same way.
 * <p>
 * The {@link Environment} is injected so you can read this copy's own port and
 * stamp it onto the product you return (see {@code getProduct}) - that is the
 * load-balancer proof.
 */
@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private Environment environment;

    /** The port this running copy listens on: 8100 or 8101. */
    private int myPort() {
        return Integer.parseInt(environment.getProperty("server.port", "0"));
    }

    // ---- GET (list) : worked example, already done -----------------------
    @GetMapping
    public ResponseEntity<Iterable<Product>> listProducts() {
        return new ResponseEntity<>(productRepository.findAll(), HttpStatus.OK);
    }

    // ---- GET (one) -------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        // TODO [REST]:
        //   1. productRepository.findById(id)
        //   2. if empty -> return 404 (HttpStatus.NOT_FOUND)
        //   3. otherwise: product.setServedByPort(myPort());  // <-- LB proof
        //      return the product with 200 OK
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    // ---- POST (create) ---------------------------------------------------
    @PostMapping
    public ResponseEntity<String> createProduct(@RequestBody Product product) {
        // TODO [REST]: save the product and return 201 CREATED.
        //   Product saved = productRepository.save(product);
        //   (Tip: if a category id is sent, look it up with categoryRepository
        //    and attach it before saving.)
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    // ---- PUT (replace) ---------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        // TODO [REST]: if id exists, overwrite the product's fields and save;
        //   else return 404.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    // ---- PATCH (partial update) -----------------------------------------
    @PatchMapping("/{id}")
    public ResponseEntity<String> patchProduct(@PathVariable Long id, @RequestBody Product product) {
        // TODO [REST]: change ONLY the fields that were sent (e.g. price only),
        //   leave the rest as they are, then save. Return 404 if id not found.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }

    // ---- DELETE ----------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        // TODO [REST]: if id exists, productRepository.deleteById(id) and return
        //   200; else 404.
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }
}
