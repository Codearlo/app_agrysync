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
    const headerPath = '/includes/app_header.html'; // RUTA ABSOLUTA DESDE LA RAÍZ DEL DOMINIO
    console.log(`Intentando cargar header desde: ${headerPath}`);
    try {
        const response = await fetch(headerPath); 
        if (!response.ok) {
            console.error(`Respuesta del servidor para ${headerPath}: ${response.status} ${response.statusText}`);
            throw new Error(`No se pudo cargar ${headerPath}. Estado: ${response.status}`);
        }
        const headerHtml = await response.text();
        if (headerHtml.trim() === "") {
            console.warn(`El archivo ${headerPath} está vacío.`);
            headerContainer.innerHTML = "<div class='header-content' style='padding: 1rem; text-align: center; color: white;'><p>Contenido del header no encontrado (archivo vacío).</p></div>";
            return false; // Considerar como fallo si está vacío
        }
        headerContainer.innerHTML = headerHtml;
        console.log("Estructura del header cargada en #main-app-header.");
        return true; 
    } catch (error) {
        console.error("Error cargando la estructura del header:", error);
        headerContainer.innerHTML = "<div class='header-content' style='padding: 1rem; text-align: center; color: white;'><p>Error crítico al cargar el header.</p></div>";
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
    const navPath = '/includes/bottom_navigation.html'; // RUTA ABSOLUTA DESDE LA RAÍZ DEL DOMINIO
    console.log(`Intentando cargar navegación desde: ${navPath}`);
    try {
        const response = await fetch(navPath);
        if (!response.ok) {
            console.error(`Respuesta del servidor para ${navPath}: ${response.status} ${response.statusText}`);
            throw new Error(`No se pudo cargar ${navPath}. Estado: ${response.status}`);
        }
        const navHtml = await response.text();
        if (navHtml.trim() === "") {
            console.warn(`El archivo ${navPath} está vacío.`);
            navContainer.innerHTML = "<p style='text-align:center; padding:0.5rem; width:100%; color: var(--danger);'>Contenido de navegación no encontrado (archivo vacío).</p>";
            return false; // Considerar como fallo si está vacío
        }
        navContainer.innerHTML = navHtml;
        console.log("Estructura de la navegación cargada en #main-bottom-nav.");
        return true; 
    } catch (error) {
        console.error("Error cargando la estructura de la navegación inferior:", error);
        navContainer.innerHTML = "<p style='text-align:center; padding:0.5rem; width:100%; color: var(--danger);'>Error crítico al cargar navegación.</p>";
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
        // Este console.warn es útil si la estructura del header se cargó pero faltan estos IDs internos.
        console.warn("Elementos internos del header (título, subtítulo o insignia) no encontrados para actualizar. ¿El contenido de app_header.html es correcto?");
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
    console.log(`Intentando mostrar página: ${pageId}`);
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        const mainContent = activePage.querySelector('.main-content') || activePage;
        if (mainContent) mainContent.scrollTop = 0;
        
        const currentNotificationBadge = document.getElementById('header-notification-badge');
        const currentNotificationCount = currentNotificationBadge ? parseInt(currentNotificationBadge.textContent) : 0;
        updateAppHeader(pageId, isNaN(currentNotificationCount) ? 0 : currentNotificationCount);
    } else {
        console.warn(`Página con ID '${pageId}' no encontrada en el DOM.`);
    }

    const navContainer = document.getElementById('main-bottom-nav');
    if (navContainer && navContainer.children.length > 0) { 
        const navItems = navContainer.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            // Comprobar si el atributo onclick existe y si la función contiene el pageId correcto
            const onclickAttr = item.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`showPage('${pageId}')`)) {
                item.classList.add('active');
            }
        });
    } else {
        // console.warn("Contenedor de navegación o items no encontrados para actualizar estado activo.");
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
}
