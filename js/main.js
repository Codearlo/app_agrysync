// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // --- INICIALIZACIÓN DE AUTENTICACIÓN ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-btn');
    const bottomNav = document.querySelector('.bottom-nav');

    if (loginForm && typeof handleLoginFormSubmit === 'function') {
        loginForm.addEventListener('submit', handleLoginFormSubmit);
    }
    if (registerForm && typeof handleRegisterFormSubmit === 'function') {
        registerForm.addEventListener('submit', handleRegisterFormSubmit);
    }
    if (logoutButton && typeof logoutUser === 'function') {
        logoutButton.addEventListener('click', logoutUser);
    }

    // Verificar estado de login al cargar
    const loggedInUser = checkLoginStatus();
    if (loggedInUser) {
        updateUIAfterLogin(loggedInUser);
        if (bottomNav) bottomNav.style.display = 'flex';
        showPage('home'); // Mostrar home si está logueado
        if (typeof fetchAndDisplayPlants === 'function') {
            fetchAndDisplayPlants(); // Cargar plantas del usuario
        }
    } else {
        if (bottomNav) bottomNav.style.display = 'none'; // Ocultar nav si no está logueado
        showPage('login'); // Mostrar login si no está logueado
    }

    // --- INICIALIZACIÓN DEL MODO OSCURO ---
    // (código de modo oscuro existente)
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
    
    if (darkModeToggleContainer) {
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

    // --- FUNCIONALIDAD DE PLANTAS (YA INCLUIDA EN LA LÓGICA DE AUTH) ---
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
