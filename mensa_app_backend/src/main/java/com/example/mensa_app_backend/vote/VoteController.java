package com.example.mensa_app_backend.vote;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    @Autowired(required = false)
    private DishVoteRepository repository;

    private static final Map<String, Integer> inMemoryVotes = new HashMap<>();
    private static final Map<String, List<String>> inMemoryUserVotes = new HashMap<>();

    private final SecretKey jwtKey = Keys.hmacShaKeyFor(
            "super-secret-mensa-jwt-key-2024-min-256-bits!!".getBytes(StandardCharsets.UTF_8));

    @GetMapping
    public ResponseEntity<Map<String, Integer>> getCounts() {
        if (repository != null) {
            Map<String, Integer> counts = new HashMap<>();
            for (DishVote v : repository.findAll()) {
                counts.merge(v.getDishId(), 1, Integer::sum);
            }
            return ResponseEntity.ok(counts);
        }
        return ResponseEntity.ok(new HashMap<>(inMemoryVotes));
    }

    @GetMapping("/my")
    public ResponseEntity<List<String>> getMyVotes(@RequestHeader(value = "Authorization") String auth) {
        String email = extractEmail(auth);
        if (email == null) return ResponseEntity.ok(List.of());

        if (repository != null) {
            return ResponseEntity.ok(repository.findByUserEmail(email).stream()
                    .map(DishVote::getDishId).toList());
        }
        return ResponseEntity.ok(inMemoryUserVotes.getOrDefault(email, List.of()));
    }

    @PostMapping("/{dishId}")
    public ResponseEntity<Map<String, Object>> castVote(
            @PathVariable String dishId,
            @RequestHeader(value = "Authorization") String auth) {
        String email = extractEmail(auth);
        if (email == null) return ResponseEntity.status(401).build();

        if (repository != null) {
            repository.save(new DishVote(dishId, email));
            Map<String, Integer> counts = new HashMap<>();
            for (DishVote v : repository.findAll()) {
                counts.merge(v.getDishId(), 1, Integer::sum);
            }
            List<String> voted = repository.findByUserEmail(email).stream()
                    .map(DishVote::getDishId).toList();
            return ResponseEntity.ok(Map.of("counts", counts, "votedIds", voted));
        }

        inMemoryVotes.merge(dishId, 1, Integer::sum);
        inMemoryUserVotes.computeIfAbsent(email, k -> new java.util.ArrayList<>()).add(dishId);
        return ResponseEntity.ok(Map.of(
                "counts", new HashMap<>(inMemoryVotes),
                "votedIds", inMemoryUserVotes.getOrDefault(email, List.of())));
    }

    private String extractEmail(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        try {
            return Jwts.parser().verifyWith(jwtKey).build()
                    .parseSignedClaims(auth.substring(7)).getPayload().getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
