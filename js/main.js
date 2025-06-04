// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // --- INICIALIZACIÓN DEL MODO OSCURO ---
    const savedDarkMode = localStorage.getItem('darkMode');
    const darkModeToggleContainer = document.getElementById('darkModeToggleContainer');
    const darkModeCheckbox = document.getElementById('darkModeToggle'); // El input real

    if (savedDarkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (darkModeToggleContainer) darkModeToggleContainer.classList.add('active');
        if (darkModeCheckbox) darkModeCheckbox.checked = true;
    } else {
        // Asegurar que el estado visual del contenedor y el checkbox estén sincronizados
        if (darkModeToggleContainer) darkModeToggleContainer.classList.remove('active');
        if (darkModeCheckbox) darkModeCheckbox.checked = false;
    }
    
    // Event listener para el contenedor del toggle de modo oscuro
    if (darkModeToggleContainer) {
        darkModeToggleContainer.addEventListener('click', () => {
            // No llamar a toggleDarkMode() directamente aquí si el checkbox lo hace.
            // El click en el contenedor ya dispara el click en el checkbox (si está bien configurado en HTML)
            // o podemos llamar a toggleDarkMode() y sincronizar el checkbox.
            // Para este setup, asumimos que el HTML está hecho para que el click en el contenedor
            // también cambie el estado del checkbox. Si no, llamar a toggleDarkMode() aquí.
            // Por ahora, la lógica de toggleDarkMode() ya actualiza el contenedor.
            // Si el checkbox está oculto y el contenedor es el único target de click:
            if(darkModeCheckbox) darkModeCheckbox.click(); // Simula click en el checkbox oculto
            toggleDarkMode(); // Llama a la función para actualizar localStorage y body class
        });
    }
    
    // --- INICIALIZACIÓN DEL CLIMA ---
    // Asegurarse que la función getGeoLocationAndFetchWeather esté disponible (cargada desde weather.js)
    if (typeof getGeoLocationAndFetchWeather === 'function') {
        getGeoLocationAndFetchWeather();
    }

    const locationToggleContainer = document.getElementById('locationToggleContainer');
    const locationCheckbox = document.getElementById('locationToggle');

    if (locationToggleContainer && locationCheckbox) {
        // Sincronizar estado visual inicial del contenedor del toggle de ubicación
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
    // Asignar elementos del DOM del chat ahora que el DOM está cargado
    // Estos son usados por las funciones en assistant.js
    if (typeof addMessageToChat === 'function') { // Verificar si assistant.js está cargado
        chatMessagesContainerAssistant = document.querySelector('#assistant .chat-messages');
        userInputAssistant = document.getElementById('userInput'); // Asumiendo que es el input del chat
        sendMessageBtnAssistant = document.getElementById('sendMessageBtn');  // Asumiendo que es el botón del chat

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
    
    // --- MOSTRAR PÁGINA INICIAL ---
    if (typeof showPage === 'function') {
        showPage('home'); 
    }

    // --- SIMULACIÓN DE ACTUALIZACIÓN DE SALUD DE PLANTA (EJEMPLO) ---
    setInterval(() => {
        const healthElement = document.querySelector('#home .plant-item:first-child .health-value');
        if (healthElement && healthElement.textContent.includes('%')) {
            let currentHealth = parseInt(healthElement.textContent);
            currentHealth = Math.max(60, Math.min(99, currentHealth + (Math.floor(Math.random() * 7) - 3)));
            healthElement.textContent = currentHealth + '%';
            const parentItem = healthElement.closest('.plant-item');
            if (parentItem) {
                // Limpiar clases antiguas antes de añadir la nueva
                parentItem.classList.remove('health-good', 'health-warning', 'health-danger');
                healthElement.classList.remove('health-good', 'health-warning', 'health-danger');
                
                if (currentHealth < 75) {
                    healthElement.classList.add('health-danger');
                } else if (currentHealth < 90) {
                    healthElement.classList.add('health-warning');
                } else {
                    healthElement.classList.add('health-good');
                }
            }
        }
    }, 15000);

    // --- FEEDBACK TÁCTIL VISUAL ---
    document.querySelectorAll('button, .nav-item, .action-btn, .toggle-switch').forEach(element => {
        element.addEventListener('touchstart', function() {
            // Aplicar un efecto visual, por ejemplo, una ligera escala
            this.style.transform = 'scale(0.97)';
        }, { passive: true });
        element.addEventListener('touchend', function() {
            // Restaurar el estado original
            this.style.transform = 'scale(1)';
        });
    });

    // --- CONFIGURACIÓN DE INTERRUPTORES GENÉRICOS (NO DARK MODE/LOCATION) ---
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        // Evitar re-asignar listeners a los que ya tienen lógica específica
        if(toggle.id === 'darkModeToggleContainer' || toggle.id === 'locationToggleContainer') return;

        const checkbox = toggle.querySelector('input[type="checkbox"].sr-only'); // Asegurar que sea el checkbox oculto
        if (checkbox && checkbox.checked) {
            toggle.classList.add('active');
        }

        toggle.addEventListener('click', function() {
            // Solo alternar la clase 'active' si no es un toggle con lógica especial
            // La lógica de los checkboxes ocultos ya debería manejarse por sus contenedores si es necesario
            if (!this.id || (this.id !== 'darkModeToggleContainer' && this.id !== 'locationToggleContainer')) {
                 this.classList.toggle('active');
                 if (checkbox) {
                    checkbox.checked = this.classList.contains('active');
                 }
            }
        });
    });
});
