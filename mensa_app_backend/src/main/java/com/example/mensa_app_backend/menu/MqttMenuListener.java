package com.example.mensa_app_backend.menu;

import com.example.mensa_app_backend.config.MqttConfig;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MqttMenuListener {

    @Autowired
    private MenuService menuService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMeals(String payload) {
        try {
            List<MenuItem> items = objectMapper.readValue(payload, new TypeReference<List<MenuItem>>() {});
            for (MenuItem item : items) {
                menuService.addItem(item);
            }
        } catch (Exception e) {
            System.err.println("MQTT Menu parse error: " + e.getMessage());
        }
    }
}
