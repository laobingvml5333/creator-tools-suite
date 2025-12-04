// ========================================
// CHAPTER STAMP GENERATOR LOGIC
// ========================================

const el = {
    timestampInput: document.getElementById('timestamp-input'),
    generateBtn: document.getElementById('generate-btn'),
    outputContainer: document.getElementById('output-container'),
    outputList: document.getElementById('output-list'),
    copyBtn: document.getElementById('copy-btn')
};

let chapters = [];

// Init
function init() {
    el.generateBtn.addEventListener('click', generateChapters);
    el.copyBtn.addEventListener('click', copyAll);
    console.log('Chapter Stamp Generator Initialized');
}

// Generate Chapters
function generateChapters() {
    const input = el.timestampInput.value.trim();

    if (!input) {
        alert('Please enter some timestamps first!');
        return;
    }

    // Parse input
    chapters = parseTimestamps(input);

    if (chapters.length === 0) {
        alert('No valid timestamps found. Please check your format.');
        return;
    }

    // Sort by time
    chapters.sort((a, b) => a.seconds - b.seconds);

    // Display
    displayChapters();
    el.outputContainer.classList.remove('hidden');
    el.outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Parse Timestamps
function parseTimestamps(input) {
    const lines = input.split('\n').filter(line => line.trim());
    const parsed = [];

    lines.forEach(line => {
        // Try different formats
        let match;

        // Format: "0:00 Title" or "0:00 - Title"
        match = line.match(/^(\d+):(\d+)\s*-?\s*(.+)$/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const title = match[3].trim();
            parsed.push({
                time: `${minutes}:${String(seconds).padStart(2, '0')}`,
                title: title,
                seconds: minutes * 60 + seconds
            });
            return;
        }

        // Format: "1:30:45 Title" (with hours)
        match = line.match(/^(\d+):(\d+):(\d+)\s*-?\s*(.+)$/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const title = match[4].trim();
            parsed.push({
                time: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                title: title,
                seconds: hours * 3600 + minutes * 60 + seconds
            });
            return;
        }

        // Format: "3 minutes 45 seconds Title"
        match = line.match(/^(\d+)\s*minutes?\s*(\d+)?\s*seconds?\s*-?\s*(.+)$/i);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = match[2] ? parseInt(match[2]) : 0;
            const title = match[3].trim();
            parsed.push({
                time: `${minutes}:${String(seconds).padStart(2, '0')}`,
                title: title,
                seconds: minutes * 60 + seconds
            });
            return;
        }

        // Format: "45 seconds Title" or "45s Title"
        match = line.match(/^(\d+)\s*s(?:econds?)?\s*-?\s*(.+)$/i);
        if (match) {
            const seconds = parseInt(match[1]);
            const title = match[2].trim();
            parsed.push({
                time: `0:${String(seconds).padStart(2, '0')}`,
                title: title,
                seconds: seconds
            });
            return;
        }
    });

    return parsed;
}

// Display Chapters
function displayChapters() {
    el.outputList.innerHTML = chapters.map((chapter, index) => `
        <div class="flex items-start gap-3 p-4 bg-black border border-white/10 rounded-lg hover:border-white/30 transition-colors group">
            <span class="text-gray-500 font-mono text-sm mt-1">${index + 1}.</span>
            <div class="flex-1">
                <code class="text-white font-mono">${chapter.time}</code>
                <span class="text-gray-400 ml-2">${chapter.title}</span>
            </div>
            <button onclick="copyChapter(${index})" 
                class="btn btn-secondary px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <i class="fas fa-copy"></i>
            </button>
        </div>
    `).join('');
}

// Copy Single Chapter
window.copyChapter = function (index) {
    const chapter = chapters[index];
    const text = `${chapter.time} ${chapter.title}`;

    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback handled by button
    });
};

// Copy All
function copyAll() {
    const text = chapters.map(ch => `${ch.time} ${ch.title}`).join('\n');

    navigator.clipboard.writeText(text).then(() => {
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
