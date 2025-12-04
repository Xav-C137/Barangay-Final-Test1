// weather.js - Handles interaction with the OpenWeatherMap API.

// NOTE: Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API Key
const API_KEY = '99f854f21e84659e904d96879c2fb627'; 

/**
 * Fetches current weather data for a given latitude and longitude.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {Promise<Object|null>} A promise that resolves to a weather object or null on error.
 */
export async function getWeather(lat, lng) {
    if (API_KEY === 'YOUR_API_KEY') {
        console.error("OpenWeather API Key is not set. Please update 'weather.js'.");
        // Fallback dummy data
        return {
            temp: 28,
            feels_like: 32,
            condition: "Sunny (Dummy Data)",
            iconUrl: "http://openweathermap.org/img/wn/01d.png" 
        };
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Return a clean weather object
        return {
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            condition: data.weather[0].main,
            iconUrl: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}

/**
 * Renders the weather widget HTML.
 * @param {Object} weather - The weather object from getWeather().
 * @returns {string} The HTML string for the weather widget.
 */
export function renderWeatherWidget(weather) {
    if (!weather) return `<p>Weather data unavailable.</p>`;

    return `
        <div class="weather-info">
            <img src="${weather.iconUrl}" alt="${weather.condition} icon">
            <span class="temp-main">${weather.temp}°C</span>
        </div>
        <div>
            <p class="condition">${weather.condition}</p>
            <p>Feels like: ${weather.feels_like}°C</p>
        </div>
    `;
}