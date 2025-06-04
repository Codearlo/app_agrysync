// js/main.js

document.addEventListener('DOMContentLoaded', async function() { 
    console.log("DOM completamente cargado y parseado.");

    // --- VERIFICACIÓN DE AUTENTICACIÓN (TEMPORALMENTE DESACTIVADA) ---
    // const loggedInUser = checkLoginStatus(); 
    // const mainAppHeaderContainer = document.getElementById('main-app-header');
    // const mainBottomNavContainer = document.getElementById('main-bottom-nav');

    // if (!loggedInUser) {
    //     console.log("Usuario no logueado. Redirigiendo a login.html (VERIFICACIÓN DESACTIVADA)");
    //     // window.location.href = 'login.html'; // Desactivado para desarrollo
    //     // return; 
    // }
    // console.log("Usuario (simulado o real si la verificación estuviera activa):", loggedInUser);

    // Asumimos que hay un usuario para propósitos de desarrollo sin login
    const loggedInUser = { id: 1, username: "DevUser", email: "dev@example.com" }; // Usuario de prueba
    console.log("VERIFICACIÓN DE LOGIN DESACTIVADA. Usando usuario de prueba:", loggedInUser);

    const mainAppHeaderContainer = document.getElementById('main-app-header');
    const mainBottomNavContainer = document.getElementById('main-bottom-nav');


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
        // Aunque falle la carga del contenido de la nav, intentamos mostrar el contenedor si existe
        mainBottomNavContainer.style.display = 'flex'; 
    }
    
    // Actualizar UI con datos del usuario (ahora usa el usuario de prueba)
    if (typeof updateUIAfterLogin === 'function') {
        updateUIAfterLogin(loggedInUser); 
    } else {
        console.error("Función updateUIAfterLogin no definida (debería estar en auth.js).");
    }

    // Mostrar navegación y página de inicio
    // Se asume que si la verificación de login está desactivada, queremos ver la app principal
    if (mainBottomNavContainer) { // Mostrar la barra de navegación siempre si la verificación está desactivada
        mainBottomNavContainer.style.display = 'flex'; 
        console.log("Barra de navegación inferior establecida a display:flex (login check desactivado).");
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

    // Inicializar chat del asistente
    if (typeof initializeAssistantChat === 'function') { 
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
    
    // --- INICIALIZACIONES DE UI GENERALES ---
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

    // --- SIMULACIÓN (OPCIONAL) ---
    if (typeof startPlantHealthSimulation === 'function') {
        // startPlantHealthSimulation(); 
    }
});
