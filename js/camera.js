function startCamera() {
  console.log('Starting camera...');
  const videoElement = document.getElementById('camera-video-preview'); // Corregido el selector
  if (!videoElement) {
    console.error('Elemento de video no encontrado.');
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      videoElement.srcObject = stream;
    })
    .catch(error => {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Iniciar la cámara solo si la página de diagnóstico está activa
    const diagnosisPage = document.getElementById('diagnosis');
    if (diagnosisPage.classList.contains('active')) {
        startCamera();
    }

    // O usar un observador para cuando se muestre la página
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && diagnosisPage.classList.contains('active')) {
                startCamera();
            }
        });
    });

    observer.observe(diagnosisPage, { attributes: true });
});