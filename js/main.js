// js/main.js

/**
 * Función principal que se ejecuta una vez que el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', async function() { 
    console.log("DOM cargado. Iniciando AgroSync main.js.");

    // Elemento principal de la aplicación
    const appContainer = document.querySelector('.app-container'); 

    if (!appContainer) {
        console.error("Error crítico: Falta el contenedor principal .app-container.");
        document.body.innerHTML = "<p style='color:red; font-size:18px; text-align:center; padding:20px;'>Error crítico de la aplicación.</p>";
        return;
    }

    // 1. Verifica el estado de la sesión UNA SOLA VEZ
    const loggedInUser = await checkLoginStatus(); 

    // 2. Inicializa toda la interfaz de usuario basándose en el estado de la sesión
    initializeUI(loggedInUser);
    
    // --- EVENT LISTENERS Y OTRAS INICIALIZACIONES ---
    initializeEventListeners();

    console.log("AgroSync inicializado correctamente.");
});

/**
 * Orquesta la actualización de toda la interfaz de usuario.
 * @param {object|null} user - El objeto de usuario si está logueado, o null si es invitado.
 */
function initializeUI(user) {
    if (user) {
        console.log("Usuario logueado:", user);
    } else {
        console.log("Usuario no logueado (invitado).");
    }

    // Llama a las funciones específicas para actualizar cada parte de la UI
    if (typeof updateProfileUI === 'function') {
        updateProfileUI(user);
    }
    if (typeof fetchAndDisplayPlants === 'function') {
        fetchAndDisplayPlants(user);
    }
    if (typeof updateAssistantUI === 'function') {
        updateAssistantUI(user);
    }
    if (typeof getGeoLocationAndFetchWeather === 'function') {
        getGeoLocationAndFetchWeather();
    }
    if (typeof initializeDarkMode === 'function') {
        initializeDarkMode();
    }
    if (typeof initializeTouchFeedback === 'function') {
        initializeTouchFeedback();
    }
}

/**
 * Centraliza la asignación de todos los event listeners.
 */
function initializeEventListeners() {
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton && typeof logoutUser === 'function') {
        logoutButton.addEventListener('click', logoutUser);
    }

    // Puedes agregar más listeners aquí si es necesario
    // Ejemplo:
    // const calculateCompostBtn = document.getElementById('calculate-compost-btn');
    // if (calculateCompostBtn && typeof calculateCompost === 'function') {
    //     calculateCompostBtn.addEventListener('click', calculateCompost);
    // }
}