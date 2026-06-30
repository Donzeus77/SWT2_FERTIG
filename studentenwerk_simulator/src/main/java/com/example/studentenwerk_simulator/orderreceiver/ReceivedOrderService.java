package com.example.studentenwerk_simulator.orderreceiver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ReceivedOrderService {

    @Autowired(required = false)
    private ReceivedOrderRepository repository;

    private final List<ReceivedOrder> orders = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    public List<ReceivedOrder> getAllOrders() {
        if (repository != null) return repository.findAll();
        return List.copyOf(orders);
    }

    public ReceivedOrder receiveOrder(ReceivedOrderRequest request) {
        ReceivedOrder order;
        if (repository != null) {
            order = new ReceivedOrder(request.getMenuItemId(), request.getStudentName(), "EINGEGANGEN");
            return repository.save(order);
        } else {
            order = new ReceivedOrder(nextId.getAndIncrement(), request.getMenuItemId(), request.getStudentName(), "EINGEGANGEN");
            orders.add(order);
        }
        return order;
    }
}
