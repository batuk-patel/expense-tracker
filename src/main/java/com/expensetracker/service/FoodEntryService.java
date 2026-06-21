package com.expensetracker.service;

import com.expensetracker.entity.FoodEntry;
import com.expensetracker.repository.FoodEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expensetracker.util.DateTimeUtil;
import java.util.List;
import java.util.Optional;

@Service
public class FoodEntryService {

    @Autowired
    private FoodEntryRepository foodEntryRepository;

    public FoodEntry saveFoodEntry(FoodEntry entry) {
        if (entry.getEntryTime() == null) {
            entry.setEntryTime(DateTimeUtil.now());
        }
        return foodEntryRepository.save(entry);
    }

    public List<FoodEntry> getAllFoodEntries() {
        return foodEntryRepository.findAll();
    }

    public Optional<FoodEntry> getFoodEntryById(Long id) {
        return foodEntryRepository.findById(id);
    }

    public List<FoodEntry> getFoodEntriesByTrip(Long tripId) {
        return foodEntryRepository.findByTripId(tripId);
    }

    public void deleteFoodEntry(Long id) {
        foodEntryRepository.deleteById(id);
    }

    public FoodEntry updateFoodEntry(Long id, FoodEntry updatedEntry) {
        return foodEntryRepository.findById(id).map(entry -> {
            entry.setAmount(updatedEntry.getAmount());
            entry.setName(updatedEntry.getName());
            entry.setTrip(updatedEntry.getTrip());
            return foodEntryRepository.save(entry);
        }).orElse(null);
    }
}
