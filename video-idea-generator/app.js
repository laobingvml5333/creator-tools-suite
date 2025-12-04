// ========================================
// VIDEO IDEA GENERATOR LOGIC
// ========================================

const el = {
    ideaDisplay: document.getElementById('idea-display'),
    generateBtn: document.getElementById('generate-btn'),
    copyBtn: document.getElementById('copy-btn'),
    catButtons: document.querySelectorAll('[data-cat]')
};

// State
let currentCategory = 'all';
let isAnimating = false;

// Database
const ideas = {
    vlog: [
        "A Day in My Life: Realistic Edition",
        "My Morning Routine (5 AM Club)",
        "Behind the Scenes of My Channel",
        "Room Tour / Studio Tour 2025",
        "Answering Your Assumptions About Me",
        "What I Eat in a Day",
        "Productivity Vlog: Get Work Done With Me",
        "My Evening Routine to Unwind",
        "Travel Vlog: Exploring a New City",
        "Decluttering My Life (Minimalism)"
    ],
    tech: [
        "Top 5 Gadgets Under $50",
        "My Desk Setup Tour 2025",
        "Is the iPhone 16 Worth It?",
        "How to Edit Videos Faster (Workflow)",
        "Best Free Apps for Creators",
        "Mac vs PC: Which is Better for Editing?",
        "Reviewing My Oldest Videos",
        "Tech I Regret Buying",
        "Budget vs Expensive Tech Challenge",
        "How to Start a YouTube Channel in 2025"
    ],
    gaming: [
        "I Played [Game] for 24 Hours Straight",
        "Can I Beat [Game] Without Taking Damage?",
        "Ranking Every Boss in [Game]",
        "The Evolution of [Game Series]",
        "Pro vs Noob: [Game] Comparison",
        "Trying the Worst Rated Games on Steam",
        "Speedrun Challenge: [Game] Any%",
        "My Gaming Setup Tour",
        "Reacting to My Old Gameplay",
        "10 Hidden Easter Eggs in [Game]"
    ],
    challenge: [
        "I Said YES to Everything for 24 Hours",
        "Surviving on $10 for a Week",
        "I Tried the 75 Hard Challenge",
        "No Social Media for 30 Days",
        "Eating Only One Color of Food for 24 Hours",
        "I Let My Subscribers Control My Life",
        "Overnight in a Haunted Location",
        "10,000 Calorie Challenge",
        "Learning a New Skill in 24 Hours",
        "I Traded a Paperclip for a House (Part 1)"
    ]
};

// Init
function init() {
    attachListeners();
    console.log('Idea Generator Initialized');
}

// Listeners
function attachListeners() {
    // Generate
    el.generateBtn.addEventListener('click', generateIdea);

    // Copy
    el.copyBtn.addEventListener('click', copyIdea);

    // Categories
    el.catButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update Active State
            el.catButtons.forEach(b => {
                b.classList.remove('bg-white', 'text-black');
                b.classList.add('text-gray-400', 'hover:text-white');
            });
            e.target.classList.remove('text-gray-400', 'hover:text-white');
            e.target.classList.add('bg-white', 'text-black');

            // Update State
            currentCategory = e.target.dataset.cat;
        });
    });
}

// Logic
function generateIdea() {
    if (isAnimating) return;
    isAnimating = true;

    // Get Pool
    let pool = [];
    if (currentCategory === 'all') {
        Object.values(ideas).forEach(arr => pool.push(...arr));
    } else {
        pool = ideas[currentCategory];
    }

    // Animation Effect
    let count = 0;
    const maxCount = 10;
    const interval = setInterval(() => {
        const randomTemp = pool[Math.floor(Math.random() * pool.length)];
        el.ideaDisplay.textContent = randomTemp;
        el.ideaDisplay.style.opacity = 0.5;

        count++;
        if (count >= maxCount) {
            clearInterval(interval);
            // Final Selection
            const finalIdea = pool[Math.floor(Math.random() * pool.length)];
            el.ideaDisplay.textContent = finalIdea;
            el.ideaDisplay.style.opacity = 1;
            el.ideaDisplay.classList.add('scale-105');
            setTimeout(() => el.ideaDisplay.classList.remove('scale-105'), 200);
            isAnimating = false;
        }
    }, 50);
}

function copyIdea() {
    const text = el.ideaDisplay.textContent;
    if (text.includes('Click "Generate"')) return;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = el.copyBtn.innerHTML;
        el.copyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
        el.copyBtn.classList.add('bg-green-600', 'border-green-600');

        setTimeout(() => {
            el.copyBtn.innerHTML = originalText;
            el.copyBtn.classList.remove('bg-green-600', 'border-green-600');
        }, 2000);
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);
