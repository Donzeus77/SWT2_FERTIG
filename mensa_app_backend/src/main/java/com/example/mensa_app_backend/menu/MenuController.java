package com.example.mensa_app_backend.menu;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu(@RequestParam(required = false) String date) {
        if (date != null) {
            return ResponseEntity.ok(menuService.getByDate(date));
        }
        return ResponseEntity.ok(menuService.getAllItems());
    }

    @GetMapping("/week/{monday}")
    public ResponseEntity<Map<String, List<MenuItem>>> getWeekMenu(@PathVariable String monday) {
        return ResponseEntity.ok(menuService.getByWeek(monday));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        return menuService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MenuItem createMenuItem(@RequestBody MenuItem item) {
        return menuService.addItem(item);
    }
}
