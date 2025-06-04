// js/main.js

document.addEventListener('DOMContentLoaded', async function() { // Hacer la función async
    // --- VERIFICACIÓN DE AUTENTICACIÓN AL CARGAR INDEX.HTML ---
    const loggedInUser = checkLoginStatus(); 
    const bottomNav = document.querySelector('.bottom-nav');
    const mainAppHeader = document.getElementById('main-app-header');

    if (!loggedInUser) {
        window.location.href = 'login.html';
        return; 
    }

    // Si el usuario está logueado, cargar el header y continuar
    let headerLoaded = false;
    if (typeof loadAppHeaderStructure === 'function') {
        headerLoaded = await loadAppHeaderStructure(); // Esperar a que el header se cargue
    } else {
        console.error("Función loadAppHeaderStructure no definida.");
    }

    if (!headerLoaded) {
        // Si el header no se pudo cargar, podríamos mostrar un error o no continuar.
        // Por ahora, la app podría verse extraña sin header.
        console.error("El header principal no se pudo cargar. La aplicación podría no funcionar correctamente.");
        // Opcionalmente, ocultar el contenedor de la app o mostrar un mensaje de error global.
    }
    
    if (typeof updateUIAfterLogin === 'function') {
        updateUIAfterLogin(loggedInUser); // Actualizar info de perfil
    }
    if (bottomNav) bottomNav.style.display = 'flex'; 
    
    // Mostrar página de inicio por defecto para usuarios logueados
    if (typeof showPage === 'function') {
        showPage('home'); // Esto también actualizará el contenido del header
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
