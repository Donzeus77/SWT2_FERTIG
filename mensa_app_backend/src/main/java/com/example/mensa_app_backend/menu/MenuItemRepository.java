package com.example.mensa_app_backend.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByDate(LocalDate date);
    List<MenuItem> findByDateBetween(LocalDate start, LocalDate end);
    List<MenuItem> findByLocation(String location);
}
