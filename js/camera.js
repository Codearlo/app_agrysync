// js/camera.js

document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const plantAnalysisResults = document.getElementById('plant-analysis-results');
    const plantHealthPercentage = document.getElementById('plant-health-percentage');
    const possibleDiseases = document.getElementById('possible-diseases');

    // Verificar si los elementos existen
    if (!video || !canvas || !takePhotoBtn || !plantAnalysisResults || !plantHealthPercentage || !possibleDiseases) {
        console.error("No se encontraron todos los elementos necesarios para la cámara.");
        return;
    }

    // Acceder a la cámara
    async function startCamera() {
        try {
            console.log("Starting camera...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            console.log("Got stream:", stream);
            try {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    console.log("Metadata loaded");
                    video.play();
                };
            } catch (error) {
                console.error("Error setting srcObject:", error);
                alert("No se pudo acceder a la cámara. Verifica los permisos.");
            }
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            alert("No se pudo acceder a la cámara. Verifica los permisos.");
        }
    }

    // Tomar la foto
    takePhotoBtn.addEventListener('click', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        try {
            canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        } catch (error) {
            console.error("Error drawing image to canvas:", error);
            alert("Error al tomar la foto. Intenta de nuevo.");
            return;
        }
        console.log("Image drawn to canvas");
        const imageDataURL = canvas.toDataURL('image/jpeg');

        // Mostrar los resultados del análisis (temporalmente ocultos)
        plantAnalysisResults.style.display = 'block';
        plantHealthPercentage.textContent = 'Analizando...';
        possibleDiseases.textContent = '';

        // Llamar a la función de análisis de la planta
        analyzePlantHealth(imageDataURL);
    });

    // Iniciar la cámara al cargar la página
    startCamera();
});
