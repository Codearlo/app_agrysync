// js/main.js

document.addEventListener('DOMContentLoaded', async function() { 
    const loggedInUser = checkLoginStatus(); 
    const mainAppHeaderContainer = document.getElementById('main-app-header');
    const mainBottomNavContainer = document.getElementById('main-bottom-nav');

    if (!loggedInUser) {
        window.location.href = 'login.html';
        return; 
    }

    let headerContentLoaded = false;
    if (typeof loadAppHeaderStructure === 'function') {
        headerContentLoaded = await loadAppHeaderStructure(); 
    } else {
        console.error("Función loadAppHeaderStructure no definida.");
    }

    let bottomNavContentLoaded = false;
    if (typeof loadBottomNavigationStructure === 'function') {
        bottomNavContentLoaded = await loadBottomNavigationStructure();
    } else {
        console.error("Función loadBottomNavigationStructure no definida.");
    }

    if (!headerContentLoaded) {
        console.error("El contenido del header principal no se pudo cargar.");
        if(mainAppHeaderContainer) mainAppHeaderContainer.innerHTML = "<p style='color:white; text-align:center; padding:1rem;'>Error al cargar el header.</p>";
    }
    if (!bottomNavContentLoaded) {
        console.error("El contenido de la navegación inferior no se pudo cargar.");
        if(mainBottomNavContainer) mainBottomNavContainer.innerHTML = "<p style='text-align:center; padding:0.5rem;'>Error al cargar navegación.</p>";
    }
    
    if (typeof updateUIAfterLogin === 'function') {
        updateUIAfterLogin(loggedInUser); 
    } else {
        console.error("Función updateUIAfterLogin no definida.");
    }

    if (mainBottomNavContainer && bottomNavContentLoaded) { // Mostrar solo si se cargó
        mainBottomNavContainer.style.display = 'flex'; 
        console.log("Barra de navegación inferior debería estar visible.");
    } else if (mainBottomNavContainer) {
        mainBottomNavContainer.style.display = 'none'; // Ocultar si no se cargó bien
    }
    
    if (typeof showPage === 'function') {
        showPage('home'); 
    } else {
        console.error("Función showPage no definida.");
    }

    if (typeof fetchAndDisplayPlants === 'function') {
        fetchAndDisplayPlants(); 
    } else {
        console.error("Función fetchAndDisplayPlants no definida.");
    }
    
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton && typeof logoutUser === 'function') {
        logoutButton.addEventListener('click', logoutUser);
    } else if(logoutButton) {
        console.error("Función logoutUser no definida pero el botón existe.");
    }

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
    
    const calculateCompostBtn = document.getElementById('calculate-compost-btn');
    if (calculateCompostBtn && typeof calculateCompost === 'function') {
        calculateCompostBtn.addEventListener('click', calculateCompost);
    }

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

    const addPlantForm = document.getElementById('add-plant-form');
    if (addPlantForm && typeof handleAddPlantFormSubmit === 'function') {
        addPlantForm.addEventListener('submit', handleAddPlantFormSubmit);
    }
    
    document.querySelectorAll('button, .nav-item, .action-btn, .toggle-switch').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.97)';
        }, { passive: true });
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });

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
