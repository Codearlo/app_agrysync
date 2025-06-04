// js/ui.js

const pageSpecificHeaders = {
    home: { title: "AgroSync <i class=\"fas fa-leaf\"></i>", subtitle: "Tu jardín inteligente y sincronizado" },
    diagnosis: { title: "Diagnóstico IA", subtitle: "Detecta problemas en tus plantas" },
    compost: { title: "Compostaje Pro <i class=\"fas fa-recycle\"></i>", subtitle: "Calcula y aprende a compostar" },
    assistant: { title: "Asistente IA <i class=\"fas fa-brain\"></i>", subtitle: "Tu consejero agrícola personal" },
    profile: { title: "Mi Perfil", subtitle: "Agricultor Urbano Apasionado" } // Subtítulo puede ser actualizado por auth.js
};

/**
 * Carga la estructura del header desde un archivo HTML y la inserta en el DOM.
 * Esta función se llamará una vez al cargar la aplicación principal.
 */
async function loadAppHeaderStructure() {
    const headerContainer = document.getElementById('main-app-header');
    if (!headerContainer) {
        console.error("Contenedor principal del header (#main-app-header) no encontrado.");
        return false;
    }
    try {
        const response = await fetch('includes/app_header.html'); // Ruta al archivo del header
        if (!response.ok) {
            throw new Error(`No se pudo cargar includes/app_header.html. Estado: ${response.status}`);
        }
        const headerHtml = await response.text();
        headerContainer.innerHTML = headerHtml;
        return true; // Indica que el header se cargó
    } catch (error) {
        console.error("Error cargando la estructura del header:", error);
        headerContainer.innerHTML = "<p>Error al cargar el header.</p>"; // Mensaje de error en el header
        return false;
    }
}

/**
 * Actualiza el contenido del header dinámico (título, subtítulo, notificaciones).
 * @param {string} pageId - El ID de la página actual para determinar el título/subtítulo.
 * @param {number} notificationCount - (Opcional) Número de notificaciones a mostrar.
 */
function updateAppHeader(pageId, notificationCount = null) {
    const headerTitleEl = document.getElementById('header-app-title');
    const headerSubtitleEl = document.getElementById('header-app-subtitle');
    const notificationBadgeEl = document.getElementById('header-notification-badge');

    if (!headerTitleEl || !headerSubtitleEl || !notificationBadgeEl) {
        // Esto puede ocurrir si el header aún no se ha cargado completamente
        // console.warn("Elementos del header no encontrados para actualizar. Esperando carga...");
        return;
    }

    const headerData = pageSpecificHeaders[pageId] || { title: "AgroSync", subtitle: "Bienvenido" };
    
    headerTitleEl.innerHTML = headerData.title; // Usar innerHTML para permitir iconos
    headerSubtitleEl.textContent = headerData.subtitle;

    if (notificationCount !== null) {
        notificationBadgeEl.textContent = notificationCount;
        notificationBadgeEl.style.display = notificationCount > 0 ? 'flex' : 'none';
    } else {
        // Si no se pasa, mantener el valor actual o uno por defecto
        // Por ahora, lo dejamos como está si es null, o podrías ocultarlo
        // notificationBadgeEl.style.display = 'none'; 
    }
}


/**
 * Muestra la página especificada y oculta las demás.
 * Actualiza el estado activo en la barra de navegación y el header.
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
        
        // Actualizar el header dinámico
        updateAppHeader(pageId, parseInt(document.getElementById('header-notification-badge')?.textContent || '0')); // Pasar el conteo actual de notificaciones
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`showPage('${pageId}')`)) {
            item.classList.add('active');
        }
    });
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
