// js/weather.js

// Seleccionar elementos del DOM una vez, idealmente en DOMContentLoaded o al inicio del script
const weatherTempEl = document.getElementById('weather-temp');
const weatherHumidityEl = document.getElementById('weather-humidity');
const weatherWindEl = document.getElementById('weather-wind');
const weatherIconEl = document.getElementById('weather-icon-element'); 
const weatherLocationEl = document.getElementById('weather-location');

const weatherIconsMap = {
    0: 'fas fa-sun', 1: 'fas fa-cloud-sun', 2: 'fas fa-cloud-sun', 3: 'fas fa-cloud',
    45: 'fas fa-smog', 48: 'fas fa-smog',
    51: 'fas fa-cloud-rain', 53: 'fas fa-cloud-rain', 55: 'fas fa-cloud-showers-heavy',
    56: 'fas fa-snowflake', 57: 'fas fa-snowflake',
    61: 'fas fa-cloud-rain', 63: 'fas fa-cloud-rain', 65: 'fas fa-cloud-showers-heavy',
    66: 'fas fa-snowflake', 67: 'fas fa-snowflake',
    71: 'fas fa-snowflake', 73: 'fas fa-snowflake', 75: 'fas fa-snowflake', 77: 'fas fa-snowflake',
    80: 'fas fa-cloud-showers-heavy', 81: 'fas fa-cloud-showers-heavy', 82: 'fas fa-poo-storm',
    85: 'fas fa-snowflake', 86: 'fas fa-snowflake',
    95: 'fas fa-bolt', 96: 'fas fa-bolt', 99: 'fas fa-bolt',
};

/**
 * Actualiza la interfaz de usuario con los datos del clima.
 * @param {object|null} data - Los datos del clima de la API, o null si hay error.
 * @param {string} locationName - El nombre de la ubicación para mostrar.
 */
function updateWeatherUI(data, locationName = "Ubicación actual") {
    if (!weatherTempEl || !weatherHumidityEl || !weatherWindEl || !weatherIconEl || !weatherLocationEl) {
        console.error("Algunos elementos del DOM para el clima no fueron encontrados.");
        return;
    }

    if (!data || !data.current) {
        weatherTempEl.textContent = 'N/A';
        weatherHumidityEl.textContent = 'N/A';
        weatherWindEl.textContent = 'N/A';
        weatherIconEl.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
        weatherLocationEl.textContent = 'No se pudo obtener el clima.';
        return;
    }
    const current = data.current;
    weatherTempEl.textContent = `${Math.round(current.temperature_2m)}°`;
    weatherHumidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
    weatherWindEl.textContent = `${Math.round(current.wind_speed_10m)}`;
    
    const iconClass = weatherIconsMap[current.weather_code] || 'fas fa-question-circle';
    weatherIconEl.innerHTML = `<i class="${iconClass}"></i>`;
    weatherLocationEl.textContent = `Clima para: ${locationName}`;
}

/**
 * Obtiene los datos del clima de la API de Open-Meteo.
 * @param {number} latitude - La latitud.
 * @param {number} longitude - La longitud.
 * @param {string} locationName - El nombre de la ubicación para mostrar.
 */
async function fetchWeatherData(latitude, longitude, locationName) {
    if (weatherIconEl) weatherIconEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    if (weatherLocationEl) weatherLocationEl.textContent = `Obteniendo clima para ${locationName}...`;

    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        const data = await response.json();
        updateWeatherUI(data, locationName);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        updateWeatherUI(null, "Error"); // Pasar "Error" como locationName
        if (weatherLocationEl) weatherLocationEl.textContent = `Error al obtener clima.`;
    }
}

/**
 * Intenta obtener la geolocalización del usuario y luego los datos del clima.
 * Si falla, usa una ubicación predeterminada.
 */
async function getGeoLocationAndFetchWeather() {
    const locationToggleCheckbox = document.getElementById('locationToggle');
    const defaultLat = -12.04318; // Lima, Peru
    const defaultLon = -77.02824;
    const defaultLocationName = "Lima, Perú (predeterminado)";

    if (!locationToggleCheckbox || !locationToggleCheckbox.checked) {
        if (weatherLocationEl) weatherLocationEl.textContent = "Ubicación desactivada. Usando predeterminada.";
        fetchWeatherData(defaultLat, defaultLon, defaultLocationName);
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    // Usar Nominatim para obtener el nombre de la ciudad (opcional)
                    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`);
                    const geoData = await geoResponse.json();
                    const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || "Ubicación actual";
                    fetchWeatherData(lat, lon, cityName);
                } catch (e) {
                    console.warn("No se pudo obtener el nombre de la ciudad, usando coordenadas.", e);
                    fetchWeatherData(lat, lon, `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`);
                }
            },
            (error) => {
                console.warn(`Error de geolocalización: ${error.message}. Usando predeterminada.`);
                if (weatherLocationEl) weatherLocationEl.textContent = "Error de ubicación. Usando predeterminada.";
                fetchWeatherData(defaultLat, defaultLon, defaultLocationName);
            },
            { timeout: 10000 } // Timeout para la solicitud de geolocalización
        );
    } else {
        console.warn("Geolocalización no soportada. Usando predeterminada.");
        if (weatherLocationEl) weatherLocationEl.textContent = "Geolocalización no soportada. Usando predeterminada.";
        fetchWeatherData(defaultLat, defaultLon, defaultLocationName);
    }
}
