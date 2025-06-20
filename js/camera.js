function startCamera() {
  console.log('Starting camera...');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const videoElement = document.querySelector('video');
      videoElement.srcObject = stream;
    })
    .catch(error => {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos y que no esté siendo utilizada por otra aplicación.');
    });
}

document.addEventListener('DOMContentLoaded', startCamera);
});
