// js/cache-reloader.js

(function() {
    // IMPORTANTE: Cambia este número de versión cada vez que hagas nuevos cambios en tus archivos JS o CSS.
    // Por ejemplo: '1.0.1', '1.0.2', etc.
    const APP_VERSION = '6.0.0';

    const storedVersion = localStorage.getItem('app_version');

    if (storedVersion !== APP_VERSION) {
        console.log(`Nueva versión detectada. Versión anterior: ${storedVersion}, Versión nueva: ${APP_VERSION}. Forzando recarga de caché.`);
        
        // Actualiza la versión en el almacenamiento local.
        localStorage.setItem('app_version', APP_VERSION);
        
        // Forza una recarga de la página desde el servidor, ignorando la caché del navegador.
        window.location.reload(true);
    } else {
        console.log(`Versión de la aplicación (${APP_VERSION}) actualizada.`);
    }
})();