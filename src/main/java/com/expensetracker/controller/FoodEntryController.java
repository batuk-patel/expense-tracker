package com.expensetracker.controller;

import com.expensetracker.entity.FoodEntry;
import com.expensetracker.service.FoodEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-entries")
@CrossOrigin(origins = "*")
public class FoodEntryController {

    @Autowired
    private FoodEntryService foodEntryService;

    @PostMapping
    public ResponseEntity<FoodEntry> createFoodEntry(@RequestBody FoodEntry entry) {
        return ResponseEntity.ok(foodEntryService.saveFoodEntry(entry));
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

    @PutMapping("/{id}")
    public ResponseEntity<FoodEntry> updateFoodEntry(@PathVariable Long id, @RequestBody FoodEntry updatedEntry) {
        FoodEntry entry = foodEntryService.updateFoodEntry(id, updatedEntry);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.notFound().build();
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
