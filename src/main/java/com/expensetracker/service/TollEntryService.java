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

    public TollEntry saveTollEntry(TollEntry tollEntry) {
        // Always ensure entryTime is set
        if (tollEntry.getEntryTime() == null) {
            tollEntry.setEntryTime(LocalDateTime.now());
        }
        return tollEntryRepository.save(tollEntry);
    }

    public List<TollEntry> getAllTollEntries() {
        return tollEntryRepository.findAll();
    }

    public Optional<TollEntry> getTollEntryById(Long id) {
        return tollEntryRepository.findById(id);
    }

    public List<TollEntry> getTollEntriesByTrip(Long tripId) {
        return tollEntryRepository.findByTripId(tripId);
    }

    public void deleteTollEntry(Long id) {
        tollEntryRepository.deleteById(id);
    }

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
