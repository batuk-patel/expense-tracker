package com.expensetracker.service;

import com.expensetracker.entity.FuelEntry;
import com.expensetracker.repository.FuelEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FuelEntryService {
    
    @Autowired
    private FuelEntryRepository fuelEntryRepository;
    
    public FuelEntry saveFuelEntry(FuelEntry fuelEntry) {
        if (fuelEntry.getEntryTime() == null) {
            fuelEntry.setEntryTime(LocalDateTime.now());
        }
        return fuelEntryRepository.save(fuelEntry);
    }
    
    // Get all fuel entries
    public List<FuelEntry> getAllFuelEntries() {
        return fuelEntryRepository.findAll();
    }
    
    // Get fuel entry by ID
    public Optional<FuelEntry> getFuelEntryById(Long id) {
        return fuelEntryRepository.findById(id);
    }
    
    // Get fuel entries by location
    public List<FuelEntry> getFuelEntriesByLocation(String location) {
        return fuelEntryRepository.findByLocation(location);
    }
    
    // Get fuel entries between two dates
    public List<FuelEntry> getFuelEntriesByDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        return fuelEntryRepository.findByEntryTimeBetween(startTime, endTime);
    }
    
    // Get fuel entries by trip ID
    public List<FuelEntry> getFuelEntriesByTrip(Long tripId) {
        return fuelEntryRepository.findByTripId(tripId);
    }
    
    // Delete a fuel entry
    public void deleteFuelEntry(Long id) {
        fuelEntryRepository.deleteById(id);
    }
    
    // Update a fuel entry
    public FuelEntry updateFuelEntry(Long id, FuelEntry updatedEntry) {
        return fuelEntryRepository.findById(id).map(fuelEntry -> {
            fuelEntry.setAmount(updatedEntry.getAmount());
            fuelEntry.setLocation(updatedEntry.getLocation());
            fuelEntry.setLiters(updatedEntry.getLiters());
            fuelEntry.setNote(updatedEntry.getNote());
            fuelEntry.setTrip(updatedEntry.getTrip());
            return fuelEntryRepository.save(fuelEntry);
        }).orElse(null);
    }
}
