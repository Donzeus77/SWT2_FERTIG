package com.example.mensa_app_backend.order;

import com.example.mensa_app_backend.config.MqttConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    @Autowired(required = false)
    private OrderRepository repository;

    @Autowired(required = false)
    private MqttConfig.MqttGateway mqttGateway;

    @Value("${mqtt.topic.orders}")
    private String ordersTopic;

    private final List<Order> orders = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    public List<Order> getAllOrders() {
        if (repository != null) return repository.findAll();
        return List.copyOf(orders);
    }

    public Optional<Order> getOrderById(Long id) {
        if (repository != null) return repository.findById(id);
        return orders.stream().filter(o -> o.getId().equals(id)).findFirst();
    }

    public Order createOrder(OrderRequest request) {
        Order order;
        if (repository != null) {
            order = new Order(
                    UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    request.getItems() != null ? request.getItems() : List.of(),
                    request.getTotal(),
                    request.getPickupTime(),
                    request.getLocation(),
                    request.getPaymentMethod());
            order = repository.save(order);
        } else {
            order = new Order(
                    UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                    request.getItems() != null ? request.getItems() : List.of(),
                    request.getTotal(),
                    request.getPickupTime(),
                    request.getLocation(),
                    request.getPaymentMethod());
            order.setId(nextId.getAndIncrement());
            orders.add(order);
        }
        publishOrder(order);
        return order;
    }

    public Optional<Order> updateStatus(Long id, String status) {
        if (repository != null) {
            return repository.findById(id).map(o -> {
                o.setStatus(status);
                return repository.save(o);
            });
        }
        return orders.stream().filter(o -> o.getId().equals(id)).findFirst().map(o -> {
            o.setStatus(status);
            return o;
        });
    }

    private void publishOrder(Order order) {
        if (mqttGateway != null) {
            try {
                String json = objectMapper.writeValueAsString(order);
                mqttGateway.publish(json, ordersTopic);
            } catch (Exception e) {
                System.err.println("MQTT publish order error: " + e.getMessage());
            }
        }
    }
}
