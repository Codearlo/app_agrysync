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
    
    // Verificar si ya existe el contenido del header
    const existingHeaderContent = headerContainer.querySelector('.header-content');
    if (existingHeaderContent) {
        console.log("UI LOG: Header ya existe, no se sobrescribe.");
        return true;
    }
    
    // Solo crear el header si no existe
    const headerHTML = `
        <div class="header-content">
            <div class="app-title" id="header-app-title">AgroSync <i class="fas fa-leaf"></i></div>
            <div class="app-subtitle" id="header-app-subtitle">Tu jardín inteligente</div>
            <div class="notification-badge" id="header-notification-badge" style="display: none;">0</div>
        </div>
    `;
    
    headerContainer.innerHTML = headerHTML;
    console.log("UI LOG: Header cargado dinámicamente.");
    return true;
}

async function loadBottomNavigationStructure() {
    const navContainer = document.getElementById('main-bottom-nav');
    if (!navContainer) {
        console.error("UI ERROR: Contenedor #main-bottom-nav no encontrado.");
        return false;
    }
    
    // Verificar si ya existe el contenido de navegación
    const existingNavItems = navContainer.querySelectorAll('.nav-item');
    if (existingNavItems.length > 0) {
        console.log("UI LOG: Navegación ya existe, no se sobrescribe.");
        return true;
    }
    
    // Solo crear la navegación si no existe
    const navHTML = `
        <button class="nav-item active" onclick="showPage('home')">
            <span class="nav-emoji"><i class="fas fa-home"></i></span>
            <span class="nav-label">Inicio</span>
        </button>
        <button class="nav-item" onclick="showPage('diagnosis')">
            <span class="nav-emoji"><i class="fas fa-stethoscope"></i></span>
            <span class="nav-label">Diagnóstico</span>
        </button>
        <button class="nav-item" onclick="showPage('compost')"> 
            <span class="nav-emoji"><i class="fas fa-recycle"></i></span>
            <span class="nav-label">Compost</span>
        </button>
         <button class="nav-item" onclick="showPage('assistant')">
            <span class="nav-emoji"><i class="fas fa-comments"></i></span>
            <span class="nav-label">Asistente</span>
        </button>
        <button class="nav-item" onclick="showPage('profile')">
            <span class="nav-emoji"><i class="fas fa-user-circle"></i></span>
            <span class="nav-label">Perfil</span>
        </button>
    `;
    
    navContainer.innerHTML = navHTML;
    console.log("UI LOG: Navegación cargada dinámicamente.");
    return true;
}

function updateAppHeader(pageId, notificationCount = null) {
    const headerTitleEl = document.getElementById('header-app-title') || document.querySelector('.app-title');
    const headerSubtitleEl = document.getElementById('header-app-subtitle') || document.querySelector('.app-subtitle');
    const notificationBadgeEl = document.getElementById('header-notification-badge') || document.querySelector('.notification-badge');

    if (!headerTitleEl || !headerSubtitleEl) {
        console.warn("UI WARNING: Elementos del header (título o subtítulo) no encontrados para actualizar.");
        return;
    }
    
    const headerData = pageSpecificHeaders[pageId] || { title: "AgroSync <i class=\"fas fa-leaf\"></i>", subtitle: "Tu jardín inteligente" };
    headerTitleEl.innerHTML = headerData.title; 
    headerSubtitleEl.textContent = headerData.subtitle;
    
    if (notificationCount !== null && notificationBadgeEl) {
        notificationBadgeEl.textContent = notificationCount;
        notificationBadgeEl.style.display = notificationCount > 0 ? 'flex' : 'none';
    }
}

function showPage(pageId) {
    console.log(`UI LOG: Mostrando página: ${pageId}`);
    
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar página activa
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        const mainContent = activePage.querySelector('.main-content') || activePage;
        if (mainContent) mainContent.scrollTop = 0;
        
        // Obtener el badge de notificaciones
        const badge = document.getElementById('header-notification-badge') || document.querySelector('.notification-badge');
        const count = badge ? parseInt(badge.textContent) : 0;
        updateAppHeader(pageId, isNaN(count) ? 0 : count);
        
        // Actualizar el asistente cuando se navega a la página del asistente
        if (pageId === 'assistant' && typeof updateAssistantForUser === 'function') {
            updateAssistantForUser();
        }
    } else {
        console.warn(`UI WARNING: Página con ID '${pageId}' no encontrada.`);
    }

    // Actualizar navegación
    const navContainer = document.getElementById('main-bottom-nav');
    if (navContainer) { 
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