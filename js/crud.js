// crud.js - Handles the CRUD functionality for barangay data stored in LocalStorage.

import { getBarangayData, saveBarangayData } from './data-loader.js';
import { setupLogoutListener } from './login.js';

const modal = document.getElementById('crud-modal');
const form = document.getElementById('barangay-crud-form');
const barangayListContainer = document.getElementById('barangay-list');

let allBarangays = []; // Local cache of data

/**
 * Generates a simple unique ID for new records.
 */
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Generates the HTML for a dynamic facility input group (Health Center or School).
 * @param {string} type - 'healthCenters' or 'schools'.
 * @param {Object} [facility={}] - Existing facility data for editing.
 * @returns {string} The HTML string.
 */
function createFacilityFields(type, facility = {}) {
    const id = facility.id || generateId();
    const nameLabel = type === 'healthCenters' ? 'Center Name' : 'School Name';

    return `
        <div class="form-group facility-group" data-id="${id}" data-type="${type}">
            <button type="button" class="remove-btn">X</button>
            <div class="form-group">
                <label>${nameLabel}:</label>
                <input type="text" class="facility-name" value="${facility.name || ''}" required>
            </div>
            <div class="form-group location-group">
                <label>Location (Lat/Lng):</label>
                <input type="number" step="any" class="facility-lat" placeholder="Latitude" value="${facility.lat || ''}" required>
                <input type="number" step="any" class="facility-lng" placeholder="Longitude" value="${facility.lng || ''}" required>
            </div>
        </div>
    `;
}

/**
 * Renders the form for a new or existing barangay record.
 * @param {Object} [barangay={}] - The barangay object to edit, or empty for new.
 */
function renderForm(barangay = {}) {
    document.getElementById('barangay-id').value = barangay.id || '';
    document.getElementById('modal-title').textContent = barangay.id ? `Edit ${barangay.barangayName}` : 'Add New Barangay';
    
    // Core fields
    document.getElementById('barangayName').value = barangay.barangayName || '';
    document.getElementById('population').value = barangay.population || '';
    document.getElementById('barangayLat').value = barangay.barangayLocation ? barangay.barangayLocation.lat : '';
    document.getElementById('barangayLng').value = barangay.barangayLocation ? barangay.barangayLocation.lng : '';
    
    // Dynamic fields
    const hcContainer = document.getElementById('health-centers-container');
    const schoolContainer = document.getElementById('schools-container');
    hcContainer.innerHTML = '';
    schoolContainer.innerHTML = '';

    (barangay.healthCenters || []).forEach(hc => {
        hcContainer.insertAdjacentHTML('beforeend', createFacilityFields('healthCenters', hc));
    });
    
    (barangay.schools || []).forEach(school => {
        schoolContainer.insertAdjacentHTML('beforeend', createFacilityFields('schools', school));
    });
    
    // Show modal
    modal.style.display = 'flex';
}

/**
 * Collects data from the form and saves it.
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('barangay-id').value || generateId();

    // 1. Collect Facilities Data
    const collectFacilities = (containerId) => {
        const facilities = [];
        document.getElementById(containerId).querySelectorAll('.facility-group').forEach(group => {
            facilities.push({
                id: group.dataset.id,
                name: group.querySelector('.facility-name').value,
                lat: parseFloat(group.querySelector('.facility-lat').value),
                lng: parseFloat(group.querySelector('.facility-lng').value),
            });
        });
        return facilities;
    };

    // 2. Build the final data object
    const newBarangay = {
        id: id,
        barangayName: document.getElementById('barangayName').value,
        population: parseInt(document.getElementById('population').value),
        barangayLocation: {
            lat: parseFloat(document.getElementById('barangayLat').value),
            lng: parseFloat(document.getElementById('barangayLng').value)
        },
        healthCenters: collectFacilities('health-centers-container'),
        schools: collectFacilities('schools-container')
    };
    
    // 3. Update allBarangays array
    const index = allBarangays.findIndex(b => b.id === id);
    if (index > -1) {
        allBarangays[index] = newBarangay; // Update existing
    } else {
        allBarangays.push(newBarangay); // Create new
    }

    // 4. Save and Refresh
    saveBarangayData(allBarangays);
    renderBarangayList();
    modal.style.display = 'none';
}

/**
 * Deletes a barangay record.
 */
function deleteBarangay(id) {
    if (!confirm("Are you sure you want to delete this Barangay record?")) return;

    allBarangays = allBarangays.filter(b => b.id !== id);
    saveBarangayData(allBarangays);
    renderBarangayList();
}

/**
 * Renders the table list for viewing and management (R, U, D).
 */
async function renderBarangayList() {
    allBarangays = await getBarangayData(); // Load latest data
    
    if (allBarangays.length === 0) {
        barangayListContainer.innerHTML = '<p style="padding: 15px;">No barangay data available. Click "Add New Barangay" to begin.</p>';
        return;
    }

    let html = `
        <table class="barangay-list-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Population</th>
                    <th>Facilities</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    allBarangays.forEach(b => {
        const totalFacilities = b.healthCenters.length + b.schools.length;
        html += `
            <tr>
                <td>${b.barangayName}</td>
                <td>${b.population.toLocaleString()}</td>
                <td>${totalFacilities} (${b.healthCenters.length} HC, ${b.schools.length} Schools)</td>
                <td class="action-btns">
                    <button class="btn-primary edit-btn" data-id="${b.id}">Edit</button>
                    <button class="btn-secondary delete-btn" data-id="${b.id}">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    
    barangayListContainer.innerHTML = html;
}

/**
 * Initializes listeners for the CRUD page.
 */
function initCrud() {
    // Initial list render
    renderBarangayList();

    // 1. Form Submission
    form.addEventListener('submit', handleFormSubmit);

    // 2. Open Modal (Add New)
    document.getElementById('add-new-btn').addEventListener('click', () => renderForm());

    // 3. Close Modal
    modal.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => modal.style.display = 'none');
    });

    // 4. Dynamic Facility Listeners (inside the modal)
    document.getElementById('add-health-center-btn').addEventListener('click', () => {
        const container = document.getElementById('health-centers-container');
        container.insertAdjacentHTML('beforeend', createFacilityFields('healthCenters'));
    });
    
    document.getElementById('add-school-btn').addEventListener('click', () => {
        const container = document.getElementById('schools-container');
        container.insertAdjacentHTML('beforeend', createFacilityFields('schools'));
    });
    
    // 5. Remove Facility Listener (uses event delegation on the form)
    form.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('.facility-group').remove();
        }
    });

    // 6. Edit/Delete Listeners (uses event delegation on the list container)
    barangayListContainer.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('edit-btn')) {
            const barangay = allBarangays.find(b => b.id === id);
            if (barangay) renderForm(barangay);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteBarangay(id);
        }
    });
    setupLogoutListener();
}

document.addEventListener('DOMContentLoaded', initCrud);


// Ensure the sidebar navigation is updated in dashboard.html, map.html, resources.html
// to include the link: <li><a href="manage-data.html">Manage Data (CRUD)</a></li>