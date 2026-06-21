package com.expensetracker.repository;

import com.expensetracker.entity.TripCustomField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripCustomFieldRepository extends JpaRepository<TripCustomField, Long> {
    List<TripCustomField> findByTripIdOrderBySortOrderAscIdAsc(Long tripId);
    void deleteByTripId(Long tripId);
}
