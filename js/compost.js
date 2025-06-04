// js/compost.js

/**
 * Calcula las estimaciones para el compostaje basado en la cantidad deseada.
 * Actualiza la sección de resultados en la interfaz.
 */
function calculateCompost() {
    const amountInput = document.getElementById('compost-amount');
    const resultsSection = document.getElementById('compost-results-section');
    const greenAmountEl = document.getElementById('green-materials-amount');
    const brownAmountEl = document.getElementById('brown-materials-amount');
    const fermentationTimeEl = document.getElementById('fermentation-time');

    if (!amountInput || !resultsSection || !greenAmountEl || !brownAmountEl || !fermentationTimeEl) {
        console.error("Faltan elementos del DOM para la calculadora de compostaje.");
        return;
    }

    const amountKg = parseFloat(amountInput.value);

    if (isNaN(amountKg) || amountKg <= 0) {
        console.error("Por favor, ingresa una cantidad válida de compost en kilogramos.");
        resultsSection.style.display = 'none';
        // Podrías mostrar un mensaje de error en la UI aquí
        return;
    }
    
    const totalInitialMaterialKg = amountKg * 2.5; 
    const greenKg = totalInitialMaterialKg * (1/3); 
    const brownKg = totalInitialMaterialKg * (2/3); 
    const greenLitres = greenKg * 3.5; // Estimación de densidad
    const brownLitres = brownKg * 4.5; // Estimación de densidad (marrones suelen ser menos densos)

    greenAmountEl.textContent = `Aproximadamente ${greenKg.toFixed(1)} kg (${greenLitres.toFixed(0)} litros).`;
    brownAmountEl.textContent = `Aproximadamente ${brownKg.toFixed(1)} kg (${brownLitres.toFixed(0)} litros).`;

    let timeEstimate = "4-12 semanas";
    if (amountKg > 10) {
        timeEstimate = "6-16 semanas";
    } else if (amountKg < 2) {
        timeEstimate = "3-8 semanas (para pilas pequeñas bien gestionadas)";
    }
    fermentationTimeEl.textContent = `Entre ${timeEstimate} (varía mucho según el método, tamaño de partícula, aireación y humedad).`;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
