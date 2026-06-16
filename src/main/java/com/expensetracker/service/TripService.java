package com.expensetracker.service;

import com.expensetracker.entity.Trip;
import com.expensetracker.entity.TollEntry;
import com.expensetracker.entity.FuelEntry;
import com.expensetracker.repository.TripRepository;
import com.expensetracker.repository.TollEntryRepository;
import com.expensetracker.repository.FuelEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TripService {
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private TollEntryRepository tollEntryRepository;
    
    @Autowired
    private FuelEntryRepository fuelEntryRepository;
    
    // Save a new trip
    public Trip saveTrip(Trip trip) {
        return tripRepository.save(trip);
    }
    
    // Get all trips
    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }
    
    // Get active trips
    public List<Trip> getActiveTrips() {
        return tripRepository.findByActive(true);
    }
    
    // Get trip by ID
    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }
    
    // Delete a trip (safely dissociating toll/fuel entries first to avoid foreign key violations)
    @Transactional
    public void deleteTrip(Long id) {
        // Dissociate from Toll entries
        List<TollEntry> tolls = tollEntryRepository.findByTripId(id);
        for (TollEntry toll : tolls) {
            toll.setTrip(null);
            tollEntryRepository.save(toll);
        }
        
        // Dissociate from Fuel entries
        List<FuelEntry> fuels = fuelEntryRepository.findByTripId(id);
        for (FuelEntry fuel : fuels) {
            fuel.setTrip(null);
            fuelEntryRepository.save(fuel);
        }
        
        tripRepository.deleteById(id);
    }
}
