package com.example.mensa_app_backend.order;

public class OrderRequest {
    private String code;
    private java.util.List<Order.OrderItem> items;
    private double total;
    private String pickupTime;
    private String location;
    private String paymentMethod;
    private String status;

    public OrderRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public java.util.List<Order.OrderItem> getItems() { return items; }
    public void setItems(java.util.List<Order.OrderItem> items) { this.items = items; }
    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
    public String getPickupTime() { return pickupTime; }
    public void setPickupTime(String pickupTime) { this.pickupTime = pickupTime; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
