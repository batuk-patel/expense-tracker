package com.expensetracker.entity;

import com.expensetracker.util.DateTimeUtil;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_expense_entries")
public class CustomExpenseEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(optional = false)
    @JoinColumn(name = "custom_field_id", nullable = false)
    private TripCustomField customField;

    @Column(nullable = true)
    private Double amount;

    @Column(nullable = true)
    private String textValue;

    @Column(nullable = true)
    private Double numberValue;

    @Column(nullable = true)
    private String note;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    public CustomExpenseEntry() {
        this.entryTime = DateTimeUtil.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public TripCustomField getCustomField() { return customField; }
    public void setCustomField(TripCustomField customField) { this.customField = customField; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getTextValue() { return textValue; }
    public void setTextValue(String textValue) { this.textValue = textValue; }

    public Double getNumberValue() { return numberValue; }
    public void setNumberValue(Double numberValue) { this.numberValue = numberValue; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getEntryTime() { return entryTime; }
    public void setEntryTime(LocalDateTime entryTime) { this.entryTime = entryTime; }
}
