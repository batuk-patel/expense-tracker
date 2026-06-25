// API Configuration
const API_BASE = '/api';
const TOLL_API = `${API_BASE}/toll-entries`;
const FUEL_API = `${API_BASE}/fuel-entries`;
const ACCOMMODATION_API = `${API_BASE}/accommodation-entries`;
const FOOD_API = `${API_BASE}/food-entries`;
const TRIP_API = `${API_BASE}/trips`;
const CUSTOM_EXPENSE_API = `${API_BASE}/custom-expense-entries`;

// State
let tollEntries = [];
let fuelEntries = [];
let accommodationEntries = [];
let foodEntries = [];
let customExpenseEntries = [];
let trips = [];
let tripCustomFields = [];
let currentTripFilter = 'all';
let currentActivityFilter = 'all';

const APP_TIMEZONE = 'Asia/Kolkata';

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
const activityFilterSelect = document.getElementById('activity-filter-select');
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

const btnToggleRenameTrip = document.getElementById('btn-toggle-rename-trip');
const renameTripPanel = document.getElementById('panel-rename-trip');
const renameTripForm = document.getElementById('rename-trip-form');
const cancelRenameTripBtn = document.getElementById('btn-cancel-rename-trip');
const customFieldsPanel = document.getElementById('panel-custom-fields');
const customFieldsTripNameEl = document.getElementById('custom-fields-trip-name');
const customFieldForm = document.getElementById('custom-field-form');
const customFieldsList = document.getElementById('custom-fields-list');
const cardCustomExpenseForm = document.getElementById('card-custom-expense-form');
const cardCustomExpenseLogs = document.getElementById('card-custom-expense-logs');
const customExpenseForm = document.getElementById('custom-expense-form');
const customExpenseFieldSelect = document.getElementById('custom-expense-field');
const customExpenseAmountGroup = document.getElementById('custom-expense-amount-group');
const customExpenseTextGroup = document.getElementById('custom-expense-text-group');
const customExpenseNumberGroup = document.getElementById('custom-expense-number-group');
const customLogsList = document.getElementById('custom-logs-list');
const badgeCustomCountEl = document.getElementById('badge-custom-count');

let currentTheme = 'dark';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('themeMode');
    currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(currentTheme);

    const savedFilter = localStorage.getItem('currentTripFilter');
    if (savedFilter) currentTripFilter = savedFilter;

    const savedActivity = localStorage.getItem('currentActivityFilter');
    if (savedActivity) currentActivityFilter = savedActivity;

    startClock();
    fetchData();
    setupEventListeners();
});

// Real-Time Clock
function startClock() {
    const updateTime = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-IN', { hour12: true, timeZone: APP_TIMEZONE });
        dateEl.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            timeZone: APP_TIMEZONE
        });
    };
    updateTime();
    setInterval(updateTime, 1000);
}

function currentEntryTime() {
    return new Date().toISOString();
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
        const [tollRes, fuelRes, accommodationRes, foodRes, tripRes, customRes] = await Promise.all([
            fetch(TOLL_API),
            fetch(FUEL_API),
            fetch(ACCOMMODATION_API),
            fetch(FOOD_API),
            fetch(TRIP_API),
            fetch(CUSTOM_EXPENSE_API)
        ]);

        if (tollRes.ok) tollEntries = await tollRes.json();
        if (fuelRes.ok) fuelEntries = await fuelRes.json();
        if (accommodationRes.ok) accommodationEntries = await accommodationRes.json();
        if (foodRes.ok) foodEntries = await foodRes.json();
        if (tripRes.ok) trips = await tripRes.json();
        if (customRes.ok) customExpenseEntries = await customRes.json();

        updateTripDropdowns();
        await updateTripSpecificPanels();
        updateUI();
    } catch (err) {
        console.error('Error fetching data:', err);
        showToast('Could not load entries from server.', true);
    }
}

function getSelectedTripId() {
    if (currentTripFilter === 'all' || currentTripFilter === 'none') return null;
    return parseInt(currentTripFilter, 10);
}

function propagateTripName(tripId, newName, newDescription) {
    const updateTripRef = (entry) => {
        if (entry.trip && entry.trip.id === tripId) {
            entry.trip.name = newName;
            if (newDescription !== undefined) {
                entry.trip.description = newDescription;
            }
        }
    };
    tollEntries.forEach(updateTripRef);
    fuelEntries.forEach(updateTripRef);
    accommodationEntries.forEach(updateTripRef);
    foodEntries.forEach(updateTripRef);
    customExpenseEntries.forEach(updateTripRef);
}

async function fetchCustomFieldsForTrip(tripId) {
    if (!tripId) {
        tripCustomFields = [];
        return;
    }
    try {
        const res = await fetch(`${TRIP_API}/${tripId}/custom-fields`);
        if (res.ok) {
            tripCustomFields = await res.json();
        } else {
            tripCustomFields = [];
        }
    } catch (err) {
        console.error('Error fetching custom fields:', err);
        tripCustomFields = [];
    }
}

async function updateTripSpecificPanels() {
    const tripId = getSelectedTripId();
    const hasTrip = tripId !== null;

    btnToggleRenameTrip.classList.toggle('hidden', !hasTrip);
    customFieldsPanel.classList.toggle('hidden', !hasTrip);
    cardCustomExpenseForm.classList.toggle('hidden', !hasTrip);
    cardCustomExpenseLogs.classList.toggle('hidden', !hasTrip);

    if (!hasTrip) {
        renameTripPanel.classList.add('hidden');
        tripCustomFields = [];
        renderCustomFieldsList();
        updateCustomExpenseFieldSelect();
        return;
    }

    const trip = trips.find(t => t.id === tripId);
    if (trip) {
        customFieldsTripNameEl.textContent = trip.name;
    }

    await fetchCustomFieldsForTrip(tripId);
    renderCustomFieldsList();
    updateCustomExpenseFieldSelect();
}

function renderCustomFieldsList() {
    if (tripCustomFields.length === 0) {
        customFieldsList.innerHTML = '<p class="panel-hint">No custom fields yet. Add one above.</p>';
        return;
    }

    customFieldsList.innerHTML = tripCustomFields.map(field => `
        <div class="custom-field-item" data-id="${field.id}">
            <div>
                <strong>${escapeHTML(field.name)}</strong>
                <span class="badge badge-orange">${field.fieldType}</span>
            </div>
            <button type="button" class="btn-delete" aria-label="Delete field" onclick="deleteCustomField(${field.id})">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
        </div>
    `).join('');
}

function updateCustomExpenseFieldSelect() {
    customExpenseFieldSelect.innerHTML = '<option value="">Select a field...</option>';
    tripCustomFields.forEach(field => {
        const opt = document.createElement('option');
        opt.value = field.id;
        opt.textContent = `${field.name} (${field.fieldType})`;
        opt.dataset.fieldType = field.fieldType;
        customExpenseFieldSelect.appendChild(opt);
    });
    updateCustomExpenseInputVisibility();
}

function updateCustomExpenseInputVisibility() {
    const selected = customExpenseFieldSelect.selectedOptions[0];
    const fieldType = selected ? selected.dataset.fieldType : null;

    customExpenseAmountGroup.classList.toggle('hidden', fieldType !== 'AMOUNT');
    customExpenseTextGroup.classList.toggle('hidden', fieldType !== 'TEXT');
    customExpenseNumberGroup.classList.toggle('hidden', fieldType !== 'NUMBER');

    document.getElementById('custom-expense-amount').required = fieldType === 'AMOUNT';
    document.getElementById('custom-expense-text').required = fieldType === 'TEXT';
    document.getElementById('custom-expense-number').required = fieldType === 'NUMBER';
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

    const editTripSelect = document.getElementById('edit-trip');
    if (editTripSelect) editTripSelect.innerHTML = `<option value="none">General / No Trip</option>`;

    // Sort trips by date descending
    trips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    trips.forEach(trip => {
        const makeOpt = () => {
            const o = document.createElement('option');
            o.value = trip.id;
            o.textContent = trip.name;
            return o;
        };
        tripFilterSelect.appendChild(makeOpt());
        tollTripSelect.appendChild(makeOpt());
        fuelTripSelect.appendChild(makeOpt());
        accommodationTripSelect.appendChild(makeOpt());
        foodTripSelect.appendChild(makeOpt());
        if (editTripSelect) editTripSelect.appendChild(makeOpt());
    });

    // Validate and restore active filter choice
    const exists = trips.some(t => t.id.toString() === currentTripFilter);
    if (currentTripFilter !== 'all' && currentTripFilter !== 'none' && !exists) {
        currentTripFilter = 'all';
        localStorage.setItem('currentTripFilter', 'all');
    }
    tripFilterSelect.value = currentTripFilter;
    if (activityFilterSelect) activityFilterSelect.value = currentActivityFilter;

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

// Update UI (Stats & Logs List based on trip + activity filter)
function updateUI() {
    let filteredTolls = [...tollEntries];
    let filteredFuels = [...fuelEntries];
    let filteredAccommodation = [...accommodationEntries];
    let filteredFood = [...foodEntries];
    let filteredCustom = [...customExpenseEntries];

    if (currentTripFilter === 'none') {
        filteredTolls = tollEntries.filter(item => !item.trip);
        filteredFuels = fuelEntries.filter(item => !item.trip);
        filteredAccommodation = accommodationEntries.filter(item => !item.trip);
        filteredFood = foodEntries.filter(item => !item.trip);
        filteredCustom = [];
    } else if (currentTripFilter !== 'all') {
        const tripId = parseInt(currentTripFilter);
        filteredTolls = tollEntries.filter(item => item.trip && item.trip.id === tripId);
        filteredFuels = fuelEntries.filter(item => item.trip && item.trip.id === tripId);
        filteredAccommodation = accommodationEntries.filter(item => item.trip && item.trip.id === tripId);
        filteredFood = foodEntries.filter(item => item.trip && item.trip.id === tripId);
        filteredCustom = customExpenseEntries.filter(item => item.trip && item.trip.id === tripId);
    }

    // Activity filter: show/hide sections
    const act = currentActivityFilter;
    const showToll  = act === 'all' || act === 'toll';
    const showFuel  = act === 'all' || act === 'fuel';
    const showStay  = act === 'all' || act === 'accommodation';
    const showFood  = act === 'all' || act === 'food';

    const cardTollForm = document.getElementById('card-toll-form');
    const cardFuelForm = document.getElementById('card-fuel-form');
    const cardAccForm  = document.getElementById('card-accommodation-form');
    const cardFoodForm = document.getElementById('card-food-form');
    const cardTollLogs = document.getElementById('card-toll-logs');
    const cardFuelLogs = document.getElementById('card-fuel-logs');
    const cardAccLogs  = document.getElementById('card-accommodation-logs');
    const cardFoodLogs = document.getElementById('card-food-logs');

    cardTollForm?.classList.toggle('hidden', !showToll);
    cardFuelForm?.classList.toggle('hidden', !showFuel);
    cardAccForm?.classList.toggle('hidden', !showStay);
    cardFoodForm?.classList.toggle('hidden', !showFood);
    cardTollLogs?.classList.toggle('hidden', !showToll);
    cardFuelLogs?.classList.toggle('hidden', !showFuel);
    cardAccLogs?.classList.toggle('hidden', !showStay);
    cardFoodLogs?.classList.toggle('hidden', !showFood);

    filteredTolls.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    filteredFuels.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    filteredAccommodation.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    filteredFood.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));
    filteredCustom.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));

    const totalToll = filteredTolls.reduce((sum, item) => sum + item.amount, 0);
    const totalFuel = filteredFuels.reduce((sum, item) => sum + item.amount, 0);
    const totalAccommodation = filteredAccommodation.reduce((sum, item) => sum + item.amount, 0);
    const totalFood = filteredFood.reduce((sum, item) => sum + item.amount, 0);
    const totalCustom = filteredCustom
        .filter(item => item.customField && item.customField.fieldType === 'AMOUNT' && item.amount != null)
        .reduce((sum, item) => sum + item.amount, 0);
    const totalLiters = filteredFuels.reduce((sum, item) => sum + item.liters, 0);
    const combinedTotal = totalToll + totalFuel + totalAccommodation + totalFood + totalCustom;

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
        const customPct = totalCustom > 0 ? ((totalCustom / combinedTotal) * 100).toFixed(0) : null;
        let meta = `Toll (${tollPct}%) • Fuel (${fuelPct}%) • Stay (${accommodationPct}%) • Food (${foodPct}%)`;
        if (customPct) meta += ` • Custom (${customPct}%)`;
        combinedMetaEl.textContent = meta;
    } else {
        combinedMetaEl.textContent = 'No expenses logged';
    }

    renderTollLogs(filteredTolls);
    renderFuelLogs(filteredFuels);
    renderAccommodationLogs(filteredAccommodation);
    renderFoodLogs(filteredFood);
    renderCustomLogs(filteredCustom);
    badgeCustomCountEl.textContent = `${filteredCustom.length} entries`;
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
                <button class="btn-edit" aria-label="Edit entry" onclick="openEditModal('toll', ${entry.id})">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
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
                <button class="btn-edit" aria-label="Edit entry" onclick="openEditModal('fuel', ${entry.id})">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
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
                ${entry.note ? `<div class="log-note">${escapeHTML(entry.note)}</div>` : ''}
                <span class="log-time">${formatDateTime(entry.entryTime)}</span>
            </div>
            <div class="log-action-side">
                <span class="log-amount">₹${entry.amount.toFixed(2)}</span>
                <button class="btn-edit" aria-label="Edit entry" onclick="openEditModal('accommodation', ${entry.id})">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
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
                ${entry.note ? `<div class="log-note">${escapeHTML(entry.note)}</div>` : ''}
                <span class="log-time">${formatDateTime(entry.entryTime)}</span>
            </div>
            <div class="log-action-side">
                <span class="log-amount">₹${entry.amount.toFixed(2)}</span>
                <button class="btn-edit" aria-label="Edit entry" onclick="openEditModal('food', ${entry.id})">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                </button>
                <button class="btn-delete" aria-label="Delete entry" onclick="deleteFood(${entry.id})">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function formatCustomValue(entry) {
    if (!entry.customField) return '';
    if (entry.customField.fieldType === 'AMOUNT' && entry.amount != null) {
        return `₹${entry.amount.toFixed(2)}`;
    }
    if (entry.customField.fieldType === 'NUMBER' && entry.numberValue != null) {
        return entry.numberValue.toString();
    }
    if (entry.customField.fieldType === 'TEXT' && entry.textValue) {
        return entry.textValue;
    }
    return '—';
}

function renderCustomLogs(entries) {
    if (entries.length === 0) {
        customLogsList.innerHTML = `
            <div class="empty-state">
                <p>No custom entries logged yet.</p>
            </div>`;
        return;
    }

    customLogsList.innerHTML = entries.map(entry => `
        <div class="log-item custom-item" data-id="${entry.id}">
            <div class="log-details">
                <div class="log-title-row">
                    <span class="log-location">${escapeHTML(entry.customField ? entry.customField.name : 'Custom')}</span>
                    ${entry.trip ? `<span class="badge-trip-link">${escapeHTML(entry.trip.name)}</span>` : ''}
                </div>
                <div class="log-note">${escapeHTML(formatCustomValue(entry))}</div>
                ${entry.note ? `<div class="log-note">${escapeHTML(entry.note)}</div>` : ''}
                <span class="log-time">${formatDateTime(entry.entryTime)}</span>
            </div>
            <div class="log-action-side">
                ${entry.amount != null ? `<span class="log-amount">₹${entry.amount.toFixed(2)}</span>` : ''}
                <button class="btn-delete" aria-label="Delete entry" onclick="deleteCustomExpense(${entry.id})">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Event Listeners for Forms and Toolbar
function setupEventListeners() {
    // Trip Filter Dropdown Change
    tripFilterSelect.addEventListener('change', async (e) => {
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
        await updateTripSpecificPanels();
        updateUI();
    });

    // Activity Filter Dropdown Change
    if (activityFilterSelect) {
        activityFilterSelect.addEventListener('change', (e) => {
            currentActivityFilter = e.target.value;
            localStorage.setItem('currentActivityFilter', currentActivityFilter);
            updateUI();
        });
    }

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

    btnToggleRenameTrip.addEventListener('click', () => {
        const tripId = getSelectedTripId();
        if (!tripId) return;
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return;
        document.getElementById('rename-trip-name').value = trip.name;
        document.getElementById('rename-trip-desc').value = trip.description || '';
        renameTripPanel.classList.remove('hidden');
        tripPanel.classList.add('hidden');
    });

    cancelRenameTripBtn.addEventListener('click', () => {
        renameTripPanel.classList.add('hidden');
        renameTripForm.reset();
    });

    renameTripForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tripId = getSelectedTripId();
        if (!tripId) return;

        const payload = {
            name: document.getElementById('rename-trip-name').value.trim(),
            description: document.getElementById('rename-trip-desc').value.trim() || null
        };

        try {
            const res = await fetch(`${TRIP_API}/${tripId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updated = await res.json();
                const idx = trips.findIndex(t => t.id === tripId);
                if (idx !== -1) trips[idx] = updated;
                propagateTripName(tripId, updated.name, updated.description);
                updateTripDropdowns();
                await updateTripSpecificPanels();
                renameTripPanel.classList.add('hidden');
                renameTripForm.reset();
                updateUI();
                showToast('Trip updated!');
            } else {
                throw new Error('Rename failed');
            }
        } catch (err) {
            console.error('Error renaming trip:', err);
            showToast('Failed to rename trip.', true);
        }
    });

    customFieldForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tripId = getSelectedTripId();
        if (!tripId) return;

        const payload = {
            name: document.getElementById('custom-field-name').value.trim(),
            fieldType: document.getElementById('custom-field-type').value
        };

        try {
            const res = await fetch(`${TRIP_API}/${tripId}/custom-fields`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                customFieldForm.reset();
                await fetchCustomFieldsForTrip(tripId);
                renderCustomFieldsList();
                updateCustomExpenseFieldSelect();
                showToast('Custom field added!');
            } else {
                throw new Error('Add field failed');
            }
        } catch (err) {
            console.error('Error adding custom field:', err);
            showToast('Failed to add custom field.', true);
        }
    });

    customExpenseFieldSelect.addEventListener('change', updateCustomExpenseInputVisibility);

    customExpenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tripId = getSelectedTripId();
        const fieldId = parseInt(customExpenseFieldSelect.value, 10);
        if (!tripId || !fieldId) return;

        const selected = customExpenseFieldSelect.selectedOptions[0];
        const fieldType = selected.dataset.fieldType;

        const payload = {
            tripId,
            customFieldId: fieldId,
            entryTime: currentEntryTime(),
            note: document.getElementById('custom-expense-note').value.trim() || null
        };

        if (fieldType === 'AMOUNT') {
            payload.amount = parseFloat(document.getElementById('custom-expense-amount').value);
        } else if (fieldType === 'TEXT') {
            payload.textValue = document.getElementById('custom-expense-text').value.trim();
        } else if (fieldType === 'NUMBER') {
            payload.numberValue = parseFloat(document.getElementById('custom-expense-number').value);
        }

        try {
            const res = await fetch(CUSTOM_EXPENSE_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const saved = await res.json();
                customExpenseEntries.unshift(saved);
                customExpenseForm.reset();
                updateCustomExpenseFieldSelect();
                updateUI();
                showToast('Custom entry saved!');
            } else {
                const errText = await res.text();
                console.error('Server error saving custom entry:', errText);
                showToast('Failed to save custom entry.', true);
            }
        } catch (err) {
            console.error('Error saving custom entry:', err);
            showToast('Failed to save custom entry.', true);
        }
    });

    // Save New Trip Submit
    tripForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tripNameInput = document.getElementById('trip-name');
        const tripDescInput = document.getElementById('trip-desc');

        const payload = {
            name: tripNameInput.value.trim(),
            description: tripDescInput.value.trim() || null,
            startDate: currentEntryTime()
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
                await updateTripSpecificPanels();
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
            entryTime: currentEntryTime(),
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
            entryTime: currentEntryTime(),
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
            note: document.getElementById('accommodation-note').value.trim() || null,
            entryTime: currentEntryTime(),
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
            note: document.getElementById('food-note').value.trim() || null,
            entryTime: currentEntryTime(),
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

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const editModal     = document.getElementById('edit-modal');
const editModalForm = document.getElementById('edit-modal-form');

function openEditModal(type, id) {
    let entry;
    if (type === 'toll')          entry = tollEntries.find(e => e.id === id);
    else if (type === 'fuel')     entry = fuelEntries.find(e => e.id === id);
    else if (type === 'accommodation') entry = accommodationEntries.find(e => e.id === id);
    else if (type === 'food')     entry = foodEntries.find(e => e.id === id);
    if (!entry) return;

    // Populate hidden fields
    document.getElementById('edit-entry-id').value   = id;
    document.getElementById('edit-entry-type').value = type;

    // Reset all optional groups
    document.getElementById('edit-group-location').classList.add('hidden');
    document.getElementById('edit-group-toll-type').classList.add('hidden');
    document.getElementById('edit-group-liters').classList.add('hidden');
    document.getElementById('edit-group-name').classList.add('hidden');
    document.getElementById('edit-location').required = false;
    document.getElementById('edit-liters').required   = false;

    // Common: amount + note + trip
    document.getElementById('edit-amount').value = entry.amount;
    document.getElementById('edit-note').value   = entry.note || '';

    // Populate trip select then set value
    const editTripSelect = document.getElementById('edit-trip');
    editTripSelect.value = entry.trip ? entry.trip.id : 'none';

    // Set modal title & type-specific fields
    if (type === 'toll') {
        document.getElementById('edit-modal-title').textContent = 'Edit Toll Entry';
        document.getElementById('edit-group-location').classList.remove('hidden');
        document.getElementById('edit-group-toll-type').classList.remove('hidden');
        document.getElementById('edit-location').value   = entry.location;
        document.getElementById('edit-location').required = true;
        const tollTypeVal = entry.tollType || 'National';
        document.querySelector(`input[name="edit-toll-type"][value="${tollTypeVal}"]`).checked = true;
    } else if (type === 'fuel') {
        document.getElementById('edit-modal-title').textContent = 'Edit Fuel Entry';
        document.getElementById('edit-group-location').classList.remove('hidden');
        document.getElementById('edit-group-liters').classList.remove('hidden');
        document.getElementById('edit-location').value   = entry.location;
        document.getElementById('edit-location').required = true;
        document.getElementById('edit-liters').value     = entry.liters;
        document.getElementById('edit-liters').required  = true;
    } else if (type === 'accommodation') {
        document.getElementById('edit-modal-title').textContent = 'Edit Accommodation';
        document.getElementById('edit-group-name').classList.remove('hidden');
        document.getElementById('edit-name-label').textContent = 'Hotel / Place (Optional)';
        document.getElementById('edit-name').value = entry.name || '';
    } else if (type === 'food') {
        document.getElementById('edit-modal-title').textContent = 'Edit Food Entry';
        document.getElementById('edit-group-name').classList.remove('hidden');
        document.getElementById('edit-name-label').textContent = 'Restaurant / Dish (Optional)';
        document.getElementById('edit-name').value = entry.name || '';
    }

    editModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEditModal() {
    editModal.classList.add('hidden');
    document.body.style.overflow = '';
    editModalForm.reset();
}

// Wire modal close buttons
document.getElementById('edit-modal-close')?.addEventListener('click', closeEditModal);
document.getElementById('btn-cancel-edit')?.addEventListener('click', closeEditModal);
editModal?.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });

// Wire edit form submit — we never send entryTime so the backend preserves it
editModalForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = parseInt(document.getElementById('edit-entry-id').value);
    const type = document.getElementById('edit-entry-type').value;

    const editTripSelect = document.getElementById('edit-trip');
    const tripVal = editTripSelect ? editTripSelect.value : 'none';

    const payload = {
        amount: parseFloat(document.getElementById('edit-amount').value),
        note:   document.getElementById('edit-note').value.trim() || null,
        trip:   tripVal === 'none' ? null : { id: parseInt(tripVal) }
    };

    if (type === 'toll') {
        payload.location = document.getElementById('edit-location').value.trim();
        payload.tollType = document.querySelector('input[name="edit-toll-type"]:checked')?.value || 'National';
    } else if (type === 'fuel') {
        payload.location = document.getElementById('edit-location').value.trim();
        payload.liters   = parseFloat(document.getElementById('edit-liters').value);
    } else if (type === 'accommodation' || type === 'food') {
        payload.name = document.getElementById('edit-name').value.trim() || null;
    }

    const apiMap = {
        toll: TOLL_API, fuel: FUEL_API,
        accommodation: ACCOMMODATION_API, food: FOOD_API
    };
    const api = apiMap[type];

    try {
        const res = await fetch(`${api}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const updated = await res.json();
            if (type === 'toll') {
                const idx = tollEntries.findIndex(e => e.id === id);
                if (idx !== -1) tollEntries[idx] = updated;
            } else if (type === 'fuel') {
                const idx = fuelEntries.findIndex(e => e.id === id);
                if (idx !== -1) fuelEntries[idx] = updated;
            } else if (type === 'accommodation') {
                const idx = accommodationEntries.findIndex(e => e.id === id);
                if (idx !== -1) accommodationEntries[idx] = updated;
            } else if (type === 'food') {
                const idx = foodEntries.findIndex(e => e.id === id);
                if (idx !== -1) foodEntries[idx] = updated;
            }
            closeEditModal();
            updateUI();
            showToast('Entry updated!');
        } else {
            const errText = await res.text();
            console.error('Edit failed:', errText);
            showToast('Failed to update entry.', true);
        }
    } catch (err) {
        console.error('Error updating entry:', err);
        showToast('Failed to update entry.', true);
    }
});

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

async function deleteCustomField(fieldId) {
    const tripId = getSelectedTripId();
    if (!tripId || !confirm('Delete this custom field and all its entries?')) return;

    try {
        const res = await fetch(`${TRIP_API}/${tripId}/custom-fields/${fieldId}`, { method: 'DELETE' });
        if (res.ok) {
            tripCustomFields = tripCustomFields.filter(f => f.id !== fieldId);
            customExpenseEntries = customExpenseEntries.filter(e => !e.customField || e.customField.id !== fieldId);
            renderCustomFieldsList();
            updateCustomExpenseFieldSelect();
            updateUI();
            showToast('Custom field deleted.');
        } else {
            throw new Error('Delete failed');
        }
    } catch (err) {
        console.error('Error deleting custom field:', err);
        showToast('Failed to delete custom field.', true);
    }
}

async function deleteCustomExpense(id) {
    if (!confirm('Are you sure you want to delete this custom entry?')) return;

    try {
        const res = await fetch(`${CUSTOM_EXPENSE_API}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            customExpenseEntries = customExpenseEntries.filter(item => item.id !== id);
            updateUI();
            showToast('Custom entry deleted.');
        } else {
            throw new Error('Delete failed');
        }
    } catch (err) {
        console.error('Error deleting custom entry:', err);
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
    if (!dateStr) return '';
    let normalized = dateStr;
    if (dateStr.includes('T') && !dateStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
        normalized = `${dateStr}+05:30`;
    }
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return dateStr;
    const datePart = d.toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: APP_TIMEZONE
    });
    const timePart = d.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: APP_TIMEZONE
    });
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
