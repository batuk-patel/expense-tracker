package com.expensetracker.controller;

import com.expensetracker.entity.Trip;
import com.expensetracker.service.TripService;
import com.expensetracker.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    @Autowired
    private TripService tripService;

    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody Map<String, Object> body) {
        try {
            Trip trip = new Trip();
            Object name = body.get("name");
            if (name == null || name.toString().isBlank()) {
                return ResponseEntity.badRequest().body("Trip name is required");
            }
            trip.setName(name.toString().trim());
            Object desc = body.get("description");
            trip.setDescription(desc != null && !desc.toString().isBlank() ? desc.toString().trim() : null);
            if (body.get("startDate") != null) {
                trip.setStartDate(DateTimeUtil.parse(body.get("startDate")));
            }
            Trip savedTrip = tripService.saveTrip(trip);
            return ResponseEntity.ok(savedTrip);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error saving trip: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Trip>> getActiveTrips() {
        return ResponseEntity.ok(tripService.getActiveTrips());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return tripService.getTripById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Object name = body.get("name");
            if (name == null || name.toString().isBlank()) {
                return ResponseEntity.badRequest().body("Trip name is required");
            }
            Object desc = body.get("description");
            String description = desc != null ? desc.toString() : null;
            return tripService.updateTrip(id, name.toString(), description)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating trip: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        if (tripService.getTripById(id).isPresent()) {
            tripService.deleteTrip(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
