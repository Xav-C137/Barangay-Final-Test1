// dashboard.js - Loads stats, weather, and handles UI on the dashboard.

import { getBarangayData } from './data-loader.js';
import { getWeather, renderWeatherWidget } from './weather.js';

// Coordinates for a central location in the Philippines (Manila) for general weather
const PH_CENTER_LAT = 14.5995; 
const PH_CENTER_LNG = 120.9842; 

/**
 * Calculates total resources and counts from barangay data.
 * @param {Array} data - Array of barangay objects.
 */
function calculateStats(data) {
    const barangayCount = data.length;
    let totalResources = 0;

    data.forEach(barangay => {
        // Sum schools, health centers, and evacuation sites for total resources
        totalResources += barangay.health_centers + barangay.schools + barangay.evacuation_sites;
    });

    document.getElementById('total-resources-count').textContent = totalResources.toLocaleString();
    document.getElementById('barangay-count').textContent = barangayCount.toLocaleString();
}

/**
 * Initializes the dashboard by loading data and weather.
 */
async function initDashboard() {
    // 1. Load Barangay Stats
    const barangayData = await getBarangayData();
    calculateStats(barangayData);

    // 2. Load Weather
    const weatherData = await getWeather(PH_CENTER_LAT, PH_CENTER_LNG);
    const weatherWidget = document.getElementById('weather-widget');
    
    if (weatherWidget) {
        weatherWidget.innerHTML = renderWeatherWidget(weatherData);
    }
}

/**
 * Handles user logout.
 */
// Locate this function/logic in dashboard.js, map.js, and resources.js

function handleLogout() {
    // 1. CLEAR THE ACTIVE SESSION KEY
    localStorage.removeItem('barangay_map_logged_in'); 
    
    // 2. NEW FIX: CLEAR THE REMEMBER ME KEY
    localStorage.removeItem('barangay_map_remember'); 

    window.location.href = 'index.html';
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
    initDashboard();

    // Attach logout functionality to the button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link action
            handleLogout();
        });
    }

    // Attach menu toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
});

// Re-import login.js functions (specifically validateSession) to ensure session check runs on this page
import './login.js';