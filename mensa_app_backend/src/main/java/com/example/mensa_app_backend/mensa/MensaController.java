package com.example.mensa_app_backend.mensa;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/mensas")
public class MensaController {

    @Autowired(required = false)
    private MensaRepository repository;

    private final List<Mensa> mensas = new ArrayList<>();
    private final AtomicLong nextId = new AtomicLong(1);

    @PostConstruct
    private void init() {
        if (repository != null && repository.count() == 0) {
            repository.save(new Mensa("Hauptmensa", "Vogelpothsweg 85, 44227 Dortmund",
                    "Hauptmensa der TU Dortmund", "Mo-Fr 11:00-14:30", "TU Dortmund", 51.493, 7.416));
            repository.save(new Mensa("Mensa S\u00fcd", "Baroper Str. 331, 44227 Dortmund",
                    "Mensa am Campus S\u00fcd", "Mo-Fr 11:00-14:00", "TU Dortmund", 51.485, 7.412));
            repository.save(new Mensa("Galerie", "Emil-Figge-Str. 73, 44227 Dortmund",
                    "Caf\u00e9 und Bistro", "Mo-Fr 09:00-17:00", "TU Dortmund", 51.492, 7.418));
            repository.save(new Mensa("Food Fakult\u00e4t", "Otto-Hahn-Str. 12, 44227 Dortmund",
                    "Mensa der Fakult\u00e4t", "Mo-Fr 11:30-14:00", "TU Dortmund", 51.490, 7.409));
            repository.save(new Mensa("FH Mensa", "Sonnenstra\u00dfe 96, 44139 Dortmund",
                    "Mensa der FH Dortmund", "Mo-Fr 11:00-14:30", "FH Dortmund", 51.505, 7.460));
        } else {
            mensas.add(build(nextId.getAndIncrement(), "Hauptmensa", "Vogelpothsweg 85", "Hauptmensa der TU Dortmund", "Mo-Fr 11:00-14:30", "TU Dortmund", 51.493, 7.416));
            mensas.add(build(nextId.getAndIncrement(), "Mensa S\u00fcd", "Baroper Str. 331", "Mensa am Campus S\u00fcd", "Mo-Fr 11:00-14:00", "TU Dortmund", 51.485, 7.412));
            mensas.add(build(nextId.getAndIncrement(), "Galerie", "Emil-Figge-Str. 73", "Caf\u00e9 und Bistro", "Mo-Fr 09:00-17:00", "TU Dortmund", 51.492, 7.418));
            mensas.add(build(nextId.getAndIncrement(), "Food Fakult\u00e4t", "Otto-Hahn-Str. 12", "Mensa der Fakult\u00e4t", "Mo-Fr 11:30-14:00", "TU Dortmund", 51.490, 7.409));
            mensas.add(build(nextId.getAndIncrement(), "FH Mensa", "Sonnenstra\u00dfe 96", "Mensa der FH Dortmund", "Mo-Fr 11:00-14:30", "FH Dortmund", 51.505, 7.460));
        }
    }

    private Mensa build(Long id, String name, String addr, String desc, String hours, String campus, double lat, double lon) {
        Mensa m = new Mensa(name, addr, desc, hours, campus, lat, lon);
        m.setId(id);
        return m;
    }

    @GetMapping
    public List<Mensa> getAll(@RequestParam(required = false) String campus) {
        if (repository != null) {
            if (campus != null) return repository.findByCampus(campus);
            return repository.findAll();
        }
        if (campus != null) return mensas.stream().filter(m -> campus.equals(m.getCampus())).toList();
        return mensas;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mensa> getById(@PathVariable Long id) {
        if (repository != null) return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        return mensas.stream().filter(m -> m.getId().equals(id)).findFirst()
                .map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
