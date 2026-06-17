package com.expensetracker.repository;

import com.expensetracker.entity.AccommodationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccommodationEntryRepository extends JpaRepository<AccommodationEntry, Long> {
    List<AccommodationEntry> findByTripId(Long tripId);
}
