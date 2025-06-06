// js/cache.js - Sistema de cache sin bucles de recarga

(function() {
    'use strict';
    
    // Configuración simplificada
    const CACHE_CONFIG = {
        version: Date.now(),
        isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    };
    
    // Prevenir múltiples inicializaciones y bucles
    if (window.agroSyncCacheInitialized) {
        return;
    }
    window.agroSyncCacheInitialized = true;
    
    // Marcar que la página se está cargando para evitar bucles
    const RELOAD_KEY = 'agrosync_reloading';
    const RELOAD_TIMEOUT = 5000; // 5 segundos de timeout
    
    function isReloading() {
        const reloadTime = sessionStorage.getItem(RELOAD_KEY);
        if (reloadTime) {
            const timeDiff = Date.now() - parseInt(reloadTime);
            return timeDiff < RELOAD_TIMEOUT;
        }
        return false;
    }
    
    function markReloading() {
        sessionStorage.setItem(RELOAD_KEY, Date.now().toString());
    }
    
    function clearReloadingFlag() {
        sessionStorage.removeItem(RELOAD_KEY);
    }
    
    // Limpiar flag al cargar la página
    clearReloadingFlag();
    
    function manageCacheVersion() {
        // Solo gestionar versión, sin recargas automáticas
        const currentVersion = CACHE_CONFIG.version.toString();
        const storedVersion = localStorage.getItem('agrosync_cache_version');
        
        if (storedVersion && storedVersion !== currentVersion) {
            console.log('🔄 Nueva versión detectada');
            
            // Limpiar cache del service worker si existe
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
    
    // Función manual para forzar recarga (solo desarrollo)
    window.forceReload = function() {
        if (!CACHE_CONFIG.isDev) {
            console.log('❌ Recarga forzada solo disponible en desarrollo');
            return;
        }
        
        if (isReloading()) {
            console.log('⏳ Ya hay una recarga en proceso...');
            return;
        }
        
        console.log('🔄 Forzando recarga...');
        markReloading();
        sessionStorage.clear();
        localStorage.removeItem('agrosync_cache_version');
        
        // Delay para evitar bucles
        setTimeout(() => {
            window.location.reload(true);
        }, 500);
    };
    
    // Función para verificar actualizaciones manualmente
    window.checkForUpdates = function() {
        if (!CACHE_CONFIG.isDev) {
            console.log('❌ Verificación manual solo disponible en desarrollo');
            return;
        }
        
        console.log('🔍 Verificando actualizaciones...');
        
        fetch(window.location.href, { 
            method: 'HEAD',
            cache: 'no-cache'
        }).then(response => {
            const lastModified = response.headers.get('Last-Modified');
            const stored = sessionStorage.getItem('agrosync_last_check');
            
            if (stored && lastModified && stored !== lastModified) {
                console.log('📱 Actualizaciones disponibles. Usa forceReload() para recargar.');
            } else {
                console.log('✅ No hay actualizaciones disponibles');
            }
            
            if (lastModified) {
                sessionStorage.setItem('agrosync_last_check', lastModified);
            }
        }).catch(err => {
            console.log('❌ Error verificando actualizaciones:', err.message);
        });
    };
    
    // Sistema de notificación de actualizaciones (sin recarga automática)
    function setupUpdateNotification() {
        if (!CACHE_CONFIG.isDev) return;
        
        let lastNotification = 0;
        const NOTIFICATION_COOLDOWN = 30000; // 30 segundos entre notificaciones
        
        const checkUpdates = () => {
            const now = Date.now();
            if (now - lastNotification < NOTIFICATION_COOLDOWN) return;
            
            fetch('js/main.js', { 
                method: 'HEAD',
                cache: 'no-cache'
            }).then(response => {
                const lastModified = response.headers.get('Last-Modified');
                const stored = sessionStorage.getItem('agrosync_main_check');
                
                if (stored && lastModified && stored !== lastModified && document.visibilityState === 'visible') {
                    lastNotification = now;
                    console.log('🔔 Actualizaciones disponibles. Usa forceReload() para actualizar.');
                    
                    // Mostrar notificación visual opcional
                    if (window.showUpdateNotification) {
                        window.showUpdateNotification();
                    }
                }
                
                if (lastModified) {
                    sessionStorage.setItem('agrosync_main_check', lastModified);
                }
            }).catch(() => {
                // Ignorar errores silenciosamente
            });
        };
        
        // Verificar solo cuando la página se vuelve visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                setTimeout(checkUpdates, 3000);
            }
        });
        
        // Verificación inicial (muy diferida)
        setTimeout(checkUpdates, 15000);
    }
    
    // Función opcional para mostrar notificación de actualización
    window.showUpdateNotification = function() {
        // Solo crear notificación si no existe
        if (document.getElementById('update-notification')) return;
        
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-blue);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Nueva versión disponible</span>
            <button onclick="window.forceReload()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius);
                cursor: pointer;
                font-weight: 600;
            ">Actualizar</button>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                padding: 0.5rem;
                cursor: pointer;
                opacity: 0.7;
            ">✕</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    };
    
    // Inicialización segura
    function initCache() {
        // Evitar inicialización múltiple
        if (isReloading()) {
            console.log('⏳ Recarga en proceso, saltando inicialización...');
            return;
        }
        
        try {
            manageCacheVersion();
            
            if (CACHE_CONFIG.isDev) {
                setupUpdateNotification();
                console.log('🛠️ Modo desarrollo:');
                console.log('   • forceReload() - Forzar recarga');
                console.log('   • checkForUpdates() - Verificar actualizaciones');
            }
            
            console.log(`⚡ AgroSync Cache v${CACHE_CONFIG.version} - Sin bucles`);
        } catch (error) {
            console.error('❌ Error inicializando cache:', error);
        }
    }
    
    // Inicializar de forma segura
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCache);
    } else {
        initCache();
    }
    
    // Cleanup al cerrar la página
    window.addEventListener('beforeunload', () => {
        clearReloadingFlag();
    });
    
    // CSS para animación de notificación
    if (!document.getElementById('cache-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'cache-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();