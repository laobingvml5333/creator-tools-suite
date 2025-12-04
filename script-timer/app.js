// ========================================
// VIDEO SCRIPT TIMER - MAIN APPLICATION LOGIC
// ========================================

// ========================================
// STATE MANAGEMENT
// ========================================
let currentWpm = 150; // Default: Normal speed
let wordCount = 0;
let estimatedSeconds = 0;

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    scriptInput: null,
    speedRadios: null,
    customWpmInput: null,
    timeDisplay: null,
    wordCountDisplay: null,
    currentWpmDisplay: null
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    // Cache DOM elements
    cacheElements();
    
    // Attach event listeners
    attachEventListeners();
    
    // Initial calculation
    calculateTime();
    
    console.log('Script Timer initialized successfully!');
}

function cacheElements() {
    elements.scriptInput = document.getElementById('scriptInput');
    elements.speedRadios = document.querySelectorAll('input[name="speed"]');
    elements.customWpmInput = document.getElementById('customWpm');
    elements.timeDisplay = document.getElementById('timeDisplay');
    elements.wordCountDisplay = document.getElementById('wordCount');
    elements.currentWpmDisplay = document.getElementById('currentWpm');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Script input - real-time update
    elements.scriptInput.addEventListener('input', handleScriptInput);
    
    // Speed radio buttons
    elements.speedRadios.forEach(radio => {
        radio.addEventListener('change', handleSpeedChange);
    });
    
    // Custom WPM input
    elements.customWpmInput.addEventListener('input', handleCustomWpmInput);
    
    // Auto-select custom radio when typing in custom WPM field
    elements.customWpmInput.addEventListener('focus', () => {
        const customRadio = document.querySelector('input[name="speed"][value="custom"]');
        if (customRadio) {
            customRadio.checked = true;
            handleSpeedChange({ target: customRadio });
        }
    });
}

// ========================================
// EVENT HANDLERS
// ========================================
function handleScriptInput() {
    calculateTime();
}

function handleSpeedChange(event) {
    const selectedValue = event.target.value;
    
    if (selectedValue === 'custom') {
        // Use custom WPM value
        const customValue = parseInt(elements.customWpmInput.value);
        currentWpm = isNaN(customValue) ? 150 : Math.max(50, Math.min(300, customValue));
    } else {
        // Use preset WPM value
        currentWpm = parseInt(selectedValue);
    }
    
    // Update display and recalculate
    elements.currentWpmDisplay.textContent = currentWpm;
    calculateTime();
}

function handleCustomWpmInput() {
    // Only update if custom radio is selected
    const customRadio = document.querySelector('input[name="speed"][value="custom"]');
    if (customRadio && customRadio.checked) {
        const customValue = parseInt(elements.customWpmInput.value);
        currentWpm = isNaN(customValue) ? 150 : Math.max(50, Math.min(300, customValue));
        elements.currentWpmDisplay.textContent = currentWpm;
        calculateTime();
    }
}

// ========================================
// CALCULATION LOGIC
// ========================================
function calculateTime() {
    // Get script text
    const text = elements.scriptInput.value.trim();
    
    // Calculate word count
    if (text.length === 0) {
        wordCount = 0;
    } else {
        // Split by whitespace and filter empty strings
        const words = text.split(/\s+/).filter(word => word.length > 0);
        wordCount = words.length;
    }
    
    // Calculate estimated time in seconds
    if (wordCount > 0 && currentWpm > 0) {
        estimatedSeconds = Math.round((wordCount / currentWpm) * 60);
    } else {
        estimatedSeconds = 0;
    }
    
    // Update display
    updateDisplay();
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================
function updateDisplay() {
    // Update word count
    elements.wordCountDisplay.textContent = wordCount;
    
    // Format time as MM:SS
    const formattedTime = formatTime(estimatedSeconds);
    elements.timeDisplay.textContent = formattedTime;
    
    // Add animation effect
    elements.timeDisplay.classList.add('scale-105');
    setTimeout(() => {
        elements.timeDisplay.classList.remove('scale-105');
    }, 200);
}

/**
 * Format seconds into MM:SS format
 * @param {number} totalSeconds - Total seconds
 * @returns {string} - Formatted time string
 */
function formatTime(totalSeconds) {
    if (totalSeconds === 0) {
        return '00:00';
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Pad with zeros
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    
    return `${minutesStr}:${secondsStr}`;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get detailed time breakdown
 * @returns {Object} - Time breakdown object
 */
function getTimeBreakdown() {
    const hours = Math.floor(estimatedSeconds / 3600);
    const minutes = Math.floor((estimatedSeconds % 3600) / 60);
    const seconds = estimatedSeconds % 60;
    
    return {
        hours,
        minutes,
        seconds,
        totalSeconds: estimatedSeconds,
        totalMinutes: Math.round(estimatedSeconds / 60 * 10) / 10,
        wordCount,
        wpm: currentWpm
    };
}

/**
 * Export script statistics (Future feature)
 */
function exportStats() {
    const breakdown = getTimeBreakdown();
    const stats = `
Script Statistics
==================
Word Count: ${breakdown.wordCount}
Speaking Speed: ${breakdown.wpm} WPM
Estimated Time: ${formatTime(breakdown.totalSeconds)}
Total Minutes: ${breakdown.totalMinutes}

Generated by Script Timer
${new Date().toLocaleString()}
    `.trim();
    
    // Create downloadable text file
    const blob = new Blob([stats], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script-stats.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// START APPLICATION
// ========================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
