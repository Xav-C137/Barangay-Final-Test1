// data-loader.js - Handles fetching/saving data from localStorage (simulating JSON persistence).

const LOCAL_STORAGE_KEY = 'barangay_map_data';

/**
 * Ensures the initial data is loaded from the JSON file OR LocalStorage.
 * If LocalStorage is empty, it loads the default data from the JSON file once.
 */
async function loadInitialData() {
    // 1. Check LocalStorage
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    }

    // 2. If LocalStorage is empty, fetch default data from JSON file
    try {
        const response = await fetch('data/barangays.json');
        if (!response.ok) {
            console.error("Default JSON file not found or failed to load.");
            return [];
        }
        const defaultData = await response.json();
        
        // Save to LocalStorage for persistence
        saveBarangayData(defaultData); 
        return defaultData;

    } catch (error) {
        console.error("Could not load default barangay data:", error);
        return [];
    }
}

/**
 * Returns the current barangay data from LocalStorage.
 * @returns {Promise<Array>} A promise that resolves to an array of barangay objects.
 */
export async function getBarangayData() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    // Use the initial loading function to ensure data exists
    return data ? JSON.parse(data) : await loadInitialData(); 
}

/**
 * Saves the provided array of barangay objects to LocalStorage.
 * @param {Array} data - The array of barangay objects to save.
 */
export function saveBarangayData(data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    console.log("Data saved to LocalStorage.");
}

// Initial check to load default data if needed
loadInitialData();