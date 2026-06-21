package com.expensetracker.entity;

import com.expensetracker.util.DateTimeUtil;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_entries")
public class FuelEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private Double liters;
    
    @Column(nullable = false)
    private LocalDateTime entryTime;
    
    @Column(nullable = true)
    private String note;
    
    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = true)
    private Trip trip;
    
    // Constructors
    public FuelEntry() {
        this.entryTime = DateTimeUtil.now();
    }
    
    public FuelEntry(Double amount, String location, Double liters, String note, Trip trip) {
        this.amount = amount;
        this.location = location;
        this.liters = liters;
        this.note = note;
        this.trip = trip;
        this.entryTime = DateTimeUtil.now();
    }
    
    // Getters and Setters
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
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public Double getLiters() {
        return liters;
    }
    
    public void setLiters(Double liters) {
        this.liters = liters;
    }
    
    public LocalDateTime getEntryTime() {
        return entryTime;
    }
    
    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }
    
    public String getNote() {
        return note;
    }
    
    public void setNote(String note) {
        this.note = note;
    }
    
    public Trip getTrip() {
        return trip;
    }
    
    public void setTrip(Trip trip) {
        this.trip = trip;
    }
}
