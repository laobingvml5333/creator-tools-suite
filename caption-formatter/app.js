// ========================================
// AUTO CAPTION FORMATTER LOGIC
// ========================================

const el = {
    scriptInput: document.getElementById('script-input'),
    platformTikTok: document.getElementById('platform-tiktok'),
    platformYouTube: document.getElementById('platform-youtube'),
    formatSelect: document.getElementById('format-select'),
    generateBtn: document.getElementById('generate-btn'),
    outputContainer: document.getElementById('output-container'),
    outputText: document.getElementById('output-text'),
    copyBtn: document.getElementById('copy-btn')
};

// State
let platform = 'tiktok'; // 'tiktok' or 'youtube'
const WPM = 150; // Words per minute (average speaking rate)

// Init
function init() {
    el.platformTikTok.addEventListener('click', () => setPlatform('tiktok'));
    el.platformYouTube.addEventListener('click', () => setPlatform('youtube'));
    el.generateBtn.addEventListener('click', generateCaptions);
    el.copyBtn.addEventListener('click', copyOutput);
    console.log('Caption Formatter Initialized');
}

// Set Platform
function setPlatform(newPlatform) {
    platform = newPlatform;

    // Update UI
    if (platform === 'tiktok') {
        el.platformTikTok.className = 'btn btn-primary flex-1';
        el.platformYouTube.className = 'btn btn-secondary flex-1';
    } else {
        el.platformTikTok.className = 'btn btn-secondary flex-1';
        el.platformYouTube.className = 'btn btn-primary flex-1';
    }
}

// Generate Captions
function generateCaptions() {
    const script = el.scriptInput.value.trim();

    if (!script) {
        alert('Please enter a script first!');
        return;
    }

    // Split into lines based on platform
    const lines = splitScript(script);

    // Generate timestamps
    const captions = generateTimestamps(lines);

    // Format output
    const format = el.formatSelect.value;
    let output = '';

    switch (format) {
        case 'srt':
            output = formatSRT(captions);
            break;
        case 'vtt':
            output = formatVTT(captions);
            break;
        case 'plain':
            output = formatPlain(captions);
            break;
    }

    // Display
    el.outputText.value = output;
    el.outputContainer.classList.remove('hidden');
    el.outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Split Script
function splitScript(script) {
    const maxWords = platform === 'tiktok' ? 6 : 12;
    const sentences = script.match(/[^.!?]+[.!?]+/g) || [script];
    const lines = [];

    sentences.forEach(sentence => {
        const words = sentence.trim().split(/\s+/);
        let currentLine = [];

        words.forEach(word => {
            currentLine.push(word);
            if (currentLine.length >= maxWords) {
                lines.push(currentLine.join(' '));
                currentLine = [];
            }
        });

        if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
        }
    });

    return lines;
}

// Generate Timestamps
function generateTimestamps(lines) {
    const captions = [];
    let currentTime = 0;

    lines.forEach(line => {
        const wordCount = line.split(/\s+/).length;
        const duration = (wordCount / WPM) * 60; // seconds

        captions.push({
            start: currentTime,
            end: currentTime + duration,
            text: line
        });

        currentTime += duration;
    });

    return captions;
}

// Format SRT
function formatSRT(captions) {
    return captions.map((caption, index) => {
        const startTime = formatTime(caption.start, 'srt');
        const endTime = formatTime(caption.end, 'srt');
        return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    }).join('\n');
}

// Format VTT
function formatVTT(captions) {
    let output = 'WEBVTT\n\n';
    output += captions.map((caption, index) => {
        const startTime = formatTime(caption.start, 'vtt');
        const endTime = formatTime(caption.end, 'vtt');
        return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}\n`;
    }).join('\n');
    return output;
}

// Format Plain Text
function formatPlain(captions) {
    return captions.map(caption => caption.text).join('\n\n');
}

// Format Time
function formatTime(seconds, format) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    const mmm = String(ms).padStart(3, '0');

    if (format === 'srt') {
        return `${hh}:${mm}:${ss},${mmm}`;
    } else {
        return `${hh}:${mm}:${ss}.${mmm}`;
    }
}

// Copy Output
function copyOutput() {
    el.outputText.select();
    navigator.clipboard.writeText(el.outputText.value).then(() => {
        const originalHTML = el.copyBtn.innerHTML;
        el.copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
        el.copyBtn.classList.add('bg-green-600');

        setTimeout(() => {
            el.copyBtn.innerHTML = originalHTML;
            el.copyBtn.classList.remove('bg-green-600');
        }, 2000);
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);
