package th.mfu.product.dto;

/**
 * Data Transfer Object for Product.
 */
public class ProductDTO {

    private Long id;
    private String name;
    private double price;
    private int stock;
    private Long categoryId;
    private String categoryName;
    private int servedByPort;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public int getServedByPort() {
        return servedByPort;
    }

    public void setServedByPort(int servedByPort) {
        this.servedByPort = servedByPort;
    }
}
