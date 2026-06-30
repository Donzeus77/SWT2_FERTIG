package com.example.mensa_app_backend.auth;

import com.example.mensa_app_backend.profil.Profil;
import com.example.mensa_app_backend.profil.ProfilRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired(required = false)
    private ProfilRepository profilRepository;

    private final SecretKey jwtKey = Keys.hmacShaKeyFor(
            "super-secret-mensa-jwt-key-2024-min-256-bits!!".getBytes(StandardCharsets.UTF_8));

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String firstName = body.getOrDefault("firstName", "");
        String lastName = body.getOrDefault("lastName", "");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }

        Profil profil = new Profil(email, password, firstName, lastName);
        if (profilRepository != null) {
            profil = profilRepository.save(profil);
        }

        String token = generateToken(profil);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", toUserMap(profil)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }

        Profil profil = null;
        if (profilRepository != null) {
            var opt = profilRepository.findByEmail(email);
            if (opt.isPresent() && opt.get().getPasswort().equals(password)) {
                profil = opt.get();
            }
        }

        if (profil == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String token = generateToken(profil);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", toUserMap(profil)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        try {
            String token = auth.substring(7);
            var claims = Jwts.parser().verifyWith(jwtKey).build()
                    .parseSignedClaims(token).getPayload();
            String email = claims.getSubject();
            Long id = claims.get("id", Long.class);

            if (profilRepository != null) {
                var opt = profilRepository.findByEmail(email);
                if (opt.isPresent()) {
                    return ResponseEntity.ok(toUserMap(opt.get()));
                }
            }
            return ResponseEntity.ok(Map.of(
                    "id", String.valueOf(id),
                    "firstName", "",
                    "lastName", "",
                    "email", email,
                    "type", claims.get("type", String.class)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }
    }

    private String generateToken(Profil profil) {
        return Jwts.builder()
                .subject(profil.getEmail())
                .claim("id", profil.getId())
                .claim("type", profil.getStatus())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(jwtKey)
                .compact();
    }

    private Map<String, Object> toUserMap(Profil profil) {
        return Map.of(
                "id", String.valueOf(profil.getId()),
                "firstName", profil.getVorname(),
                "lastName", profil.getNachname(),
                "email", profil.getEmail(),
                "type", profil.getStatus());
    }
}
