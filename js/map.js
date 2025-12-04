// map.js - Initializes the Leaflet map and loads barangay markers.

import { getBarangayData } from './data-loader.js';
import { getWeather, renderWeatherWidget } from './weather.js';

// Coordinates for a central location in the Philippines (Manila Bay area)
const PH_START_LAT = 14.58; 
const PH_START_LNG = 120.98;
const DEFAULT_ZOOM = 12;

let map;

/**
 * Initializes the Leaflet map and base layers.
 */
function initMap() {
    // Initialize the map, centered on PH_START_LAT/LNG
    map = L.map('map').setView([PH_START_LAT, PH_START_LNG], DEFAULT_ZOOM);

    // Define Base Layers
    const basicMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Using Esri for a simple satellite option (common free tile provider)
    const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Add Layer Control
    const baseMaps = {
        "Basic Map": basicMap,
        "Satellite Map": satelliteMap
    };

    L.control.layers(baseMaps).addTo(map);
    
    // Add Fullscreen Control (Optional but good UX)
    L.control.fullscreen().addTo(map);

    // Add Geocoder Search Control (NOTE: Requires the leaflet-control-geocoder library)
    L.Control.geocoder({
        placeholder: "Search location...",
        defaultMarkGeocode: false // Don't add default marker
    }).on('markgeocode', function(e) {
        const bbox = e.geocode.bbox;
        const poly = L.polygon([
            bbox.getSouthEast(),
            bbox.getNorthEast(),
            bbox.getNorthWest(),
            bbox.getSouthWest()
        ]).addTo(map);
        map.fitBounds(poly.getBounds());
    }).addTo(map);
}

/**
 * Creates the HTML content for a barangay marker popup.
 * @param {Object} barangay - The barangay object.
 * @param {Object|null} weather - The weather object for the location.
 * @returns {string} The complete HTML string for the popup.
 */
function createPopupContent(barangay, weather) {
    const weatherHtml = weather 
        ? renderWeatherWidget(weather) 
        : '<p>Weather data unavailable.</p>';

    return `
        <h3>${barangay.name}</h3>
        <hr>
        <p><strong>Population:</strong> ${barangay.population.toLocaleString()}</p>
        <p><strong>Health Centers:</strong> ${barangay.health_centers}</p>
        <p><strong>Schools:</strong> ${barangay.schools}</p>
        <p><strong>Evacuation Sites:</strong> ${barangay.evacuation_sites}</p>
        <hr>
        <h4>Current Weather</h4>
        ${weatherHtml}
    `;
}

/**
 * Loads barangay markers onto the map.
 * @param {Array} barangayData - Array of barangay objects.
 */
async function loadBarangayMarkers(barangayData) {
    // Create a feature group to manage all markers
    const markerGroup = L.featureGroup().addTo(map);

    for (const barangay of barangayData) {
        // Fetch weather for the specific barangay coordinates
        const weather = await getWeather(barangay.lat, barangay.lng);

        const marker = L.marker([barangay.lat, barangay.lng])
            .bindPopup(createPopupContent(barangay, weather), {
                maxWidth: 300
            })
            // Store barangay data on the marker for search purposes
            .data = barangay; 
        
        markerGroup.addLayer(marker);
    }
    
    // Optional: Fit map view to all markers after loading
    if (barangayData.length > 0) {
         map.fitBounds(markerGroup.getBounds());
    }
}

/**
 * Initializes the map page.
 */
async function initMapPage() {
    initMap();
    const barangayData = await getBarangayData();
    await loadBarangayMarkers(barangayData);
}

/**
 * Toggles the sidebar for mobile responsiveness.
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// --- Event Listeners and Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    initMapPage();

    // Attach logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            localStorage.removeItem('barangay_map_logged_in');
            window.location.href = 'index.html';
        });
    }

    // Attach menu toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
});
// Locate this function/logic in dashboard.js, map.js, and resources.js

function handleLogout() {
    // 1. CLEAR THE ACTIVE SESSION KEY
    localStorage.removeItem('barangay_map_logged_in'); 
    
    // 2. NEW FIX: CLEAR THE REMEMBER ME KEY
    localStorage.removeItem('barangay_map_remember'); 

    window.location.href = 'index.html';
}

// Re-import login.js functions (specifically validateSession) to ensure session check runs on this page
import './login.js';