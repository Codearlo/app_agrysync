// js/cache.js - Sistema de cache optimizado para desarrollo

(function() {
    'use strict';
    
    // Configuración de cache ligera
    const CACHE_CONFIG = {
        enabled: true,
        version: Date.now(),
        checkInterval: 30000, // 30 segundos en lugar de 5
        isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        enableAutoReload: false // Deshabilitado por defecto para mejor rendimiento
    };
    
    // Solo versionar recursos críticos
    const CRITICAL_RESOURCES = [
        'js/main.js',
        'js/ui.js',
        'js/auth.js',
        'css/base.css'
    ];
    
    function addVersionToCriticalResources() {
        // Solo versionar recursos críticos para evitar recargas innecesarias
        if (!CACHE_CONFIG.enabled) return;
        
        // CSS críticos únicamente
        const criticalCSS = document.querySelectorAll('link[rel="stylesheet"]');
        criticalCSS.forEach(link => {
            const href = link.getAttribute('href');
            if (href && CRITICAL_RESOURCES.some(resource => href.includes(resource.replace('js/', 'css/').replace('.js', '.css')))) {
                if (!href.includes('?v=') && !href.includes('cdnjs.cloudflare.com')) {
                    link.href = `${href}?v=${CACHE_CONFIG.version}`;
                }
            }
        });
    }
    
    function manageCacheVersion() {
        const currentVersion = CACHE_CONFIG.version.toString();
        const storedVersion = localStorage.getItem('agrosync_cache_version');
        
        if (storedVersion && storedVersion !== currentVersion) {
            console.log('🔄 Nueva versión de AgroSync detectada');
            // Solo limpiar cache del service worker si existe
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        if (name.includes('agrosync')) {
                            caches.delete(name);
                        }
                    });
                });
            }
        }
        
        localStorage.setItem('agrosync_cache_version', currentVersion);
    }
    
    // Función de recarga inteligente (solo para desarrollo)
    function setupSmartReload() {
        if (!CACHE_CONFIG.isDev || !CACHE_CONFIG.enableAutoReload) return;
        
        let lastCheck = Date.now();
        
        const checkForUpdates = () => {
            // Evitar checks muy frecuentes
            if (Date.now() - lastCheck < CACHE_CONFIG.checkInterval) return;
            lastCheck = Date.now();
            
            // Verificar solo el archivo principal
            fetch('js/main.js', { 
                method: 'HEAD',
                cache: 'no-cache'
            }).then(response => {
                const lastModified = response.headers.get('Last-Modified');
                const etag = response.headers.get('ETag');
                const key = 'agrosync_main_version';
                const stored = sessionStorage.getItem(key);
                const current = lastModified || etag;
                
                if (stored && current && stored !== current && document.visibilityState === 'visible') {
                    console.log('📱 Actualizaciones disponibles, recargando...');
                    window.location.reload(true);
                }
                
                if (current) sessionStorage.setItem(key, current);
            }).catch(() => {
                // Ignorar errores silenciosamente
            });
        };
        
        // Solo verificar cuando la página es visible y activa
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                setTimeout(checkForUpdates, 2000); // Delay para evitar sobrecarga
            }
        });
        
        // Check inicial diferido
        setTimeout(checkForUpdates, 10000);
    }
    
    // Función para forzar recarga manual (solo para desarrollo)
    window.forceReload = function() {
        if (CACHE_CONFIG.isDev) {
            sessionStorage.clear();
            localStorage.removeItem('agrosync_cache_version');
            window.location.reload(true);
        }
    };
    
    // Función para alternar auto-recarga
    window.toggleAutoReload = function() {
        CACHE_CONFIG.enableAutoReload = !CACHE_CONFIG.enableAutoReload;
        console.log(`🔄 Auto-recarga ${CACHE_CONFIG.enableAutoReload ? 'activada' : 'desactivada'}`);
        if (CACHE_CONFIG.enableAutoReload) {
            setupSmartReload();
        }
    };
    
    // Inicialización ligera
    function initCache() {
        // Solo ejecutar en carga inicial
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                addVersionToCriticalResources();
                manageCacheVersion();
            });
        } else {
            addVersionToCriticalResources();
            manageCacheVersion();
        }
        
        // Setup de desarrollo opcional
        if (CACHE_CONFIG.isDev) {
            setupSmartReload();
            console.log(`🛠️ Modo desarrollo activo. Usa toggleAutoReload() para activar recarga automática.`);
        }
    }
    
    // Evitar múltiples inicializaciones
    if (!window.agroSyncCacheInitialized) {
        window.agroSyncCacheInitialized = true;
        initCache();
        console.log(`⚡ AgroSync Cache optimizado - v${CACHE_CONFIG.version}`);
    }
})();