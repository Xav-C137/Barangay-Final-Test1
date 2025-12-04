// data-loader.js - Handles fetching of the local JSON data.

/**
 * Fetches the barangay resources data from the local JSON file.
 * @returns {Promise<Array>} A promise that resolves to an array of barangay objects.
 */
export async function getBarangayData() {
    try {
        const response = await fetch('data/barangay-resources.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not load barangay data:", error);
        return []; // Return an empty array on failure
    }
}