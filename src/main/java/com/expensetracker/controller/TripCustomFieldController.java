package com.expensetracker.controller;

import com.expensetracker.entity.TripCustomField;
import com.expensetracker.service.TripCustomFieldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/custom-fields")
@CrossOrigin(origins = "*")
public class TripCustomFieldController {

    @Autowired
    private TripCustomFieldService fieldService;

    @GetMapping
    public ResponseEntity<List<TripCustomField>> getFields(@PathVariable Long tripId) {
        return ResponseEntity.ok(fieldService.getFieldsByTrip(tripId));
    }

    @PostMapping
    public ResponseEntity<?> createField(@PathVariable Long tripId, @RequestBody Map<String, Object> body) {
        try {
            Object name = body.get("name");
            if (name == null || name.toString().isBlank()) {
                return ResponseEntity.badRequest().body("Field name is required");
            }
            String fieldType = body.getOrDefault("fieldType", "AMOUNT").toString().toUpperCase();
            if (!List.of("AMOUNT", "TEXT", "NUMBER").contains(fieldType)) {
                return ResponseEntity.badRequest().body("fieldType must be AMOUNT, TEXT, or NUMBER");
            }
            TripCustomField saved = fieldService.createField(tripId, name.toString(), fieldType);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating field: " + e.getMessage());
        }
    }

    @DeleteMapping("/{fieldId}")
    public ResponseEntity<Void> deleteField(@PathVariable Long tripId, @PathVariable Long fieldId) {
        return fieldService.getFieldById(fieldId)
                .filter(f -> f.getTrip().getId().equals(tripId))
                .map(f -> {
                    fieldService.deleteField(fieldId);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
