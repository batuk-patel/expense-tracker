package com.expensetracker.controller;

import com.expensetracker.entity.FuelEntry;
import com.expensetracker.service.FuelEntryService;
import com.expensetracker.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fuel-entries")
@CrossOrigin(origins = "*")
public class FuelEntryController {

    @Autowired
    private FuelEntryService fuelEntryService;

    @Autowired
    private TripService tripService;

    @PostMapping
    public ResponseEntity<?> createFuelEntry(@RequestBody Map<String, Object> body) {
        try {
            FuelEntry entry = new FuelEntry();
            entry.setAmount(((Number) body.get("amount")).doubleValue());
            entry.setLocation((String) body.get("location"));
            entry.setLiters(((Number) body.get("liters")).doubleValue());
            Object note = body.get("note");
            entry.setNote(note != null && !note.toString().isBlank() ? note.toString() : null);

            Object tripObj = body.get("trip");
            if (tripObj instanceof Map) {
                Object tripId = ((Map<?, ?>) tripObj).get("id");
                if (tripId != null) {
                    Long id = ((Number) tripId).longValue();
                    tripService.getTripById(id).ifPresent(entry::setTrip);
                }
            }

            FuelEntry saved = fuelEntryService.saveFuelEntry(entry);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving fuel entry: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<FuelEntry>> getAllFuelEntries() {
        return ResponseEntity.ok(fuelEntryService.getAllFuelEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelEntry> getFuelEntryById(@PathVariable Long id) {
        return fuelEntryService.getFuelEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<FuelEntry>> getFuelEntriesByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(fuelEntryService.getFuelEntriesByTrip(tripId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelEntry(@PathVariable Long id) {
        if (fuelEntryService.getFuelEntryById(id).isPresent()) {
            fuelEntryService.deleteFuelEntry(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
