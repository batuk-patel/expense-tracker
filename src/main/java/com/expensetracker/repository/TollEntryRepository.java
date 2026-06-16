package com.expensetracker.repository;

import com.expensetracker.entity.TollEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TollEntryRepository extends JpaRepository<TollEntry, Long> {
    List<TollEntry> findByLocation(String location);
    List<TollEntry> findByEntryTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    List<TollEntry> findByTripId(Long tripId);
}
