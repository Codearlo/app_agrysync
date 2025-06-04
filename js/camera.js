// js/camera.js

/**
 * Simula el proceso de tomar una foto y analizarla.
 * Actualiza el texto y estilo del botón de la cámara.
 * @param {Event} event - El evento click del botón.
 */
function simulateCamera(event) { // Pasamos el evento para acceder a event.target
    const btn = event.target.closest('.camera-btn'); 
    if (!btn) return;

    const originalText = btn.innerHTML; 
    const originalGradient = btn.style.background;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';
    btn.style.background = 'var(--warning)';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Análisis Completo';
        btn.style.background = 'var(--success)';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = originalGradient; // Restaurar el gradiente original si es necesario
            btn.disabled = false;
        }, 2000);
    }, 2500);
}
