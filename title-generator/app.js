// ========================================
// YOUTUBE TITLE GENERATOR LOGIC
// ========================================

const el = {
    keywordInput: document.getElementById('keyword-input'),
    staticBtn: document.getElementById('static-btn'),
    aiBtn: document.getElementById('ai-btn'),
    aiLoading: document.getElementById('ai-loading'),
    resultsContainer: document.getElementById('results-container'),
    resultsList: document.getElementById('results-list')
};

// Static Templates
const templates = [
    "I Tried [KEYWORD] for 30 Days and Here's What Happened",
    "10 Reasons Why [KEYWORD] is Dead (and What to Do Instead)",
    "The Truth About [KEYWORD] That Nobody Tells You",
    "How I Made $10,000 Using [KEYWORD] (Step by Step)",
    "[KEYWORD] vs [KEYWORD] - Which is Better in 2025?",
    "Why Everyone is Switching to [KEYWORD] Right Now",
    "7 [KEYWORD] Mistakes You're Probably Making",
    "The Ultimate [KEYWORD] Guide for Beginners",
    "Is [KEYWORD] Worth It? My Honest Review",
    "[KEYWORD] Changed My Life - Here's How",
    "Stop Using [KEYWORD] Until You Watch This",
    "The Dark Side of [KEYWORD] Nobody Talks About"
];

// AI Model (lazy loaded)
let aiPipeline = null;

// Init
function init() {
    el.staticBtn.addEventListener('click', generateStatic);
    el.aiBtn.addEventListener('click', generateAI);
    console.log('Title Generator Initialized');
}

// Static Generation
function generateStatic() {
    const keyword = el.keywordInput.value.trim();

    if (!keyword) {
        alert('Please enter a keyword first!');
        return;
    }

    const titles = templates.map(template =>
        template.replace(/\[KEYWORD\]/g, keyword)
    );

    displayResults(titles, 'Template-Based Titles');
}

// AI Generation (Lazy Load)
async function generateAI() {
    const keyword = el.keywordInput.value.trim();

    if (!keyword) {
        alert('Please enter a keyword first!');
        return;
    }

    // Show loading
    el.aiLoading.classList.remove('hidden');
    el.aiBtn.disabled = true;
    el.aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';

    try {
        // Lazy load Transformers.js
        if (!aiPipeline) {
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
            aiPipeline = await pipeline('text-generation', 'Xenova/distilgpt2');
        }

        // Generate titles
        const prompt = `Generate 5 viral YouTube video titles about ${keyword}:\n1.`;
        const output = await aiPipeline(prompt, {
            max_new_tokens: 200,
            temperature: 0.9,
            do_sample: true
        });

        // Parse output
        const generatedText = output[0].generated_text;
        const lines = generatedText.split('\n').filter(line => line.trim().match(/^\d+\./));
        const titles = lines.map(line => line.replace(/^\d+\.\s*/, '').trim()).slice(0, 5);

        if (titles.length === 0) {
            throw new Error('No titles generated');
        }

        displayResults(titles, 'AI-Generated Titles');

    } catch (error) {
        console.error('AI Error:', error);
        alert('AI generation failed. Try the Template option instead!');
    } finally {
        el.aiLoading.classList.add('hidden');
        el.aiBtn.disabled = false;
        el.aiBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>AI Magic Write ✨';
    }
}

// Display Results
function displayResults(titles, heading) {
    el.resultsContainer.classList.remove('hidden');

    el.resultsList.innerHTML = `
        <p class="text-sm text-gray-400 mb-4">${heading}</p>
        ${titles.map((title, index) => `
            <div class="flex items-start gap-3 p-4 bg-black border border-white/10 rounded-lg hover:border-white/30 transition-colors group">
                <span class="text-gray-500 font-mono text-sm mt-1">${index + 1}.</span>
                <p class="flex-1 text-white leading-relaxed">${title}</p>
                <button onclick="copyTitle('${title.replace(/'/g, "\\'")}', this)" 
                    class="btn btn-secondary px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `).join('')}
    `;

    // Scroll to results
    el.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Copy Function (Global)
window.copyTitle = function (title, btn) {
    navigator.clipboard.writeText(title).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('bg-green-600');

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('bg-green-600');
        }, 2000);
    });
};

// Start
document.addEventListener('DOMContentLoaded', init);
