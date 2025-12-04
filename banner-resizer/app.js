// ========================================
// YOUTUBE BANNER RESIZER LOGIC
// ========================================

const el = {
    bannerInput: document.getElementById('banner-input'),
    previewContainer: document.getElementById('preview-container'),
    canvas: document.getElementById('banner-canvas'),
    downloadSection: document.getElementById('download-section'),
    downloadBtn: document.getElementById('download-btn')
};

const ctx = el.canvas.getContext('2d');

// YouTube Banner Dimensions
const BANNER = {
    width: 2560,
    height: 1440
};

const SAFE_ZONES = {
    tv: { x: 0, y: 0, width: 2560, height: 1440 },
    desktop: { x: 352, y: 508, width: 1855, height: 423 },
    mobile: { x: 507, y: 508, width: 1546, height: 423 }
};

let uploadedImage = null;

// Init
function init() {
    el.bannerInput.addEventListener('change', handleUpload);
    el.downloadBtn.addEventListener('click', downloadBanner);
    console.log('Banner Resizer Initialized');
}

// Handle Upload
function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            renderCanvas();
            el.previewContainer.classList.remove('hidden');
            el.downloadSection.classList.remove('hidden');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Render Canvas
function renderCanvas() {
    if (!uploadedImage) return;

    // Set canvas size
    el.canvas.width = BANNER.width;
    el.canvas.height = BANNER.height;

    // Draw uploaded image (scaled to fit)
    const scale = Math.max(
        BANNER.width / uploadedImage.width,
        BANNER.height / uploadedImage.height
    );
    const scaledWidth = uploadedImage.width * scale;
    const scaledHeight = uploadedImage.height * scale;
    const x = (BANNER.width - scaledWidth) / 2;
    const y = (BANNER.height - scaledHeight) / 2;

    ctx.drawImage(uploadedImage, x, y, scaledWidth, scaledHeight);

    // Draw Safe Zones
    drawSafeZone(SAFE_ZONES.tv, 'rgba(255, 0, 0, 0.1)', 'rgba(255, 0, 0, 0.5)', 'TV');
    drawSafeZone(SAFE_ZONES.desktop, 'rgba(0, 100, 255, 0.15)', 'rgba(0, 100, 255, 0.7)', 'Desktop');
    drawSafeZone(SAFE_ZONES.mobile, 'rgba(0, 255, 0, 0.2)', 'rgba(0, 255, 0, 0.8)', 'Mobile Safe');
}

// Draw Safe Zone
function drawSafeZone(zone, fillColor, strokeColor, label) {
    // Fill
    ctx.fillStyle = fillColor;
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

    // Border
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

    // Label
    ctx.fillStyle = strokeColor;
    ctx.font = 'bold 40px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, zone.x + zone.width / 2, zone.y + zone.height / 2);
}

// Download Banner
function downloadBanner() {
    if (!uploadedImage) return;

    // Create clean canvas without overlays
    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = BANNER.width;
    cleanCanvas.height = BANNER.height;
    const cleanCtx = cleanCanvas.getContext('2d');

    // Draw image only
    const scale = Math.max(
        BANNER.width / uploadedImage.width,
        BANNER.height / uploadedImage.height
    );
    const scaledWidth = uploadedImage.width * scale;
    const scaledHeight = uploadedImage.height * scale;
    const x = (BANNER.width - scaledWidth) / 2;
    const y = (BANNER.height - scaledHeight) / 2;

    cleanCtx.drawImage(uploadedImage, x, y, scaledWidth, scaledHeight);

    // Download
    cleanCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'youtube-banner-2560x1440.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// Start
document.addEventListener('DOMContentLoaded', init);
