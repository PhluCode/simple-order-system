package th.mfu.order;

/**
 * A plain carrier for the JSON that product-service sends back. It is NOT a JPA
 * entity - order-service has no products table. It only needs somewhere to put
 * the fields it reads from the reply.
 * <p>
 * {@code servedByPort} is the port of the product-service copy that answered.
 * Log it after each call and watch it flip between 8100 and 8101 - your load
 * balancer proof. Given to you complete; add fields if your Product has more.
 */
public class ProductDTO {

    private Long id;
    private String name;
    private double price;
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

    public int getServedByPort() {
        return servedByPort;
    }

    public void setServedByPort(int servedByPort) {
        this.servedByPort = servedByPort;
    }
}
