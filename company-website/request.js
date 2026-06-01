(() => {
  const form = document.getElementById('request-form');
  const submitBtn = document.getElementById('submit-btn');
  const errorMsg = document.getElementById('error-msg');
  const successState = document.getElementById('success-state');
  const logoInput = document.getElementById('logo-input');
  const logoPreview = document.getElementById('logo-preview');
  const logoPreviewImg = document.getElementById('logo-preview-img');
  const logoRemove = document.getElementById('logo-remove');
  const addressInput = document.getElementById('address-input');
  const searchBtn = document.getElementById('search-btn');
  const locateBtn = document.getElementById('locate-btn');
  const coordsDisplay = document.getElementById('coords-display');
  const mapErrorEl = document.getElementById('map-error');

  let logoBase64 = null;
  let map, marker;
  let pinnedLat = null;
  let pinnedLng = null;

  const apiBase = window.OMNICIVIC_CONFIG?.apiBaseUrl || 'http://localhost:9090';

  function initMap() {
    if (typeof L === 'undefined') {
      mapErrorEl.textContent = 'Map library failed to load. Please refresh the page.';
      mapErrorEl.classList.remove('hidden');
      return;
    }
    map = L.map('address-map', { attributionControl: false }).setView([13.0827, 80.2707], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    map.on('click', e => placePin(e.latlng.lat, e.latlng.lng));
  }

  function placePin(lat, lng, zoom = 16) {
    pinnedLat = lat;
    pinnedLng = lng;
    if (marker) marker.remove();
    const icon = L.divIcon({
      html: `<div style="position:relative;width:18px;height:18px;">
               <div style="position:absolute;inset:0;background:#7B9576;border-radius:50%;border:3px solid #FAF9F5;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>
               <div style="position:absolute;inset:-3px;border-radius:50%;background:#7B9576;opacity:0.4;animation:pin-pulse 1.8s ease-out infinite;"></div>
             </div>`,
      className: '',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    marker = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
    marker.on('dragend', e => {
      const ll = e.target.getLatLng();
      pinnedLat = ll.lat;
      pinnedLng = ll.lng;
      coordsDisplay.textContent = `📍 ${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)}`;
    });
    map.setView([lat, lng], zoom);
    coordsDisplay.textContent = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    coordsDisplay.classList.remove('hidden');
  }

  async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Geocoding service unavailable.');
    const results = await res.json();
    if (!results.length) throw new Error('Address not found. Drop a pin manually on the map.');
    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  }

  searchBtn.addEventListener('click', async () => {
    const address = addressInput.value.trim();
    if (!address) {
      mapErrorEl.textContent = 'Type an address first, then click Find.';
      mapErrorEl.classList.remove('hidden');
      return;
    }
    mapErrorEl.classList.add('hidden');
    searchBtn.disabled = true;
    searchBtn.textContent = '⏳ Searching…';
    try {
      const { lat, lng } = await geocodeAddress(address);
      placePin(lat, lng);
    } catch (err) {
      mapErrorEl.textContent = err.message;
      mapErrorEl.classList.remove('hidden');
    } finally {
      searchBtn.disabled = false;
      searchBtn.textContent = '🔍 Find';
    }
  });

  locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      mapErrorEl.textContent = 'Geolocation is not supported by your browser.';
      mapErrorEl.classList.remove('hidden');
      return;
    }
    locateBtn.disabled = true;
    locateBtn.textContent = '⏳ Locating…';
    navigator.geolocation.getCurrentPosition(
      pos => {
        placePin(pos.coords.latitude, pos.coords.longitude);
        locateBtn.disabled = false;
        locateBtn.textContent = '📍 My location';
      },
      () => {
        mapErrorEl.textContent = 'Could not get your location. Drop a pin manually on the map.';
        mapErrorEl.classList.remove('hidden');
        locateBtn.disabled = false;
        locateBtn.textContent = '📍 My location';
      }
    );
  });

  logoInput.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showError('Logo file is too large. Please use an image under 2MB.');
      logoInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      logoBase64 = result.split(',')[1];
      logoPreviewImg.src = result;
      logoPreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  logoRemove.addEventListener('click', () => {
    logoBase64 = null;
    logoInput.value = '';
    logoPreview.classList.add('hidden');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideError();

    if (pinnedLat === null || pinnedLng === null) {
      showError('Please drop a pin on the map to mark your community\'s location.');
      return;
    }

    const fd = new FormData(form);
    const payload = {
      organizationName: fd.get('organizationName')?.toString().trim(),
      ownerName: fd.get('ownerName')?.toString().trim(),
      ownerEmail: fd.get('ownerEmail')?.toString().trim(),
      ownerPhone: fd.get('ownerPhone')?.toString().trim() || null,
      description: fd.get('description')?.toString().trim() || '',
      address: fd.get('address')?.toString().trim(),
      addressLat: pinnedLat,
      addressLng: pinnedLng,
      logoBase64,
      websiteUrl: fd.get('websiteUrl')?.toString().trim() || null,
      instagramUrl: fd.get('instagramUrl')?.toString().trim() || null,
      facebookUrl: fd.get('facebookUrl')?.toString().trim() || null,
      twitterUrl: fd.get('twitterUrl')?.toString().trim() || null
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch(`${apiBase}/service-requests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed (status ${res.status})`);
      }

      document.getElementById('success-name').textContent = payload.ownerName;
      document.getElementById('success-org').textContent = payload.organizationName;
      document.getElementById('success-email').textContent = payload.ownerEmail;
      form.classList.add('hidden');
      successState.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showError(err.message || 'Could not submit request. Please ensure the backend is running and try again.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit request <svg fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>';
    }
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function hideError() { errorMsg.classList.add('hidden'); }

  // Add keyframe used by inline icon HTML
  const style = document.createElement('style');
  style.textContent = `@keyframes pin-pulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(3); opacity: 0; } }`;
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
