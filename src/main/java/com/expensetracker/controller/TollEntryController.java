package com.expensetracker.controller;

import com.expensetracker.entity.TollEntry;
import com.expensetracker.service.TollEntryService;
import com.expensetracker.service.TripService;
import com.expensetracker.util.DateTimeUtil;
import com.expensetracker.util.RequestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/toll-entries")
@CrossOrigin(origins = "*")
public class TollEntryController {

    @Autowired
    private TollEntryService tollEntryService;

    @Autowired
    private TripService tripService;

    @PostMapping
    public ResponseEntity<?> createTollEntry(@RequestBody Map<String, Object> body) {
        try {
            TollEntry entry = new TollEntry();
            entry.setAmount(((Number) body.get("amount")).doubleValue());
            entry.setLocation((String) body.get("location"));
            entry.setTollType(body.getOrDefault("tollType", "National").toString());
            Object note = body.get("note");
            entry.setNote(note != null && !note.toString().isBlank() ? note.toString() : null);
            entry.setEntryTime(DateTimeUtil.parse(body.get("entryTime")));

            Long tripId = RequestUtil.extractTripId(body);
            if (tripId != null) {
                tripService.getTripById(tripId).ifPresent(entry::setTrip);
            }

            TollEntry saved = tollEntryService.saveTollEntry(entry);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving toll entry: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<TollEntry>> getAllTollEntries() {
        return ResponseEntity.ok(tollEntryService.getAllTollEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TollEntry> getTollEntryById(@PathVariable Long id) {
        return tollEntryService.getTollEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<TollEntry>> getTollEntriesByTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(tollEntryService.getTollEntriesByTrip(tripId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTollEntry(@PathVariable Long id) {
        if (tollEntryService.getTollEntryById(id).isPresent()) {
            tollEntryService.deleteTollEntry(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTollEntry(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            if (tollEntryService.getTollEntryById(id).isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            TollEntry entry = new TollEntry();
            entry.setAmount(((Number) body.get("amount")).doubleValue());
            entry.setLocation((String) body.get("location"));
            entry.setTollType(body.getOrDefault("tollType", "National").toString());
            Object note = body.get("note");
            entry.setNote(note != null && !note.toString().isBlank() ? note.toString() : null);

            Long tripId = RequestUtil.extractTripId(body);
            if (tripId != null) {
                tripService.getTripById(tripId).ifPresent(entry::setTrip);
            } else {
                entry.setTrip(null);
            }

            TollEntry updated = tollEntryService.updateTollEntry(id, entry);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating toll entry: " + e.getMessage());
        }
    }
}
