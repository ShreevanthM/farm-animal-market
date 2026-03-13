// Mock Data
let livestockData = [
  {
    id: 1,
    type: 'cow',
    breed: 'Holstein Friesian',
    age: 3.5,
    price: 45000,
    location: 'Baramati, Pune',
    description: 'Healthy cow, current daily milk yield is around 18 liters. Very calm nature and fully vaccinated.',
    image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    seller: 'Ramesh Patil',
    phone: '+91 9876543210'
  },
  {
    id: 2,
    type: 'goat',
    breed: 'Boer',
    age: 1.2,
    price: 12000,
    location: 'Shirur, Pune',
    description: 'Male goat, excellent health and diet. Great for breeding purposes.',
    image: 'https://images.unsplash.com/photo-1524024973431-2ad0b889eb25?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 5).toISOString(),
    seller: 'Suresh Kumar',
    phone: '+91 8765432109'
  },
  {
    id: 3,
    type: 'sheep',
    breed: 'Deccani',
    age: 2,
    price: 8500,
    location: 'Satara Rural',
    description: 'Yields good quality wool. Disease free and active.',
    image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 1).toISOString(),
    seller: 'Vitthal Mane',
    phone: '+91 7654321098'
  },
  {
    id: 4,
    type: 'cow',
    breed: 'Gir',
    age: 4,
    price: 55000,
    location: 'Kolhapur',
    description: 'A2 milk producing Gir cow. Gentle, recently gave birth to a healthy calf.',
    image: 'https://images.unsplash.com/photo-1596733430284-f743727520d2?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 10).toISOString(),
    seller: 'Ananda',
    phone: '+91 6543210987'
  }
];

// App State
const state = {
  currentView: 'home',
  activeFilter: 'all',
  searchQuery: ''
};

// DOM Elements
const appContent = document.getElementById('app-content');
const detailModal = document.getElementById('detailModal');
const detailModalBody = document.getElementById('detailModalBody');
const closeDetailBtn = document.getElementById('closeDetail');

// View Templates Cache
let templates = {};

// Initialize App
function initApp() {
  templates = {
    home: document.getElementById('view-home').innerHTML,
    listings: document.getElementById('view-listings').innerHTML,
    add: document.getElementById('view-add').innerHTML,
    messages: document.getElementById('view-messages').innerHTML,
    saved: document.getElementById('view-saved').innerHTML,
  };
  lucide.createIcons(); // Initialize icons
  renderView(state.currentView);
  setupNavigation();
  setupModal();
}

// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Navigation System
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.target;
      app.navigate(target);
    });
  });
}

function updateNavUI(target) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.dataset.target === target) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Render Views
function renderView(viewName) {
  appContent.innerHTML = templates[viewName] || '<h1>View Not Found</h1>';
  updateNavUI(viewName);
  
  // Re-initialize icons for new DOM
  lucide.createIcons();
  
  // Specific view scripts
  if (viewName === 'home') {
    renderRecentListings();
    setupHomeListeners();
  } else if (viewName === 'listings') {
    renderAllListings();
    setupListingsListeners();
  } else if (viewName === 'add') {
    setupAddForm();
  }
  
  window.scrollTo(0, 0);
}

// Home View Logic
function setupHomeListeners() {
  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        state.searchQuery = e.target.value;
        app.navigate('listings');
      }
    });
  }
}

function renderRecentListings() {
  const container = document.getElementById('recentContainer');
  if (!container) return;
  
  // Get 5 most recent
  const recent = [...livestockData]
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 5);
    
  container.innerHTML = recent.map(animal => createAnimalCard(animal)).join('');
}

// Listings View Logic
function setupListingsListeners() {
  const filterChips = document.querySelectorAll('#listingsFilters .chip');
  
  filterChips.forEach(chip => {
    // Set initial active state based on current state
    if (chip.dataset.filter === state.activeFilter) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }

    chip.addEventListener('click', (e) => {
      filterChips.forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      state.activeFilter = e.target.dataset.filter;
      renderAllListings();
    });
  });
}

function renderAllListings() {
  const container = document.getElementById('allListingsContainer');
  if (!container) return;
  
  let filtered = livestockData;
  
  // Apply category filter
  if (state.activeFilter !== 'all') {
    filtered = filtered.filter(a => a.type === state.activeFilter);
  }
  
  // Apply search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(a => 
      a.breed.toLowerCase().includes(q) || 
      a.location.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q)
    );
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="search-x" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 16px;"></i>
        <h3>No livestock found</h3>
        <p>Try adjusting your filters or search terms.</p>
        <button onclick="app.filterAndNavigate('all')" class="btn-primary" style="margin-top: 16px; display: inline-flex;">Clear Filters</button>
      </div>`;
    lucide.createIcons();
    return;
  }
  
  container.innerHTML = filtered.map(animal => createAnimalCard(animal)).join('');
  lucide.createIcons(); // For newly rendered cards
}

// Add Form Logic
function setupAddForm() {
  const form = document.getElementById('addAnimalForm');
  const fileInput = document.getElementById('animalMedia');
  const previewContainer = document.getElementById('mediaPreviewContainer');
  let selectedMedia = [];

  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      if (this.files && this.files.length > 0) {
        Array.from(this.files).forEach(file => {
          const reader = new FileReader();
          reader.onload = function(e) {
            const isVideo = file.type.startsWith('video/');
            const mediaItem = {
              id: Date.now() + Math.random().toString(36).substr(2, 9),
              type: isVideo ? 'video' : 'image',
              url: e.target.result
            };
            selectedMedia.push(mediaItem);
            renderMediaPreviews();
          }
          reader.readAsDataURL(file);
        });
        this.value = ''; // Reset input to allow re-selection
      }
    });
  }

  function renderMediaPreviews() {
    if (selectedMedia.length > 0) {
      previewContainer.classList.remove('hidden');
      previewContainer.innerHTML = selectedMedia.map(media => `
        <div class="media-preview-item fade-in">
          ${media.type === 'video' 
            ? `<video src="${media.url}" autoplay loop muted playsinline></video>`
            : `<img src="${media.url}" alt="Preview">`
          }
          <button type="button" class="remove-media" data-id="${media.id}">
            <i data-lucide="x" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      `).join('');
      
      previewContainer.querySelectorAll('.remove-media').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          selectedMedia = selectedMedia.filter(m => m.id !== id);
          renderMediaPreviews();
        });
      });
      lucide.createIcons({ root: previewContainer });
    } else {
      previewContainer.classList.add('hidden');
      previewContainer.innerHTML = '';
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newAnimal = {
        id: Date.now(),
        type: document.querySelector('input[name="animalType"]:checked').value,
        breed: document.getElementById('breed').value,
        age: parseFloat(document.getElementById('age').value),
        price: parseFloat(document.getElementById('price').value),
        location: document.getElementById('location').value,
        description: document.getElementById('description').value,
        media: selectedMedia.length > 0 ? [...selectedMedia] : [{
          type: 'image', 
          url: 'https://images.unsplash.com/photo-1596733430284-f743727520d2?auto=format&fit=crop&q=80&w=800&h=600'
        }],
        dateAdded: new Date().toISOString(),
        seller: 'Current User',
        phone: '+91 9999999999'
      };

      livestockData.unshift(newAnimal);
      app.filterAndNavigate('all');
      alert("Listing added successfully!"); 
    });
  }
}

// Components
function getMediaHTML(animal, isThumb = false) {
  const mediaList = animal.media || [{ type: 'image', url: animal.image }];
  const media = mediaList[0];
  if (!media) return '';
  if (media.type === 'video') {
    return `<video src="${media.url}" ${isThumb ? 'muted loop playsinline autoplay' : 'controls'} style="width: 100%; height: 100%; object-fit: cover;"></video>`;
  }
  return `<img src="${media.url}" alt="${animal.breed}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">`;
}

function createAnimalCard(animal) {
  const typeIcons = {
    cow: '<i data-lucide="tractor"></i>', // fallback icon
    goat: '<i data-lucide="scissors"></i>',
    sheep: '<i data-lucide="cloud"></i>'
  };

  return `
    <div class="animal-card fade-in" onclick="app.openDetail(${animal.id})">
      <div class="card-image-wrap">
        ${getMediaHTML(animal, true)}
        <div class="card-badge">${animal.type.charAt(0).toUpperCase() + animal.type.slice(1)}</div>
      </div>
      <div class="card-content">
        <div class="card-title">
          <span>${animal.breed}</span>
        </div>
        <div class="card-price">${formatCurrency(animal.price)}</div>
        <div style="margin: 8px 0; border-top: 1px dotted var(--border);"></div>
        <div class="card-details">
          <div class="detail-item">
            <i data-lucide="map-pin"></i>
            <span>${animal.location.split(',')[0]}</span>
          </div>
          <div class="detail-item" style="margin-left: auto;">
            <i data-lucide="calendar"></i>
            <span>${animal.age} Yrs</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Modal Logic
function setupModal() {
  closeDetailBtn.addEventListener('click', closeDetailModal);
  
  // Close on backdrop click
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeDetailModal();
    }
  });
}

function openDetailModal(id) {
  const animal = livestockData.find(a => a.id === id);
  if (!animal) return;

  const mediaList = animal.media || [{ type: 'image', url: animal.image }];
  const mediaCarouselHTML = mediaList.map(media => `
    <div class="detail-carousel-item" style="min-width: 100%; height: 300px; flex-shrink: 0; scroll-snap-align: start;">
       ${media.type === 'video' 
          ? `<video src="${media.url}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>`
          : `<img src="${media.url}" alt="${animal.breed}" style="width: 100%; height: 100%; object-fit: cover;">`
       }
    </div>
  `).join('');

  detailModalBody.innerHTML = `
    <div class="detail-hero" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;">
      ${mediaCarouselHTML}
    </div>
    ${mediaList.length > 1 ? `<div style="text-align: center; font-size: 0.8rem; padding: 4px; color: var(--text-muted); background: var(--surface);">Swipe for more photos/videos</div>` : ''}
    <div class="detail-header">
      <div class="detail-title-row">
        <div class="detail-title">${animal.breed}</div>
        <div class="detail-price">${formatCurrency(animal.price)}</div>
      </div>
      <div class="detail-location">
        <i data-lucide="map-pin"></i> ${animal.location}
      </div>
    </div>
    
    <div class="detail-stats">
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="calendar"></i></div>
        <div class="stat-info">
          <span class="stat-label">Age</span>
          <span class="stat-value">${animal.age} Years</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="tag"></i></div>
        <div class="stat-info">
          <span class="stat-label">Category</span>
          <span class="stat-value" style="text-transform: capitalize;">${animal.type}</span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3>About this animal</h3>
      <p>${animal.description || 'No additional details provided.'}</p>
    </div>
    
    <div class="detail-section">
      <h3>Seller Details</h3>
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
        <div style="width: 48px; height: 48px; background: var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <i data-lucide="user"></i>
        </div>
        <div>
          <div style="font-weight: 600;">${animal.seller}</div>
          <div style="color: var(--text-muted); font-size: 0.9rem;">Member since 2024</div>
        </div>
      </div>
    </div>

    <div class="contact-action">
      <button class="btn-secondary" onclick="alert('Saving feature to be implemented')">
        <i data-lucide="bookmark"></i>
      </button>
      <button class="btn-primary flex-2" onclick="window.location.href='tel:${animal.phone}'">
        <i data-lucide="phone"></i>
        Contact Owner
      </button>
    </div>
  `;

  // Render icons inside modal
  lucide.createIcons({
    root: detailModalBody
  });

  detailModal.classList.remove('overlay-hidden');
  // Small delay to allow display:block to apply before adding transition class
  setTimeout(() => {
    detailModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }, 10);
}

function closeDetailModal() {
  detailModal.classList.remove('show');
  document.body.style.overflow = '';
  
  // Wait for transition to finish
  setTimeout(() => {
    detailModal.classList.add('overlay-hidden');
  }, 300);
}

// Global App API
const app = {
  navigate: (viewName) => {
    state.currentView = viewName;
    renderView(viewName);
  },
  filterAndNavigate: (category) => {
    state.activeFilter = category;
    state.searchQuery = ''; // Reset search
    app.navigate('listings');
  },
  openDetail: (id) => {
    openDetailModal(id);
  }
};

// Start application
document.addEventListener('DOMContentLoaded', initApp);
