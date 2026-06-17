package com.expensetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_entries")
public class FoodEntry {

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

    public FoodEntry() {
        this.entryTime = LocalDateTime.now();
    }

    public FoodEntry(Double amount, String name, Trip trip) {
        this.amount = amount;
        this.name = name;
        this.trip = trip;
        this.entryTime = LocalDateTime.now();
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
