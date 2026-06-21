package com.expensetracker.repository;

import com.expensetracker.entity.CustomExpenseEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomExpenseEntryRepository extends JpaRepository<CustomExpenseEntry, Long> {
    List<CustomExpenseEntry> findByTripIdOrderByEntryTimeDesc(Long tripId);
    void deleteByTripId(Long tripId);
    void deleteByCustomFieldId(Long customFieldId);
}
