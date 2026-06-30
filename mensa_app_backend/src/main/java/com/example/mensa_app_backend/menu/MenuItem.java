package com.example.mensa_app_backend.menu;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_item")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String category;
    private double studentPrice;
    private double staffPrice;
    private double guestPrice;

    @ElementCollection
    private List<String> allergens = new ArrayList<>();

    @ElementCollection
    private List<String> dietary = new ArrayList<>();

    @Embedded
    private Nutrition nutrition;

    private String location;
    private boolean available = true;
    private LocalDate date;

    protected MenuItem() {}

    public MenuItem(String name, String description, String category,
                    double studentPrice, double staffPrice, double guestPrice,
                    List<String> allergens, List<String> dietary,
                    Nutrition nutrition, String location, LocalDate date) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.studentPrice = studentPrice;
        this.staffPrice = staffPrice;
        this.guestPrice = guestPrice;
        this.allergens = allergens;
        this.dietary = dietary;
        this.nutrition = nutrition;
        this.location = location;
        this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getStudentPrice() { return studentPrice; }
    public void setStudentPrice(double studentPrice) { this.studentPrice = studentPrice; }
    public double getStaffPrice() { return staffPrice; }
    public void setStaffPrice(double staffPrice) { this.staffPrice = staffPrice; }
    public double getGuestPrice() { return guestPrice; }
    public void setGuestPrice(double guestPrice) { this.guestPrice = guestPrice; }
    public List<String> getAllergens() { return allergens; }
    public void setAllergens(List<String> allergens) { this.allergens = allergens; }
    public List<String> getDietary() { return dietary; }
    public void setDietary(List<String> dietary) { this.dietary = dietary; }
    public Nutrition getNutrition() { return nutrition; }
    public void setNutrition(Nutrition nutrition) { this.nutrition = nutrition; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    @Embeddable
    public static class Nutrition {
        private int calories;
        private int protein;
        private int carbs;
        private int fat;

        public Nutrition() {}
        public Nutrition(int calories, int protein, int carbs, int fat) {
            this.calories = calories;
            this.protein = protein;
            this.carbs = carbs;
            this.fat = fat;
        }

        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }
        public int getProtein() { return protein; }
        public void setProtein(int protein) { this.protein = protein; }
        public int getCarbs() { return carbs; }
        public void setCarbs(int carbs) { this.carbs = carbs; }
        public int getFat() { return fat; }
        public void setFat(int fat) { this.fat = fat; }
    }
}
