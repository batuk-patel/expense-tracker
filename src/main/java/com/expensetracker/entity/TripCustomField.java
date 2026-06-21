package com.expensetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "trip_custom_fields")
public class TripCustomField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String fieldType; // AMOUNT, TEXT, NUMBER

    @Column(nullable = false)
    private Integer sortOrder = 0;

    public TripCustomField() {}

    public TripCustomField(Trip trip, String name, String fieldType, Integer sortOrder) {
        this.trip = trip;
        this.name = name;
        this.fieldType = fieldType;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFieldType() { return fieldType; }
    public void setFieldType(String fieldType) { this.fieldType = fieldType; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
