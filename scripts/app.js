/* Cute Weather - Main Application Logic */

// Initialize variables first
const API_BASE = 'https://api.open-meteo.com/v1/forecast';
let supabaseUrl = 'https://YOUR_SUPABASE_PROJECT.supabase.co';
let supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

  // Check if Supabase is configured
  let supabase = null;
  let isSupabaseConfigured = false;
  let supabaseClient = null;

// Check for stored locations from admin
let storedLocations = [];

// DOM Elements
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherSection = document.getElementById('weatherSection');
const locationSection = document.getElementById('locationSection');
const adminSection = document.getElementById('adminSection');
const locationsList = document.getElementById('locationsList');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const description = document.getElementById('description');
const dateEl = document.getElementById('date');
const loveIcon = document.getElementById('loveIcon');
const loadingOverlay = document.getElementById('loadingOverlay');
const greetingEl = document.getElementById('greeting');
const tipText = document.getElementById('tipText');
const toastContainer = document.getElementById('toastContainer');
const cloudBg = document.getElementById('cloudBg');

// Weather icon mapping
const weatherIcons = {
  'clear-day': '☀️',
  'clear-night': '🌙',
  'partly-cloudy-day': '⛅',
  'partly-cloudy-night': '🌙⛅',
  'cloudy': '☁️',
  'rain': '🌧️',
  'drizzle': '🌦️',
  'snow': '❄️',
  'thunderstorm': '⛈️',
  'mist': '🌫️',
  'fog': '🌫️',
  'wind': '💨',
  'haze': '🌬️'
};

// Love icon for Bogor
const loveIconSvg = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zM2 8.5C2 5.42 4.42 3 7.5 3 9.72 3 11.94 4.5 12.93 5.69L12 8.09l-1.07-1.62c-.78-.38-1.02-.94-.73-1.46C10.94 6.81 11.52 6 12 6c1.74 0 3.41.81 4.5 2.09C15.59 8.81 17.26 9 18.5 9c1.74 0 3.41-.81 4.5-2.09C21.09 6.81 22 7.38 22 8.5C22 11.58 19.58 13 16.5 13 13.42 13 11 11.58 11 8.5 11 5.42 8.5 2 8.5z"/>
</svg>`;

// Check if location is Bogor
function isBogor(lat, lon) {
  // Bogor coordinates: approximately -6.58, 106.79
  return Math.abs(lat - (-6.58)) < 0.5 && Math.abs(lon - 106.79) < 0.5;
}

// Get weather icon based on condition
function getWeatherIcon(condition) {
  const lowerCondition = condition.toLowerCase();
  for (const [key, icon] of Object.entries(weatherIcons)) {
    if (lowerCondition.includes(key)) {
      return icon;
    }
  }
  return '🌤️';
}

// Get custom icon based on location
function getCustomIcon(lat, lon) {
  if (isBogor(lat, lon)) {
    return loveIconSvg;
  }
  return '';
}

// Show section
function showSection(sectionId) {
  // Hide all sections
  [locationSection, weatherSection, adminSection].forEach(section => {
    section.style.display = 'none';
  });
  
  // Show requested section
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';
    section.classList.add('fade-in');
  }
  
  // If admin section, load locations
  if (sectionId === 'adminSection') {
    loadLocations();
  }
}

// Set weather data
function setWeatherData(data, city) {
  const iconCode = data.current_weather?.weathercode || 'clear-day';
  const icon = getWeatherIcon(iconCodes[iconCode] || iconCode) || '🌤️';
  
  // Add love icon if in Bogor
  const customIcon = isBogor(data.latitude, data.longitude) ? loveIconSvg : '';
  
  cityName.textContent = city;
  weatherIcon.innerHTML = customIcon + icon;
  temperature.textContent = `${Math.round(data.current_weather.temperature)}°C`;
  humidity.textContent = `${data.current_weather?.humidity || '--'}%`;
  wind.textContent = `${data.current_weather?.windspeed || '--'} m/s`;
  description.textContent = data.current_weather?.weatherdescription || 'Tidak tersedia';
  
  // Set date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = new Date().toLocaleDateString('id-ID', options);
  
  // Show weather section
  weatherSection.style.display = 'block';
  weatherSection.classList.add('fade-in');
  
  // Update dynamic background theme based on weather
  updateBackgroundTheme(iconCode);
  
  // Update cute animal companion based on weather
  updateAnimalCompanion(iconCode);
  
  // Create weather particle effects
  createParticleEffect(iconCode);
  
  // Show weather tip
  showWeatherTip(iconCode, data.current_weather?.temperature);
  
  // Show success toast
  showToast(`Cuaca ${city} berhasil dimuat!`, 'success');
}

// Update background theme based on weather condition
function updateBackgroundTheme(iconCode) {
  // Remove existing weather classes
  document.body.classList.remove(
    'weather-clear-day', 'weather-clear-night', 'weather-rain',
    'weather-clouds', 'weather-snow', 'weather-thunderstorm'
  );
  
  // Add appropriate weather class
  if (iconCode === 0 || iconCode === 1 || iconCode === 2) {
    // Determine day/night based on time
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      document.body.classList.add('weather-clear-day');
    } else {
      document.body.classList.add('weather-clear-night');
    }
  } else if (iconCode >= 51 && iconCode <= 67 || iconCode >= 80 && iconCode <= 82) {
    document.body.classList.add('weather-rain');
  } else if (iconCode === 3 || iconCode >= 45 && iconCode <= 48) {
    document.body.classList.add('weather-clouds');
  } else if (iconCode >= 71 && iconCode <= 77 || iconCode >= 85 && iconCode <= 86) {
    document.body.classList.add('weather-snow');
  } else if (iconCode >= 95 && iconCode <= 99) {
    document.body.classList.add('weather-thunderstorm');
  }
}

// Update cute animal companion based on weather
function updateAnimalCompanion(iconCode) {
  const animal = document.getElementById('animalCompanion');
  if (!animal) return;
  
  let emoji = '🐰'; // Default: rabbit
  
  if (iconCode === 0 || iconCode === 1 || iconCode === 2) {
    emoji = '🐰'; // Sunny - rabbit
  } else if (iconCode >= 51 && iconCode <= 67 || iconCode >= 80 && iconCode <= 82) {
    emoji = '🐢'; // Rainy - turtle with umbrella
  } else if (iconCode === 3 || iconCode >= 45 && iconCode <= 48) {
    emoji = '🦉'; // Cloudy - owl
  } else if (iconCode >= 71 && iconCode <= 77 || iconCode >= 85 && iconCode <= 86) {
    emoji = '🐧'; // Snow - penguin
  } else if (iconCode >= 95 && iconCode <= 99) {
    emoji = '🐱'; // Thunderstorm - cat
  }
  
  animal.textContent = emoji;
}

// Create weather particle effects
function createParticleEffect(iconCode) {
  // Remove existing particles
  const existingParticles = document.querySelectorAll('.particle');
  existingParticles.forEach(p => p.remove());
  
  // Only create particles for rain, snow, or thunderstorm
  if (iconCode >= 51 && iconCode <= 67 || iconCode >= 80 && iconCode <= 82) {
    // Rain effect
    createRainParticles();
  } else if (iconCode >= 71 && iconCode <= 77 || iconCode >= 85 && iconCode <= 86) {
    // Snow effect
    createSnowParticles();
  }
}

// Create rain particle effect
function createRainParticles() {
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.width = `${1 + Math.random() * 2}px`;
    particle.style.height = `${5 + Math.random() * 10}px`;
    particle.style.backgroundColor = 'rgba(173, 216, 230, 0.6)';
    particle.style.animationDuration = `${0.5 + Math.random() * 1}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    document.body.appendChild(particle);
  }
}

// Create snow particle effect
function createSnowParticles() {
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.width = `${3 + Math.random() * 4}px`;
    particle.style.height = `${3 + Math.random() * 4}px`;
    particle.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    particle.style.borderRadius = '50%';
    particle.style.animationDuration = `${2 + Math.random() * 3}s`;
    particle.style.animationDelay = `${Math.random() * 3}s`;
    document.body.appendChild(particle);
  }
}

// Show weather tip based on condition
function showWeatherTip(iconCode, temperature) {
  if (!tipText) return;
  
  let tip = '';
  
  if (iconCode === 0 || iconCode === 1 || iconCode === 2) {
    tip = 'Cuaca cerah! Jangan lupa pakai kacamata hitam dan tabir surya.';
  } else if (iconCode >= 51 && iconCode <= 67 || iconCode >= 80 && iconCode <= 82) {
    tip = 'Hari ini hujan, bawa payung atau jemuran agar tetap kering.';
  } else if (iconCode === 3 || iconCode >= 45 && iconCode <= 48) {
    tip = 'Cuaca berawan, cocok untuk berjalan santai di luar.';
  } else if (iconCode >= 71 && iconCode <= 77 || iconCode >= 85 && iconCode <= 86) {
    if (temperature && temperature < 10) {
      tip = 'Dingin! Pakailah jaket tebal dan sarung tangan.';
    } else {
      tip = 'Cuaca mendung, bawa jaket ringan untuk kehangatan.';
    }
  } else if (iconCode >= 95 && iconCode <= 99) {
    tip = 'Badai petir! Sebaiknya tetap di dalam ruangan yang aman.';
  } else {
    tip = 'Cuaca tidak diketahui, siapkan diri untuk segala kondisi.';
  }
  
  tipText.textContent = tip;
}

// Show toast notification
function showToast(message, type = 'success') {
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  
  const iconMap = {
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
    <span>${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 400);
  }, 3000);
}

// Create floating clouds in background
function createFloatingClouds() {
  if (!cloudBg) return;
  
  const cloudEmojis = ['☁️', '☁️', '☁️'];
  
  for (let i = 0; i < 5; i++) {
    const cloud = document.createElement('div');
    cloud.classList.add('cloud');
    cloud.textContent = cloudEmojis[Math.floor(Math.random() * cloudEmojis.length)];
    cloud.style.top = `${Math.random() * 80 + 10}%`;
    cloud.style.fontSize = `${40 + Math.random() * 40}px`;
    cloud.style.opacity = `${0.1 + Math.random() * 0.2}`;
    cloud.style.animationDuration = `${15 + Math.random() * 20}s`;
    cloud.style.animationDelay = `${Math.random() * 5}s`;
    cloud.style.left = `${Math.random() * 20 - 10}%`;
    cloudBg.appendChild(cloud);
  }
}

// Sparkle cursor trail effect
function initSparkleTrail() {
  let lastSparkleTime = 0;
  
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkleTime < 50) return;
    lastSparkleTime = now;
    
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    sparkle.textContent = '✨';
    sparkle.style.left = `${e.clientX}px`;
    sparkle.style.top = `${e.clientY}px`;
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.remove();
      }
    }, 800);
  });
}

// Update greeting based on time of day
function updateGreeting() {
  if (!greetingEl) return;
  
  const hour = new Date().getHours();
  let greeting = '';
  
  if (hour >= 5 && hour < 11) {
    greeting = '🌅 Selamat pagi! Siap dapat cuaca hari ini?';
  } else if (hour >= 11 && hour < 15) {
    greeting = '☀️ Selamat siang! Cek cuaca sebelum keluar ya!';
  } else if (hour >= 15 && hour < 18) {
    greeting = '🌇 Selamat sore! Cuaca sudah berubah, cek dulu!';
  } else {
    greeting = '🌙 Selamat malam! Nikmati malam yang indah!';
  }
  
  greetingEl.textContent = greeting;
}

// Show/hide loading overlay
function showLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }
}

function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove('active');
  }
}

// Icon mapping from Open-Meteo
const iconCodes = {
  0: 'clear-day',
  1: 'clear-day',
  2: 'clear-day',
  3: 'cloudy',
  45: 'fog',
  48: 'fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'rain',
  57: 'rain',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'snow',
  67: 'snow',
  71: 'wind',
  73: 'wind',
  75: 'wind',
  77: 'wind',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  85: 'snow',
  86: 'snow',
  95: 'thunderstorm',
  96: 'thunderstorm',
  99: 'thunderstorm'
};

// Fetch weather data
// source: 'manual' (search/default) or 'realtime' (GPS location button)
async function fetchWeather(city, lat, lon, source = 'manual') {
  showLoading();
  try {
    const response = await fetch(
      `${API_BASE}?latitude=${lat}&longitude=${lon}&current-weather=true&timezone=id`
    );
    
    if (!response.ok) throw new Error('Gagal mengambil data cuaca');
    
    const data = await response.json();
    setWeatherData(data, city);
    
    // Store location to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      storeLocationToSupabase(city, lat, lon, source);
    }
    
    // Add to local storage
    addLocationToHistory(city, lat, lon);
    
  } catch (error) {
    console.error(error);
    showToast('Gagal mengambil data cuaca. Coba lagi nanti.', 'error');
    if (locationInput) {
      locationInput.classList.add('shake');
      setTimeout(() => locationInput.classList.remove('shake'), 500);
    }
  } finally {
    hideLoading();
  }
}

// Store location to Supabase
// source: 'manual' (search/default) or 'realtime' (GPS location button)
async function storeLocationToSupabase(city, lat, lon, source = 'manual') {
  try {
    const { error } = await supabase
      .from('locations')
      .insert([{ name: city, latitude: lat, longitude: lon, icon_type: isBogor(lat, lon) ? 'love' : 'default', source: source }]);
    
    if (error) console.error('Error storing location:', error);
  } catch (err) {
    console.error('Supabase error:', err);
  }
}

// Add to location history
function addLocationToHistory(city, lat, lon) {
  const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
  const exists = history.some(loc => loc.city === city && loc.lat === lat && loc.lon === lon);
  
  if (!exists) {
    history.unshift({ city, lat, lon, date: new Date().toISOString() });
    // Keep only last 10 locations
    const limited = history.slice(0, 10);
    localStorage.setItem('weatherHistory', JSON.stringify(limited));
    renderHistory();
  }
}

// Render location history
function renderHistory() {
  const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
  storedLocations = history;
  
  if (history.length === 0) {
    locationsList.innerHTML = '<p class="empty-state">Belum ada lokasi yang disimpan</p>';
    return;
  }
  
  locationsList.innerHTML = history.map((loc, index) => `
    <div class="location-item fade" style="animation-delay: ${index * 0.1}s">
      <span class="ci">${loc.city}</span>
      <span class="icon">${getWeatherIcon('clear-day')}</span>
      <button class="btn-remove" data-index="${index}" style="cursor: pointer; color: #e74c3c; font-size: 0.8rem;">×</button>
    </div>
  `).join('');
  
  // Add remove event listeners
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.getAttribute('data-index'));
      removeFromHistory(index);
    });
  });
}

// Remove from history
function removeFromHistory(index) {
  const history = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
  history.splice(index, 1);
  localStorage.setItem('weatherHistory', JSON.stringify(history));
  renderHistory();
}

// Get location by name using Open-Meteo Geocoding API
async function geocodeCity(cityName) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=id&format=json`
    );
    if (!response.ok) throw new Error('Pencarian kota gagal');
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude
      };
    }
    return null;
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
}

// Handle search button
searchBtn.addEventListener('click', async () => {
  const city = locationInput.value.trim();
  if (!city) return;
  
  searchBtn.disabled = true;
  const originalText = searchBtn.textContent;
  searchBtn.textContent = 'Mencari...';

  try {
    const coords = await geocodeCity(city);
    if (coords) {
      await fetchWeather(coords.name, coords.latitude, coords.longitude);
    } else {
      showToast('Kota tidak ditemukan. Coba nama kota lain!', 'warning');
    }
  } catch (error) {
    console.error(error);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = originalText;
  }
});

// Handle location permission
locationBtn.addEventListener('click', async () => {
  if (!navigator.geolocation) {
    showToast('Browser Anda tidak mendukung geolocation', 'error');
    return;
  }
  
  locationBtn.disabled = true;
  locationBtn.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path stroke-linecap="round" d="M12 12v10M8 8l4-2m4 4l-4-2" stroke-width="2" stroke-linecap="round"/></svg> Mendapatkan lokasi...';
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
    
    const { latitude, longitude } = position.coords;
    
    // Reverse geocode to get city name
    const city = await reverseGeocode(latitude, longitude) || 'Lokasi Saya';
    
    await fetchWeather(city, latitude, longitude, 'realtime');
  } catch (error) {
    console.error('Geolocation error:', error);
    showToast('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.', 'error');
  } finally {
    locationBtn.disabled = false;
    locationBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="12" x2="16" y2="16"></line><line x1="12" y1="16" x2="20" y2="12"></line><line x1="12" y1="12" x2="12.01" y2="12"></line></svg> Dapatkan Lokasi Saya';
  }
});

// Reverse geocode using OpenStreetMap Nominatim API (Free, high accuracy)
async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id`
    );
    if (!response.ok) throw new Error('Reverse geocoding gagal');
    const data = await response.json();
    if (data && data.address) {
      // Prioritize city name, city_district, town, municipality, suburb, etc.
      const address = data.address;
      const city = address.city || address.town || address.municipality || address.city_district || address.suburb || address.village || address.county || address.state;
      return city;
    }
    return null;
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    return null;
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Check if Supabase is configured
  const supabaseConfig = localStorage.getItem('supabaseConfig');
  if (supabaseConfig) {
    const config = JSON.parse(supabaseConfig);
    supabaseUrl = config.url;
    supabaseAnonKey = config.key;
    isSupabaseConfigured = true;
    // Initialize Supabase client using CDN library
    if (typeof supabasejs !== 'undefined') {
      supabase = supabasejs.createClient(supabaseUrl, supabaseAnonKey);
      // Expose to global scope so admin.html can access it
      window.supabase = supabase;
      window.isSupabaseConfigured = isSupabaseConfigured;
    }
  }
  
  // Render existing history
  renderHistory();
  
  // Enable location button
  if (locationBtn) {
    locationBtn.disabled = false;
  }
  
  // Update greeting based on time
  updateGreeting();
  
  // Create floating clouds
  createFloatingClouds();
  
  // Initialize sparkle cursor trail
  initSparkleTrail();
  
  // Set default location to Jakarta
  fetchWeather('Jakarta', -6.2088, 106.8456);
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchWeather, storeLocationToSupabase, isBogor, reverseGeocode };
}
