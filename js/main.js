// js/main.js

document.addEventListener('DOMContentLoaded', async function() { 
    console.log("DOM completamente cargado y parseado. Iniciando AgroSync main.js...");

    // --- VERIFICACIÓN DE AUTENTICACIÓN (TEMPORALMENTE DESACTIVADA) ---
    const loggedInUser = { id: 1, username: "DevUser", email: "dev@example.com" }; // Usuario de prueba
    console.log("VERIFICACIÓN DE LOGIN DESACTIVADA. Usando usuario de prueba:", loggedInUser);

    const mainAppHeaderContainer = document.getElementById('main-app-header');
    const mainBottomNavContainer = document.getElementById('main-bottom-nav');
    const appContainer = document.querySelector('.app-container'); 

    if (!mainAppHeaderContainer || !mainBottomNavContainer || !appContainer) {
        console.error("Error crítico: Faltan contenedores principales (#main-app-header, #main-bottom-nav, o .app-container). Verifica tu index.html.");
        document.body.innerHTML = "<p style='color:red; font-size:18px; text-align:center; padding:20px;'>Error crítico: Faltan elementos base de la aplicación. Revisa la consola.</p>";
        return;
    }

    // Cargar componentes dinámicos de la UI (header y navegación)
    let headerContentLoaded = false;
    if (typeof loadAppHeaderStructure === 'function') {
        console.log("Llamando a loadAppHeaderStructure...");
        headerContentLoaded = await loadAppHeaderStructure();
        console.log("Resultado de loadAppHeaderStructure:", headerContentLoaded);
    } else {
        console.error("Función loadAppHeaderStructure no definida (debería estar en ui.js).");
    }

    let bottomNavContentLoaded = false;
    if (typeof loadBottomNavigationStructure === 'function') {
        console.log("Llamando a loadBottomNavigationStructure...");
        bottomNavContentLoaded = await loadBottomNavigationStructure();
        console.log("Resultado de loadBottomNavigationStructure:", bottomNavContentLoaded);
    } else {
        console.error("Función loadBottomNavigationStructure no definida (debería estar en ui.js).");
    }

    // Si alguno de los componentes esenciales no se cargó, mostrar un error y no continuar con la UI principal.
    if (!headerContentLoaded || !bottomNavContentLoaded) {
        console.error("FALLO CRÍTICO: El header o la navegación inferior no se pudieron cargar. La aplicación no se mostrará correctamente.");
        if (!headerContentLoaded && mainAppHeaderContainer) {
            mainAppHeaderContainer.innerHTML = "<div class='header-content' style='padding: 1rem; text-align: center; color: white;'><p>Error al cargar el header. Verifica la consola (Network tab para 'includes/app_header.html').</p></div>";
        }
        if (!bottomNavContentLoaded && mainBottomNavContainer) {
            mainBottomNavContainer.innerHTML = "<p style='text-align:center; padding:0.5rem; width:100%; color: var(--danger);'>Error al cargar navegación. Verifica la consola (Network tab para 'includes/bottom_navigation.html').</p>";
            mainBottomNavContainer.style.display = 'flex'; 
        }
        // Ocultar el resto de las páginas si los componentes base fallan
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        if(mainBottomNavContainer && !bottomNavContentLoaded) mainBottomNavContainer.style.display = 'none'; // Ocultar nav si su contenido falló
        return; // Detener la inicialización de la UI principal
    }
    
    console.log("Header y Navegación cargados o intento de carga completado.");

    // Actualizar UI con datos del usuario
    if (typeof updateUIAfterLogin === 'function') {
        updateUIAfterLogin(loggedInUser); 
    } else {
        console.error("Función updateUIAfterLogin no definida (debería estar en auth.js).");
    }

    // Mostrar navegación y página de inicio
    if (mainBottomNavContainer) {
        mainBottomNavContainer.style.display = 'flex'; 
        console.log("Barra de navegación inferior establecida a display:flex.");
    }
    
    if (typeof showPage === 'function') {
        console.log("Llamando a showPage('home').");
        showPage('home'); 
    } else {
        console.error("Función showPage no definida (debería estar en ui.js).");
    }
    
    // Cargar datos específicos de la aplicación
    if (typeof fetchAndDisplayPlants === 'function') {
        fetchAndDisplayPlants(); 
    } else {
        console.error("Función fetchAndDisplayPlants no definida (debería estar en plants.js).");
    }
    
    if (typeof getGeoLocationAndFetchWeather === 'function') {
        getGeoLocationAndFetchWeather();
    } else {
        console.error("Función getGeoLocationAndFetchWeather no definida (debería estar en weather.js).");
    }

    // --- EVENT LISTENERS PARA FUNCIONALIDADES ESPECÍFICAS ---
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
    } else {
        if (typeof addMessageToChat === 'function' && typeof getGeminiResponse === 'function') { 
            const assistantPage = document.getElementById('assistant');
            if (assistantPage) { 
                chatMessagesContainerAssistant = assistantPage.querySelector('.chat-messages');
                userInputAssistant = assistantPage.querySelector('#userInput'); 
                sendMessageBtnAssistant = assistantPage.querySelector('#sendMessageBtn');  

                if (sendMessageBtnAssistant && userInputAssistant && chatMessagesContainerAssistant) {
                    sendMessageBtnAssistant.addEventListener('click', () => {
                        const messageText = userInputAssistant.value.trim();
                        if (messageText) {
                            addMessageToChat(messageText, 'user');
                            getGeminiResponse(messageText); 
                            userInputAssistant.value = '';
                            userInputAssistant.focus();
                        }
                    });
                    userInputAssistant.addEventListener('keypress', (event) => {
                        if (event.key === 'Enter') {
                            if(sendMessageBtnAssistant) sendMessageBtnAssistant.click();
                        }
                    });
                }
            }
        }
    }
    
    if (typeof initializeDarkMode === 'function') {
        initializeDarkMode();
    } else {
        console.error("Función initializeDarkMode no definida (debería estar en ui.js).");
    }

    if (typeof initializeLocationToggle === 'function') {
        initializeLocationToggle();
    } else {
        console.error("Función initializeLocationToggle no definida (debería estar en ui.js).");
    }
    
    if (typeof initializeTouchFeedback === 'function') {
        initializeTouchFeedback();
    } else {
        console.error("Función initializeTouchFeedback no definida (debería estar en ui.js).");
    }

    if (typeof initializeGenericToggles === 'function') {
        initializeGenericToggles();
    } else {
        console.error("Función initializeGenericToggles no definida (debería estar en ui.js).");
    }

    if (typeof startPlantHealthSimulation === 'function') {
        // startPlantHealthSimulation(); 
    }
});
