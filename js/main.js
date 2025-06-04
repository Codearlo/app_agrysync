// js/main.js

document.addEventListener('DOMContentLoaded', async function() { // Hacer la función async
    // --- VERIFICACIÓN DE AUTENTICACIÓN AL CARGAR INDEX.HTML ---
    const loggedInUser = checkLoginStatus(); 
    const bottomNav = document.querySelector('.bottom-nav');
    const mainAppHeaderContainer = document.getElementById('main-app-header'); // El contenedor <header>

    if (!loggedInUser) {
        window.location.href = 'login.html';
        return; // Detener si no está logueado
    }

    // Si el usuario está logueado, cargar el header y continuar
    let headerContentLoaded = false;
    if (typeof loadAppHeaderStructure === 'function') {
        console.log("Intentando cargar estructura del header...");
        headerContentLoaded = await loadAppHeaderStructure(); // Esperar a que el header se cargue
    } else {
        console.error("Función loadAppHeaderStructure no definida. Asegúrate que ui.js esté cargado y la función exportada/disponible.");
    }

    if (!headerContentLoaded) {
        console.error("El contenido del header principal no se pudo cargar. La aplicación podría no funcionar correctamente. Verifica la ruta a 'includes/app_header.html' y el contenido del archivo.");
        // Opcionalmente, podrías mostrar un mensaje de error más visible en la UI aquí
        if(mainAppHeaderContainer) mainAppHeaderContainer.innerHTML = "<p style='color:white; text-align:center; padding:1rem;'>Error al cargar el header.</p>";
        // Decidimos si continuar o no. Si el header es crítico, podríamos retornar.
        // return; 
    }
    
    // Solo continuar con la inicialización completa de la UI si el header (o al menos su intento de carga) ha ocurrido.
    if (typeof updateUIAfterLogin === 'function') {
        updateUIAfterLogin(loggedInUser); // Actualizar info de perfil que podría estar en el header o en la página de perfil
    } else {
        console.error("Función updateUIAfterLogin no definida.");
    }

    if (bottomNav) {
        bottomNav.style.display = 'flex'; 
        console.log("Barra de navegación inferior debería estar visible.");
    } else {
        console.error("Elemento .bottom-nav no encontrado.");
    }
    
    // Mostrar página de inicio por defecto para usuarios logueados
    // Esto también llamará a updateAppHeader para establecer el título/subtítulo correcto
    if (typeof showPage === 'function') {
        showPage('home'); 
    } else {
        console.error("Función showPage no definida.");
    }

    // Cargar plantas del usuario
    if (typeof fetchAndDisplayPlants === 'function') {
        fetchAndDisplayPlants(); 
    } else {
        console.error("Función fetchAndDisplayPlants no definida.");
    }
    
    // --- EVENT LISTENER BOTÓN DE CERRAR SESIÓN ---
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton && typeof logoutUser === 'function') {
        logoutButton.addEventListener('click', logoutUser);
    } else if(logoutButton) {
        console.error("Función logoutUser no definida pero el botón existe.");
    }

    // --- INICIALIZACIÓN DEL MODO OSCURO ---
    const savedDarkMode = localStorage.getItem('darkMode');
    const darkModeToggleContainer = document.getElementById('darkModeToggleContainer');
    const darkModeCheckbox = document.getElementById('darkModeToggle'); 

    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (darkModeToggleContainer) darkModeToggleContainer.classList.add('active');
        if (darkModeCheckbox) darkModeCheckbox.checked = true;
    } else {
        if (darkModeToggleContainer) darkModeToggleContainer.classList.remove('active');
        if (darkModeCheckbox) darkModeCheckbox.checked = false;
    }
    
    if (darkModeToggleContainer && typeof toggleDarkMode === 'function') {
        darkModeToggleContainer.addEventListener('click', () => {
            if(darkModeCheckbox) darkModeCheckbox.click(); 
            toggleDarkMode(); 
        });
    }
    
    // --- INICIALIZACIÓN DEL CLIMA ---
    if (typeof getGeoLocationAndFetchWeather === 'function') {
        getGeoLocationAndFetchWeather();
    }

    const locationToggleContainer = document.getElementById('locationToggleContainer');
    const locationCheckbox = document.getElementById('locationToggle');

    if (locationToggleContainer && locationCheckbox) {
        if(locationCheckbox.checked) {
            locationToggleContainer.classList.add('active');
        } else {
            locationToggleContainer.classList.remove('active');
        }

        locationToggleContainer.addEventListener('click', () => {
            locationCheckbox.checked = !locationCheckbox.checked; 
            locationToggleContainer.classList.toggle('active', locationCheckbox.checked); 
            if (typeof getGeoLocationAndFetchWeather === 'function') {
                getGeoLocationAndFetchWeather(); 
            }
        });
    }
    
    // --- EVENT LISTENER CALCULADORA DE COMPOSTAJE ---
    const calculateCompostBtn = document.getElementById('calculate-compost-btn');
    if (calculateCompostBtn && typeof calculateCompost === 'function') {
        calculateCompostBtn.addEventListener('click', calculateCompost);
    }

    // --- INICIALIZACIÓN DEL CHAT DEL ASISTENTE ---
    // Las variables chatMessagesContainerAssistant, etc., se deben declarar globalmente en assistant.js o pasarse
    if (typeof addMessageToChat === 'function' && typeof getGeminiResponse === 'function') { 
        // Asegurarse que los elementos del DOM del chat existan antes de añadir listeners
        const assistantPage = document.getElementById('assistant');
        if (assistantPage) { // Solo configurar si la página del asistente existe en el DOM
            chatMessagesContainerAssistant = assistantPage.querySelector('.chat-messages');
            userInputAssistant = assistantPage.querySelector('#userInput'); // Asumir que el ID es único o está dentro de #assistant
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
            } else {
                // console.warn("Elementos del chat del asistente no encontrados en la página del asistente.");
            }
        }
    }

    // --- FUNCIONALIDAD DE PLANTAS (FORMULARIO DE AÑADIR) ---
    const addPlantForm = document.getElementById('add-plant-form');
    if (addPlantForm && typeof handleAddPlantFormSubmit === 'function') {
        addPlantForm.addEventListener('submit', handleAddPlantFormSubmit);
    }
    
    // --- FEEDBACK TÁCTIL VISUAL ---
    document.querySelectorAll('button, .nav-item, .action-btn, .toggle-switch').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.97)';
        }, { passive: true });
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // --- CONFIGURACIÓN DE INTERRUPTORES GENÉRICOS ---
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        if(toggle.id === 'darkModeToggleContainer' || toggle.id === 'locationToggleContainer') return;

        const checkbox = toggle.querySelector('input[type="checkbox"].sr-only'); 
        if (checkbox && checkbox.checked) {
            toggle.classList.add('active');
        }

        toggle.addEventListener('click', function() {
            if (!this.id || (this.id !== 'darkModeToggleContainer' && this.id !== 'locationToggleContainer')) {
                 this.classList.toggle('active');
                 if (checkbox) {
                    checkbox.checked = this.classList.contains('active');
                 }
            }
        });
    });
});
