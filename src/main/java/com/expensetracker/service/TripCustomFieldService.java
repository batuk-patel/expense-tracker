package com.expensetracker.service;

import com.expensetracker.entity.Trip;
import com.expensetracker.entity.TripCustomField;
import com.expensetracker.repository.CustomExpenseEntryRepository;
import com.expensetracker.repository.TripCustomFieldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TripCustomFieldService {

    @Autowired
    private TripCustomFieldRepository fieldRepository;

    @Autowired
    private CustomExpenseEntryRepository entryRepository;

    @Autowired
    private TripService tripService;

    public List<TripCustomField> getFieldsByTrip(Long tripId) {
        return fieldRepository.findByTripIdOrderBySortOrderAscIdAsc(tripId);
    }

    public Optional<TripCustomField> getFieldById(Long id) {
        return fieldRepository.findById(id);
    }

    public TripCustomField createField(Long tripId, String name, String fieldType) {
        Trip trip = tripService.getTripById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
        List<TripCustomField> existing = fieldRepository.findByTripIdOrderBySortOrderAscIdAsc(tripId);
        int nextOrder = existing.isEmpty() ? 0 : existing.get(existing.size() - 1).getSortOrder() + 1;
        TripCustomField field = new TripCustomField(trip, name.trim(), fieldType, nextOrder);
        return fieldRepository.save(field);
    }

    @Transactional
    public void deleteField(Long fieldId) {
        entryRepository.deleteByCustomFieldId(fieldId);
        fieldRepository.deleteById(fieldId);
    }

    @Transactional
    public void deleteFieldsByTrip(Long tripId) {
        entryRepository.deleteByTripId(tripId);
        fieldRepository.deleteByTripId(tripId);
    }
}
