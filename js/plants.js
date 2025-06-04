// js/plants.js

const plantsListContainer = document.getElementById('plants-list-container');
const noPlantsMessage = document.getElementById('no-plants-message');

/**
 * Renderiza una planta individual en la lista.
 * @param {object} plant - El objeto de la planta con sus propiedades.
 */
function renderPlant(plant) {
    if (!plantsListContainer) return;

    const plantItem = document.createElement('div');
    plantItem.classList.add('plant-item');
    plantItem.dataset.plantId = plant.id; // Guardar ID para futuras acciones (editar/borrar)

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
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function calculateHealthPercentage(status) {
    switch (status) {
        case 'Saludable': return Math.floor(Math.random() * 11) + 90;
        case 'Advertencia': return Math.floor(Math.random() * 20) + 70;
        case 'Peligro': return Math.floor(Math.random() * 30) + 40;
        default: return 50;
    }
}

/**
 * Obtiene las plantas del usuario desde el backend y las muestra.
 */
async function fetchAndDisplayPlants() {
    if (!plantsListContainer || !noPlantsMessage) return;

    const user = checkLoginStatus(); // Obtener usuario logueado
    if (!user || !user.id) {
        plantsListContainer.innerHTML = ''; // Limpiar por si acaso
        noPlantsMessage.textContent = 'Inicia sesión para ver tus plantas.';
        noPlantsMessage.style.display = 'block';
        return;
    }

    try {
        // Pasar user_id al backend
        const response = await fetch(`backend/get_plants.php?user_id=${user.id}`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const plants = await response.json();

        plantsListContainer.innerHTML = ''; 

        if (plants.length === 0) {
            noPlantsMessage.textContent = 'Aún no has añadido ninguna planta. ¡Ve a tu perfil para empezar!';
            noPlantsMessage.style.display = 'block';
        } else {
            noPlantsMessage.style.display = 'none';
            plants.forEach(plant => renderPlant(plant));
        }
    } catch (error) {
        console.error("Error al obtener las plantas:", error);
        plantsListContainer.innerHTML = '<p style="color: var(--danger); text-align: center;">Error al cargar las plantas. Intenta de nuevo más tarde.</p>';
        noPlantsMessage.style.display = 'none';
    }
}

/**
 * Maneja el envío del formulario para añadir una nueva planta.
 * @param {Event} event - El evento de envío del formulario.
 */
async function handleAddPlantFormSubmit(event) {
    event.preventDefault(); 

    const user = checkLoginStatus();
    if (!user || !user.id) {
        alert("Debes iniciar sesión para añadir plantas."); // O mostrar mensaje en UI
        return;
    }

    const form = event.target;
    const plantNameInput = document.getElementById('plant-name');
    const plantDescriptionInput = document.getElementById('plant-description');
    const plantHealthInput = document.getElementById('plant-health');
    const addPlantMessage = document.getElementById('add-plant-message');

    if (!plantNameInput || !plantHealthInput || !addPlantMessage) {
        console.error("Faltan elementos del formulario para añadir planta.");
        return;
    }

    const plantData = {
        user_id: user.id, // Añadir user_id
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plantData)
        });

        const result = await response.json();

        if (result.success) {
            addPlantMessage.textContent = result.message;
            addPlantMessage.style.color = 'var(--success)';
            form.reset(); 
            
            // Actualizar la lista de plantas inmediatamente
            if (plantsListContainer && noPlantsMessage) { 
                 if (noPlantsMessage.style.display === 'block') {
                    noPlantsMessage.style.display = 'none';
                    plantsListContainer.innerHTML = ''; 
                }
                const newPlantData = {
                    id: result.plant_id, 
                    plant_name: result.plant_name,
                    plant_description: result.plant_description,
                    health_status: result.health_status,
                    added_date: new Date().toISOString() 
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
