// js/cache.js - Sistema de cache para forzar recarga de recursos

(function() {
    'use strict';
    
    // Versión de cache - incrementa automáticamente cada vez que se modifica la web
    const CACHE_VERSION = Date.now();
    
    // Lista de recursos que deben ser recargados
    const RESOURCES_TO_CACHE = [
        'js/main.js',
        'js/ui.js',
        'js/auth.js',
        'js/assistant.js',
        'js/plants.js',
        'js/weather.js',
        'js/compost.js',
        'js/camera.js',
        'css/base.css',
        'css/home.css',
        'css/diagnosis.css',
        'css/compost.css',
        'css/assistant.css',
        'css/profile.css',
        'css/auth.css',
        'css/dark_mode.css',
        'css/responsive_utilities.css'
    ];
    
    function addCacheVersionToResources() {
        // Agregar versión a CSS
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('cdnjs.cloudflare.com') && !href.includes('?v=')) {
                link.href = `${href}?v=${CACHE_VERSION}`;
            }
        });
        
        // Agregar versión a JS (excepto este archivo)
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && !src.includes('cache.js') && !src.includes('?v=')) {
                script.src = `${src}?v=${CACHE_VERSION}`;
            }
        });
    }
    
    function clearBrowserCache() {
        // Limpiar localStorage de cache anterior si existe
        const oldCacheVersion = localStorage.getItem('agrosync_cache_version');
        if (oldCacheVersion && oldCacheVersion !== CACHE_VERSION.toString()) {
            console.log('Nueva versión detectada, limpiando cache...');
            
            // Limpiar service worker cache si está disponible
            if ('caches' in window) {
                caches.keys().then(function(names) {
                    for (let name of names) {
                        if (name.includes('agrosync')) {
                            caches.delete(name);
                        }
                    }
                });
            }
        }
        
        // Actualizar versión en localStorage
        localStorage.setItem('agrosync_cache_version', CACHE_VERSION.toString());
    }
    
    function reloadPageIfNeeded() {
        // Solo en desarrollo - forzar recarga si detecta cambios
        const lastVersion = sessionStorage.getItem('agrosync_last_version');
        if (lastVersion && lastVersion !== CACHE_VERSION.toString()) {
            console.log('Cambios detectados, recargando página...');
            window.location.reload(true);
        }
        sessionStorage.setItem('agrosync_last_version', CACHE_VERSION.toString());
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addCacheVersionToResources();
            clearBrowserCache();
        });
    } else {
        addCacheVersionToResources();
        clearBrowserCache();
    }
    
    // Ejecutar inmediatamente para recursos ya cargados
    reloadPageIfNeeded();
    
    // Función global para forzar recarga de un recurso específico
    window.reloadResource = function(resourcePath) {
        const timestamp = Date.now();
        
        if (resourcePath.endsWith('.css')) {
            const link = document.querySelector(`link[href*="${resourcePath}"]`);
            if (link) {
                const newHref = resourcePath + '?v=' + timestamp;
                link.href = newHref;
            }
        } else if (resourcePath.endsWith('.js')) {
            // Para JS es más complejo, mejor recargar la página
            window.location.reload(true);
        }
    };
    
    // Detectar cambios de archivos en desarrollo (solo funciona si el servidor lo soporta)
    function setupDevReload() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Verificar cambios cada 5 segundos en desarrollo
            setInterval(function() {
                fetch(window.location.href, { 
                    method: 'HEAD',
                    cache: 'no-cache'
                }).then(response => {
                    const lastModified = response.headers.get('Last-Modified');
                    const storedLastModified = sessionStorage.getItem('agrosync_last_modified');
                    
                    if (storedLastModified && lastModified && storedLastModified !== lastModified) {
                        console.log('Archivo modificado detectado, recargando...');
                        window.location.reload(true);
                    }
                    
                    if (lastModified) {
                        sessionStorage.setItem('agrosync_last_modified', lastModified);
                    }
                }).catch(() => {
                    // Ignorar errores de red
                });
            }, 5000);
        }
    }
    
    // Inicializar detección de cambios en desarrollo
    setupDevReload();
    
    console.log(`AgroSync Cache System initialized - Version: ${CACHE_VERSION}`);
})();