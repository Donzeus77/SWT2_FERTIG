package com.example.mensa_app_backend.menu;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MenuService {

    @Autowired(required = false)
    private MenuItemRepository repository;

    private final List<MenuItem> items = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    @PostConstruct
    private void init() {
        if (repository != null && repository.count() == 0) {
            LocalDate today = LocalDate.now();
            repository.save(new MenuItem(
                    "Pasta Bolognese", "mit Tomatenso\u00dfe und Rinderhack", "hauptgericht",
                    3.50, 5.00, 7.00,
                    List.of("Gluten"), List.of(),
                    new MenuItem.Nutrition(680, 35, 72, 18), "Hauptmensa", today));
            repository.save(new MenuItem(
                    "Veganer Salat", "mit Dressing und Croutons", "beilage",
                    2.80, 4.00, 5.60,
                    List.of(), List.of("Vegan"),
                    new MenuItem.Nutrition(320, 12, 28, 14), "Hauptmensa", today));
            repository.save(new MenuItem(
                    "Schnitzel mit Pommes", "paniertes Schweineschnitzel", "hauptgericht",
                    4.20, 5.80, 7.50,
                    List.of("Gluten", "Ei"), List.of(),
                    new MenuItem.Nutrition(850, 42, 65, 32), "Mensa S\u00fcd", today));
            repository.save(new MenuItem(
                    "Suppe des Tages", "wechselt t\u00e4glich", "beilage",
                    1.50, 2.50, 3.00,
                    List.of(), List.of("Vegetarisch"),
                    new MenuItem.Nutrition(180, 8, 15, 10), "Galerie", today));
        } else {
            items.add(buildItem(nextId.getAndIncrement(), "Pasta Bolognese", "mit Tomatenso\u00dfe und Rinderhack", "hauptgericht", 3.50, 5.00, 7.00, List.of("Gluten"), List.of(), new MenuItem.Nutrition(680, 35, 72, 18), "Hauptmensa"));
            items.add(buildItem(nextId.getAndIncrement(), "Veganer Salat", "mit Dressing und Croutons", "beilage", 2.80, 4.00, 5.60, List.of(), List.of("Vegan"), new MenuItem.Nutrition(320, 12, 28, 14), "Hauptmensa"));
            items.add(buildItem(nextId.getAndIncrement(), "Schnitzel mit Pommes", "paniertes Schweineschnitzel", "hauptgericht", 4.20, 5.80, 7.50, List.of("Gluten", "Ei"), List.of(), new MenuItem.Nutrition(850, 42, 65, 32), "Mensa S\u00fcd"));
            items.add(buildItem(nextId.getAndIncrement(), "Suppe des Tages", "wechselt t\u00e4glich", "beilage", 1.50, 2.50, 3.00, List.of(), List.of("Vegetarisch"), new MenuItem.Nutrition(180, 8, 15, 10), "Galerie"));
        }
    }

    private MenuItem buildItem(Long id, String name, String desc, String cat,
                                double sPrice, double stPrice, double gPrice,
                                List<String> allergens, List<String> dietary,
                                MenuItem.Nutrition nutrition, String location) {
        MenuItem item = new MenuItem(name, desc, cat, sPrice, stPrice, gPrice, allergens, dietary, nutrition, location, LocalDate.now());
        item.setId(id);
        return item;
    }

    public List<MenuItem> getAllItems() {
        if (repository != null) return repository.findAll();
        return List.copyOf(items);
    }

    public List<MenuItem> getByDate(String dateStr) {
        LocalDate date = LocalDate.parse(dateStr);
        if (repository != null) return repository.findByDate(date);
        return items.stream().filter(i -> date.equals(i.getDate())).toList();
    }

    public List<MenuItem> getByWeek(String mondayStr) {
        LocalDate monday = LocalDate.parse(mondayStr);
        LocalDate friday = monday.with(DayOfWeek.FRIDAY);
        if (repository != null) return repository.findByDateBetween(monday, friday);
        return items.stream()
                .filter(i -> !i.getDate().isBefore(monday) && !i.getDate().isAfter(friday))
                .toList();
    }

    public Optional<MenuItem> getItemById(Long id) {
        if (repository != null) return repository.findById(id);
        return items.stream().filter(item -> item.getId().equals(id)).findFirst();
    }

    public MenuItem addItem(MenuItem item) {
        if (repository != null) return repository.save(item);
        item.setId(nextId.getAndIncrement());
        items.add(item);
        return item;
    }
}
