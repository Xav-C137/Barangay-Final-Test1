import { setupLogoutListener } from './login.js';
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

    tbody.innerHTML = '';

    data.forEach(barangay => {
        const healthCenterCount = barangay.healthCenters ? barangay.healthCenters.length : 0;
        const schoolCount = barangay.schools ? barangay.schools.length : 0;
        const evacuationCount = 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${barangay.barangayName}</td> 
            <td>${barangay.population.toLocaleString()}</td>
            <td>${healthCenterCount}</td>
            <td>${schoolCount}</td>
            <td>${evacuationCount}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Filters the barangay data based on a search term.
 */
function filterTable() {
    const searchTerm = document.getElementById('resource-search').value.toLowerCase();

    const filteredData = allBarangays.filter(barangay => 
        barangay.barangayName.toLowerCase().includes(searchTerm)
    );
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
    const isResourceColumn = ['healthCenters', 'schools', 'evacuation_sites'].includes(column);

    return data.sort((a, b) => {
        
        let valA, valB;

        if (isResourceColumn) {

            valA = a[column] ? a[column].length : 0;
            valB = b[column] ? b[column].length : 0;
            if (column === 'evacuation_sites') {
                valA = 0; 
                valB = 0;
            }
        } 

        else if (column === 'name') { 
             valA = a.barangayName;
             valB = b.barangayName;
        } 

        else {
            valA = a[column];
            valB = b[column];
        }

        if (typeof valA === 'number') {
            return ascending ? valA - valB : valB - valA;
        } 

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
        isAscending = true;
    }
    
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
    
    setupLogoutListener();

    // Attach menu toggle functionality
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
});