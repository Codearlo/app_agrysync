// js/main.js

document.addEventListener('DOMContentLoaded', async function() { 
    console.log("DOM cargado. Iniciando AgroSync main.js (modo acceso público).");

    const loggedInUser = checkLoginStatus(); // auth.js
    const mainAppHeaderContainer = document.getElementById('main-app-header');
    const mainBottomNavContainer = document.getElementById('main-bottom-nav');
    const appContainer = document.querySelector('.app-container'); 

    if (!mainAppHeaderContainer || !mainBottomNavContainer || !appContainer) {
        console.error("Error crítico: Faltan contenedores base. Verifica index.html.");
        document.body.innerHTML = "<p style='color:red; font-size:18px; text-align:center; padding:20px;'>Error crítico de la aplicación.</p>";
        return;
    }

    let headerContentLoaded = false;
    if (typeof loadAppHeaderStructure === 'function') { // ui.js
        headerContentLoaded = await loadAppHeaderStructure();
    } else { console.error("loadAppHeaderStructure no definida."); }

    let bottomNavContentLoaded = false;
    if (typeof loadBottomNavigationStructure === 'function') { // ui.js
        bottomNavContentLoaded = await loadBottomNavigationStructure();
    } else { console.error("loadBottomNavigationStructure no definida."); }

    if (!headerContentLoaded && mainAppHeaderContainer) {
        mainAppHeaderContainer.innerHTML = "<div class='header-content'><p style='color:white;text-align:center;'>Error header</p></div>";
    }
    if (!bottomNavContentLoaded && mainBottomNavContainer) {
        mainBottomNavContainer.innerHTML = "<p style='color:var(--danger);text-align:center;'>Error nav</p>";
    }
    
    // La barra de navegación siempre es visible en este modelo
    if (mainBottomNavContainer) mainBottomNavContainer.style.display = 'flex';

    if (loggedInUser) {
        console.log("Usuario logueado:", loggedInUser);
        if (typeof updateUIAfterLogin === 'function') updateUIAfterLogin(loggedInUser); // auth.js
        if (typeof fetchAndDisplayPlants === 'function') fetchAndDisplayPlants(); // plants.js (usará el user de localStorage)
    } else {
        console.log("Usuario no logueado (invitado).");
        if (typeof updateUIForGuest === 'function') updateUIForGuest(); // auth.js
        if (typeof fetchAndDisplayPlants === 'function') fetchAndDisplayPlants(); // plants.js (mostrará prompt de login)
    }
    
    if (typeof showPage === 'function') { // ui.js
        showPage('home'); 
    } else { console.error("showPage no definida."); }
    
    if (typeof getGeoLocationAndFetchWeather === 'function') { // weather.js
        getGeoLocationAndFetchWeather();
    } else { console.error("getGeoLocationAndFetchWeather no definida."); }

    // --- EVENT LISTENERS ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton && typeof logoutUser === 'function') { // auth.js
        logoutButton.addEventListener('click', logoutUser);
    }

    const calculateCompostBtn = document.getElementById('calculate-compost-btn');
    if (calculateCompostBtn && typeof calculateCompost === 'function') { // compost.js
        calculateCompostBtn.addEventListener('click', calculateCompost);
    }

    const addPlantForm = document.getElementById('add-plant-form');
    if (addPlantForm && typeof handleAddPlantFormSubmit === 'function') { // plants.js
        addPlantForm.addEventListener('submit', handleAddPlantFormSubmit);
    }

    if (typeof initializeAssistantChat === 'function') { // assistant.js
        initializeAssistantChat();
    }
    
    if (typeof initializeDarkMode === 'function') { // ui.js
        initializeDarkMode();
    }
    if (typeof initializeLocationToggle === 'function') { // ui.js
        initializeLocationToggle();
    }
    if (typeof initializeTouchFeedback === 'function') { // ui.js
        initializeTouchFeedback();
    }
    if (typeof initializeGenericToggles === 'function') { // ui.js
        initializeGenericToggles();
    }
});
