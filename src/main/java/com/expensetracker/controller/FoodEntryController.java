package com.expensetracker.controller;

import com.expensetracker.entity.FoodEntry;
import com.expensetracker.service.FoodEntryService;
import com.expensetracker.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/food-entries")
@CrossOrigin(origins = "*")
public class FoodEntryController {

    @Autowired
    private FoodEntryService foodEntryService;

    @Autowired
    private TripService tripService;

    @PostMapping
    public ResponseEntity<?> createFoodEntry(@RequestBody Map<String, Object> body) {
        try {
            FoodEntry entry = new FoodEntry();
            entry.setAmount(((Number) body.get("amount")).doubleValue());
            Object name = body.get("name");
            entry.setName(name != null && !name.toString().isBlank() ? name.toString() : null);

            Object tripObj = body.get("trip");
            if (tripObj instanceof Map) {
                Object tripId = ((Map<?, ?>) tripObj).get("id");
                if (tripId != null) {
                    Long id = ((Number) tripId).longValue();
                    tripService.getTripById(id).ifPresent(entry::setTrip);
                }
            }

            FoodEntry saved = foodEntryService.saveFoodEntry(entry);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving food entry: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<FoodEntry>> getAllFoodEntries() {
        return ResponseEntity.ok(foodEntryService.getAllFoodEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodEntry> getFoodEntryById(@PathVariable Long id) {
        return foodEntryService.getFoodEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<FoodEntry>> getFoodEntriesByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(foodEntryService.getFoodEntriesByTrip(tripId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodEntry(@PathVariable Long id) {
        if (foodEntryService.getFoodEntryById(id).isPresent()) {
            foodEntryService.deleteFoodEntry(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
