package com.expensetracker.service;

import com.expensetracker.entity.TollEntry;
import com.expensetracker.repository.TollEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TollEntryService {
    
    @Autowired
    private TollEntryRepository tollEntryRepository;
    
    // Save a new toll entry
    public TollEntry saveTollEntry(TollEntry tollEntry) {
        return tollEntryRepository.save(tollEntry);
    }
    
    // Get all toll entries
    public List<TollEntry> getAllTollEntries() {
        return tollEntryRepository.findAll();
    }
    
    // Get toll entry by ID
    public Optional<TollEntry> getTollEntryById(Long id) {
        return tollEntryRepository.findById(id);
    }
    
    // Get toll entries by location
    public List<TollEntry> getTollEntriesByLocation(String location) {
        return tollEntryRepository.findByLocation(location);
    }
    
    // Get toll entries between two dates
    public List<TollEntry> getTollEntriesByDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        return tollEntryRepository.findByEntryTimeBetween(startTime, endTime);
    }
    
    // Get toll entries by trip ID
    public List<TollEntry> getTollEntriesByTrip(Long tripId) {
        return tollEntryRepository.findByTripId(tripId);
    }
    
    // Delete a toll entry
    public void deleteTollEntry(Long id) {
        tollEntryRepository.deleteById(id);
    }
    
    // Update a toll entry
    public TollEntry updateTollEntry(Long id, TollEntry updatedEntry) {
        return tollEntryRepository.findById(id).map(tollEntry -> {
            tollEntry.setAmount(updatedEntry.getAmount());
            tollEntry.setLocation(updatedEntry.getLocation());
            tollEntry.setTollType(updatedEntry.getTollType());
            tollEntry.setNote(updatedEntry.getNote());
            tollEntry.setTrip(updatedEntry.getTrip());
            return tollEntryRepository.save(tollEntry);
        }).orElse(null);
    }
}
