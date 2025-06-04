// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // --- VERIFICACIÓN DE AUTENTICACIÓN AL CARGAR INDEX.HTML ---
    const loggedInUser = checkLoginStatus(); // Asume que checkLoginStatus está en auth.js y ya cargado
    const bottomNav = document.querySelector('.bottom-nav');

    if (!loggedInUser) {
        // Si no hay usuario, redirigir a la página de login
        window.location.href = 'login.html';
        return; // Detener la ejecución de más scripts en esta página
    }

    // Si el usuario está logueado, continuar con la inicialización de la app
    if (typeof updateUIAfterLogin === 'function') {
        updateUIAfterLogin(loggedInUser);
    }
    if (bottomNav) bottomNav.style.display = 'flex'; // Mostrar navegación
    
    // Mostrar página de inicio por defecto para usuarios logueados
    if (typeof showPage === 'function') {
        showPage('home'); 
    } else {
        console.error("Función showPage no definida. Asegúrate que ui.js esté cargado antes de main.js.");
    }

    // Cargar plantas del usuario
    if (typeof fetchAndDisplayPlants === 'function') {
        fetchAndDisplayPlants(); 
    } else {
        console.error("Función fetchAndDisplayPlants no definida. Asegúrate que plants.js esté cargado.");
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
    if (typeof addMessageToChat === 'function') { 
        chatMessagesContainerAssistant = document.querySelector('#assistant .chat-messages');
        userInputAssistant = document.getElementById('userInput'); 
        sendMessageBtnAssistant = document.getElementById('sendMessageBtn');  

        if (sendMessageBtnAssistant && userInputAssistant) {
            sendMessageBtnAssistant.addEventListener('click', () => {
                const messageText = userInputAssistant.value.trim();
                if (messageText) {
                    addMessageToChat(messageText, 'user');
                    if (typeof getGeminiResponse === 'function') {
                        getGeminiResponse(messageText); 
                    }
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
