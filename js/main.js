// js/main.js

// Importar funciones de Firebase (si usas módulos y los SDKs de Firebase)
// Para este ejemplo, asumiremos que los scripts de Firebase se cargan globalmente
// o que las funciones de Firebase estarán disponibles cuando se necesiten.
// Si usas módulos, harías algo como:
// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
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

    // --- FUNCIONALIDAD DE PLANTAS ---
    const addPlantForm = document.getElementById('add-plant-form');
    if (addPlantForm && typeof handleAddPlantFormSubmit === 'function') {
        addPlantForm.addEventListener('submit', handleAddPlantFormSubmit);
    }

    // Cargar plantas al iniciar la app (si la función está disponible)
    if (typeof fetchAndDisplayPlants === 'function') {
        fetchAndDisplayPlants();
    }
    
    // --- MOSTRAR PÁGINA INICIAL ---
    if (typeof showPage === 'function') {
        showPage('home'); 
    }

    // --- SIMULACIÓN DE ACTUALIZACIÓN DE SALUD DE PLANTA (EJEMPLO) ---
    // Este es un ejemplo y puede no ser necesario si la salud se maneja desde la BD
    // setInterval(() => {
    //     const healthElement = document.querySelector('#home .plant-item:first-child .health-value');
    //     if (healthElement && healthElement.textContent.includes('%')) {
    //         let currentHealth = parseInt(healthElement.textContent);
    //         currentHealth = Math.max(60, Math.min(99, currentHealth + (Math.floor(Math.random() * 7) - 3)));
    //         healthElement.textContent = currentHealth + '%';
    //         const parentItem = healthElement.closest('.plant-item');
    //         if (parentItem) {
    //             parentItem.classList.remove('health-good', 'health-warning', 'health-danger');
    //             healthElement.classList.remove('health-good', 'health-warning', 'health-danger');
                
    //             if (currentHealth < 75) {
    //                 healthElement.classList.add('health-danger');
    //             } else if (currentHealth < 90) {
    //                 healthElement.classList.add('health-warning');
    //             } else {
    //                 healthElement.classList.add('health-good');
    //             }
    //         }
    //     }
    // }, 15000);

    // --- FEEDBACK TÁCTIL VISUAL ---
    document.querySelectorAll('button, .nav-item, .action-btn, .toggle-switch').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.97)';
        }, { passive: true });
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // --- CONFIGURACIÓN DE INTERRUPTORES GENÉRICOS (NO DARK MODE/LOCATION) ---
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
