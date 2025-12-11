// map.js - Initializes the Leaflet map and loads all nested markers.
import { setupLogoutListener } from './login.js';
import { getBarangayData } from './data-loader.js';
import { getWeather, renderWeatherWidget } from './weather.js';
import './login.js';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
});

let map;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function initMap() {
    // ... (Map initialization code from previous response) ...
    map = L.map('map').setView([8.360264, 124.868031], 17);

    const basicMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' });

    const baseMaps = { "Basic Map": basicMap, "Satellite Map": satelliteMap };
    L.control.layers(baseMaps).addTo(map);
    L.control.fullscreen().addTo(map);
    
    // Simple Geocoder (Note: Only handles searches, not dynamic marker lookup)
    L.Control.geocoder({ placeholder: "Search location...", defaultMarkGeocode: false }).addTo(map);
}

// Custom icons for different facilities
const healthIcon = L.divIcon({
    className: 'custom-div-icon health-icon',
    html: '<i style="color:red" class="fas fa-hospital-symbol"></i>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

const schoolIcon = L.divIcon({
    className: 'custom-div-icon school-icon',
    html: '<i style="color:blue" class="fas fa-school"></i>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});


/**
 * Creates the HTML content for a Barangay marker popup.
 */
async function createBarangayPopup(barangay) {
    const { lat, lng } = barangay.barangayLocation;
    const weather = await getWeather(lat, lng);
    
    // Ensure weather.js has an API key for this to work
    const weatherHtml = weather 
        ? renderWeatherWidget(weather) 
        : '<p>Weather data unavailable or API key not set.</p>';

    return `
        <h3>${barangay.barangayName}</h3>
        <p><strong>Population:</strong> ${barangay.population.toLocaleString()}</p>
        <hr>
        <h4>Current Weather</h4>
        ${weatherHtml}
    `;
}

/**
 * Loads all markers onto the map (Barangay, Health Centers, Schools).
 */
async function loadAllMarkers(barangayData) {
    // Clear previous layers if the map is being refreshed
    if (map.markerGroup) {
        map.removeLayer(map.markerGroup);
    }
    const markerGroup = L.featureGroup().addTo(map);
    map.markerGroup = markerGroup; // Store group for easy removal/refresh

    for (const barangay of barangayData) {
        // --- 1. Barangay Marker ---
        const bMarker = L.marker([barangay.barangayLocation.lat, barangay.barangayLocation.lng])
            .bindPopup("Loading details...") // Temporary popup
            .addTo(markerGroup);

        // Load popup content asynchronously to avoid blocking the loop
        bMarker.on('popupopen', async () => {
             const content = await createBarangayPopup(barangay);
             bMarker.setPopupContent(content);
        });

        // --- 2. Health Center Markers ---
        barangay.healthCenters.forEach(hc => {
            const hcPopup = `
                <h4>${hc.name}</h4>
                <span style="background-color: red; color: white; padding: 2px 5px; border-radius: 3px;">Health Facility</span>
            `;
            L.marker([hc.lat, hc.lng], { icon: healthIcon })
                .bindPopup(hcPopup)
                .addTo(markerGroup);
        });

        // --- 3. School Markers ---
        barangay.schools.forEach(school => {
            const schoolPopup = `
                <h4>${school.name}</h4>
                <span style="background-color: blue; color: white; padding: 2px 5px; border-radius: 3px;">School Facility</span>
            `;
            L.marker([school.lat, school.lng], { icon: schoolIcon })
                .bindPopup(schoolPopup)
                .addTo(markerGroup);
        });
    }
    
    if (barangayData.length > 0) {
         map.fitBounds(markerGroup.getBounds());
    }
}

/**
 * Initializes the map page.
 */
async function initMapPage() {
    initMap();
    L.marker([8.369435, 124.864576])
        .bindPopup("Map Center Test Pin: Leaflet is Working!")
        .addTo(map);
    const barangayData = await getBarangayData();
    await loadAllMarkers(barangayData);
}

document.addEventListener('DOMContentLoaded', () => {
    initMapPage();
    setupLogoutListener();

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
});