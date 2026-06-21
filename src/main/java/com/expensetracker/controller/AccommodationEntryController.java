package com.expensetracker.controller;

import com.expensetracker.entity.AccommodationEntry;
import com.expensetracker.service.AccommodationEntryService;
import com.expensetracker.service.TripService;
import com.expensetracker.util.DateTimeUtil;
import com.expensetracker.util.RequestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accommodation-entries")
@CrossOrigin(origins = "*")
public class AccommodationEntryController {

    @Autowired
    private AccommodationEntryService accommodationEntryService;

    @Autowired
    private TripService tripService;

    @PostMapping
    public ResponseEntity<?> createAccommodationEntry(@RequestBody Map<String, Object> body) {
        try {
            AccommodationEntry entry = new AccommodationEntry();
            entry.setAmount(((Number) body.get("amount")).doubleValue());
            Object name = body.get("name");
            entry.setName(name != null && !name.toString().isBlank() ? name.toString() : null);
            entry.setEntryTime(DateTimeUtil.parse(body.get("entryTime")));

            Long tripId = RequestUtil.extractTripId(body);
            if (tripId != null) {
                tripService.getTripById(tripId).ifPresent(entry::setTrip);
            }

            AccommodationEntry saved = accommodationEntryService.saveAccommodationEntry(entry);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving accommodation entry: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<AccommodationEntry>> getAllAccommodationEntries() {
        return ResponseEntity.ok(accommodationEntryService.getAllAccommodationEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccommodationEntry> getAccommodationEntryById(@PathVariable Long id) {
        return accommodationEntryService.getAccommodationEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<AccommodationEntry>> getAccommodationEntriesByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(accommodationEntryService.getAccommodationEntriesByTrip(tripId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccommodationEntry(@PathVariable Long id) {
        if (accommodationEntryService.getAccommodationEntryById(id).isPresent()) {
            accommodationEntryService.deleteAccommodationEntry(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
