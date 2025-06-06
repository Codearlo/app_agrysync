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

    // Verificar si el header y navegación ya tienen contenido (modo estático)
    const headerHasContent = mainAppHeaderContainer.querySelector('.header-content') !== null;
    const navHasContent = mainBottomNavContainer.querySelector('.nav-item') !== null;

    console.log("Header tiene contenido:", headerHasContent);
    console.log("Navegación tiene contenido:", navHasContent);

    // Solo cargar dinámicamente si no existe contenido estático
    if (!headerHasContent) {
        console.log("Cargando header dinámicamente...");
        if (typeof loadAppHeaderStructure === 'function') {
            await loadAppHeaderStructure();
        } else {
            console.error("loadAppHeaderStructure no definida.");
            mainAppHeaderContainer.innerHTML = "<div class='header-content'><div class='app-title'>AgroSync <i class='fas fa-leaf'></i></div><div class='app-subtitle'>Tu jardín inteligente</div></div>";
        }
    }

    if (!navHasContent) {
        console.log("Cargando navegación dinámicamente...");
        if (typeof loadBottomNavigationStructure === 'function') {
            await loadBottomNavigationStructure();
        } else {
            console.error("loadBottomNavigationStructure no definida.");
        }
    }
    
    // La barra de navegación siempre es visible
    if (mainBottomNavContainer) {
        mainBottomNavContainer.style.display = 'flex';
    }

    // Configurar usuario
    if (loggedInUser) {
        console.log("Usuario logueado:", loggedInUser);
        if (typeof updateUIAfterLogin === 'function') updateUIAfterLogin(loggedInUser);
        if (typeof fetchAndDisplayPlants === 'function') fetchAndDisplayPlants();
    } else {
        console.log("Usuario no logueado (invitado).");
        if (typeof updateUIForGuest === 'function') updateUIForGuest();
        if (typeof fetchAndDisplayPlants === 'function') fetchAndDisplayPlants();
    }
    
    // Mostrar página inicial
    if (typeof showPage === 'function') {
        showPage('home'); 
    } else {
        console.error("showPage no definida.");
        // Función básica de respaldo
        window.showPage = function(pageId) {
            console.log('Mostrando página:', pageId);
            
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
            }
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            const activeNavItem = document.querySelector(`[onclick="showPage('${pageId}')"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }
        };
        window.showPage('home');
    }
    
    // Cargar clima
    if (typeof getGeoLocationAndFetchWeather === 'function') {
        getGeoLocationAndFetchWeather();
    } else {
        console.error("getGeoLocationAndFetchWeather no definida.");
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

    // Inicializar chat del asistente
    if (typeof initializeAssistantChat === 'function') {
        initializeAssistantChat();
    }
    
    // Inicializar el estado del asistente según el usuario
    if (typeof updateAssistantForUser === 'function') {
        updateAssistantForUser();
    }
    
    // Inicializar toggles y configuraciones
    if (typeof initializeDarkMode === 'function') {
        initializeDarkMode();
    }
    if (typeof initializeLocationToggle === 'function') {
        initializeLocationToggle();
    }
    if (typeof initializeTouchFeedback === 'function') {
        initializeTouchFeedback();
    }
    if (typeof initializeGenericToggles === 'function') {
        initializeGenericToggles();
    }

    console.log("AgroSync inicializado correctamente.");
});