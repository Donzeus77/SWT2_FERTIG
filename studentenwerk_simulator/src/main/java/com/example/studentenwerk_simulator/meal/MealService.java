package com.example.studentenwerk_simulator.meal;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MealService {

    private final List<Meal> meals = List.of(
            new Meal(1L, "Pasta Bolognese", "Hauptgericht", 3.50),
            new Meal(2L, "Veganer Salat", "Salat", 2.80),
            new Meal(3L, "Schnitzel mit Pommes", "Hauptgericht", 4.20),
            new Meal(4L, "Suppe des Tages", "Suppe", 1.50)
    );

    public List<Meal> getAllMeals() {
        return meals;
    }

    public Optional<Meal> getMealById(Long id) {
        return meals.stream().filter(m -> m.id().equals(id)).findFirst();
    }
}
