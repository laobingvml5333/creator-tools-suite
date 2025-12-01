// ========================================
// FREE ONLINE TELEPROMPTER - VANILLA JAVASCRIPT
// ========================================

// WPM Mapping: Speed 1-10 to Words Per Minute
const WPM_MAP = {
    1: 100,   // Very slow
    2: 120,
    3: 130,
    4: 140,
    5: 150,   // Default - conversational pace
    6: 180,
    7: 210,
    8: 240,
    9: 270,
    10: 300   // Very fast
};

// State Management
let state = {
    isPlaying: false,
    scrollSpeed: 5,
    fontSize: 48,
    isMirrored: false,
    scriptText: '',
    scrollPosition: 0,
    animationFrameId: null,
    wordCount: 0,
    estimatedSeconds: 0
};

// DOM Elements
const elements = {
    // Mode containers
    editMode: null,
    promptMode: null,
    controlBar: null,
    
    // Input & Display
    scriptInput: null,
    promptDisplay: null,
    promptText: null,
    
    // Statistics
    wordCount: null,
    estimatedTime: null,
    wpmDisplay: null,
    
    // Buttons
    startPromptBtn: null,
    exitPromptBtn: null,
    playPauseBtn: null,
    flipBtn: null,
    resetBtn: null,
    
    // Sliders
    speedSlider: null,
    fontSizeSlider: null,
    speedValue: null,
    fontSizeValue: null
};

// ========================================
// INITIALIZATION
// ========================================

function init() {
    // Cache DOM elements
    cacheElements();
    
    // Load saved data from LocalStorage
    loadFromLocalStorage();
    
    // Attach event listeners
    attachEventListeners();
    
    // Calculate initial statistics
    updateStatistics();
    
    console.log('Free Online Teleprompter initialized successfully!');
}

function cacheElements() {
    elements.editMode = document.getElementById('editMode');
    elements.promptMode = document.getElementById('promptMode');
    elements.controlBar = document.getElementById('controlBar');
    
    elements.scriptInput = document.getElementById('scriptInput');
    elements.promptDisplay = document.getElementById('promptDisplay');
    elements.promptText = document.getElementById('promptText');
    
    elements.wordCount = document.getElementById('wordCount');
    elements.estimatedTime = document.getElementById('estimatedTime');
    elements.wpmDisplay = document.getElementById('wpmDisplay');
    
    elements.startPromptBtn = document.getElementById('startPromptBtn');
    elements.exitPromptBtn = document.getElementById('exitPromptBtn');
    elements.playPauseBtn = document.getElementById('playPauseBtn');
    elements.flipBtn = document.getElementById('flipBtn');
    elements.resetBtn = document.getElementById('resetBtn');
    
    elements.speedSlider = document.getElementById('speedSlider');
    elements.fontSizeSlider = document.getElementById('fontSizeSlider');
    elements.speedValue = document.getElementById('speedValue');
    elements.fontSizeValue = document.getElementById('fontSizeValue');
}

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {
    // Mode switching
    elements.startPromptBtn.addEventListener('click', enterPromptMode);
    elements.exitPromptBtn.addEventListener('click', exitPromptMode);
    
    // Playback controls
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Settings controls
    elements.speedSlider.addEventListener('input', updateSpeed);
    elements.fontSizeSlider.addEventListener('input', updateFontSize);
    elements.flipBtn.addEventListener('click', toggleMirror);
    elements.resetBtn.addEventListener('click', resetScroll);
    
    // Auto-save text input and update statistics
    elements.scriptInput.addEventListener('input', () => {
        saveTextToLocalStorage();
        updateStatistics();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ========================================
// STATISTICS CALCULATION
// ========================================

function updateStatistics() {
    // Get current text
    const text = elements.scriptInput.value.trim();
    
    // Calculate word count
    if (text.length === 0) {
        state.wordCount = 0;
    } else {
        // Split by whitespace and filter empty strings
        const words = text.split(/\s+/).filter(word => word.length > 0);
        state.wordCount = words.length;
    }
    
    // Calculate estimated time based on current speed (WPM)
    const currentWPM = WPM_MAP[state.scrollSpeed];
    if (state.wordCount > 0 && currentWPM > 0) {
        state.estimatedSeconds = Math.round((state.wordCount / currentWPM) * 60);
    } else {
        state.estimatedSeconds = 0;
    }
    
    // Update UI
    updateStatisticsDisplay();
}

function updateStatisticsDisplay() {
    // Update word count
    elements.wordCount.textContent = state.wordCount;
    
    // Update estimated time (convert seconds to min:sec format)
    const minutes = Math.floor(state.estimatedSeconds / 60);
    const seconds = state.estimatedSeconds % 60;
    elements.estimatedTime.textContent = `${minutes} min ${seconds} sec`;
    
    // Update WPM display in control bar
    const currentWPM = WPM_MAP[state.scrollSpeed];
    elements.wpmDisplay.textContent = `(~${currentWPM} WPM)`;
}

// ========================================
// MODE SWITCHING
// ========================================

function enterPromptMode() {
    // Get current text
    state.scriptText = elements.scriptInput.value.trim();
    
    if (!state.scriptText) {
        alert('Please enter your script content first!');
        return;
    }
    
    // Update display text
    elements.promptText.textContent = state.scriptText;
    elements.promptText.style.fontSize = state.fontSize + 'px';
    
    // Switch UI
    elements.editMode.classList.add('hidden');
    elements.promptMode.classList.remove('hidden');
    elements.controlBar.classList.remove('hidden');
    
    // Reset scroll position
    elements.promptDisplay.scrollTop = 0;
    state.scrollPosition = 0;
    
    console.log('Entered Prompt Mode');
}

function exitPromptMode() {
    // Stop scrolling if playing
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    // Switch UI back
    elements.editMode.classList.remove('hidden');
    elements.promptMode.classList.add('hidden');
    elements.controlBar.classList.add('hidden');
    
    console.log('Exited Prompt Mode');
}

// ========================================
// PLAYBACK CONTROLS
// ========================================

function togglePlayPause() {
    state.isPlaying = !state.isPlaying;
    
    const icon = elements.playPauseBtn.querySelector('i');
    
    if (state.isPlaying) {
        // Start scrolling
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        elements.playPauseBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        elements.playPauseBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        startAutoScroll();
    } else {
        // Pause scrolling
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        elements.playPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        elements.playPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        stopAutoScroll();
    }
}

// ========================================
// AUTO-SCROLL ENGINE
// ========================================

function startAutoScroll() {
    function scroll() {
        if (!state.isPlaying) return;
        
        // Calculate scroll increment based on speed (1-10)
        // Higher speed = faster scrolling
        const scrollIncrement = state.scrollSpeed * 0.5;
        
        // Update scroll position
        state.scrollPosition += scrollIncrement;
        elements.promptDisplay.scrollTop = state.scrollPosition;
        
        // Check if reached bottom
        const maxScroll = elements.promptDisplay.scrollHeight - elements.promptDisplay.clientHeight;
        if (state.scrollPosition >= maxScroll) {
            // Auto-pause at end
            togglePlayPause();
            return;
        }
        
        // Continue animation
        state.animationFrameId = requestAnimationFrame(scroll);
    }
    
    state.animationFrameId = requestAnimationFrame(scroll);
}

function stopAutoScroll() {
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }
}

function resetScroll() {
    // Stop if playing
    if (state.isPlaying) {
        togglePlayPause();
    }
    
    // Reset to top
    state.scrollPosition = 0;
    elements.promptDisplay.scrollTop = 0;
    
    console.log('Scroll reset to top');
}

// ========================================
// SETTINGS CONTROLS
// ========================================

function updateSpeed(event) {
    state.scrollSpeed = parseInt(event.target.value);
    elements.speedValue.textContent = state.scrollSpeed;
    
    // Update WPM display
    updateStatisticsDisplay();
    
    saveSettingsToLocalStorage();
}

function updateFontSize(event) {
    state.fontSize = parseInt(event.target.value);
    elements.fontSizeValue.textContent = state.fontSize + 'px';
    elements.promptText.style.fontSize = state.fontSize + 'px';
    saveSettingsToLocalStorage();
}

function toggleMirror() {
    state.isMirrored = !state.isMirrored;
    
    if (state.isMirrored) {
        elements.promptText.classList.add('mirror-x');
        elements.flipBtn.classList.add('bg-purple-700');
    } else {
        elements.promptText.classList.remove('mirror-x');
        elements.flipBtn.classList.remove('bg-purple-700');
    }
    
    saveSettingsToLocalStorage();
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

function handleKeyboardShortcuts(event) {
    // Only work in Prompt Mode
    if (elements.promptMode.classList.contains('hidden')) return;
    
    switch(event.key) {
        case ' ':
        case 'Enter':
            event.preventDefault();
            togglePlayPause();
            break;
        case 'Escape':
            event.preventDefault();
            exitPromptMode();
            break;
        case 'r':
        case 'R':
            event.preventDefault();
            resetScroll();
            break;
        case 'f':
        case 'F':
            event.preventDefault();
            toggleMirror();
            break;
        case 'ArrowUp':
            event.preventDefault();
            if (state.fontSize < 100) {
                elements.fontSizeSlider.value = state.fontSize + 2;
                updateFontSize({ target: elements.fontSizeSlider });
            }
            break;
        case 'ArrowDown':
            event.preventDefault();
            if (state.fontSize > 20) {
                elements.fontSizeSlider.value = state.fontSize - 2;
                updateFontSize({ target: elements.fontSizeSlider });
            }
            break;
        case 'ArrowRight':
            event.preventDefault();
            if (state.scrollSpeed < 10) {
                elements.speedSlider.value = state.scrollSpeed + 1;
                updateSpeed({ target: elements.speedSlider });
            }
            break;
        case 'ArrowLeft':
            event.preventDefault();
            if (state.scrollSpeed > 1) {
                elements.speedSlider.value = state.scrollSpeed - 1;
                updateSpeed({ target: elements.speedSlider });
            }
            break;
    }
}

// ========================================
// LOCAL STORAGE
// ========================================

function saveTextToLocalStorage() {
    localStorage.setItem('teleprompter_text', elements.scriptInput.value);
}

function saveSettingsToLocalStorage() {
    const settings = {
        scrollSpeed: state.scrollSpeed,
        fontSize: state.fontSize,
        isMirrored: state.isMirrored
    };
    localStorage.setItem('teleprompter_settings', JSON.stringify(settings));
}

function loadFromLocalStorage() {
    // Load saved text
    const savedText = localStorage.getItem('teleprompter_text');
    if (savedText) {
        elements.scriptInput.value = savedText;
        state.scriptText = savedText;
    }
    
    // Load saved settings
    const savedSettings = localStorage.getItem('teleprompter_settings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            
            // Apply speed
            if (settings.scrollSpeed) {
                state.scrollSpeed = settings.scrollSpeed;
                elements.speedSlider.value = settings.scrollSpeed;
                elements.speedValue.textContent = settings.scrollSpeed;
            }
            
            // Apply font size
            if (settings.fontSize) {
                state.fontSize = settings.fontSize;
                elements.fontSizeSlider.value = settings.fontSize;
                elements.fontSizeValue.textContent = settings.fontSize + 'px';
            }
            
            // Apply mirror state
            if (settings.isMirrored) {
                state.isMirrored = settings.isMirrored;
                if (state.isMirrored) {
                    elements.flipBtn.classList.add('bg-purple-700');
                }
            }
            
            console.log('Settings loaded from LocalStorage');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
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
