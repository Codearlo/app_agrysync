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
    
    // Crear el header directamente en lugar de cargar desde archivo
    const headerHTML = `
        <style>
            .app-header {
                background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-blue) 100%);
                color: var(--white);
                padding: 1.25rem 1rem; 
                min-height: 70px; 
                display: flex; 
                align-items: center; 
                position: sticky; 
                top: 0;
                z-index: 100; 
                box-shadow: var(--shadow-lg);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .header-content {
                max-width: 1200px; 
                margin: 0 auto; 
                position: relative; 
                width: 100%; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
            }
            
            .app-title {
                font-size: 1.75rem; 
                font-weight: 800;
                margin-bottom: 0.15rem; 
                letter-spacing: -0.025em;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .app-title i { margin-left: 0.5rem; }
            
            .app-subtitle {
                font-size: 0.9rem; 
                opacity: 0.9;
                font-weight: 500;
            }
            
            .notification-badge {
                position: absolute;
                top: 50%; 
                transform: translateY(-50%);
                right: 1rem; 
                background: var(--danger);
                color: var(--white);
                border-radius: 50%;
                width: 26px; 
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 700;
                box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                animation: pulseHeaderBadge 2s infinite;
                border: 2px solid var(--white); 
            }
            
            @keyframes pulseHeaderBadge {
                0%, 100% { 
                    transform: scale(1) translateY(-50%); 
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                }
                50% { 
                    transform: scale(1.15) translateY(-50%); 
                    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.6);
                }
            }
            
            body.dark-mode .app-header {
                background: linear-gradient(135deg, var(--secondary-green) 0%, var(--secondary-blue) 100%);
            }
        </style>
        <div class="header-content">
            <div class="app-title" id="header-app-title">AgroSync <i class="fas fa-leaf"></i></div>
            <div class="app-subtitle" id="header-app-subtitle">Tu jardín inteligente</div>
            <div class="notification-badge" id="header-notification-badge" style="display: none;">0</div>
        </div>
    `;
    
    headerContainer.innerHTML = headerHTML;
    console.log("UI LOG: Header cargado directamente.");
    return true;
}

async function loadBottomNavigationStructure() {
    const navContainer = document.getElementById('main-bottom-nav');
    if (!navContainer) {
        console.error("UI ERROR: Contenedor #main-bottom-nav no encontrado.");
        return false;
    }
    
    // Crear la navegación directamente en lugar de cargar desde archivo
    const navHTML = `
        <style>
            .bottom-nav {
                position: fixed;
                bottom: 0;
                width: 100%; 
                max-width: 1200px; 
                margin-left: auto;
                margin-right: auto;
                left: 50%;
                transform: translateX(-50%);
                
                background: rgba(255, 255, 255, 0.97); 
                backdrop-filter: blur(25px); 
                -webkit-backdrop-filter: blur(25px);
                border-top: 1px solid var(--gray-200);
                display: flex;
                justify-content: space-around; 
                padding: 0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom)); 
                z-index: 1000;
                box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.08); 
                
                border-top-left-radius: var(--border-radius-lg); 
                border-top-right-radius: var(--border-radius-lg); 
                min-height: 60px; 
            }
            
            .bottom-nav .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center; 
                padding: 0.25rem 0.5rem; 
                background: none;
                border: none;
                cursor: pointer;
                transition: var(--transition);
                color: var(--gray-500);
                text-decoration: none;
                min-width: 60px; 
                min-height: 50px; 
                border-radius: var(--border-radius);
                position: relative; 
                flex-grow: 1; 
            }
            
            .bottom-nav .nav-item::before {
                content: '';
                position: absolute;
                top: -1px; 
                left: 50%;
                transform: translateX(-50%);
                width: 0; 
                height: 3px; 
                background: var(--primary-blue);
                border-radius: 0 0 3px 3px; 
                opacity: 0;
                transition: width 0.3s ease, opacity 0.3s ease;
            }
            
            .bottom-nav .nav-item.active {
                color: var(--primary-blue);
            }
            
            .bottom-nav .nav-item.active::before {
                opacity: 1;
                width: 60%; 
            }
            
            .bottom-nav .nav-item:hover {
                color: var(--primary-blue);
                background: rgba(59, 130, 246, 0.05); 
            }
            .bottom-nav .nav-item:hover::before {
                opacity: 0.7;
                width: 40%;
            }
            .bottom-nav .nav-item.active:hover::before {
                width: 70%; 
            }
            
            .nav-emoji {
                font-size: 1.5rem; 
                margin-bottom: 0.25rem; 
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));
                transition: var(--transition);
                line-height: 1; 
            }
            .nav-emoji i { transition: transform 0.3s ease; }
            
            .bottom-nav .nav-item:hover .nav-emoji i {
                transform: scale(1.15) translateY(-2px); 
            }
            .bottom-nav .nav-item.active .nav-emoji i {
                transform: scale(1.1) translateY(-1px);
            }
            
            .nav-label {
                font-size: 0.6875rem; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                line-height: 1.2; 
            }
            
            body.dark-mode .bottom-nav {
                background: rgba(17, 24, 39, 0.97); 
                border-top-color: var(--gray-700); 
            }
            body.dark-mode .bottom-nav .nav-item {
                color: var(--gray-500);
            }
            body.dark-mode .bottom-nav .nav-item.active {
                color: var(--primary-blue);
                background: rgba(59, 130, 246, 0.15);
            }
            body.dark-mode .bottom-nav .nav-item:hover {
                color: var(--primary-blue);
                background: rgba(59, 130, 246, 0.1);
            }
        </style>
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
    console.log("UI LOG: Navegación cargada directamente.");
    return true;
}

function updateAppHeader(pageId, notificationCount = null) {
    const headerTitleEl = document.getElementById('header-app-title');
    const headerSubtitleEl = document.getElementById('header-app-subtitle');
    const notificationBadgeEl = document.getElementById('header-notification-badge');

    if (!headerTitleEl || !headerSubtitleEl || !notificationBadgeEl) {
        console.warn("UI WARNING: Elementos internos del header (título, subtítulo o insignia) no encontrados para actualizar.");
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
        
        // Actualizar el asistente cuando se navega a la página del asistente
        if (pageId === 'assistant' && typeof updateAssistantForUser === 'function') {
            updateAssistantForUser();
        }
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