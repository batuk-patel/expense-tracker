package com.expensetracker.controller;

import com.expensetracker.entity.CustomExpenseEntry;
import com.expensetracker.service.CustomExpenseEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/custom-expense-entries")
@CrossOrigin(origins = "*")
public class CustomExpenseEntryController {

    @Autowired
    private CustomExpenseEntryService entryService;

    @PostMapping
    public ResponseEntity<?> createEntry(@RequestBody Map<String, Object> body) {
        try {
            Long tripId = body.get("tripId") != null ? ((Number) body.get("tripId")).longValue() : null;
            Long fieldId = body.get("customFieldId") != null ? ((Number) body.get("customFieldId")).longValue() : null;
            if (tripId == null || fieldId == null) {
                return ResponseEntity.badRequest().body("tripId and customFieldId are required");
            }

            Double amount = body.get("amount") != null ? ((Number) body.get("amount")).doubleValue() : null;
            Double numberValue = body.get("numberValue") != null ? ((Number) body.get("numberValue")).doubleValue() : null;
            Object textVal = body.get("textValue");
            String textValue = textVal != null && !textVal.toString().isBlank() ? textVal.toString().trim() : null;
            Object noteVal = body.get("note");
            String note = noteVal != null && !noteVal.toString().isBlank() ? noteVal.toString().trim() : null;

            CustomExpenseEntry saved = entryService.createEntry(
                    tripId, fieldId, amount, textValue, numberValue, note, body.get("entryTime"));
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving entry: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CustomExpenseEntry>> getAllEntries() {
        return ResponseEntity.ok(entryService.getAllEntries());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<CustomExpenseEntry>> getEntriesByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(entryService.getEntriesByTrip(tripId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        if (entryService.getEntryById(id).isPresent()) {
            entryService.deleteEntry(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
