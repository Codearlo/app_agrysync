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
 * @param {number} userId - El ID del usuario para el cual obtener las plantas.
 */
async function fetchAndDisplayPlants(userId) { // userId ahora es un parámetro
    if (!plantsListContainer || !noPlantsMessage) {
        console.error("Elementos del DOM para la lista de plantas no encontrados.");
        return;
    }

    if (!userId) { // Verificar si se pasó un userId válido
        plantsListContainer.innerHTML = ''; 
        noPlantsMessage.textContent = 'Error: No se pudo identificar al usuario para cargar las plantas.';
        noPlantsMessage.style.display = 'block';
        console.error("fetchAndDisplayPlants fue llamado sin un userId.");
        return;
    }

    console.log(`Fetching plants for user ID: ${userId}`);

    try {
        const response = await fetch(`backend/get_plants.php?user_id=${userId}`); 
        if (!response.ok) {
            // Intentar leer el cuerpo del error si es JSON
            let errorDetails = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorDetails += ` - ${errorData.error}`;
                }
            } catch (e) {
                // El cuerpo del error no era JSON o hubo otro problema al leerlo
            }
            throw new Error(errorDetails);
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
        plantsListContainer.innerHTML = `<p style="color: var(--danger); text-align: center;">Error al cargar las plantas: ${error.message}. Intenta de nuevo más tarde.</p>`;
        noPlantsMessage.style.display = 'none';
    }
}

/**
 * Maneja el envío del formulario para añadir una nueva planta.
 * @param {Event} event - El evento de envío del formulario.
 */
async function handleAddPlantFormSubmit(event) {
    event.preventDefault(); 

    const user = checkLoginStatus(); // Para añadir planta, aún necesitamos saber quién es el usuario
    if (!user || !user.id) {
        // En una app real, esto no debería suceder si el formulario solo es visible para usuarios logueados.
        // Pero como el login está desactivado, usamos el user_id del objeto de prueba.
        // Si la verificación de login estuviera activa, esto sería un alert o un mensaje en UI.
        console.warn("Intentando añadir planta sin un usuario de localStorage. Se usará el ID del usuario de prueba si está disponible en main.js.");
        // Para el caso de login desactivado, podríamos obtener el ID del loggedInUser de main.js si fuera global,
        // o mejor, pasarlo si esta función se llama desde un contexto donde se conoce.
        // Por ahora, si checkLoginStatus falla, mostramos error.
        const addPlantMessageEl = document.getElementById('add-plant-message');
        if (addPlantMessageEl) {
            addPlantMessageEl.textContent = 'Error de autenticación. No se puede añadir planta.';
            addPlantMessageEl.style.color = 'var(--danger)';
        }
        return;
    }
    const userIdForPlant = user.id;


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
            
            if (plantsListContainer && noPlantsMessage) { 
                 if (noPlantsMessage.style.display === 'block') {
                    noPlantsMessage.style.display = 'none';
                    plantsListContainer.innerHTML = ''; 
                }
                // Usar los datos devueltos por el backend para la nueva planta
                const newPlantData = {
                    id: result.plant_id, 
                    plant_name: result.plant_name,
                    plant_description: result.plant_description,
                    health_status: result.health_status,
                    // added_date: new Date().toISOString() // El backend debería devolver esto
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

/**
 * Inicia una simulación de actualización de salud para la primera planta en la lista (ejemplo).
 */
function startPlantHealthSimulation() {
    console.log("Iniciando simulación de salud de plantas (ejemplo).");
    setInterval(() => {
        const firstPlantItem = document.querySelector('#plants-list-container .plant-item');
        if (firstPlantItem) {
            const healthValueElement = firstPlantItem.querySelector('.health-value');
            const healthStatusText = firstPlantItem.querySelector('.plant-health .health-label'); 

            if (healthValueElement && healthValueElement.textContent.includes('%')) {
                let currentHealth = parseInt(healthValueElement.textContent);
                const change = Math.floor(Math.random() * 11) - 5; 
                currentHealth = Math.max(30, Math.min(100, currentHealth + change)); 
                
                let newStatus = 'Saludable';
                let newHealthClass = 'health-good';

                if (currentHealth < 50) {
                    newStatus = 'Peligro';
                    newHealthClass = 'health-danger';
                } else if (currentHealth < 80) {
                    newStatus = 'Advertencia';
                    newHealthClass = 'health-warning';
                }
                
                healthValueElement.textContent = currentHealth + '%';
                healthValueElement.className = `health-value ${newHealthClass}`; 
                if(healthStatusText) healthStatusText.textContent = `Salud (${newStatus})`;
            }
        }
    }, 20000); 
}
