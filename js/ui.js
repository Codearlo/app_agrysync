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
        return true; 
    } catch (error) {
        console.error("Error cargando la estructura del header:", error);
        headerContainer.innerHTML = "<p style='color:white; text-align:center; padding:1rem;'>Error al cargar el header.</p>";
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
        return true; // Indica que la navegación se cargó
    } catch (error) {
        console.error("Error cargando la estructura de la navegación inferior:", error);
        navContainer.innerHTML = "<p style='text-align:center; padding:1rem;'>Error al cargar navegación.</p>";
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
        
        updateAppHeader(pageId, parseInt(document.getElementById('header-notification-badge')?.textContent || '0'));
    }

    // Actualizar estado activo de la barra de navegación (si ya está cargada)
    const navContainer = document.getElementById('main-bottom-nav');
    if (navContainer && navContainer.children.length > 0) { // Verificar que los items estén cargados
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
 * Alterna el modo oscuro en la aplicación.
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    const darkModeToggleSwitch = document.getElementById('darkModeToggleContainer');
    if (darkModeToggleSwitch) {
        if (isDarkMode) {
            darkModeToggleSwitch.classList.add('active');
        } else {
            darkModeToggleSwitch.classList.remove('active');
        }
    }
    const darkModeCheckbox = document.getElementById('darkModeToggle');
     if(darkModeCheckbox) {
        darkModeCheckbox.checked = isDarkMode;
    }
}
