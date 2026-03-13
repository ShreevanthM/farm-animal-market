// Mock Data
let defaultLivestockData = [
  {
    id: 1,
    type: 'cow',
    breed: 'HF (Holstein Friesian)',
    gender: 'female',
    lifeStage: 'Milking cow',
    milkProduction: 18,
    age: 3.5,
    price: 45000,
    location: 'Baramati, Pune',
    description: 'Healthy cow, current daily milk yield is around 18 liters. Very calm nature and fully vaccinated.',
    image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 2).toISOString(),
    seller: 'Ramesh Patil',
    phone: '+919876543210'
  },
  {
    id: 2,
    type: 'goat',
    breed: 'Boer',
    gender: 'male',
    weight: 45,
    age: 1.2,
    price: 12000,
    location: 'Shirur, Pune',
    description: 'Male goat, excellent health and diet. Great for breeding purposes.',
    image: 'https://images.unsplash.com/photo-1524024973431-2ad0b889eb25?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 5).toISOString(),
    seller: 'Suresh Kumar',
    phone: '+918765432109'
  },
  {
    id: 3,
    type: 'sheep',
    breed: 'Deccani',
    gender: 'female',
    bulkOrder: true,
    quantity: 10,
    age: 2,
    price: 8500, // per animal
    location: 'Satara Rural',
    description: 'Yields good quality wool. Disease free and active. Selling as a flock of 10.',
    image: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 1).toISOString(),
    seller: 'Vitthal Mane',
    phone: '+917654321098'
  },
  {
    id: 4,
    type: 'buffalo',
    breed: 'Murrah',
    gender: 'female',
    lifeStage: 'Pregnant cow',
    age: 4,
    price: 55000,
    location: 'Kolhapur',
    description: 'Healthy pregnant Murrah buffalo.',
    image: 'https://images.unsplash.com/photo-1618018353326-8c4608c1d530?auto=format&fit=crop&q=80&w=800&h=600',
    dateAdded: new Date(Date.now() - 86400000 * 10).toISOString(),
    seller: 'Ananda',
    phone: '+916543210987'
  }
];

let livestockData = defaultLivestockData;
try {
  const savedData = localStorage.getItem('livestockData');
  if (savedData) {
    livestockData = JSON.parse(savedData);
  }
} catch (e) {
  console.error("Failed to parse saved data", e);
}

function saveLivestockData() {
  try {
    localStorage.setItem('livestockData', JSON.stringify(livestockData));
  } catch (e) {
    console.error("Failed to save data. Image sizes might be too large.", e);
    alert("Warning: Could not save data locally. You might have uploaded media that is too large.");
  }
}

// App State
const state = {
  currentView: 'home',
  activeFilter: 'all',
  searchQuery: '',
  editingId: null
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
  const typeSelect = document.getElementById('animalType');
  const breedSelect = document.getElementById('breed');
  const fileInput = document.getElementById('animalMedia');
  const previewContainer = document.getElementById('mediaPreviewContainer');
  let selectedMedia = [];

  const breeds = {
    cow: ['HF (Holstein Friesian)', 'Jersey', 'Gir', 'Malnad Gidda', 'Hallikar', 'Local breed'],
    buffalo: ['Murrah', 'Local buffalo'],
    goat: ['Boer', 'Osmanabadi', 'Jamunapari', 'Sirohi', 'Local goat'],
    sheep: ['Mandya', 'Bellary', 'Deccani', 'Local sheep']
  };

  const lifeStages = {
    cow: ['Calf (0-3 months)', 'Young calf (3-12 months)', 'Heifer (1-3 years)', 'Pregnant cow', 'Milking cow'],
    buffalo: ['Calf (0-3 months)', 'Young calf (3-12 months)', 'Heifer (1-3 years)', 'Pregnant cow', 'Milking cow']
  };

  function updateDynamicFields() {
    if (!typeSelect) return;
    const type = typeSelect.value;
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : 'female';
    const isBulk = document.getElementById('bulkOrder').checked;

    // hide all dynamic fields first
    document.querySelectorAll('.dynamic-field').forEach(el => el.classList.add('hidden'));

    if (type === 'eggs') {
       document.getElementById('fg-bulk').classList.remove('hidden');
       if (isBulk) document.getElementById('fg-quantity').classList.remove('hidden');
       return;
    }

    document.getElementById('fg-gender').classList.remove('hidden');

    if (type === 'cow' || type === 'buffalo') {
       document.getElementById('fg-breed').classList.remove('hidden');
       document.getElementById('fg-age').classList.remove('hidden');
       
       if (gender === 'female') {
          document.getElementById('fg-lifestage').classList.remove('hidden');
          document.getElementById('fg-milk').classList.remove('hidden');
          
          const lsSelect = document.getElementById('lifeStage');
          lsSelect.innerHTML = lifeStages[type].map(s => `<option value="${s}">${s}</option>`).join('');
       } else {
          document.getElementById('fg-weight').classList.remove('hidden');
       }

       breedSelect.innerHTML = breeds[type].map(b => `<option value="${b}">${b}</option>`).join('');
       
    } else if (type === 'goat' || type === 'sheep') {
       document.getElementById('fg-breed').classList.remove('hidden');
       document.getElementById('fg-age').classList.remove('hidden');
       document.getElementById('fg-weight').classList.remove('hidden');
       document.getElementById('fg-bulk').classList.remove('hidden');
       if (isBulk) document.getElementById('fg-quantity').classList.remove('hidden');

       breedSelect.innerHTML = breeds[type].map(b => `<option value="${b}">${b}</option>`).join('');
       
    } else if (type === 'chicken') {
       document.getElementById('fg-chicken-type').classList.remove('hidden');
       document.getElementById('fg-age').classList.remove('hidden');
       document.getElementById('fg-bulk').classList.remove('hidden');
       if (isBulk) document.getElementById('fg-quantity').classList.remove('hidden');
       
    } else if (type === 'dog') {
       document.getElementById('fg-breed-text').classList.remove('hidden');
       document.getElementById('fg-age').classList.remove('hidden');
    }
  }

  // Listeners
  if (typeSelect) {
    typeSelect.addEventListener('change', updateDynamicFields);
    document.querySelectorAll('input[name="gender"]').forEach(rad => rad.addEventListener('change', updateDynamicFields));
    document.getElementById('bulkOrder').addEventListener('change', updateDynamicFields);
    updateDynamicFields();
  }

  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      if (this.files && this.files.length > 0) {
        Array.from(this.files).forEach(file => {
          const reader = new FileReader();
          reader.onload = function(e) {
            const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mov)$/i);
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
        this.value = '';
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

  // Populate form if editing
  if (state.editingId && form) {
     const animal = livestockData.find(a => a.id === state.editingId);
     if (animal) {
       document.getElementById('formTitle').innerText = "Edit Listing";
       document.getElementById('formSubtitle').innerText = "Update your livestock details";
       document.getElementById('btnCancelEdit').classList.remove('hidden');
       document.getElementById('btnSubmitListing').innerHTML = '<i data-lucide="save"></i> Update Listing';
       
       document.getElementById('editListingId').value = animal.id;
       typeSelect.value = animal.type;
       if (animal.gender) {
         const gr = document.querySelector(`input[name="gender"][value="${animal.gender}"]`);
         if (gr) gr.checked = true;
       }
       document.getElementById('bulkOrder').checked = animal.bulkOrder || false;
       updateDynamicFields();

       // Fill values after fields are theoretically shown
       if (animal.breed && (animal.type === 'cow' || animal.type === 'buffalo' || animal.type === 'goat' || animal.type === 'sheep')) {
           breedSelect.value = animal.breed;
       } else if (animal.breed && animal.type === 'chicken') {
           document.getElementById('chickenType').value = animal.breed;
       } else if (animal.breed && animal.type === 'dog') {
           document.getElementById('breedText').value = animal.breed;
       }
       
       if (animal.lifeStage) document.getElementById('lifeStage').value = animal.lifeStage;
       if (animal.age) document.getElementById('age').value = animal.age;
       if (animal.weight) document.getElementById('weight').value = animal.weight;
       if (animal.milkProduction) document.getElementById('milkProduction').value = animal.milkProduction;
       if (animal.quantity) document.getElementById('quantity').value = animal.quantity;
       if (animal.price) document.getElementById('price').value = animal.price;
       if (animal.location) document.getElementById('location').value = animal.location;
       if (animal.description) document.getElementById('description').value = animal.description;
       
       selectedMedia = animal.media || [];
       if (!animal.media && animal.image) selectedMedia = [{type: 'image', url: animal.image}];
       renderMediaPreviews();
     }
  } else if (form) {
     document.getElementById('formTitle').innerText = "List an Animal";
     document.getElementById('formSubtitle').innerText = "Fill details to sell your livestock";
     document.getElementById('btnCancelEdit').classList.add('hidden');
     document.getElementById('btnSubmitListing').innerText = "Submit Listing";
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const type = typeSelect.value;
      const gender = document.querySelector('input[name="gender"]:checked').value;
      let finalBreed = '';
      if (type === 'cow' || type === 'buffalo' || type === 'goat' || type === 'sheep') finalBreed = breedSelect.value;
      else if (type === 'chicken') finalBreed = document.getElementById('chickenType').value;
      else if (type === 'dog') finalBreed = document.getElementById('breedText').value;

      const editId = document.getElementById('editListingId').value;
      
      const newAnimal = {
        id: editId ? parseInt(editId) : Date.now(),
        type: type,
        breed: finalBreed || type,
        gender: type === 'eggs' ? undefined : gender,
        lifeStage: (type === 'cow' || type === 'buffalo') && gender === 'female' ? document.getElementById('lifeStage').value : undefined,
        milkProduction: (type === 'cow' || type === 'buffalo') && gender === 'female' ? parseFloat(document.getElementById('milkProduction').value) : undefined,
        age: parseFloat(document.getElementById('age').value),
        weight: parseFloat(document.getElementById('weight').value) || undefined,
        bulkOrder: document.getElementById('bulkOrder').checked,
        quantity: document.getElementById('bulkOrder').checked ? parseInt(document.getElementById('quantity').value) : undefined,
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

      if (!newAnimal.media[0].url) newAnimal.media[0].url = 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800&h=600';
      newAnimal.image = newAnimal.media[0].url;

      if (editId) {
        const idx = livestockData.findIndex(a => a.id === parseInt(editId));
        if (idx !== -1) {
           newAnimal.dateAdded = livestockData[idx].dateAdded; // preserve date
           livestockData[idx] = newAnimal;
        }
        state.editingId = null; // reset
      } else {
        livestockData.unshift(newAnimal);
      }
      
      saveLivestockData();
      app.filterAndNavigate('all');
      alert(editId ? "Listing updated successfully!" : "Listing added successfully!"); 
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

  const mediaList = animal.media || [{ type: 'image', url: animal.image }];
  const hasMultiple = mediaList.length > 1;

  return `
    <div class="animal-card fade-in" onclick="app.openDetail(${animal.id})">
      <div class="card-image-wrap">
        ${getMediaHTML(animal, true)}
        <div class="card-badge">${animal.type.charAt(0).toUpperCase() + animal.type.slice(1)}</div>
        ${hasMultiple ? '<div class="card-badge" style="top: auto; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.2);"><i data-lucide="layers" style="width: 12px; height: 12px; margin-right: 4px; vertical-align: middle;"></i>Multi</div>' : ''}
      </div>
      <div class="card-content">
        <div class="card-title">
          <span>${animal.breed}</span>
          ${animal.seller === 'Current User' ? '<i data-lucide="check-circle" style="color: var(--success); width: 16px; height: 16px;" aria-label="Verified"></i>' : ''}
        </div>
        <div class="card-price">${animal.bulkOrder ? formatCurrency(animal.price) + ' <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">x ' + (animal.quantity || 1) + '</span>' : formatCurrency(animal.price)}</div>
        <div style="margin: 8px 0; border-top: 1px dotted var(--border);"></div>
        <div class="card-details">
          <div class="detail-item">
            <i data-lucide="map-pin"></i>
            <span>${animal.location.split(',')[0]}</span>
          </div>
          <div class="detail-item" style="margin-left: auto;">
            <i data-lucide="calendar"></i>
            <span>${animal.age ? animal.age + ' Yrs' : (animal.weight ? animal.weight + ' kg' : 'N/A')}</span>
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
    <div class="detail-carousel-item" style="min-width: 100%; height: 300px; flex-shrink: 0; scroll-snap-align: start; position: relative; background: #000;">
       ${media.type === 'video' 
          ? `<video src="${media.url}" controls playsinline style="width: 100%; height: 100%; object-fit: contain;"></video>`
          : `<img src="${media.url}" alt="${animal.breed}" style="width: 100%; height: 100%; object-fit: cover;">`
       }
    </div>
  `).join('');

  const dotsHTML = mediaList.length > 1 ? `
    <div class="carousel-dots" id="carouselDots" style="position: absolute; bottom: 12px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; pointer-events: none;">
      ${mediaList.map((_, i) => `<div class="dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${i === 0 ? '#fff' : 'rgba(255,255,255,0.4)'}; box-shadow: 0 1px 3px rgba(0,0,0,0.5); transition: background 0.3s;"></div>`).join('')}
    </div>
  ` : '';

  const arrowsHTML = mediaList.length > 1 ? `
    <button class="carousel-arrow prev" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.4); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;"><i data-lucide="chevron-left"></i></button>
    <button class="carousel-arrow next" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.4); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10;"><i data-lucide="chevron-right"></i></button>
  ` : '';

  detailModalBody.innerHTML = `
    <div style="position: relative; width: 100%; background: #000;">
      <div class="detail-hero" id="detailCarousel" style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth;">
        ${mediaCarouselHTML}
      </div>
      ${arrowsHTML}
      ${dotsHTML}
    </div>
    <div class="detail-header">
      <div class="detail-title-row">
        <div class="detail-title">
          ${animal.breed}
          ${animal.seller === 'Current User' ? '<i data-lucide="check-circle" style="color: var(--success); width: 22px; height: 22px; display: inline-block; vertical-align: middle;"></i>' : ''}
        </div>
        <div class="detail-price">
           ${formatCurrency(animal.price)}
        </div>
      </div>
      <div class="detail-location">
        <i data-lucide="map-pin"></i> ${animal.location}
      </div>
      ${animal.bulkOrder ? `<div style="background: rgba(46, 125, 50, 0.1); color: var(--primary-dark); padding: 8px 12px; border-radius: var(--radius-md); font-weight: 600; margin-top: 8px; display: inline-flex; align-items: center; gap: 8px;"><i data-lucide="package" style="width: 18px;"></i> Bulk Order: ${animal.quantity} Available</div>` : ''}
    </div>
    
    <div class="detail-stats" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
      ${animal.age ? `
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="calendar"></i></div>
        <div class="stat-info">
          <span class="stat-label">Age</span>
          <span class="stat-value">${animal.age} Years</span>
        </div>
      </div>` : ''}
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="tag"></i></div>
        <div class="stat-info">
          <span class="stat-label">Category</span>
          <span class="stat-value" style="text-transform: capitalize;">${animal.type}</span>
        </div>
      </div>
      ${animal.gender ? `
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="users"></i></div>
        <div class="stat-info">
          <span class="stat-label">Gender</span>
          <span class="stat-value" style="text-transform: capitalize;">${animal.gender}</span>
        </div>
      </div>` : ''}
      ${animal.lifeStage ? `
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="activity"></i></div>
        <div class="stat-info">
          <span class="stat-label">Life Stage</span>
          <span class="stat-value" style="text-transform: capitalize;">${animal.lifeStage}</span>
        </div>
      </div>` : ''}
      ${animal.milkProduction ? `
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="droplet"></i></div>
        <div class="stat-info">
          <span class="stat-label">Milk / Day</span>
          <span class="stat-value" style="text-transform: capitalize;">${animal.milkProduction} L</span>
        </div>
      </div>` : ''}
      ${animal.weight ? `
      <div class="stat-box">
        <div class="stat-icon"><i data-lucide="scale"></i></div>
        <div class="stat-info">
          <span class="stat-label">Weight</span>
          <span class="stat-value" style="text-transform: capitalize;">${animal.weight} kg</span>
        </div>
      </div>` : ''}
    </div>

    <div class="detail-section">
      <h3>About this animal</h3>
      <p>${animal.description || 'No additional details provided.'}</p>
    </div>
    
    <!-- Edit Button for Current User -->
    ${animal.seller === 'Current User' ? `
    <div class="detail-section" style="padding-bottom: 0;">
      <button class="btn-secondary ripple" style="width: 100%; justify-content: center; border: 2px solid var(--primary); color: var(--primary); background: transparent;" onclick="app.editListing(${animal.id})">
        <i data-lucide="edit"></i> Edit Listing
      </button>
    </div>
    ` : ''}

    <div class="detail-section" style="margin-top: var(--space-lg);">
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
      <button class="btn-secondary flex-1" style="flex: 1; border-color: var(--text-muted);" onclick="window.location.href='tel:${animal.phone}'">
        <i data-lucide="phone"></i> Call
      </button>
      <button class="btn-primary flex-2" style="background: #25D366;" onclick="window.open('https://wa.me/${animal.phone.replace(/[^0-9]/g, '')}', '_blank')">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
        WhatsApp
      </button>
    </div>
  `;

  // Render icons inside modal
  lucide.createIcons({
    root: detailModalBody
  });

  // Carousel Navigation Logic
  if (mediaList.length > 1) {
    const carousel = document.getElementById('detailCarousel');
    const btnPrev = detailModalBody.querySelector('.carousel-arrow.prev');
    const btnNext = detailModalBody.querySelector('.carousel-arrow.next');
    const dots = detailModalBody.querySelectorAll('.dot');
    
    const updateDots = () => {
      const scrollLeft = carousel.scrollLeft;
      const index = Math.round(scrollLeft / carousel.offsetWidth);
      dots.forEach((dot, i) => {
        dot.style.background = i === index ? '#fff' : 'rgba(255,255,255,0.4)';
      });
    };

    carousel.addEventListener('scroll', updateDots);
    
    btnNext.addEventListener('click', () => {
      carousel.scrollBy({ left: carousel.offsetWidth, behavior: 'smooth' });
    });
    
    btnPrev.addEventListener('click', () => {
      carousel.scrollBy({ left: -carousel.offsetWidth, behavior: 'smooth' });
    });
  }

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
    if (viewName !== 'add') state.editingId = null; // clean up edit state if leaving
    renderView(viewName);
  },
  filterAndNavigate: (category) => {
    state.activeFilter = category;
    state.searchQuery = ''; // Reset search
    app.navigate('listings');
  },
  openDetail: (id) => {
    openDetailModal(id);
  },
  editListing: (id) => {
    state.editingId = id;
    closeDetailModal();
    setTimeout(() => {
      app.navigate('add');
    }, 300); // wait for modal transition
  }
};

// Start application
document.addEventListener('DOMContentLoaded', initApp);
