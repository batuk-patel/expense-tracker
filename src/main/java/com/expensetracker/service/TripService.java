package com.expensetracker.service;

import com.expensetracker.entity.Trip;
import com.expensetracker.entity.TollEntry;
import com.expensetracker.entity.FuelEntry;
import com.expensetracker.entity.AccommodationEntry;
import com.expensetracker.entity.FoodEntry;
import com.expensetracker.repository.TripRepository;
import com.expensetracker.repository.TollEntryRepository;
import com.expensetracker.repository.FuelEntryRepository;
import com.expensetracker.repository.AccommodationEntryRepository;
import com.expensetracker.repository.FoodEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TollEntryRepository tollEntryRepository;

    @Autowired
    private FuelEntryRepository fuelEntryRepository;

    @Autowired
    private AccommodationEntryRepository accommodationEntryRepository;

    @Autowired
    private FoodEntryRepository foodEntryRepository;

    public Trip saveTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public List<Trip> getActiveTrips() {
        return tripRepository.findByActive(true);
    }

    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }

    // Safely delete a trip by first dissociating all linked expenses
    @Transactional
    public void deleteTrip(Long id) {
        List<TollEntry> tolls = tollEntryRepository.findByTripId(id);
        for (TollEntry toll : tolls) {
            toll.setTrip(null);
            tollEntryRepository.save(toll);
        }

        List<FuelEntry> fuels = fuelEntryRepository.findByTripId(id);
        for (FuelEntry fuel : fuels) {
            fuel.setTrip(null);
            fuelEntryRepository.save(fuel);
        }

        List<AccommodationEntry> accommodations = accommodationEntryRepository.findByTripId(id);
        for (AccommodationEntry acc : accommodations) {
            acc.setTrip(null);
            accommodationEntryRepository.save(acc);
        }

        List<FoodEntry> foods = foodEntryRepository.findByTripId(id);
        for (FoodEntry food : foods) {
            food.setTrip(null);
            foodEntryRepository.save(food);
        }

        tripRepository.deleteById(id);
    }
}
