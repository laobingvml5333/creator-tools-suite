// ========================================
// YOUTUBE THUMBNAIL SUITE - CLEAN REWRITE
// ========================================

// STATE
const state = {
    mode: 'long', // 'long' or 'shorts'
    blobUrl: null,
    compressedUrl: null,
    originalFile: null,
    title: 'Your Video Title Will Appear Here',
    showTimestamp: true
};

// CONSTANTS
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// DOM ELEMENTS
const el = {
    // Controls
    btnLong: null,
    btnShorts: null,
    inputFile: null,
    inputTitle: null,
    toggleTimestamp: null,
    controlTimestamp: null,
    hintRatio: null,

    // Compression
    alertCompression: null,
    sizeOriginal: null,
    btnCompress: null,
    btnDownload: null,
    sizeCompressed: null,

    // Preview Wrapper
    previewWrapper: null,
    viewLong: null,
    viewShorts: null,

    // Images (5 total)
    imgDesktop: null,
    imgSidebar: null,
    imgMobile: null,
    imgFeed: null,
    imgGrid1: null,

    // Titles (5 total)
    titleDesktop: null,
    titleSidebar: null,
    titleMobile: null,
    titleFeed: null,
    titleGrid: null,

    // Timestamps (3 for long view)
    tsDesktop: null,
    tsSidebar: null,
    tsMobile: null
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    cacheElements();
    attachListeners();
    console.log('Thumbnail Suite initialized (Clean Version)');
}

function cacheElements() {
    // Controls
    el.btnLong = document.getElementById('btn-long');
    el.btnShorts = document.getElementById('btn-shorts');
    el.inputFile = document.getElementById('input-file');
    el.inputTitle = document.getElementById('input-title');
    el.toggleTimestamp = document.getElementById('toggle-timestamp');
    el.controlTimestamp = document.getElementById('control-timestamp');
    el.hintRatio = document.getElementById('hint-ratio');

    // Compression
    el.alertCompression = document.getElementById('alert-compression');
    el.sizeOriginal = document.getElementById('size-original');
    el.btnCompress = document.getElementById('btn-compress');
    el.btnDownload = document.getElementById('btn-download');
    el.sizeCompressed = document.getElementById('size-compressed');

    // Preview
    el.previewWrapper = document.getElementById('preview-wrapper');
    el.viewLong = document.getElementById('view-long');
    el.viewShorts = document.getElementById('view-shorts');

    // Images
    el.imgDesktop = document.getElementById('img-desktop');
    el.imgSidebar = document.getElementById('img-sidebar');
    el.imgMobile = document.getElementById('img-mobile');
    el.imgFeed = document.getElementById('img-feed');
    el.imgGrid1 = document.getElementById('img-grid-1');

    // Titles
    el.titleDesktop = document.getElementById('title-desktop');
    el.titleSidebar = document.getElementById('title-sidebar');
    el.titleMobile = document.getElementById('title-mobile');
    el.titleFeed = document.getElementById('title-feed');
    el.titleGrid = document.getElementById('title-grid');

    // Timestamps
    el.tsDesktop = document.getElementById('ts-desktop');
    el.tsSidebar = document.getElementById('ts-sidebar');
    el.tsMobile = document.getElementById('ts-mobile');
}

function attachListeners() {
    el.btnLong.addEventListener('click', () => switchMode('long'));
    el.btnShorts.addEventListener('click', () => switchMode('shorts'));
    el.inputFile.addEventListener('change', handleFileUpload);
    el.inputTitle.addEventListener('input', handleTitleInput);
    el.toggleTimestamp.addEventListener('change', handleTimestampToggle);
    el.btnCompress.addEventListener('click', handleCompress);
    el.btnDownload.addEventListener('click', handleDownload);
}

// ========================================
// CORE LOGIC
// ========================================

function switchMode(mode) {
    state.mode = mode;
    updateModeUI();

    // Re-validate ratio if file exists
    if (state.originalFile) {
        validateRatio(state.originalFile);
    }
}

function updateModeUI() {
    const isLong = state.mode === 'long';

    // Toggle Views
    if (isLong) {
        el.viewLong.classList.remove('hidden');
        el.viewShorts.classList.add('hidden');
        el.controlTimestamp.classList.remove('hidden');
    } else {
        el.viewLong.classList.add('hidden');
        el.viewShorts.classList.remove('hidden');
        el.controlTimestamp.classList.add('hidden');
    }

    // Update Buttons
    if (isLong) {
        el.btnLong.className = "px-6 py-2 rounded-lg font-bold transition-all duration-200 bg-white text-black border border-transparent shadow-lg";
        el.btnShorts.className = "px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-[#222] text-gray-300 border border-white/10 hover:bg-[#333] hover:text-white";
    } else {
        el.btnShorts.className = "px-6 py-2 rounded-lg font-bold transition-all duration-200 bg-white text-black border border-transparent shadow-lg";
        el.btnLong.className = "px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-[#222] text-gray-300 border border-white/10 hover:bg-[#333] hover:text-white";
    }

    // Update Hint
    if (!state.originalFile) {
        el.hintRatio.textContent = isLong ? 'Recommended: 1280x720px (16:9 ratio)' : 'Recommended: 1080x1920px (9:16 ratio)';
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }

    state.originalFile = file;

    // 1. Create Blob URL
    if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
    state.blobUrl = URL.createObjectURL(file);

    // 2. Set ALL 5 images immediately
    el.imgDesktop.src = state.blobUrl;
    el.imgSidebar.src = state.blobUrl;
    el.imgMobile.src = state.blobUrl;
    el.imgFeed.src = state.blobUrl;
    el.imgGrid1.src = state.blobUrl;

    // 3. Show Preview Wrapper
    el.previewWrapper.classList.remove('hidden');

    // 4. Check Size
    checkFileSize(file);

    // 5. Validate Ratio
    validateRatio(file);

    // 6. Reset Compression
    resetCompression();
}

function handleTitleInput(e) {
    state.title = e.target.value.trim() || 'Your Video Title Will Appear Here';

    // Update all 5 title elements
    el.titleDesktop.textContent = state.title;
    el.titleSidebar.textContent = state.title;
    el.titleMobile.textContent = state.title;
    el.titleFeed.textContent = state.title;
    el.titleGrid.textContent = state.title;
}

function handleTimestampToggle(e) {
    state.showTimestamp = e.target.checked;
    const display = state.showTimestamp ? 'block' : 'none';

    el.tsDesktop.style.display = display;
    el.tsSidebar.style.display = display;
    el.tsMobile.style.display = display;
}

// ========================================
// UTILS
// ========================================

function checkFileSize(file) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > MAX_SIZE_BYTES) {
        el.alertCompression.classList.remove('hidden');
        el.sizeOriginal.textContent = sizeMB + ' MB';
    } else {
        el.alertCompression.classList.add('hidden');
    }
}

function validateRatio(file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
        const ratio = img.width / img.height;
        const isLandscape = ratio > 1.2;
        const isPortrait = ratio < 0.8;

        if (state.mode === 'long' && isPortrait) {
            el.hintRatio.innerHTML = '<span class="text-yellow-400"><i class="fas fa-exclamation-triangle mr-1"></i> Warning: Vertical image. Long videos need 16:9.</span>';
        } else if (state.mode === 'shorts' && isLandscape) {
            el.hintRatio.innerHTML = '<span class="text-yellow-400"><i class="fas fa-exclamation-triangle mr-1"></i> Warning: Horizontal image. Shorts need 9:16.</span>';
        } else {
            el.hintRatio.textContent = state.mode === 'long' ? 'Recommended: 1280x720px (16:9 ratio)' : 'Recommended: 1080x1920px (9:16 ratio)';
        }
    };
}

// ========================================
// COMPRESSION
// ========================================

function handleCompress() {
    if (!state.originalFile) return;

    el.btnCompress.disabled = true;
    el.btnCompress.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Compressing...';

    setTimeout(() => {
        compressImage(state.originalFile);
    }, 50);
}

function compressImage(file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        // Max 1920px
        const MAX = 1920;
        if (w > MAX || h > MAX) {
            if (w > h) {
                h = Math.round((h * MAX) / w);
                w = MAX;
            } else {
                w = Math.round((w * MAX) / h);
                h = MAX;
            }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(blob => {
            if (blob) {
                finishCompression(blob);
            } else {
                alert('Compression failed');
                resetCompression();
            }
        }, 'image/jpeg', 0.8);
    };
}

function finishCompression(blob) {
    if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
    state.compressedUrl = URL.createObjectURL(blob);

    // Update UI
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    el.sizeCompressed.textContent = sizeMB + ' MB';
    el.btnDownload.classList.remove('hidden');

    // Update Button
    el.btnCompress.innerHTML = '<i class="fas fa-check mr-2"></i> Compressed!';
    el.btnCompress.className = "bg-white text-black font-bold px-6 py-3 rounded-lg transition-all duration-300 flex items-center cursor-default opacity-80";

    // Update ALL 5 images to show compressed version
    el.imgDesktop.src = state.compressedUrl;
    el.imgSidebar.src = state.compressedUrl;
    el.imgMobile.src = state.compressedUrl;
    el.imgFeed.src = state.compressedUrl;
    el.imgGrid1.src = state.compressedUrl;
}

function handleDownload() {
    if (!state.compressedUrl) return;

    const a = document.createElement('a');
    a.href = state.compressedUrl;
    a.download = 'compressed-thumbnail.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function resetCompression() {
    el.btnDownload.classList.add('hidden');
    el.btnCompress.disabled = false;
    el.btnCompress.innerHTML = '<i class="fas fa-compress-alt mr-2"></i> Compress Now (Smart Quality)';
    el.btnCompress.className = "bg-white text-black font-bold px-6 py-3 rounded-lg transition-all duration-300 flex items-center hover:bg-gray-200 shadow-lg";

    if (state.compressedUrl) {
        URL.revokeObjectURL(state.compressedUrl);
        state.compressedUrl = null;
    }
}

// ========================================
// CLEANUP
// ========================================
window.addEventListener('beforeunload', () => {
    if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
    if (state.compressedUrl) URL.revokeObjectURL(state.compressedUrl);
});

// ========================================
// BOOTSTRAP
// ========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
