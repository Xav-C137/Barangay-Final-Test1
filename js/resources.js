// resources.js - Handles displaying, searching, and sorting the resources table.

import { getBarangayData } from './data-loader.js';

let allBarangays = []; // Store the full data set
let currentSortColumn = 'name';
let isAscending = true;

/**
 * Renders the barangay data into the HTML table.
 * @param {Array} data - The array of barangay objects to render.
 */
function renderTable(data) {
    const tbody = document.getElementById('resources-table-body');
    if (!tbody) return;

    tbody.innerHTML = ''; // Clear existing rows

    data.forEach(barangay => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${barangay.name}</td>
            <td>${barangay.population.toLocaleString()}</td>
            <td>${barangay.health_centers}</td>
            <td>${barangay.schools}</td>
            <td>${barangay.evacuation_sites}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Filters the barangay data based on a search term.
 */
function filterTable() {
    const searchTerm = document.getElementById('resource-search').value.toLowerCase();
    
    // Filter by barangay name
    const filteredData = allBarangays.filter(barangay => 
        barangay.name.toLowerCase().includes(searchTerm)
    );

    // Re-sort the filtered data
    const sortedData = sortData(filteredData, currentSortColumn, isAscending);
    renderTable(sortedData);
}

/**
 * Sorts the barangay data based on a column and direction.
 * @param {Array} data - Data array to sort.
 * @param {string} column - The column/property to sort by.
 * @param {boolean} ascending - Sort direction.
 * @returns {Array} The sorted array.
 */
function sortData(data, column, ascending) {
    return data.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Handle numeric values
        if (typeof valA === 'number') {
            return ascending ? valA - valB : valB - valA;
        } 
        // Handle string values (case-insensitive)
        else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
            if (valA < valB) return ascending ? -1 : 1;
            if (valA > valB) return ascending ? 1 : -1;
            return 0;
        }
    });
}

/**
 * Handles column header clicks for sorting.
 * @param {Event} event - The click event.
 */
function handleSort(event) {
    const newColumn = event.target.dataset.column;
    if (!newColumn) return;

    if (currentSortColumn === newColumn) {
        isAscending = !isAscending;
    } else {
        currentSortColumn = newColumn;
        isAscending = true; // Default to ascending for a new column
    }

    // Apply filter first to ensure the data set is correct, then sort and render
    filterTable();
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

/**
 * Initializes the resources page.
 */
async function initResourcesPage() {
    allBarangays = await getBarangayData();
    
    // Initial render (default sort by name ascending)
    const initialSortedData = sortData(allBarangays, currentSortColumn, isAscending);
    renderTable(initialSortedData);
}

// --- Event Listeners and Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    initResourcesPage();

    // Attach search/filter listener
    const searchInput = document.getElementById('resource-search');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterTable);
    }

    // Attach sort listeners to table headers
    document.querySelectorAll('.resources-table th').forEach(header => {
        header.addEventListener('click', handleSort);
    });

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