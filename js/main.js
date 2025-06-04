// js/main.js

document.addEventListener('DOMContentLoaded', async function() { 
    console.log("DOM completamente cargado y parseado.");

    // --- INICIALIZACIÓN DE AUTENTICACIÓN ---
    // Las funciones de auth.js (checkLoginStatus, etc.) se asumen disponibles globalmente
    // o se importarían si se usan módulos ES6 nativos.
    const loggedInUser = checkLoginStatus(); 
    const mainAppHeaderContainer = document.getElementById('main-app-header');
    const mainBottomNavContainer = document.getElementById('main-bottom-nav');

    if (!loggedInUser) {
        console.log("Usuario no logueado. Redirigiendo a login.html");
        window.location.href = 'login.html';
        return; 
    }
    console.log("Usuario logueado:", loggedInUser);

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

    // Mostrar mensajes de error si la carga falla
    if (!headerContentLoaded && mainAppHeaderContainer) {
        mainAppHeaderContainer.innerHTML = "<div class='header-content' style='padding: 1rem; text-align: center; color: white;'><p>Error al cargar el header. Verifica la consola.</p></div>";
    }
    if (!bottomNavContentLoaded && mainBottomNavContainer) {
        mainBottomNavContainer.innerHTML = "<p style='text-align:center; padding:0.5rem; width:100%; color: var(--danger);'>Error al cargar navegación.</p>";
        mainBottomNavContainer.style.display = 'flex'; 
    }
    
    // Actualizar UI con datos del usuario
    if (typeof updateUIAfterLogin === 'function') {
        updateUIAfterLogin(loggedInUser); 
    } else {
        console.error("Función updateUIAfterLogin no definida (debería estar en auth.js).");
    }

    // Mostrar navegación y página de inicio si todo cargó bien
    if (headerContentLoaded && bottomNavContentLoaded) {
        if (mainBottomNavContainer) {
            mainBottomNavContainer.style.display = 'flex'; 
            console.log("Barra de navegación inferior establecida a display:flex.");
        }
        if (typeof showPage === 'function') {
            console.log("Llamando a showPage('home') porque header y nav cargaron.");
            showPage('home'); 
        } else {
            console.error("Función showPage no definida (debería estar en ui.js).");
        }
    } else {
        console.warn("No se procede con showPage('home') porque el header o la navegación no se cargaron completamente.");
        if (mainBottomNavContainer && !bottomNavContentLoaded) {
             mainBottomNavContainer.style.display = 'none';
        }
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

    // Inicializar chat del asistente (los elementos se buscan dentro de assistant.js o aquí)
    if (typeof initializeAssistantChat === 'function') { // Asumiendo que creamos esta función en assistant.js
        initializeAssistantChat();
    } else {
         // Lógica anterior para inicializar el chat si no hay una función dedicada
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
    
    // --- INICIALIZACIONES DE UI GENERALES (MOVIDAS A UI.JS Y LLAMADAS AQUÍ) ---
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

    // --- SIMULACIÓN (OPCIONAL, MOVIDA A PLANTS.JS) ---
    if (typeof startPlantHealthSimulation === 'function') {
        // startPlantHealthSimulation(); // Descomentar si se quiere activar la simulación
    }
});
