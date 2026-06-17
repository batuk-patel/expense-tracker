package com.expensetracker.controller;

import com.expensetracker.entity.AccommodationEntry;
import com.expensetracker.service.AccommodationEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accommodation-entries")
@CrossOrigin(origins = "*")
public class AccommodationEntryController {

    @Autowired
    private AccommodationEntryService accommodationEntryService;

    @PostMapping
    public ResponseEntity<AccommodationEntry> createAccommodationEntry(@RequestBody AccommodationEntry entry) {
        return ResponseEntity.ok(accommodationEntryService.saveAccommodationEntry(entry));
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

    @PutMapping("/{id}")
    public ResponseEntity<AccommodationEntry> updateAccommodationEntry(@PathVariable Long id, @RequestBody AccommodationEntry updatedEntry) {
        AccommodationEntry entry = accommodationEntryService.updateAccommodationEntry(id, updatedEntry);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.notFound().build();
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
