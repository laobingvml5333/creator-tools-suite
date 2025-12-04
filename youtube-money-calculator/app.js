// ========================================
// YOUTUBE MONEY CALCULATOR LOGIC
// ========================================

const el = {
    viewsSlider: document.getElementById('views-slider'),
    viewsInput: document.getElementById('views-input'),
    viewsDisplay: document.getElementById('views-display'),

    cpmSlider: document.getElementById('cpm-slider'),
    cpmInput: document.getElementById('cpm-input'),
    cpmDisplay: document.getElementById('cpm-display'),

    dailyEarnings: document.getElementById('daily-earnings'),
    monthlyEarnings: document.getElementById('monthly-earnings'),
    yearlyEarnings: document.getElementById('yearly-earnings'),

    coffeeCount: document.getElementById('coffee-count')
};

// State
let state = {
    views: 10000,
    cpm: 2.00
};

// Init
function init() {
    attachListeners();
    calculate();
    console.log('Money Calculator Initialized');
}

// Listeners
function attachListeners() {
    // Views
    el.viewsSlider.addEventListener('input', (e) => {
        state.views = parseInt(e.target.value);
        el.viewsInput.value = state.views;
        calculate();
    });

    el.viewsInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 0;
        state.views = val;
        el.viewsSlider.value = val;
        calculate();
    });

    // CPM
    el.cpmSlider.addEventListener('input', (e) => {
        state.cpm = parseFloat(e.target.value);
        el.cpmInput.value = state.cpm.toFixed(2);
        calculate();
    });

    el.cpmInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        state.cpm = val;
        el.cpmSlider.value = val;
        calculate();
    });
}

// Calculation
function calculate() {
    // Basic Formula: (Views / 1000) * CPM
    // Note: Usually only ~50-80% of views are monetized, but for simplicity we use total views
    // and assume the user adjusts CPM to reflect "Effective CPM" (RPM).

    const daily = (state.views / 1000) * state.cpm;
    const monthly = daily * 30;
    const yearly = daily * 365;

    // Update UI
    updateDisplay(daily, monthly, yearly);
}

function updateDisplay(daily, monthly, yearly) {
    // Format Currency
    const format = (num) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Format Numbers
    const formatNum = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    el.viewsDisplay.textContent = formatNum(state.views);
    el.cpmDisplay.textContent = '$' + state.cpm.toFixed(2);

    el.dailyEarnings.textContent = format(daily);
    el.monthlyEarnings.textContent = format(monthly);
    el.yearlyEarnings.textContent = format(yearly);

    // Coffee Calculation (Assume $5 per cup)
    const coffeePrice = 5;
    const cups = Math.floor(monthly / coffeePrice);
    el.coffeeCount.textContent = formatNum(cups);
}

// Start
document.addEventListener('DOMContentLoaded', init);
