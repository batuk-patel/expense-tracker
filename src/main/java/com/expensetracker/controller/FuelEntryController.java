package com.expensetracker.controller;

import com.expensetracker.entity.FuelEntry;
import com.expensetracker.service.FuelEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel-entries")
@CrossOrigin(origins = "*")
public class FuelEntryController {
    
    @Autowired
    private FuelEntryService fuelEntryService;
    
    @PostMapping
    public ResponseEntity<FuelEntry> createFuelEntry(@RequestBody FuelEntry fuelEntry) {
        FuelEntry savedEntry = fuelEntryService.saveFuelEntry(fuelEntry);
        return ResponseEntity.ok(savedEntry);
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
    
    @PutMapping("/{id}")
    public ResponseEntity<FuelEntry> updateFuelEntry(@PathVariable Long id, @RequestBody FuelEntry updatedEntry) {
        FuelEntry entry = fuelEntryService.updateFuelEntry(id, updatedEntry);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.notFound().build();
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
