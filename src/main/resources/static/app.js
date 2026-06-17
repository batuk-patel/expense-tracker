// API Configuration
const API_BASE = '/api';
const TOLL_API = `${API_BASE}/toll-entries`;
const FUEL_API = `${API_BASE}/fuel-entries`;
const ACCOMMODATION_API = `${API_BASE}/accommodation-entries`;
const FOOD_API = `${API_BASE}/food-entries`;
const TRIP_API = `${API_BASE}/trips`;

// State
let tollEntries = [];
let fuelEntries = [];
let accommodationEntries = [];
let foodEntries = [];
let trips = [];
let currentTripFilter = 'all';

// DOM Elements
const timeEl = document.getElementById('live-time');
const dateEl = document.getElementById('live-date');

const totalCombinedEl = document.getElementById('val-total-combined');
const totalTollEl = document.getElementById('val-total-toll');
const totalFuelEl = document.getElementById('val-total-fuel');
const totalAccommodationEl = document.getElementById('val-total-accommodation');
const totalFoodEl = document.getElementById('val-total-food');
const totalLitersEl = document.getElementById('val-total-liters');

const combinedMetaEl = document.getElementById('val-combined-percentage');
const tollCountEl = document.getElementById('val-toll-count');
const fuelCountEl = document.getElementById('val-fuel-count');
const accommodationCountEl = document.getElementById('val-accommodation-count');
const foodCountEl = document.getElementById('val-food-count');
const badgeTollCountEl = document.getElementById('badge-toll-count');
const badgeFuelCountEl = document.getElementById('badge-fuel-count');
const badgeAccommodationCountEl = document.getElementById('badge-accommodation-count');
const badgeFoodCountEl = document.getElementById('badge-food-count');

const tollForm = document.getElementById('toll-form');
const fuelForm = document.getElementById('fuel-form');
const accommodationForm = document.getElementById('accommodation-form');
const foodForm = document.getElementById('food-form');

const tollLogsList = document.getElementById('toll-logs-list');
const fuelLogsList = document.getElementById('fuel-logs-list');
const accommodationLogsList = document.getElementById('accommodation-logs-list');
const foodLogsList = document.getElementById('food-logs-list');

const toastEl = document.getElementById('toast');

// New Trip DOM Elements
const tripFilterSelect = document.getElementById('trip-filter-select');
const tollTripSelect = document.getElementById('toll-trip');
const fuelTripSelect = document.getElementById('fuel-trip');
const accommodationTripSelect = document.getElementById('accommodation-trip');
const foodTripSelect = document.getElementById('food-trip');
const tripForm = document.getElementById('trip-form');
const tripPanel = document.getElementById('panel-create-trip');
const toggleTripFormBtn = document.getElementById('btn-toggle-trip-form');
const cancelTripBtn = document.getElementById('btn-cancel-trip');
const themeToggleBtn = document.getElementById('btn-toggle-theme');
const themeModeLabel = document.getElementById('theme-mode-label');

let currentTheme = 'dark';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('themeMode');
    currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(currentTheme);

    const savedFilter = localStorage.getItem('currentTripFilter');
    if (savedFilter) {
        currentTripFilter = savedFilter;
    }

    startClock();
    fetchData();
    setupEventListeners();
});

// Real-Time Clock
function startClock() {
    const updateTime = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: true });
        dateEl.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    currentTheme = theme;
    themeModeLabel.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
    themeToggleBtn.setAttribute('aria-pressed', theme === 'light');
    localStorage.setItem('themeMode', theme);
}

// Fetch All Data
async function fetchData() {
    try {
        const [tollRes, fuelRes, accommodationRes, foodRes, tripRes] = await Promise.all([
            fetch(TOLL_API),
            fetch(FUEL_API),
            fetch(ACCOMMODATION_API),
            fetch(FOOD_API),
            fetch(TRIP_API)
        ]);

        if (tollRes.ok) tollEntries = await tollRes.json();
        if (fuelRes.ok) fuelEntries = await fuelRes.json();
        if (accommodationRes.ok) accommodationEntries = await accommodationRes.json();
        if (foodRes.ok) foodEntries = await foodRes.json();
        if (tripRes.ok) trips = await tripRes.json();

        updateTripDropdowns();
        updateUI();
    } catch (err) {
        console.error('Error fetching data:', err);
        showToast('Could not load entries from server.', true);
    }
}

// Update all Trip drop-down selectors
function updateTripDropdowns() {
    // Reset options
    tripFilterSelect.innerHTML = `
        <option value="all">All Expenses</option>
        <option value="none">General (No Trip)</option>
    `;
    tollTripSelect.innerHTML = `<option value="none">General / No Trip</option>`;
    fuelTripSelect.innerHTML = `<option value="none">General / No Trip</option>`;
    accommodationTripSelect.innerHTML = `<option value="none">General / No Trip</option>`;
    foodTripSelect.innerHTML = `<option value="none">General / No Trip</option>`;

    // Sort trips by date descending
    trips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    trips.forEach(trip => {
        const optFilter = document.createElement('option');
        optFilter.value = trip.id;
        optFilter.textContent = trip.name;
        tripFilterSelect.appendChild(optFilter);

        const optToll = document.createElement('option');
        optToll.value = trip.id;
        optToll.textContent = trip.name;
        tollTripSelect.appendChild(optToll);

        const optFuel = document.createElement('option');
        optFuel.value = trip.id;
        optFuel.textContent = trip.name;
        fuelTripSelect.appendChild(optFuel);

        const optAccommodation = document.createElement('option');
        optAccommodation.value = trip.id;
        optAccommodation.textContent = trip.name;
        accommodationTripSelect.appendChild(optAccommodation);

        const optFood = document.createElement('option');
        optFood.value = trip.id;
        optFood.textContent = trip.name;
        foodTripSelect.appendChild(optFood);
    });

    // Validate and restore active filter choice
    const exists = trips.some(t => t.id.toString() === currentTripFilter);
    if (currentTripFilter !== 'all' && currentTripFilter !== 'none' && !exists) {
        currentTripFilter = 'all';
        localStorage.setItem('currentTripFilter', 'all');
    }
    tripFilterSelect.value = currentTripFilter;
    
    // Set link options to match filter defaults
    if (currentTripFilter !== 'all' && currentTripFilter !== 'none') {
        tollTripSelect.value = currentTripFilter;
        fuelTripSelect.value = currentTripFilter;
        accommodationTripSelect.value = currentTripFilter;
        foodTripSelect.value = currentTripFilter;
    } else {
        tollTripSelect.value = 'none';
        fuelTripSelect.value = 'none';
        accommodationTripSelect.value = 'none';
        foodTripSelect.value = 'none';
    }
}

// Update UI (Stats & Logs List based on trip filter)
function updateUI() {
    let filteredTolls = [...tollEntries];
    let filteredFuels = [...fuelEntries];
    let filteredAccommodation = [...accommodationEntries];
    let filteredFood = [...foodEntries];

    if (currentTripFilter === 'none') {
        filteredTolls = tollEntries.filter(item => !item.trip);
        filteredFuels = fuelEntries.filter(item => !item.trip);
        filteredAccommodation = accommodationEntries.filter(item => !item.trip);
        filteredFood = foodEntries.filter(item => !item.trip);
    } else if (currentTripFilter !== 'all') {
        const tripId = parseInt(currentTripFilter);
        filteredTolls = tollEntries.filter(item => item.trip && item.trip.id === tripId);
        filteredFuels = fuelEntries.filter(item => item.trip && item.trip.id === tripId);
        filteredAccommodation = accommodationEntries.filter(item => item.trip && item.trip.id === tripId);
        filteredFood = foodEntries.filter(item => item.trip && item.trip.id === tripId);
    }

    filteredTolls.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    filteredFuels.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    filteredAccommodation.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    filteredFood.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));

    const totalToll = filteredTolls.reduce((sum, item) => sum + item.amount, 0);
    const totalFuel = filteredFuels.reduce((sum, item) => sum + item.amount, 0);
    const totalAccommodation = filteredAccommodation.reduce((sum, item) => sum + item.amount, 0);
    const totalFood = filteredFood.reduce((sum, item) => sum + item.amount, 0);
    const totalLiters = filteredFuels.reduce((sum, item) => sum + item.liters, 0);
    const combinedTotal = totalToll + totalFuel + totalAccommodation + totalFood;

    totalCombinedEl.textContent = formatCurrency(combinedTotal);
    totalTollEl.textContent = formatCurrency(totalToll);
    totalFuelEl.textContent = formatCurrency(totalFuel);
    totalAccommodationEl.textContent = formatCurrency(totalAccommodation);
    totalFoodEl.textContent = formatCurrency(totalFood);
    totalLitersEl.textContent = `${totalLiters.toFixed(2)} L`;

    tollCountEl.textContent = `${filteredTolls.length} payment${filteredTolls.length === 1 ? '' : 's'}`;
    fuelCountEl.textContent = `${filteredFuels.length} log${filteredFuels.length === 1 ? '' : 's'}`;
    accommodationCountEl.textContent = `${filteredAccommodation.length} log${filteredAccommodation.length === 1 ? '' : 's'}`;
    foodCountEl.textContent = `${filteredFood.length} log${filteredFood.length === 1 ? '' : 's'}`;
    badgeTollCountEl.textContent = `${filteredTolls.length} entries`;
    badgeFuelCountEl.textContent = `${filteredFuels.length} entries`;
    badgeAccommodationCountEl.textContent = `${filteredAccommodation.length} entries`;
    badgeFoodCountEl.textContent = `${filteredFood.length} entries`;

    if (combinedTotal > 0) {
        const tollPct = ((totalToll / combinedTotal) * 100).toFixed(0);
        const fuelPct = ((totalFuel / combinedTotal) * 100).toFixed(0);
        const accommodationPct = ((totalAccommodation / combinedTotal) * 100).toFixed(0);
        const foodPct = ((totalFood / combinedTotal) * 100).toFixed(0);
        combinedMetaEl.textContent = `Toll (${tollPct}%) • Fuel (${fuelPct}%) • Stay (${accommodationPct}%) • Food (${foodPct}%)`;
    } else {
        combinedMetaEl.textContent = 'No expenses logged';
    }

    renderTollLogs(filteredTolls);
    renderFuelLogs(filteredFuels);
    renderAccommodationLogs(filteredAccommodation);
    renderFoodLogs(filteredFood);
}

// Render Toll Logs
function renderTollLogs(entries) {
    if (entries.length === 0) {
        tollLogsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>No toll payments logged yet.</p>
            </div>`;
        return;
    }

    tollLogsList.innerHTML = entries.map(entry => `
        <div class="log-item toll-item" data-id="${entry.id}">
            <div class="log-details">
                <div class="log-title-row">
                    <span class="log-location">${escapeHTML(entry.location)}</span>
                    <span class="badge-toll-type ${entry.tollType === 'State' ? 'badge-state' : 'badge-national'}">${entry.tollType}</span>
                    ${entry.trip ? `<span class="badge-trip-link">${escapeHTML(entry.trip.name)}</span>` : ''}
                </div>
                ${entry.note ? `<div class="log-note">${escapeHTML(entry.note)}</div>` : ''}
                <span class="log-time">${formatDateTime(entry.entryTime)}</span>
            </div>
            <div class="log-action-side">
                <span class="log-amount">₹${entry.amount.toFixed(2)}</span>
                <button class="btn-delete" aria-label="Delete entry" onclick="deleteToll(${entry.id})">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Render Fuel Logs
function renderFuelLogs(entries) {
    if (entries.length === 0) {
        fuelLogsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>No fuel purchases logged yet.</p>
            </div>`;
        return;
    }

    fuelLogsList.innerHTML = entries.map(entry => `
        <div class="log-item fuel-item" data-id="${entry.id}">
            <div class="log-details">
                <div class="log-title-row">
                    <span class="log-location">${escapeHTML(entry.location)}</span>
                    <span class="log-fuel-liters">${entry.liters.toFixed(2)} L</span>
                    ${entry.trip ? `<span class="badge-trip-link">${escapeHTML(entry.trip.name)}</span>` : ''}
                </div>
                ${entry.note ? `<div class="log-note">${escapeHTML(entry.note)}</div>` : ''}
                <span class="log-time">${formatDateTime(entry.entryTime)}</span>
            </div>
            <div class="log-action-side">
                <span class="log-amount">₹${entry.amount.toFixed(2)}</span>
                <button class="btn-delete" aria-label="Delete entry" onclick="deleteFuel(${entry.id})">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function renderAccommodationLogs(entries) {
    if (entries.length === 0) {
        accommodationLogsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>No accommodation entries logged yet.</p>
            </div>`;
        return;
    }

    accommodationLogsList.innerHTML = entries.map(entry => `
        <div class="log-item accommodation-item" data-id="${entry.id}">
            <div class="log-details">
                <div class="log-title-row">
                    <span class="log-location">${escapeHTML(entry.name || 'Accommodation')}</span>
                    ${entry.trip ? `<span class="badge-trip-link">${escapeHTML(entry.trip.name)}</span>` : ''}
                </div>
                <span class="log-time">${formatDateTime(entry.entryTime)}</span>
            </div>
            <div class="log-action-side">
                <span class="log-amount">₹${entry.amount.toFixed(2)}</span>
                <button class="btn-delete" aria-label="Delete entry" onclick="deleteAccommodation(${entry.id})">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function renderFoodLogs(entries) {
    if (entries.length === 0) {
        foodLogsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>No food expenses logged yet.</p>
            </div>`;
        return;
    }

    foodLogsList.innerHTML = entries.map(entry => `
        <div class="log-item food-item" data-id="${entry.id}">
            <div class="log-details">
                <div class="log-title-row">
                    <span class="log-location">${escapeHTML(entry.name || 'Food')}</span>
                    ${entry.trip ? `<span class="badge-trip-link">${escapeHTML(entry.trip.name)}</span>` : ''}
                </div>
                <span class="log-time">${formatDateTime(entry.entryTime)}</span>
            </div>
            <div class="log-action-side">
                <span class="log-amount">₹${entry.amount.toFixed(2)}</span>
                <button class="btn-delete" aria-label="Delete entry" onclick="deleteFood(${entry.id})">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Event Listeners for Forms and Toolbar
function setupEventListeners() {
    // Trip Filter Dropdown Change
    tripFilterSelect.addEventListener('change', (e) => {
        currentTripFilter = e.target.value;
        localStorage.setItem('currentTripFilter', currentTripFilter);
        
        if (currentTripFilter !== 'all' && currentTripFilter !== 'none') {
            tollTripSelect.value = currentTripFilter;
            fuelTripSelect.value = currentTripFilter;
            accommodationTripSelect.value = currentTripFilter;
            foodTripSelect.value = currentTripFilter;
        } else {
            tollTripSelect.value = 'none';
            fuelTripSelect.value = 'none';
            accommodationTripSelect.value = 'none';
            foodTripSelect.value = 'none';
        }
        updateUI();
    });

    // Toggle Trip Form Panel
    toggleTripFormBtn.addEventListener('click', () => {
        tripPanel.classList.toggle('hidden');
        if (!tripPanel.classList.contains('hidden')) {
            document.getElementById('trip-name').focus();
        }
    });

    cancelTripBtn.addEventListener('click', () => {
        tripPanel.classList.add('hidden');
        tripForm.reset();
    });

    // Save New Trip Submit
    tripForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tripNameInput = document.getElementById('trip-name');
        const tripDescInput = document.getElementById('trip-desc');

        const payload = {
            name: tripNameInput.value.trim(),
            description: tripDescInput.value.trim() || null
        };

        try {
            const res = await fetch(TRIP_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const savedTrip = await res.json();
                trips.push(savedTrip);
                updateTripDropdowns();
                
                // Set active filter & form default to the new trip
                currentTripFilter = savedTrip.id.toString();
                tripFilterSelect.value = currentTripFilter;
                localStorage.setItem('currentTripFilter', currentTripFilter);
                
                tollTripSelect.value = currentTripFilter;
                fuelTripSelect.value = currentTripFilter;
                accommodationTripSelect.value = currentTripFilter;
                foodTripSelect.value = currentTripFilter;

                tripForm.reset();
                tripPanel.classList.add('hidden');
                updateUI();
                showToast('New trip created!');
            } else {
                throw new Error('Save trip failed');
            }
        } catch (err) {
            console.error('Error saving trip:', err);
            showToast('Failed to save trip.', true);
        }
    });

    // Toll Form Submit
    tollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amountInput = document.getElementById('toll-amount');
        const locationInput = document.getElementById('toll-location');
        const tollTypeInput = document.querySelector('input[name="toll-type"]:checked');
        const noteInput = document.getElementById('toll-note');
        const tripVal = tollTripSelect.value;

        const payload = {
            amount: parseFloat(amountInput.value),
            location: locationInput.value.trim(),
            tollType: tollTypeInput ? tollTypeInput.value : 'National',
            note: noteInput.value.trim() || null,
            trip: tripVal === 'none' ? null : { id: parseInt(tripVal) }
        };

        try {
            const res = await fetch(TOLL_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                tollEntries.unshift(saved);
                updateUI();
                tollForm.reset();
                // Restore trip selection to current filter
                restoreFormTripSelects();
                showToast('Toll expense recorded!');
            } else {
                const errText = await res.text();
                console.error('Server error saving toll:', errText);
                showToast('Failed to save toll entry. Check console.', true);
            }
        } catch (err) {
            console.error('Error saving toll entry:', err);
            showToast('Failed to save toll entry.', true);
        }
    });

    // Fuel Form Submit
    fuelForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amountInput = document.getElementById('fuel-amount');
        const locationInput = document.getElementById('fuel-location');
        const litersInput = document.getElementById('fuel-liters');
        const noteInput = document.getElementById('fuel-note');
        const tripVal = fuelTripSelect.value;

        const payload = {
            amount: parseFloat(amountInput.value),
            location: locationInput.value.trim(),
            liters: parseFloat(litersInput.value),
            note: noteInput.value.trim() || null,
            trip: tripVal === 'none' ? null : { id: parseInt(tripVal) }
        };

        try {
            const res = await fetch(FUEL_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                fuelEntries.unshift(saved);
                updateUI();
                fuelForm.reset();
                restoreFormTripSelects();
                showToast('Fuel purchase recorded!');
            } else {
                const errText = await res.text();
                console.error('Server error saving fuel:', errText);
                showToast('Failed to save fuel entry. Check console.', true);
            }
        } catch (err) {
            console.error('Error saving fuel entry:', err);
            showToast('Failed to save fuel entry.', true);
        }
    });

    // Accommodation Form Submit
    accommodationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amountInput = document.getElementById('accommodation-amount');
        const nameInput = document.getElementById('accommodation-name');
        const tripVal = accommodationTripSelect.value;

        const payload = {
            amount: parseFloat(amountInput.value),
            name: nameInput.value.trim() || null,
            trip: tripVal === 'none' ? null : { id: parseInt(tripVal) }
        };

        try {
            const res = await fetch(ACCOMMODATION_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                accommodationEntries.unshift(saved);
                updateUI();
                accommodationForm.reset();
                restoreFormTripSelects();
                showToast('Accommodation recorded!');
            } else {
                const errText = await res.text();
                console.error('Server error saving accommodation:', errText);
                showToast('Failed to save accommodation. Check console.', true);
            }
        } catch (err) {
            console.error('Error saving accommodation entry:', err);
            showToast('Failed to save accommodation entry.', true);
        }
    });

    // Food Form Submit
    foodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amountInput = document.getElementById('food-amount');
        const nameInput = document.getElementById('food-name');
        const tripVal = foodTripSelect.value;

        const payload = {
            amount: parseFloat(amountInput.value),
            name: nameInput.value.trim() || null,
            trip: tripVal === 'none' ? null : { id: parseInt(tripVal) }
        };

        try {
            const res = await fetch(FOOD_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saved = await res.json();
                foodEntries.unshift(saved);
                updateUI();
                foodForm.reset();
                restoreFormTripSelects();
                showToast('Food expense recorded!');
            } else {
                const errText = await res.text();
                console.error('Server error saving food:', errText);
                showToast('Failed to save food entry. Check console.', true);
            }
        } catch (err) {
            console.error('Error saving food entry:', err);
            showToast('Failed to save food entry.', true);
        }
    });

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            applyTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }
}

// Restore all trip selects in forms to match the current active filter
function restoreFormTripSelects() {
    if (currentTripFilter !== 'all' && currentTripFilter !== 'none') {
        tollTripSelect.value = currentTripFilter;
        fuelTripSelect.value = currentTripFilter;
        accommodationTripSelect.value = currentTripFilter;
        foodTripSelect.value = currentTripFilter;
    } else {
        tollTripSelect.value = 'none';
        fuelTripSelect.value = 'none';
        accommodationTripSelect.value = 'none';
        foodTripSelect.value = 'none';
    }
}

// Delete Toll Entry Action
async function deleteToll(id) {
    if (!confirm('Are you sure you want to delete this toll entry?')) return;

    try {
        const res = await fetch(`${TOLL_API}/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            tollEntries = tollEntries.filter(item => item.id !== id);
            updateUI();
            showToast('Toll entry deleted.', false);
        } else {
            throw new Error('Delete failed');
        }
    } catch (err) {
        console.error('Error deleting toll:', err);
        showToast('Failed to delete entry.', true);
    }
}

// Delete Fuel Entry Action
async function deleteFuel(id) {
    if (!confirm('Are you sure you want to delete this fuel entry?')) return;

    try {
        const res = await fetch(`${FUEL_API}/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            fuelEntries = fuelEntries.filter(item => item.id !== id);
            updateUI();
            showToast('Fuel entry deleted.', false);
        } else {
            throw new Error('Delete failed');
        }
    } catch (err) {
        console.error('Error deleting fuel:', err);
        showToast('Failed to delete entry.', true);
    }
}

async function deleteAccommodation(id) {
    if (!confirm('Are you sure you want to delete this accommodation entry?')) return;

    try {
        const res = await fetch(`${ACCOMMODATION_API}/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            accommodationEntries = accommodationEntries.filter(item => item.id !== id);
            updateUI();
            showToast('Accommodation entry deleted.', false);
        } else {
            throw new Error('Delete failed');
        }
    } catch (err) {
        console.error('Error deleting accommodation:', err);
        showToast('Failed to delete entry.', true);
    }
}

async function deleteFood(id) {
    if (!confirm('Are you sure you want to delete this food entry?')) return;

    try {
        const res = await fetch(`${FOOD_API}/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            foodEntries = foodEntries.filter(item => item.id !== id);
            updateUI();
            showToast('Food entry deleted.', false);
        } else {
            throw new Error('Delete failed');
        }
    } catch (err) {
        console.error('Error deleting food:', err);
        showToast('Failed to delete entry.', true);
    }
}

// Helpers
function formatCurrency(val) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(val);
}

function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} • ${timePart}`;
}

function showToast(message, isError = false) {
    toastEl.textContent = message;
    toastEl.className = 'toast-notification show';
    
    if (isError) {
        toastEl.classList.add('error');
    }

    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
