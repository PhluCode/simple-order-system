package th.mfu.product.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import th.mfu.product.dto.ProductDTO;
import th.mfu.product.mapper.ProductMapper;
import th.mfu.product.model.Category;
import th.mfu.product.model.Product;
import th.mfu.product.repository.CategoryRepository;
import th.mfu.product.repository.ProductRepository;

/**
 * Service Layer (Tier 2 - Business Logic Layer).
 */
@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductMapper productMapper;

    public List<ProductDTO> listProducts(String name, Long categoryId) {
        List<Product> products;
        if (name != null && !name.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(name);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAll();
        }
        return products.stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProductDTO> getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::toDTO);
    }

    public ProductDTO createProduct(ProductDTO dto) {
        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }
        Product entity = productMapper.toEntity(dto, category);
        Product saved = productRepository.save(entity);
        return productMapper.toDTO(saved);
    }

    public Optional<ProductDTO> updateProduct(Long id, ProductDTO dto) {
        Optional<Product> optProduct = productRepository.findById(id);
        if (optProduct.isPresent()) {
            Product existing = optProduct.get();
            existing.setName(dto.getName());
            existing.setPrice(dto.getPrice());
            existing.setStock(dto.getStock());
            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
                existing.setCategory(category);
            } else {
                existing.setCategory(null);
            }
            Product saved = productRepository.save(existing);
            return Optional.of(productMapper.toDTO(saved));
        }
        return Optional.empty();
    }

    public Optional<ProductDTO> patchProduct(Long id, ProductDTO dto) {
        Optional<Product> optProduct = productRepository.findById(id);
        if (optProduct.isPresent()) {
            Product existing = optProduct.get();
            if (dto.getName() != null) {
                existing.setName(dto.getName());
            }
            if (dto.getPrice() != 0.0) {
                existing.setPrice(dto.getPrice());
            }
            if (dto.getStock() != 0) {
                existing.setStock(dto.getStock());
            }
            if (dto.getCategoryId() != null) {
                Category category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
                existing.setCategory(category);
            }
            Product saved = productRepository.save(existing);
            return Optional.of(productMapper.toDTO(saved));
        }
        return Optional.empty();
    }

    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
