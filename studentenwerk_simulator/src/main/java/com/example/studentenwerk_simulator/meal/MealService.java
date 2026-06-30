package com.example.studentenwerk_simulator.meal;

import com.example.studentenwerk_simulator.config.MqttConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MealService {

    @Autowired(required = false)
    private MealRepository repository;

    @Autowired(required = false)
    private MqttConfig.MqttGateway mqttGateway;

    @Value("${mqtt.topic.meals}")
    private String mealsTopic;

    private final List<Meal> meals = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    private void init() {
        if (repository != null && repository.count() == 0) {
            repository.save(new Meal("Pasta Bolognese", "Hauptgericht", 3.50));
            repository.save(new Meal("Veganer Salat", "Salat", 2.80));
            repository.save(new Meal("Schnitzel mit Pommes", "Hauptgericht", 4.20));
            repository.save(new Meal("Suppe des Tages", "Suppe", 1.50));
            publishMeals();
        } else {
            meals.add(new Meal(nextId.getAndIncrement(), "Pasta Bolognese", "Hauptgericht", 3.50));
            meals.add(new Meal(nextId.getAndIncrement(), "Veganer Salat", "Salat", 2.80));
            meals.add(new Meal(nextId.getAndIncrement(), "Schnitzel mit Pommes", "Hauptgericht", 4.20));
            meals.add(new Meal(nextId.getAndIncrement(), "Suppe des Tages", "Suppe", 1.50));
        }
    }

    public List<Meal> getAllMeals() {
        if (repository != null) return repository.findAll();
        return List.copyOf(meals);
    }

    public Optional<Meal> getMealById(Long id) {
        if (repository != null) return repository.findById(id);
        return meals.stream().filter(m -> m.getId().equals(id)).findFirst();
    }

    public Meal addMeal(Meal meal) {
        if (repository != null) {
            Meal saved = repository.save(meal);
            publishMeals();
            return saved;
        }
        meal.setId(nextId.getAndIncrement());
        meals.add(meal);
        return meal;
    }

    public void publishMeals() {
        if (mqttGateway != null) {
            try {
                List<Meal> all = getAllMeals();
                String json = objectMapper.writeValueAsString(all);
                mqttGateway.publish(json, mealsTopic);
            } catch (Exception e) {
                System.err.println("MQTT publish meals error: " + e.getMessage());
            }
        }
    }
}
