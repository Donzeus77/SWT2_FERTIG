package com.example.mensa_app_backend.vote;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DishVoteRepository extends JpaRepository<DishVote, Long> {
    List<DishVote> findByUserEmail(String userEmail);
    List<DishVote> findByDishId(String dishId);
    boolean existsByUserEmailAndDishId(String userEmail, String dishId);
}
