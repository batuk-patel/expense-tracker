package com.expensetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "toll_entries")
public class TollEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private LocalDateTime entryTime;
    
    @Column(nullable = false)
    private String tollType; // "State" or "National"
    
    @Column(nullable = true)
    private String note;
    
    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = true)
    private Trip trip;
    
    // Constructors
    public TollEntry() {
        this.entryTime = LocalDateTime.now();
    }
    
    public TollEntry(Double amount, String location, String tollType, String note, Trip trip) {
        this.amount = amount;
        this.location = location;
        this.tollType = tollType;
        this.note = note;
        this.trip = trip;
        this.entryTime = LocalDateTime.now();
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
    
    public LocalDateTime getEntryTime() {
        return entryTime;
    }
    
    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }
    
    public String getTollType() {
        return tollType;
    }
    
    public void setTollType(String tollType) {
        this.tollType = tollType;
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
