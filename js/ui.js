// js/ui.js

/**
 * Muestra la página especificada y oculta las demás.
 * Actualiza el estado activo en la barra de navegación.
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
        // Desplazar al inicio del contenido principal de la nueva página
        const mainContent = activePage.querySelector('.main-content') || activePage;
        if (mainContent) mainContent.scrollTop = 0;
    }

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        // Comprobar si el onclick del item contiene la llamada a showPage con el pageId actual
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`showPage('${pageId}')`)) {
            item.classList.add('active');
        }
    });
}

/**
 * Alterna el modo oscuro en la aplicación.
 * Guarda la preferencia en localStorage.
 * Sincroniza el estado visual del interruptor de modo oscuro.
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    // Sincronizar el estado visual del interruptor
    const darkModeToggleSwitch = document.getElementById('darkModeToggleContainer');
    if (darkModeToggleSwitch) {
        if (isDarkMode) {
            darkModeToggleSwitch.classList.add('active');
        } else {
            darkModeToggleSwitch.classList.remove('active');
        }
    }
    // Sincronizar el estado del checkbox (si existe y se usa directamente)
    const darkModeCheckbox = document.getElementById('darkModeToggle');
     if(darkModeCheckbox) {
        darkModeCheckbox.checked = isDarkMode;
    }
}
