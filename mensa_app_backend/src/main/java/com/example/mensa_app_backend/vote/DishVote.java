package com.example.mensa_app_backend.vote;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "dish_vote")
public class DishVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dishId;
    private String userEmail;

    protected DishVote() {}

    public DishVote(String dishId, String userEmail) {
        this.dishId = dishId;
        this.userEmail = userEmail;
    }

    public Long getId() { return id; }
    public String getDishId() { return dishId; }
    public String getUserEmail() { return userEmail; }
}
