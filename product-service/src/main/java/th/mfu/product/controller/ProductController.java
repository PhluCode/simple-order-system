package th.mfu.product.controller;

import java.util.Optional;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import th.mfu.product.dto.ProductDTO;
import th.mfu.product.service.ProductService;

/**
 * The REST API of product-service. STUDENT A.
 */
@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private Environment environment;

    /** The port this running copy listens on: 8100 or 8101. */
    private int myPort() {
        return Integer.parseInt(environment.getProperty("server.port", "0"));
    }

    // ---- GET (list / search) ---------------------------------------------
    @GetMapping
    public ResponseEntity<Iterable<ProductDTO>> listProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId) {
        Iterable<ProductDTO> products = productService.listProducts(name, categoryId);
        products.forEach(p -> p.setServedByPort(myPort()));
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    // ---- GET (one) -------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Long id) {
        Optional<ProductDTO> optProduct = productService.getProductById(id);
        if (optProduct.isPresent()) {
            ProductDTO product = optProduct.get();
            product.setServedByPort(myPort());
            return new ResponseEntity<>(product, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // ---- POST (create) ---------------------------------------------------
    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO product) {
        ProductDTO saved = productService.createProduct(product);
        saved.setServedByPort(myPort());
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ---- PUT (replace) ---------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO product) {
        Optional<ProductDTO> updated = productService.updateProduct(id, product);
        if (updated.isPresent()) {
            ProductDTO p = updated.get();
            p.setServedByPort(myPort());
            return new ResponseEntity<>(p, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // ---- PATCH (partial update) -----------------------------------------
    @PatchMapping("/{id}")
    public ResponseEntity<ProductDTO> patchProduct(@PathVariable Long id, @RequestBody ProductDTO product) {
        Optional<ProductDTO> patched = productService.patchProduct(id, product);
        if (patched.isPresent()) {
            ProductDTO p = patched.get();
            p.setServedByPort(myPort());
            return new ResponseEntity<>(p, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // ---- DELETE ----------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (deleted) {
            return new ResponseEntity<>("Successfully deleted the product (ID: " + id + ")", HttpStatus.OK);
        }
        return new ResponseEntity<>("Failed to delete the product (ID: " + id + "): Product not found", HttpStatus.NOT_FOUND);
    }
}
