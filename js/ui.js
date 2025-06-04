// js/ui.js

const pageSpecificHeaders = {
    home: { title: "AgroSync <i class=\"fas fa-leaf\"></i>", subtitle: "Tu jardín inteligente y sincronizado" },
    diagnosis: { title: "Diagnóstico IA", subtitle: "Detecta problemas en tus plantas" },
    compost: { title: "Compostaje Pro <i class=\"fas fa-recycle\"></i>", subtitle: "Calcula y aprende a compostar" },
    assistant: { title: "Asistente IA <i class=\"fas fa-brain\"></i>", subtitle: "Tu consejero agrícola personal" },
    profile: { title: "Mi Perfil", subtitle: "Agricultor Urbano Apasionado" } 
};

async function loadAppHeaderStructure() {
    const headerContainer = document.getElementById('main-app-header');
    if (!headerContainer) {
        console.error("UI ERROR: Contenedor #main-app-header no encontrado.");
        return false;
    }
    const headerPath = 'includes/app_header.html'; // Ruta relativa desde index.html
    console.log(`UI LOG: Intentando fetch header desde: ${headerPath}`);
    try {
        const response = await fetch(headerPath); 
        if (!response.ok) {
            console.error(`UI ERROR: Fetch fallido para ${headerPath}. Estado: ${response.status} ${response.statusText}. URL completa: ${response.url}`);
            throw new Error(`No se pudo cargar ${headerPath}.`);
        }
        const headerHtml = await response.text();
        if (!headerHtml || headerHtml.trim() === "") {
            console.warn(`UI WARNING: ${headerPath} está vacío o no es HTML válido.`);
            headerContainer.innerHTML = "<div class='header-content'><p style='color:white;text-align:center;'>Header vacío.</p></div>";
            return false;
        }
        headerContainer.innerHTML = headerHtml;
        console.log("UI LOG: Header cargado.");
        return true; 
    } catch (error) {
        console.error(`UI ERROR: Excepción cargando header desde ${headerPath}:`, error);
        headerContainer.innerHTML = "<div class='header-content'><p style='color:white;text-align:center;'>Error crítico header.</p></div>";
        return false;
    }
}

async function loadBottomNavigationStructure() {
    const navContainer = document.getElementById('main-bottom-nav');
    if (!navContainer) {
        console.error("UI ERROR: Contenedor #main-bottom-nav no encontrado.");
        return false;
    }
    const navPath = 'includes/bottom_navigation.html'; // Ruta relativa desde index.html
    console.log(`UI LOG: Intentando fetch navegación desde: ${navPath}`);
    try {
        const response = await fetch(navPath);
        if (!response.ok) {
            console.error(`UI ERROR: Fetch fallido para ${navPath}. Estado: ${response.status} ${response.statusText}. URL completa: ${response.url}`);
            throw new Error(`No se pudo cargar ${navPath}.`);
        }
        const navHtml = await response.text();
        if (!navHtml || navHtml.trim() === "") {
            console.warn(`UI WARNING: ${navPath} está vacío o no es HTML válido.`);
            navContainer.innerHTML = "<p style='text-align:center;color:var(--danger);'>Nav vacía.</p>";
            return false;
        }
        navContainer.innerHTML = navHtml;
        console.log("UI LOG: Navegación cargada.");
        return true; 
    } catch (error) {
        console.error(`UI ERROR: Excepción cargando navegación desde ${navPath}:`, error);
        navContainer.innerHTML = "<p style='text-align:center;color:var(--danger);'>Error crítico nav.</p>";
        return false;
    }
}

function updateAppHeader(pageId, notificationCount = null) {
    const headerTitleEl = document.getElementById('header-app-title');
    const headerSubtitleEl = document.getElementById('header-app-subtitle');
    const notificationBadgeEl = document.getElementById('header-notification-badge');

    if (!headerTitleEl || !headerSubtitleEl || !notificationBadgeEl) {
        // Este console.warn es útil si la estructura del header se cargó pero faltan estos IDs internos.
        console.warn("UI WARNING: Elementos internos del header (título, subtítulo o insignia) no encontrados para actualizar. ¿El contenido de app_header.html es correcto y se cargó?");
        return;
    }
    const headerData = pageSpecificHeaders[pageId] || { title: "AgroSync", subtitle: "Bienvenido" };
    headerTitleEl.innerHTML = headerData.title; 
    headerSubtitleEl.textContent = headerData.subtitle;
    if (notificationCount !== null && notificationBadgeEl) {
        notificationBadgeEl.textContent = notificationCount;
        notificationBadgeEl.style.display = notificationCount > 0 ? 'flex' : 'none';
    }
}

function showPage(pageId) {
    console.log(`UI LOG: Mostrando página: ${pageId}`);
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        const mainContent = activePage.querySelector('.main-content') || activePage;
        if (mainContent) mainContent.scrollTop = 0;
        
        const badge = document.getElementById('header-notification-badge');
        const count = badge ? parseInt(badge.textContent) : 0;
        updateAppHeader(pageId, isNaN(count) ? 0 : count);
    } else {
        console.warn(`UI WARNING: Página con ID '${pageId}' no encontrada.`);
    }

    const navContainer = document.getElementById('main-bottom-nav');
    if (navContainer && navContainer.children.length > 0) { 
        navContainer.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            const onclickAttr = item.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`showPage('${pageId}')`)) {
                item.classList.add('active');
            }
        });
    }
}

function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    const toggleContainer = document.getElementById('darkModeToggleContainer');
    const checkbox = document.getElementById('darkModeToggle'); 
    if (!toggleContainer || !checkbox) {
        console.warn("UI WARNING: Elementos del toggle de modo oscuro no encontrados.");
        return;
    }
    if (savedDarkMode === 'enabled') {
        if(document.body) document.body.classList.add('dark-mode');
        toggleContainer.classList.add('active');
        checkbox.checked = true;
    } else {
        if(document.body) document.body.classList.remove('dark-mode');
        toggleContainer.classList.remove('active');
        checkbox.checked = false;
    }
}

function toggleDarkMode() {
    const body = document.body;
    if (!body || !body.classList) {
        console.error("UI ERROR: document.body no disponible en toggleDarkMode.");
        return;
    }
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    
    const toggleContainer = document.getElementById('darkModeToggleContainer');
    const checkbox = document.getElementById('darkModeToggle');
    if (toggleContainer) {
        isDarkMode ? toggleContainer.classList.add('active') : toggleContainer.classList.remove('active');
    }
    if (checkbox) checkbox.checked = isDarkMode;
}

function initializeLocationToggle() {
    const toggleContainer = document.getElementById('locationToggleContainer');
    const checkbox = document.getElementById('locationToggle');
    if (!toggleContainer || !checkbox) {
        console.warn("UI WARNING: Elementos del toggle de ubicación no encontrados.");
        return;
    }
    checkbox.checked ? toggleContainer.classList.add('active') : toggleContainer.classList.remove('active');
}

function initializeTouchFeedback() {
    document.querySelectorAll('button, .nav-item, .action-btn, .toggle-switch').forEach(element => {
        element.addEventListener('touchstart', function() { this.style.transform = 'scale(0.97)'; }, { passive: true });
        element.addEventListener('touchend', function() { this.style.transform = 'scale(1)'; });
    });
}

function initializeGenericToggles() {
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        if(toggle.id === 'darkModeToggleContainer' || toggle.id === 'locationToggleContainer') return;
        const checkbox = toggle.querySelector('input[type="checkbox"].sr-only'); 
        if (checkbox && checkbox.checked) toggle.classList.add('active');
    });
}
