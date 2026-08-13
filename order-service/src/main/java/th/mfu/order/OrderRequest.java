package th.mfu.order;

/**
 * The shape of the JSON body a client POSTs to /orders. This is a suggestion to
 * get you moving - change the fields to whatever your order needs. It is a
 * plain carrier, not a JPA entity.
 */
public class OrderRequest {

    private String customerName;
    private Long userId;      // which user placed it (from user-service)
    private Long productId;
    private int quantity;

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
