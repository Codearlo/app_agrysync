// js/plants.js

const plantsListContainer = document.getElementById('plants-list-container');
const plantsLoginPromptEl = document.getElementById('plants-login-prompt'); // Elemento del prompt

function renderPlant(plant) {
    if (!plantsListContainer) return;
    const plantItem = document.createElement('div');
    plantItem.classList.add('plant-item');
    plantItem.dataset.plantId = plant.id; 
    let healthClass = '';
    if (plant.health_status === 'Saludable') healthClass = 'health-good';
    else if (plant.health_status === 'Advertencia') healthClass = 'health-warning';
    else if (plant.health_status === 'Peligro') healthClass = 'health-danger';
    plantItem.innerHTML = `
        <div class="plant-info">
            <h4>${escapeHTML(plant.plant_name)}</h4>
            <p>${escapeHTML(plant.plant_description) || 'Sin descripción.'}</p>
        </div>
        <div class="plant-health">
            <div class="health-value ${healthClass}">${calculateHealthPercentage(plant.health_status)}%</div>
            <div class="health-label">Salud (${escapeHTML(plant.health_status)})</div>
        </div>
    `;
    plantsListContainer.appendChild(plantItem);
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function calculateHealthPercentage(status) {
    switch (status) {
        case 'Saludable': return Math.floor(Math.random() * 11) + 90;
        case 'Advertencia': return Math.floor(Math.random() * 20) + 70;
        case 'Peligro': return Math.floor(Math.random() * 30) + 40;
        default: return 50;
    }
}

async function fetchAndDisplayPlants() {
    if (!plantsListContainer || !plantsLoginPromptEl) {
        console.error("Elementos del DOM para la lista de plantas no encontrados.");
        return;
    }

    const user = checkLoginStatus(); // checkLoginStatus() debe estar disponible globalmente desde auth.js

    if (!user || !user.id) {
        plantsListContainer.innerHTML = ''; // Limpiar cualquier planta anterior
        plantsLoginPromptEl.style.display = 'block'; // Mostrar prompt para iniciar sesión
        return;
    }

    plantsLoginPromptEl.style.display = 'none'; // Ocultar prompt si está logueado
    console.log(`Fetching plants for user ID: ${user.id}`);

    try {
        const response = await fetch(`backend/get_plants.php?user_id=${user.id}`); 
        if (!response.ok) {
            let errorDetails = `HTTP error! status: ${response.status}`;
            try { const errorData = await response.json(); if (errorData && errorData.error) { errorDetails += ` - ${errorData.error}`; } } catch (e) {}
            throw new Error(errorDetails);
        }
        const plants = await response.json();
        plantsListContainer.innerHTML = ''; 
        if (plants.length === 0) {
            plantsListContainer.innerHTML = '<p style="text-align: center; color: var(--gray-500);">Aún no has añadido ninguna planta. ¡Ve a tu perfil para empezar!</p>';
        } else {
            plants.forEach(plant => renderPlant(plant));
        }
    } catch (error) {
        console.error("Error al obtener las plantas:", error);
        plantsListContainer.innerHTML = `<p style="color: var(--danger); text-align: center;">Error al cargar las plantas: ${error.message}. Intenta de nuevo más tarde.</p>`;
    }
}

async function handleAddPlantFormSubmit(event) {
    event.preventDefault(); 
    const user = checkLoginStatus();
    const addPlantMessage = document.getElementById('add-plant-message');

    if (!addPlantMessage) {
        console.error("Elemento de mensaje para añadir planta no encontrado.");
        return;
    }

    if (!user || !user.id) {
        addPlantMessage.textContent = 'Debes iniciar sesión para añadir plantas.';
        addPlantMessage.style.color = 'var(--danger)';
        // Opcional: Redirigir a la página de login o mostrar un modal de login
        setTimeout(() => {
            if (typeof showPage === 'function') {
                // No tenemos una página de login separada en index.html,
                // el usuario debe ir a login.html.
                // Podríamos mostrar un mensaje más prominente o un botón para ir a login.
                alert("Por favor, inicia sesión para añadir plantas.");
                window.location.href = 'login.html';
            } else {
                 alert("Por favor, inicia sesión para añadir plantas.");
            }
        }, 1500);
        return;
    }
    const userIdForPlant = user.id;

    const form = event.target;
    const plantNameInput = document.getElementById('plant-name');
    const plantDescriptionInput = document.getElementById('plant-description');
    const plantHealthInput = document.getElementById('plant-health');
    
    if (!plantNameInput || !plantHealthInput) {
        console.error("Faltan elementos del formulario para añadir planta.");
        addPlantMessage.textContent = 'Error interno del formulario.';
        addPlantMessage.style.color = 'var(--danger)';
        return;
    }

    const plantData = {
        user_id: userIdForPlant, 
        plant_name: plantNameInput.value.trim(),
        plant_description: plantDescriptionInput.value.trim(),
        health_status: plantHealthInput.value
    };

    if (!plantData.plant_name) {
        addPlantMessage.textContent = 'El nombre de la planta es obligatorio.';
        addPlantMessage.style.color = 'var(--danger)';
        return;
    }

    addPlantMessage.textContent = 'Guardando planta...';
    addPlantMessage.style.color = 'var(--gray-500)';

    try {
        const response = await fetch('backend/add_plant.php', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plantData)
        });
        const result = await response.json();
        if (result.success) {
            addPlantMessage.textContent = result.message;
            addPlantMessage.style.color = 'var(--success)';
            form.reset(); 
            if (plantsListContainer) { 
                 if (plantsLoginPromptEl && plantsLoginPromptEl.style.display === 'block') {
                    plantsLoginPromptEl.style.display = 'none';
                    plantsListContainer.innerHTML = ''; 
                }
                const newPlantData = {
                    id: result.plant_id, 
                    plant_name: result.plant_name,
                    plant_description: result.plant_description,
                    health_status: result.health_status,
                };
                renderPlant(newPlantData); 
            }
        } else {
            addPlantMessage.textContent = result.message || 'Error al guardar la planta.';
            addPlantMessage.style.color = 'var(--danger)';
        }
    } catch (error) {
        console.error("Error al enviar datos de la planta:", error);
        addPlantMessage.textContent = 'Error de conexión al guardar la planta.';
        addPlantMessage.style.color = 'var(--danger)';
    }
}

// Simulación de salud (opcional, mantener si se desea)
function startPlantHealthSimulation() {
    // ... (código de simulación existente)
}
