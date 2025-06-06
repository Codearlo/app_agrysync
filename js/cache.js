// js/cache.js - Sistema de cache simple solo para desarrollo

(function() {
    'use strict';
    
    // Solo funcionar en desarrollo
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isDev) {
        console.log('📱 Modo producción - Cache deshabilitado');
        return;
    }
    
    // Evitar múltiples inicializaciones
    if (window.agroSyncCacheLoaded) {
        return;
    }
    window.agroSyncCacheLoaded = true;
    
    // Configuración simple
    const CACHE_VERSION = '12.0.0';
    
    function initSimpleCache() {
        try {
            // Solo limpiar cache obsoleto
            const storedVersion = localStorage.getItem('agrosync_version');
            if (storedVersion && storedVersion !== CACHE_VERSION) {
                console.log('🧹 Limpiando cache obsoleto...');
                
                // Limpiar solo cache del service worker
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
            
            localStorage.setItem('agrosync_version', CACHE_VERSION);
            
            console.log('🛠️ Modo desarrollo - Cache simple activo');
            console.log('   • Ctrl+F5 para recarga completa');
            console.log('   • clearCache() para limpiar cache');
            
        } catch (error) {
            console.warn('⚠️ Error en cache simple:', error);
        }
    }
    
    // Función para limpiar cache manualmente
    window.clearCache = function() {
        try {
            // Mantener datos importantes
            const userData = localStorage.getItem('agroSyncUser');
            const darkMode = localStorage.getItem('darkMode');
            
            // Limpiar localStorage
            localStorage.clear();
            
            // Restaurar datos importantes
            if (userData) localStorage.setItem('agroSyncUser', userData);
            if (darkMode) localStorage.setItem('darkMode', darkMode);
            localStorage.setItem('agrosync_version', CACHE_VERSION);
            
            // Limpiar sessionStorage
            sessionStorage.clear();
            
            console.log('✅ Cache limpiado');
            alert('Cache limpiado. La página se recargará.');
            window.location.reload(true);
        } catch (error) {
            console.error('❌ Error limpiando cache:', error);
        }
    };
    
    // Inicializar después de un pequeño delay
    setTimeout(initSimpleCache, 100);
    
})();
