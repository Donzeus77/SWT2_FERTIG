package com.example.studentenwerk_simulator.orderreceiver;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.stereotype.Component;

@Component
public class MqttOrderListener {

    @Autowired
    private ReceivedOrderService receivedOrderService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleOrder(String payload) {
        try {
            ReceivedOrderRequest request = objectMapper.readValue(payload, ReceivedOrderRequest.class);
            receivedOrderService.receiveOrder(request);
        } catch (Exception e) {
            System.err.println("MQTT Order parse error: " + e.getMessage());
        }
    }
}
