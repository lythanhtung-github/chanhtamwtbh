const CONFIG = {
    imagePath: "assets/images/",
    galleryImages: [],
    timelineData: []
};

const tracks = [
    { name: "Những điều nhỏ nhoi", url: "./assets/music/01_NHỮNG ĐIỀU NHỎ NHOI.mp3" },
    { name: "Người gieo mầm xanh", url: "./assets/music/02_NGƯỜI GIEO MẦM XANH.mp3" },
    { name: "Điều tử tế bay xa", url: "./assets/music/03_ĐIỀU TỬ TẾ BAY XA.mp3" },
    { name: "Cứ thở đi", url: "./assets/music/04_CỨ THỞ ĐI.mp3" },
    { name: "Nấu ăn cho em", url: "./assets/music/05_NẤU ĂN CHO EM.mp3" },
    { name: "Nụ cười 18 29", url: "./assets/music/06_NỤ CƯỜI 18 20.mp3" },
    { name: "Điều tuyệt vời", url: "./assets/music/07_ĐIỀU TUYỆT VỜI.mp3" },
    { name: "Nhớ mãi chuyến đi này", url: "./assets/music/08_NHỚ MÃI CHUYẾN ĐI NÀY.mp3" },
    { name: "Hành trình của lá", url: "./assets/music/10_HÀNH TRÌNH CỦA LÁ.mp3" },
    { name: "Đón ánh mặt trời", url: "./assets/music/11_ĐÓN ÁNH MẶT TRỜI.mp3" },
];

let currentTrackIdx = 0;
let loadedIndex = 0;
const batchSize = 15;

// Quản lý Lightbox
let currentImageSet = []; 
let currentPhotoIdx = 0;
let currentItemContext = null; 

// --- EFFECT: FLOATING ICONS ---
function createFloatingIcons() {
    const container = document.getElementById('floating-icons');
    const icons = ['fa-heart', 'fa-star', 'fa-music', 'fa-cloud', 'fa-smile'];
    for (let i = 0; i < 20; i++) {
        const iconEl = document.createElement('i');
        const left = Math.random() * 100;
        const duration = 15 + Math.random() * 20;
        const delay = Math.random() * 20;
        const size = 10 + Math.random() * 25;
        iconEl.className = `fas ${icons[Math.floor(Math.random() * icons.length)]} float-icon`;
        iconEl.style.left = `${left}%`;
        iconEl.style.setProperty('--duration', `${duration}s`);
        iconEl.style.setProperty('--size', `${size}px`);
        iconEl.style.animationDelay = `${delay}s`;
        container.appendChild(iconEl);
    }
}

async function loadDataFromXML() {
    try {
        const response = await fetch('data.xml');
        if (!response.ok) throw new Error();
        const str = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(str, "text/xml");

        const galleryImgs = xmlDoc.getElementsByTagName("image");
        for (let i = 0; i < galleryImgs.length; i++) {
            CONFIG.galleryImages.push(galleryImgs[i].textContent.trim());
        }

        const timelineItems = xmlDoc.getElementsByTagName("item");
        for (let i = 0; i < timelineItems.length; i++) {
            const item = timelineItems[i];
            CONFIG.timelineData.push({
                date: item.getElementsByTagName("date")[0]?.textContent || "N/A",
                title: item.getElementsByTagName("title")[0]?.textContent || "No Title",
                description: item.getElementsByTagName("description")[0]?.textContent || "",
                images: Array.from(item.getElementsByTagName("img")).map(img => img.textContent.trim())
            });
        }
        loadGallery();
        renderTimeline();
    } catch (error) {
        useFallbackData();
    }
}

function useFallbackData() {
    CONFIG.galleryImages = Array.from({length: 20}, (_, i) => `img${i+1}.jpg`);
    CONFIG.timelineData = [
        {
            date: "14/02/2024",
            title: "Ngày Lễ Tình Nhân",
            description: "Kỷ niệm ngày đặc biệt đầu tiên cùng nhau.",
            images: ["demo1.jpg", "demo2.jpg", "demo3.jpg"]
        },
        {
            date: "01/01/2024",
            title: "Chào Năm Mới",
            description: "Bắt đầu hành trình mới rực rỡ.",
            images: ["demo4.jpg", "demo5.jpg"]
        }
    ];
    loadGallery();
    renderTimeline();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'shadow-md'));
    document.getElementById(tabName).classList.add('active');
    document.getElementById(`btn-${tabName}`).classList.add('bg-blue-600', 'text-white', 'shadow-md');
}

function loadGallery() {
    const container = document.getElementById('gallery-container');
    if (loadedIndex >= CONFIG.galleryImages.length) {
        document.getElementById('loader').innerHTML = "<span class='text-xs text-blue-300'>✨ Đã xem hết tất cả ảnh ✨</span>";
        return;
    }
    const nextBatch = CONFIG.galleryImages.slice(loadedIndex, loadedIndex + batchSize);
    nextBatch.forEach((fileName, idx) => {
        const imgCard = document.createElement('div');
        imgCard.className = `aspect-rectangle overflow-hidden rounded-xl shadow-sm bg-white group cursor-pointer border border-blue-50 relative`;
        imgCard.onclick = () => openLightbox(CONFIG.galleryImages, loadedIndex + idx - batchSize, {title: "Bộ sưu tập", date: "Gallery"});
        
        const fullPath = CONFIG.imagePath + fileName;
        imgCard.innerHTML = `
            <img src="${fullPath}" onerror="this.onerror=null; this.src='https://picsum.photos/seed/${fileName}/800/500';"
                 alt="Gallery Photo" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">
        `;
        container.appendChild(imgCard);
    });
    loadedIndex += batchSize;
}

function renderTimeline() {
    const container = document.getElementById('timeline-container');
    container.innerHTML = ""; 
    CONFIG.timelineData.forEach((item, itemIdx) => {
        const itemEl = document.createElement('div');
        itemEl.className = "relative pl-8 group";
        
        const imagesHTML = item.images.map((imgName, imgIdx) => {
            return `
            <div class="aspect-rectangle overflow-hidden rounded-xl shadow-sm hover:shadow-md transition cursor-pointer relative" 
                 onclick="openLightbox(CONFIG.timelineData[${itemIdx}].images, ${imgIdx}, CONFIG.timelineData[${itemIdx}])">
                <img src="${CONFIG.imagePath + imgName}" 
                     onerror="this.onerror=null; this.src='https://picsum.photos/seed/${imgName}/800/500';" 
                     class="w-full h-full object-cover hover:scale-105 transition duration-500">
            </div>`;
        }).join('');

        itemEl.innerHTML = `
            <div class="timeline-dot top-2 group-hover:scale-125 transition"></div>
            <div class="mb-4">
                <div class="flex items-center space-x-3 mb-1">
                    <span class="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">${item.date}</span>
                    <h3 class="text-xl font-bold text-gray-800">${item.title}</h3>
                </div>
                <p class="text-sm text-gray-600 italic">${item.description}</p>
            </div>
            <div class="timeline-grid">
                ${imagesHTML}
            </div>
        `;
        container.appendChild(itemEl);
    });
}

function openLightbox(imgSet, index, context) {
    currentImageSet = imgSet;
    currentPhotoIdx = index;
    currentItemContext = context;
    updateLightboxContent();
    document.getElementById('lightbox').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function nextImage() {
    if (currentPhotoIdx < currentImageSet.length - 1) {
        currentPhotoIdx++;
        updateLightboxContent();
    } else {
        const img = document.getElementById('lightbox-img');
        img.classList.add('translate-x-2');
        setTimeout(() => img.classList.remove('translate-x-2'), 100);
    }
}

function prevImage() {
    if (currentPhotoIdx > 0) {
        currentPhotoIdx--;
        updateLightboxContent();
    }
}

function updateLightboxContent() {
    const fileName = currentImageSet[currentPhotoIdx];
    const imgEl = document.getElementById('lightbox-img');
    imgEl.src = CONFIG.imagePath + fileName;
    imgEl.onerror = () => { imgEl.src = `https://picsum.photos/seed/${fileName}/1200/800`; };

    document.getElementById('caption-title').innerText = currentItemContext.title;
    document.getElementById('caption-date').innerText = currentItemContext.date;
    document.getElementById('caption-index').innerText = `Ảnh ${currentPhotoIdx + 1} / ${currentImageSet.length}`;
}

window.addEventListener('keydown', (e) => {
    if (document.getElementById('lightbox').style.display === 'flex') {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeLightbox();
    }
});

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && document.getElementById('gallery').classList.contains('active')) {
        loadGallery();
    }
}, { threshold: 0.1 });
observer.observe(document.getElementById('loader'));

const audio = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const musicIcon = document.getElementById('music-icon');
const trackLabel = document.getElementById('track-name');

function updateTrackUI() {
    trackLabel.innerText = tracks[currentTrackIdx].name;
    if (!audio.paused) {
        musicIcon.className = 'fas fa-pause text-lg';
        musicBtn.classList.add('spinning');
    } else {
        musicIcon.className = 'fas fa-play text-lg ml-1';
        musicBtn.classList.remove('spinning');
    }
}

function toggleMusic() {
    if (audio.paused) {
        if (!audio.src) changeTrack(0);
        audio.play().catch(() => {});
    } else {
        audio.pause();
    }
    updateTrackUI();
}

function changeTrack(dir) {
    currentTrackIdx = (currentTrackIdx + dir + tracks.length) % tracks.length;
    document.getElementById('audio-source').src = tracks[currentTrackIdx].url;
    audio.load();
    audio.play().catch(() => {});
    updateTrackUI();
}

window.onload = () => {
    loadDataFromXML();
    createFloatingIcons();
    trackLabel.innerText = tracks[currentTrackIdx].name;
};