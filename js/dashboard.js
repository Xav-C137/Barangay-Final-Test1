
import { setupLogoutListener } from './login.js';
import { getBarangayData } from './data-loader.js';
import { getWeather, renderWeatherWidget } from './weather.js';
import './login.js';

const PH_CENTER_LAT = 14.5995; 
const PH_CENTER_LNG = 120.9842; 

/**
 * Calculates total resources and counts from barangay data.
 * @param {Array} data - Array of barangay objects.
 */
function calculateStats(data) {
    const barangayCount = data.length;
    let totalPopulation = 0;
    let totalResources = 0;

    data.forEach(barangay => {
        const healthCenters = barangay.healthCenters ? barangay.healthCenters.length : 0;
        const schools = barangay.schools ? barangay.schools.length : 0;
        const evacuationSites = 0;
      
        totalResources += healthCenters + schools + evacuationSites;
        totalPopulation += barangay.population;
    });

    document.getElementById('total-resources-count').textContent = totalResources.toLocaleString();
    document.getElementById('barangay-count').textContent = barangayCount.toLocaleString();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}
//loads data and weather 
async function initDashboard() {
    // barangay stats
    const barangayData = await getBarangayData();
    calculateStats(barangayData);
    // weather
    const weatherData = await getWeather(PH_CENTER_LAT, PH_CENTER_LNG);
    const weatherWidget = document.getElementById('weather-widget');
    
    if (weatherWidget) {
        weatherWidget.innerHTML = renderWeatherWidget(weatherData);
    }
}

//event Listeners and Initial Load
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupLogoutListener();

    //menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
});