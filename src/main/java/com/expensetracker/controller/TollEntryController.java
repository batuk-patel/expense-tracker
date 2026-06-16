package com.expensetracker.controller;

import com.expensetracker.entity.TollEntry;
import com.expensetracker.service.TollEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toll-entries")
@CrossOrigin(origins = "*")
public class TollEntryController {
    
    @Autowired
    private TollEntryService tollEntryService;
    
    @PostMapping
    public ResponseEntity<TollEntry> createTollEntry(@RequestBody TollEntry tollEntry) {
        TollEntry savedEntry = tollEntryService.saveTollEntry(tollEntry);
        return ResponseEntity.ok(savedEntry);
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
    
    @PutMapping("/{id}")
    public ResponseEntity<TollEntry> updateTollEntry(@PathVariable Long id, @RequestBody TollEntry updatedEntry) {
        TollEntry entry = tollEntryService.updateTollEntry(id, updatedEntry);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTollEntry(@PathVariable Long id) {
        if (tollEntryService.getTollEntryById(id).isPresent()) {
            tollEntryService.deleteTollEntry(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
