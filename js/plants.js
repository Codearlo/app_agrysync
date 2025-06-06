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

function showLoginPrompt() {
    if (!plantsListContainer) return;
    
    // Limpiar el contenedor
    plantsListContainer.innerHTML = '';
    
    // Crear y mostrar el prompt de login
    const loginPrompt = document.createElement('div');
    loginPrompt.id = 'plants-login-prompt';
    loginPrompt.style.cssText = `
        text-align: center; 
        color: var(--gray-500); 
        padding: 2rem 1rem;
        background: var(--gray-50);
        border-radius: var(--border-radius-lg);
        border: 2px dashed var(--gray-300);
        margin: 1rem 0;
    `;
    
    loginPrompt.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <i class="fas fa-seedling" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem; display: block;"></i>
        </div>
        <h4 style="margin-bottom: 1rem; color: var(--gray-600); font-size: 1.1rem;">¡Comienza tu jardín digital!</h4>
        <p style="margin-bottom: 1.5rem; color: var(--gray-500);">
            Para añadir y gestionar tus plantas necesitas una cuenta
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.location.href='login.html'" 
                    style="background: var(--primary-blue); color: white; border: none; padding: 0.75rem 1.5rem; 
                           border-radius: var(--border-radius); cursor: pointer; font-weight: 600;
                           transition: var(--transition); display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </button>
            <button onclick="window.location.href='register.html'" 
                    style="background: var(--success); color: white; border: none; padding: 0.75rem 1.5rem; 
                           border-radius: var(--border-radius); cursor: pointer; font-weight: 600;
                           transition: var(--transition); display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-user-plus"></i> Registrarse
            </button>
        </div>
    `;
    
    plantsListContainer.appendChild(loginPrompt);
}

async function fetchAndDisplayPlants() {
    if (!plantsListContainer) {
        console.error("Contenedor de lista de plantas no encontrado.");
        return;
    }

    const user = checkLoginStatus(); // checkLoginStatus() debe estar disponible globalmente desde auth.js

    if (!user || !user.id) {
        console.log("Usuario no logueado, mostrando prompt de login");
        showLoginPrompt();
        return;
    }

    console.log(`Fetching plants for user ID: ${user.id}`);

    // Mostrar loading mientras se cargan las plantas
    plantsListContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            Cargando tus plantas...
        </div>
    `;

    try {
        const response = await fetch(`backend/get_plants.php?user_id=${user.id}`); 
        if (!response.ok) {
            let errorDetails = `HTTP error! status: ${response.status}`;
            try { 
                const errorData = await response.json(); 
                if (errorData && errorData.error) { 
                    errorDetails += ` - ${errorData.error}`; 
                } 
            } catch (e) {}
            throw new Error(errorDetails);
        }
        const plants = await response.json();
        plantsListContainer.innerHTML = ''; // Limpiar loading
        
        if (plants.length === 0) {
            // Mostrar mensaje cuando no hay plantas pero está logueado
            const noPlants = document.createElement('div');
            noPlants.style.cssText = `
                text-align: center; 
                color: var(--gray-500); 
                padding: 2rem 1rem;
                background: var(--gray-50);
                border-radius: var(--border-radius-lg);
                border: 2px dashed var(--gray-300);
                margin: 1rem 0;
            `;
            noPlants.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <i class="fas fa-seedling" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 1rem; display: block;"></i>
                </div>
                <h4 style="margin-bottom: 1rem; color: var(--gray-600); font-size: 1.1rem;">¡Aún no tienes plantas!</h4>
                <p style="margin-bottom: 1.5rem; color: var(--gray-500);">
                    Ve a tu perfil para añadir tu primera planta y comenzar a cuidar tu jardín digital
                </p>
                <button onclick="showPage('profile')" 
                        style="background: var(--primary-green); color: white; border: none; padding: 0.75rem 1.5rem; 
                               border-radius: var(--border-radius); cursor: pointer; font-weight: 600;
                               transition: var(--transition); display: inline-flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-plus-circle"></i> Añadir Primera Planta
                </button>
            `;
            plantsListContainer.appendChild(noPlants);
        } else {
            plants.forEach(plant => renderPlant(plant));
        }
    } catch (error) {
        console.error("Error al obtener las plantas:", error);
        plantsListContainer.innerHTML = `
            <div style="color: var(--danger); text-align: center; padding: 2rem; background: var(--gray-50); border-radius: var(--border-radius-lg); border: 2px solid var(--danger);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                <h4 style="margin-bottom: 1rem;">Error al cargar las plantas</h4>
                <p style="margin-bottom: 1rem;">${error.message}</p>
                <button onclick="fetchAndDisplayPlants()" 
                        style="background: var(--danger); color: white; border: none; padding: 0.75rem 1.5rem; 
                               border-radius: var(--border-radius); cursor: pointer; font-weight: 600;">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
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
        setTimeout(() => {
            alert("Por favor, inicia sesión para añadir plantas.");
            window.location.href = 'login.html';
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
            
            // Actualizar la lista de plantas en la página home
            fetchAndDisplayPlants();
            
            // Opcional: cambiar a la página home para ver la nueva planta
            setTimeout(() => {
                showPage('home');
            }, 1500);
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