package com.expensetracker.entity;

import com.expensetracker.util.DateTimeUtil;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accommodation_entries")
public class AccommodationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = true)
    private String name;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = true)
    private Trip trip;

    public AccommodationEntry() {
        this.entryTime = DateTimeUtil.now();
    }

    public AccommodationEntry(Double amount, String name, Trip trip) {
        this.amount = amount;
        this.name = name;
        this.trip = trip;
        this.entryTime = DateTimeUtil.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }
}
