package th.mfu.product.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import th.mfu.product.dto.ProductDTO;
import th.mfu.product.model.Category;
import th.mfu.product.model.Product;

/**
 * MapStruct interface for Product Entity and ProductDTO mapping.
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ProductDTO toDTO(Product entity);

    @Mapping(source = "dto.id", target = "id")
    @Mapping(source = "dto.name", target = "name")
    @Mapping(source = "dto.price", target = "price")
    @Mapping(source = "dto.stock", target = "stock")
    @Mapping(source = "category", target = "category")
    Product toEntity(ProductDTO dto, Category category);
}
