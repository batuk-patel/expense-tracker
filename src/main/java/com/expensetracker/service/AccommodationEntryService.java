package com.expensetracker.service;

import com.expensetracker.entity.AccommodationEntry;
import com.expensetracker.repository.AccommodationEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expensetracker.util.DateTimeUtil;
import java.util.List;
import java.util.Optional;

@Service
public class AccommodationEntryService {

    @Autowired
    private AccommodationEntryRepository accommodationEntryRepository;

    public AccommodationEntry saveAccommodationEntry(AccommodationEntry entry) {
        if (entry.getEntryTime() == null) {
            entry.setEntryTime(DateTimeUtil.now());
        }
        return accommodationEntryRepository.save(entry);
    }

    public List<AccommodationEntry> getAllAccommodationEntries() {
        return accommodationEntryRepository.findAll();
    }

    public Optional<AccommodationEntry> getAccommodationEntryById(Long id) {
        return accommodationEntryRepository.findById(id);
    }

    public List<AccommodationEntry> getAccommodationEntriesByTrip(Long tripId) {
        return accommodationEntryRepository.findByTripId(tripId);
    }

    public void deleteAccommodationEntry(Long id) {
        accommodationEntryRepository.deleteById(id);
    }

    public AccommodationEntry updateAccommodationEntry(Long id, AccommodationEntry updatedEntry) {
        return accommodationEntryRepository.findById(id).map(entry -> {
            entry.setAmount(updatedEntry.getAmount());
            entry.setName(updatedEntry.getName());
            entry.setNote(updatedEntry.getNote());
            entry.setTrip(updatedEntry.getTrip());
            return accommodationEntryRepository.save(entry);
        }).orElse(null);
    }
}
