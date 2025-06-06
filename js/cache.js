// js/cache.js - Sistema de cache completo sin bucles

(function() {
    'use strict';
    
    // Configuración del cache
    const CACHE_CONFIG = {
        version: '1.0.0', // Versión fija para evitar cambios constantes
        isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        checkInterval: 60000 // 1 minuto entre verificaciones
    };
    
    // Recursos a cachear con versiones
    const RESOURCES = {
        html: ['index.html', 'login.html', 'register.html'],
        css: ['css/base.css', 'css/home.css', 'css/diagnosis.css', 'css/compost.css', 'css/assistant.css', 'css/profile.css', 'css/auth.css', 'css/dark_mode.css', 'css/responsive_utilities.css'],
        js: ['js/main.js', 'js/ui.js', 'js/auth.js', 'js/assistant.js', 'js/plants.js', 'js/weather.js', 'js/compost.js', 'js/camera.js']
    };
    
    // Sistema de prevención de bucles
    const LOOP_PREVENTION = {
        reloadKey: 'agrosync_reload_lock',
        timeoutMs: 10000, // 10 segundos de bloqueo
        maxReloads: 3,
        reloadCountKey: 'agrosync_reload_count'
    };
    
    function isReloadBlocked() {
        const lockTime = sessionStorage.getItem(LOOP_PREVENTION.reloadKey);
        const reloadCount = parseInt(sessionStorage.getItem(LOOP_PREVENTION.reloadCountKey) || '0');
        
        if (lockTime) {
            const timeDiff = Date.now() - parseInt(lockTime);
            if (timeDiff < LOOP_PREVENTION.timeoutMs) {
                return true;
            }
        }
        
        if (reloadCount >= LOOP_PREVENTION.maxReloads) {
            console.warn('🚫 Máximo de recargas alcanzado. Sistema de cache deshabilitado.');
            return true;
        }
        
        return false;
    }
    
    function setReloadLock() {
        const currentCount = parseInt(sessionStorage.getItem(LOOP_PREVENTION.reloadCountKey) || '0');
        sessionStorage.setItem(LOOP_PREVENTION.reloadKey, Date.now().toString());
        sessionStorage.setItem(LOOP_PREVENTION.reloadCountKey, (currentCount + 1).toString());
    }
    
    function clearReloadLock() {
        sessionStorage.removeItem(LOOP_PREVENTION.reloadKey);
        // No limpiar el contador para mantener la protección durante la sesión
    }
    
    function resetReloadCounter() {
        sessionStorage.removeItem(LOOP_PREVENTION.reloadCountKey);
        sessionStorage.removeItem(LOOP_PREVENTION.reloadKey);
    }
    
    // Función para versionar recursos
    function addVersionToResources() {
        const timestamp = Date.now();
        
        // Versionar CSS
        RESOURCES.css.forEach(cssPath => {
            const links = document.querySelectorAll(`link[href*="${cssPath}"]`);
            links.forEach(link => {
                if (!link.href.includes('?v=')) {
                    link.href = `${cssPath}?v=${timestamp}`;
                }
            });
        });
        
        // Versionar JS (solo los que no están ya cargados)
        RESOURCES.js.forEach(jsPath => {
            const scripts = document.querySelectorAll(`script[src*="${jsPath}"]`);
            scripts.forEach(script => {
                if (!script.src.includes('?v=')) {
                    script.src = `${jsPath}?v=${timestamp}`;
                }
            });
        });
    }
    
    // Gestión de versiones de cache
    function manageCacheVersions() {
        const currentVersion = CACHE_CONFIG.version;
        const storedVersion = localStorage.getItem('agrosync_cache_version');
        
        if (storedVersion !== currentVersion) {
            console.log('🔄 Nueva versión de cache detectada');
            
            // Limpiar cache del navegador
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        if (name.includes('agrosync') || name.includes('workbox')) {
                            caches.delete(name);
                        }
                    });
                });
            }
            
            // Limpiar storage obsoleto
            try {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('agrosync_') && key !== 'agrosync_cache_version' && key !== 'agroSyncUser' && key !== 'darkMode') {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            } catch (e) {
                console.warn('No se pudo limpiar localStorage:', e);
            }
            
            localStorage.setItem('agrosync_cache_version', currentVersion);
        }
    }
    
    // Sistema de verificación de actualizaciones
    let updateCheckTimer = null;
    
    function checkForUpdates() {
        if (!CACHE_CONFIG.isDev || isReloadBlocked()) return;
        
        const filesToCheck = [
            'index.html',
            'js/main.js',
            'css/base.css'
        ];
        
        const checkPromises = filesToCheck.map(file => {
            return fetch(file, {
                method: 'HEAD',
                cache: 'no-cache'
            }).then(response => {
                const lastModified = response.headers.get('Last-Modified');
                const etag = response.headers.get('ETag');
                const storageKey = `agrosync_${file.replace(/[^a-zA-Z0-9]/g, '_')}_version`;
                const currentVersion = lastModified || etag || 'unknown';
                const storedVersion = sessionStorage.getItem(storageKey);
                
                if (storedVersion && storedVersion !== currentVersion) {
                    return { file, updated: true };
                }
                
                sessionStorage.setItem(storageKey, currentVersion);
                return { file, updated: false };
            }).catch(() => {
                return { file, updated: false, error: true };
            });
        });
        
        Promise.all(checkPromises).then(results => {
            const updatedFiles = results.filter(r => r.updated && !r.error);
            if (updatedFiles.length > 0) {
                console.log('📱 Archivos actualizados detectados:', updatedFiles.map(f => f.file));
                showUpdateNotification(updatedFiles);
            }
        });
    }
    
    function showUpdateNotification(updatedFiles) {
        // Evitar múltiples notificaciones
        if (document.getElementById('update-notification')) return;
        
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%);
            color: white;
            padding: 1.5rem;
            border-radius: var(--border-radius-xl);
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
            z-index: 10000;
            max-width: 350px;
            font-family: inherit;
            animation: slideInRight 0.3s ease-out;
        `;
        
        const fileList = updatedFiles.map(f => f.file).join(', ');
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <i class="fas fa-sync-alt" style="font-size: 1.5rem;"></i>
                <div>
                    <div style="font-weight: 700; font-size: 1.1rem;">Actualización disponible</div>
                    <div style="font-size: 0.875rem; opacity: 0.9;">Archivos: ${fileList}</div>
                </div>
            </div>
            <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.875rem;
                ">Más tarde</button>
                <button onclick="window.forceReload()" style="
                    background: white;
                    border: none;
                    color: var(--primary-blue);
                    padding: 0.5rem 1.5rem;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.875rem;
                ">Actualizar ahora</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 15 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 15000);
    }
    
    // Funciones públicas para control manual
    window.forceReload = function() {
        if (isReloadBlocked()) {
            console.log('🚫 Recarga bloqueada para prevenir bucles');
            return;
        }
        
        console.log('🔄 Forzando recarga completa...');
        setReloadLock();
        
        // Limpiar todos los caches
        sessionStorage.clear();
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // Forzar recarga completa
        setTimeout(() => {
            window.location.reload(true);
        }, 500);
    };
    
    window.clearAgroSyncCache = function() {
        console.log('🧹 Limpiando cache de AgroSync...');
        resetReloadCounter();
        sessionStorage.clear();
        
        // Mantener datos importantes
        const userdata = localStorage.getItem('agroSyncUser');
        const darkMode = localStorage.getItem('darkMode');
        
        localStorage.clear();
        
        if (userdata) localStorage.setItem('agroSyncUser', userdata);
        if (darkMode) localStorage.setItem('darkMode', darkMode);
        
        console.log('✅ Cache limpiado. Recarga la página manualmente.');
    };
    
    window.toggleAutoUpdate = function() {
        if (updateCheckTimer) {
            clearInterval(updateCheckTimer);
            updateCheckTimer = null;
            console.log('🔴 Auto-actualización deshabilitada');
        } else {
            updateCheckTimer = setInterval(checkForUpdates, CACHE_CONFIG.checkInterval);
            console.log('🟢 Auto-actualización habilitada');
        }
    };
    
    // Inicialización principal
    function initCacheSystem() {
        // Evitar inicialización si hay bucles
        if (isReloadBlocked()) {
            console.warn('⚠️ Sistema de cache bloqueado por prevención de bucles');
            return;
        }
        
        try {
            manageCacheVersions();
            addVersionToResources();
            
            // Solo en desarrollo y si no está bloqueado
            if (CACHE_CONFIG.isDev) {
                console.log('🛠️ Modo desarrollo activado:');
                console.log('   • forceReload() - Recarga forzada');
                console.log('   • clearAgroSyncCache() - Limpiar cache');
                console.log('   • toggleAutoUpdate() - Activar/desactivar auto-verificación');
                
                // Iniciar verificación automática (deshabilitada por defecto)
                // updateCheckTimer = setInterval(checkForUpdates, CACHE_CONFIG.checkInterval);
            }
            
            console.log(`⚡ AgroSync Cache v${CACHE_CONFIG.version} inicializado`);
            
            // Limpiar bloqueo después de inicialización exitosa
            setTimeout(clearReloadLock, 2000);
            
        } catch (error) {
            console.error('❌ Error inicializando sistema de cache:', error);
        }
    }
    
    // Prevenir múltiples inicializaciones
    if (window.agroSyncCacheInitialized) {
        return;
    }
    window.agroSyncCacheInitialized = true;
    
    // Inicializar después de que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCacheSystem);
    } else {
        setTimeout(initCacheSystem, 100);
    }
    
    // Cleanup al salir
    window.addEventListener('beforeunload', () => {
        if (updateCheckTimer) {
            clearInterval(updateCheckTimer);
        }
        clearReloadLock();
    });
    
    // Estilos para notificaciones
    if (!document.getElementById('cache-styles')) {
        const style = document.createElement('style');
        style.id = 'cache-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
})();