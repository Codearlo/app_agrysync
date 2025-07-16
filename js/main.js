// js/main.js

document.addEventListener('DOMContentLoaded', async function() { 
    console.log("DOM cargado. Iniciando AgroSync main.js.");

    // Ahora checkLoginStatus es asíncrono, usamos await
    const loggedInUser = await checkLoginStatus(); 
    
    const appContainer = document.querySelector('.app-container'); 

    if (!appContainer) {
        console.error("Error crítico: Falta el contenedor principal .app-container.");
        document.body.innerHTML = "<p style='color:red; font-size:18px; text-align:center; padding:20px;'>Error crítico de la aplicación.</p>";
        return;
    }
    
    // Configurar el estado de la UI basado en si el usuario está logueado o no
    if (loggedInUser) {
        console.log("Usuario logueado:", loggedInUser);
        // Asegúrate de que las funciones para actualizar la UI existen
        if (typeof updateUIAfterLogin === 'function') updateUIAfterLogin(loggedInUser);
        if (typeof fetchAndDisplayPlants === 'function') fetchAndDisplayPlants();
    } else {
        console.log("Usuario no logueado (invitado).");
        if (typeof updateUIForGuest === 'function') updateUIForGuest();
        if (typeof fetchAndDisplayPlants === 'function') fetchAndDisplayPlants(); // Muestra el prompt de login
    }
    
    // El resto de la inicialización
    const currentPageId = document.querySelector('.page.active')?.id || 'home';
    if (typeof showPage === 'function') {
        showPage(currentPageId); 
    } else {
        console.error("La función showPage no está definida. Revisa la carga de tus scripts.");
    }
    
    if (typeof getGeoLocationAndFetchWeather === 'function') {
        getGeoLocationAndFetchWeather();
    }
    
    // --- EVENT LISTENERS ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton && typeof logoutUser === 'function') {
        logoutButton.addEventListener('click', logoutUser);
    }

    const calculateCompostBtn = document.getElementById('calculate-compost-btn');
    if (calculateCompostBtn && typeof calculateCompost === 'function') {
        calculateCompostBtn.addEventListener('click', calculateCompost);
    }

    const addPlantForm = document.getElementById('add-plant-form');
    if (addPlantForm && typeof handleAddPlantFormSubmit === 'function') {
        addPlantForm.addEventListener('submit', handleAddPlantFormSubmit);
    }

    if (typeof initializeAssistantChat === 'function') {
        initializeAssistantChat();
    }
    
    if (typeof updateAssistantForUser === 'function') {
        // Se llama dentro de updateUIAfterLogin o updateUIForGuest, pero podemos asegurarlo aquí
        updateAssistantForUser();
    }
    
    if (typeof initializeDarkMode === 'function') initializeDarkMode();
    if (typeof initializeLocationToggle === 'function') initializeLocationToggle();
    if (typeof initializeTouchFeedback === 'function') initializeTouchFeedback();
    if (typeof initializeGenericToggles === 'function') initializeGenericToggles();

    console.log("AgroSync inicializado correctamente.");
});