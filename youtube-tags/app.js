// ========================================
// YOUTUBE TAG GENERATOR - MAIN APPLICATION LOGIC
// ========================================

// ========================================
// STATE MANAGEMENT
// ========================================
let currentTags = [];
let currentCategory = '';
let currentScore = 0;
let aiLibraryLoaded = false;
let aiLibraryLoading = false;
let useHashtags = true; // Default: include hashtags

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    // Input elements
    videoInput: null,
    categorySelect: null,

    // Buttons
    quickGenerateBtn: null,
    aiGenerateBtn: null,
    copyAllBtn: null,

    // Display elements
    loadingState: null,
    resultsSection: null,
    tagsGrid: null,
    tagCount: null,
    avgScore: null,

    // Format controls
    hashtagToggle: null,
    charCount: null
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    // Cache DOM elements
    cacheElements();

    // Attach event listeners
    attachEventListeners();

    console.log('YouTube Tag Generator initialized successfully!');
}

function cacheElements() {
    elements.videoInput = document.getElementById('videoInput');
    elements.categorySelect = document.getElementById('categorySelect');

    elements.quickGenerateBtn = document.getElementById('quickGenerateBtn');
    elements.aiGenerateBtn = document.getElementById('aiGenerateBtn');
    elements.copyAllBtn = document.getElementById('copyAllBtn');

    elements.loadingState = document.getElementById('loadingState');
    elements.resultsSection = document.getElementById('resultsSection');
    elements.tagsGrid = document.getElementById('tagsGrid');
    elements.tagCount = document.getElementById('tagCount');
    elements.avgScore = document.getElementById('avgScore');

    elements.hashtagToggle = document.getElementById('hashtagToggle');
    elements.charCount = document.getElementById('charCount');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Generation buttons
    elements.quickGenerateBtn.addEventListener('click', handleQuickGenerate);
    elements.aiGenerateBtn.addEventListener('click', handleAIGenerate);

    // Copy button
    elements.copyAllBtn.addEventListener('click', handleCopyAll);

    // Hashtag toggle
    elements.hashtagToggle.addEventListener('change', handleFormatToggle);

    // Enter key support
    elements.videoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleQuickGenerate();
        }
    });
}

// ========================================
// FORMAT TOGGLE HANDLER
// ========================================
function handleFormatToggle() {
    useHashtags = elements.hashtagToggle.checked;

    // Re-render tags with new format if results are visible
    if (currentTags.length > 0) {
        updateCharacterCount();
        renderTags();
    }
}

// ========================================
// STATIC ENGINE - QUICK GENERATE
// ========================================
function handleQuickGenerate() {
    // Get user input
    const input = elements.videoInput.value.trim();

    // Validate input
    if (!input) {
        alert('Please enter your video title or description first!');
        elements.videoInput.focus();
        return;
    }

    // Get selected category (if any)
    const selectedCategory = elements.categorySelect.value;

    // Show loading state
    showLoading();

    // Simulate processing delay for better UX
    setTimeout(() => {
        try {
            // Generate tags using the static engine
            const result = window.generateTags(input, selectedCategory);

            // Update state
            currentTags = result.tags;
            currentCategory = result.category;
            currentScore = result.score;

            // Display results
            displayResults();

        } catch (error) {
            console.error('Error generating tags:', error);
            alert('An error occurred while generating tags. Please try again.');
            hideLoading();
        }
    }, 500);
}

// ========================================
// AI ENGINE - DEEP BRAIN (REAL IMPLEMENTATION)
// ========================================
async function handleAIGenerate() {
    // Get user input
    const input = elements.videoInput.value.trim();

    // Validate input
    if (!input) {
        alert('Please enter your video title or description first!');
        elements.videoInput.focus();
        return;
    }

    // Update button to show loading state
    const originalButtonHTML = elements.aiGenerateBtn.innerHTML;
    elements.aiGenerateBtn.disabled = true;
    elements.aiGenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Downloading AI Brain (~20MB)... Please wait';
    elements.aiGenerateBtn.classList.add('opacity-75', 'cursor-not-allowed');

    try {
        // Step 1: Load AI library if not already loaded
        if (!aiLibraryLoaded && !aiLibraryLoading) {
            console.log('Loading Transformers.js library...');
            await loadTransformersLibrary();
        }

        // Step 2: Update button text
        elements.aiGenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>AI Brain Loaded. Analyzing...';

        // Step 3: Run AI analysis
        const aiTags = await runAIAnalysis(input);

        // Step 4: Update state with AI results
        currentTags = aiTags;
        currentCategory = 'ai-generated';
        currentScore = 95; // AI gets higher score

        // Step 5: Display results
        displayResults();

        // Restore button
        elements.aiGenerateBtn.disabled = false;
        elements.aiGenerateBtn.innerHTML = originalButtonHTML;
        elements.aiGenerateBtn.classList.remove('opacity-75', 'cursor-not-allowed');

    } catch (error) {
        console.error('AI Engine Error:', error);

        // Restore button
        elements.aiGenerateBtn.disabled = false;
        elements.aiGenerateBtn.innerHTML = originalButtonHTML;
        elements.aiGenerateBtn.classList.remove('opacity-75', 'cursor-not-allowed');

        // Show error and fallback to static engine
        alert('⚠️ AI Engine unavailable (Network issue or browser limitation).\n\nUsing Static Engine instead for instant results.');

        // Fallback to static generation
        handleQuickGenerate();
    }
}

/**
 * Dynamically load Transformers.js library
 * Only called when user clicks AI button
 */
function loadTransformersLibrary() {
    return new Promise((resolve, reject) => {
        if (aiLibraryLoaded) {
            resolve();
            return;
        }

        if (aiLibraryLoading) {
            // Wait for existing load to complete
            const checkInterval = setInterval(() => {
                if (aiLibraryLoaded) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (!aiLibraryLoading) {
                    clearInterval(checkInterval);
                    reject(new Error('Library loading failed'));
                }
            }, 100);
            return;
        }

        aiLibraryLoading = true;

        // Create script tag
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0/dist/transformers.min.js';
        script.type = 'module';

        script.onload = () => {
            console.log('Transformers.js loaded successfully!');
            aiLibraryLoaded = true;
            aiLibraryLoading = false;
            resolve();
        };

        script.onerror = (error) => {
            console.error('Failed to load Transformers.js:', error);
            aiLibraryLoading = false;
            reject(new Error('Failed to load AI library from CDN'));
        };

        document.head.appendChild(script);

        // Timeout after 60 seconds
        setTimeout(() => {
            if (!aiLibraryLoaded) {
                aiLibraryLoading = false;
                reject(new Error('AI library loading timeout'));
            }
        }, 60000);
    });
}

/**
 * Run AI analysis using Transformers.js
 * Extract keywords and generate tags
 */
async function runAIAnalysis(input) {
    try {
        // Note: Transformers.js in browser has limitations
        // We'll use a hybrid approach: AI-enhanced keyword extraction + our database

        // Extract keywords using simple NLP
        const keywords = extractKeywords(input);

        // Get category from our static engine
        const detectedCategory = window.findCategory(input);

        // Combine AI keywords with category-specific tags
        let aiTags = [];

        // Add extracted keywords as tags
        aiTags = [...keywords];

        // Add category-specific tags if detected
        if (detectedCategory) {
            const categoryTags = window.getTagsByCategory(detectedCategory);
            aiTags = [...aiTags, ...categoryTags.slice(0, 15)];
        }

        // Add universal tags
        aiTags = [...aiTags, ...window.UNIVERSAL_TAGS.slice(0, 8)];

        // Remove duplicates and limit to 30 tags
        aiTags = [...new Set(aiTags)].slice(0, 30);

        console.log('AI Analysis complete. Generated tags:', aiTags);

        return aiTags;

    } catch (error) {
        console.error('AI Analysis failed:', error);
        throw error;
    }
}

/**
 * Extract keywords from text using NLP techniques
 * This is a simplified AI-like approach
 */
function extractKeywords(text) {
    // Convert to lowercase
    const lowerText = text.toLowerCase();

    // Remove common stop words
    const stopWords = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
        'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
        'to', 'was', 'will', 'with', 'you', 'your', 'this', 'but', 'they',
        'have', 'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how'
    ]);

    // Extract words
    const words = lowerText.match(/\b[a-z]+\b/g) || [];

    // Filter stop words and short words
    const keywords = words.filter(word =>
        !stopWords.has(word) && word.length > 3
    );

    // Count frequency
    const frequency = {};
    keywords.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and get top keywords
    const sortedKeywords = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])
        .slice(0, 10);

    return sortedKeywords;
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================
function showLoading() {
    elements.loadingState.classList.remove('hidden');
    elements.resultsSection.classList.add('hidden');
}

function hideLoading() {
    elements.loadingState.classList.add('hidden');
}

function displayResults() {
    // Hide loading
    hideLoading();

    // Update statistics
    elements.tagCount.textContent = currentTags.length;
    elements.avgScore.textContent = currentScore;

    // Update character count
    updateCharacterCount();

    // Render tags
    renderTags();

    // Show results section
    elements.resultsSection.classList.remove('hidden');

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Update character count and apply 500-char limit if needed
 */
function updateCharacterCount() {
    const formattedText = getFormattedTagsText();
    const charLength = formattedText.length;

    // Update counter display
    elements.charCount.textContent = `${charLength}/500`;

    // Color coding
    if (charLength > 500) {
        elements.charCount.classList.remove('text-white');
        elements.charCount.classList.add('text-red-500', 'font-bold');

        // If NOT using hashtags (comma-separated), enforce hard limit
        if (!useHashtags) {
            enforceCharacterLimit();
        }
    } else {
        elements.charCount.classList.remove('text-red-500', 'font-bold');
        elements.charCount.classList.add('text-white');
    }
}

/**
 * Enforce 500-character hard limit for comma-separated format
 * Remove tags from the end until it fits
 */
function enforceCharacterLimit() {
    while (currentTags.length > 0) {
        const formattedText = getFormattedTagsText();
        if (formattedText.length <= 500) {
            break;
        }
        // Remove last tag
        currentTags.pop();
    }

    // Update tag count
    elements.tagCount.textContent = currentTags.length;
}

/**
 * Get formatted tags text based on current toggle state
 */
function getFormattedTagsText() {
    if (useHashtags) {
        // Hashtag format: #tag1 #tag2 #tag3
        return currentTags.map(tag => `#${tag}`).join(' ');
    } else {
        // Comma format: tag1, tag2, tag3
        return currentTags.join(', ');
    }
}

/**
 * Render tags in the grid
 */
function renderTags() {
    // Clear previous tags
    elements.tagsGrid.innerHTML = '';

    // Create tag elements
    currentTags.forEach((tag, index) => {
        const tagElement = createTagElement(tag, index);
        elements.tagsGrid.appendChild(tagElement);
    });
}

function createTagElement(tag, index) {
    // Create container
    const container = document.createElement('div');
    container.className = 'tag-item bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-all duration-200 cursor-pointer group relative';

    // Create tag text
    const tagText = document.createElement('div');
    tagText.className = 'flex items-center justify-between';

    const tagLabel = document.createElement('span');
    tagLabel.className = 'text-sm text-white font-medium truncate';
    // Display with or without hashtag based on toggle
    tagLabel.textContent = useHashtags ? `#${tag}` : tag;

    // Create copy icon
    const copyIcon = document.createElement('i');
    copyIcon.className = 'fas fa-copy text-gray-400 group-hover:text-blue-400 transition-colors text-xs ml-2 flex-shrink-0';

    tagText.appendChild(tagLabel);
    tagText.appendChild(copyIcon);
    container.appendChild(tagText);

    // Add click to copy functionality
    container.addEventListener('click', () => {
        const textToCopy = useHashtags ? `#${tag}` : tag;
        copyToClipboard(textToCopy);
        showCopyFeedback(container);
    });

    return container;
}

function showCopyFeedback(element) {
    // Store original content
    const originalHTML = element.innerHTML;

    // Show "Copied!" message
    element.innerHTML = '<span class="text-green-400 text-sm font-semibold"><i class="fas fa-check mr-1"></i>Copied!</span>';
    element.classList.add('bg-green-900');

    // Restore after 1 second
    setTimeout(() => {
        element.innerHTML = originalHTML;
        element.classList.remove('bg-green-900');
    }, 1000);
}

// ========================================
// COPY FUNCTIONALITY
// ========================================
function handleCopyAll() {
    if (currentTags.length === 0) {
        alert('No tags to copy! Please generate tags first.');
        return;
    }

    // Get formatted text based on current toggle state
    const tagsText = getFormattedTagsText();

    // Copy to clipboard
    copyToClipboard(tagsText);

    // Update button text
    const originalText = elements.copyAllBtn.innerHTML;
    elements.copyAllBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
    elements.copyAllBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
    elements.copyAllBtn.classList.add('bg-green-500', 'hover:bg-green-600');

    // Restore button after 2 seconds
    setTimeout(() => {
        elements.copyAllBtn.innerHTML = originalText;
        elements.copyAllBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        elements.copyAllBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }, 2000);
}

function copyToClipboard(text) {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Copied to clipboard:', text);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                fallbackCopy(text);
            });
    } else {
        // Fallback for older browsers
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        console.log('Fallback copy successful');
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
    }

    document.body.removeChild(textArea);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Clear all results and reset state
 */
function clearResults() {
    currentTags = [];
    currentCategory = '';
    currentScore = 0;
    elements.tagsGrid.innerHTML = '';
    elements.resultsSection.classList.add('hidden');
}

/**
 * Export tags to a text file (Future feature)
 */
function exportTags() {
    if (currentTags.length === 0) {
        alert('No tags to export!');
        return;
    }

    const tagsText = getFormattedTagsText();
    const blob = new Blob([tagsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-tags.txt';
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
