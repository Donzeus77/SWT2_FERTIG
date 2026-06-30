package com.example.mensa_app_backend.mensa;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MensaRepository extends JpaRepository<Mensa, Long> {
    List<Mensa> findByCampus(String campus);
}
