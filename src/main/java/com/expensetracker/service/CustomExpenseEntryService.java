package com.expensetracker.service;

import com.expensetracker.entity.CustomExpenseEntry;
import com.expensetracker.entity.Trip;
import com.expensetracker.entity.TripCustomField;
import com.expensetracker.repository.CustomExpenseEntryRepository;
import com.expensetracker.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomExpenseEntryService {

    @Autowired
    private CustomExpenseEntryRepository entryRepository;

    @Autowired
    private TripService tripService;

    @Autowired
    private TripCustomFieldService fieldService;

    public CustomExpenseEntry saveEntry(CustomExpenseEntry entry) {
        if (entry.getEntryTime() == null) {
            entry.setEntryTime(DateTimeUtil.now());
        }
        return entryRepository.save(entry);
    }

    public List<CustomExpenseEntry> getAllEntries() {
        return entryRepository.findAll();
    }

    public List<CustomExpenseEntry> getEntriesByTrip(Long tripId) {
        return entryRepository.findByTripIdOrderByEntryTimeDesc(tripId);
    }

    public Optional<CustomExpenseEntry> getEntryById(Long id) {
        return entryRepository.findById(id);
    }

    public void deleteEntry(Long id) {
        entryRepository.deleteById(id);
    }

    public CustomExpenseEntry createEntry(Long tripId, Long fieldId, Double amount,
                                          String textValue, Double numberValue,
                                          String note, Object entryTime) {
        Trip trip = tripService.getTripById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        TripCustomField field = fieldService.getFieldById(fieldId)
                .orElseThrow(() -> new IllegalArgumentException("Custom field not found"));
        if (!field.getTrip().getId().equals(tripId)) {
            throw new IllegalArgumentException("Field does not belong to this trip");
        }

        CustomExpenseEntry entry = new CustomExpenseEntry();
        entry.setTrip(trip);
        entry.setCustomField(field);
        entry.setAmount(amount);
        entry.setTextValue(textValue);
        entry.setNumberValue(numberValue);
        entry.setNote(note);
        entry.setEntryTime(DateTimeUtil.parse(entryTime));
        return saveEntry(entry);
    }
}
