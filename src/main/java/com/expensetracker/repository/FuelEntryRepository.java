package com.expensetracker.repository;

import com.expensetracker.entity.FuelEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FuelEntryRepository extends JpaRepository<FuelEntry, Long> {
    List<FuelEntry> findByLocation(String location);
    List<FuelEntry> findByEntryTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    List<FuelEntry> findByTripId(Long tripId);
}
