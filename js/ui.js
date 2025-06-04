// js/ui.js

const pageSpecificHeaders = {
    home: { title: "AgroSync <i class=\"fas fa-leaf\"></i>", subtitle: "Tu jardín inteligente y sincronizado" },
    diagnosis: { title: "Diagnóstico IA", subtitle: "Detecta problemas en tus plantas" },
    compost: { title: "Compostaje Pro <i class=\"fas fa-recycle\"></i>", subtitle: "Calcula y aprende a compostar" },
    assistant: { title: "Asistente IA <i class=\"fas fa-brain\"></i>", subtitle: "Tu consejero agrícola personal" },
    profile: { title: "Mi Perfil", subtitle: "Agricultor Urbano Apasionado" } 
};

/**
 * Carga la estructura del header desde un archivo HTML.
 */
async function loadAppHeaderStructure() {
    const headerContainer = document.getElementById('main-app-header');
    if (!headerContainer) {
        console.error("Contenedor principal del header (#main-app-header) no encontrado.");
        return false;
    }
    try {
        const response = await fetch('includes/app_header.html'); 
        if (!response.ok) {
            throw new Error(`No se pudo cargar includes/app_header.html. Estado: ${response.status}`);
        }
        const headerHtml = await response.text();
        headerContainer.innerHTML = headerHtml;
        console.log("Estructura del header cargada en #main-app-header.");
        return true; 
    } catch (error) {
        console.error("Error cargando la estructura del header:", error);
        headerContainer.innerHTML = "<div class='header-content' style='padding: 1rem; text-align: center; color: white;'><p>Error al cargar el header.</p></div>";
        return false;
    }
}

/**
 * Carga la estructura de la barra de navegación inferior desde un archivo HTML.
 */
async function loadBottomNavigationStructure() {
    const navContainer = document.getElementById('main-bottom-nav');
    if (!navContainer) {
        console.error("Contenedor de la barra de navegación (#main-bottom-nav) no encontrado.");
        return false;
    }
    try {
        const response = await fetch('includes/bottom_navigation.html');
        if (!response.ok) {
            throw new Error(`No se pudo cargar includes/bottom_navigation.html. Estado: ${response.status}`);
        }
        const navHtml = await response.text();
        navContainer.innerHTML = navHtml;
        console.log("Estructura de la navegación cargada en #main-bottom-nav.");
        return true; 
    } catch (error) {
        console.error("Error cargando la estructura de la navegación inferior:", error);
        navContainer.innerHTML = "<p style='text-align:center; padding:0.5rem; width:100%; color: var(--danger);'>Error al cargar navegación.</p>";
        return false;
    }
}

/**
 * Actualiza el contenido del header dinámico.
 * @param {string} pageId - El ID de la página actual.
 * @param {number} notificationCount - (Opcional) Número de notificaciones.
 */
function updateAppHeader(pageId, notificationCount = null) {
    const headerTitleEl = document.getElementById('header-app-title');
    const headerSubtitleEl = document.getElementById('header-app-subtitle');
    const notificationBadgeEl = document.getElementById('header-notification-badge');

    if (!headerTitleEl || !headerSubtitleEl || !notificationBadgeEl) {
        console.warn("Elementos del header (título, subtítulo o insignia) no encontrados para actualizar. ¿Se cargó app_header.html correctamente?");
        return;
    }

    const headerData = pageSpecificHeaders[pageId] || { title: "AgroSync", subtitle: "Bienvenido" };
    
    headerTitleEl.innerHTML = headerData.title; 
    headerSubtitleEl.textContent = headerData.subtitle;

    if (notificationCount !== null) {
        notificationBadgeEl.textContent = notificationCount;
        notificationBadgeEl.style.display = notificationCount > 0 ? 'flex' : 'none';
    }
}

/**
 * Muestra la página especificada y actualiza la navegación y el header.
 * @param {string} pageId El ID de la página a mostrar.
 */
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        const mainContent = activePage.querySelector('.main-content') || activePage;
        if (mainContent) mainContent.scrollTop = 0;
        
        // Asegurarse de que el header-notification-badge exista antes de intentar leerlo
        const currentNotificationBadge = document.getElementById('header-notification-badge');
        const currentNotificationCount = currentNotificationBadge ? parseInt(currentNotificationBadge.textContent) : 0;
        updateAppHeader(pageId, currentNotificationCount);
    }

    const navContainer = document.getElementById('main-bottom-nav');
    if (navContainer && navContainer.children.length > 0) { 
        const navItems = navContainer.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`showPage('${pageId}')`)) {
                item.classList.add('active');
            }
        });
    }
}

/**
 * Inicializa la funcionalidad del modo oscuro.
 */
function initializeDarkMode() {
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
            // El checkbox real está oculto (sr-only), el click en el contenedor lo simula
            if(darkModeCheckbox) darkModeCheckbox.click(); 
            toggleDarkMode(); 
        });
    }
}

/**
 * Alterna el modo oscuro en la aplicación.
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    const darkModeToggleContainer = document.getElementById('darkModeToggleContainer');
    if (darkModeToggleContainer) {
        if (isDarkMode) {
            darkModeToggleContainer.classList.add('active');
        } else {
            darkModeToggleContainer.classList.remove('active');
        }
    }
    const darkModeCheckbox = document.getElementById('darkModeToggle');
     if(darkModeCheckbox) {
        darkModeCheckbox.checked = isDarkMode;
    }
}

/**
 * Inicializa la funcionalidad del interruptor de ubicación.
 */
function initializeLocationToggle() {
    const locationToggleContainer = document.getElementById('locationToggleContainer');
    const locationCheckbox = document.getElementById('locationToggle');

    if (locationToggleContainer && locationCheckbox) {
        // Sincronizar estado visual inicial
        if(locationCheckbox.checked) {
            locationToggleContainer.classList.add('active');
        } else {
            locationToggleContainer.classList.remove('active');
        }

        locationToggleContainer.addEventListener('click', () => {
            locationCheckbox.checked = !locationCheckbox.checked; 
            locationToggleContainer.classList.toggle('active', locationCheckbox.checked); 
            if (typeof getGeoLocationAndFetchWeather === 'function') { // Asegurarse que weather.js esté cargado
                getGeoLocationAndFetchWeather(); 
            }
        });
    }
}

/**
 * Inicializa el feedback táctil visual para elementos interactivos.
 */
function initializeTouchFeedback() {
    document.querySelectorAll('button, .nav-item, .action-btn, .toggle-switch').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.97)';
        }, { passive: true });
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * Inicializa los interruptores genéricos (que no son de modo oscuro o ubicación).
 */
function initializeGenericToggles() {
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        // Evitar re-asignar listeners a los que ya tienen lógica específica
        if(toggle.id === 'darkModeToggleContainer' || toggle.id === 'locationToggleContainer') return;

        const checkbox = toggle.querySelector('input[type="checkbox"].sr-only'); 
        if (checkbox && checkbox.checked) {
            toggle.classList.add('active');
        }

        toggle.addEventListener('click', function() {
            // Solo alternar la clase 'active' si no es un toggle con lógica especial
            if (!this.id || (this.id !== 'darkModeToggleContainer' && this.id !== 'locationToggleContainer')) {
                 this.classList.toggle('active');
                 if (checkbox) {
                    checkbox.checked = this.classList.contains('active');
                 }
            }
        });
    });
}
