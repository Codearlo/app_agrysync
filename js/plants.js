// js/plants.js

const plantsListContainer = document.getElementById('plants-list-container');

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
    
    plantsListContainer.innerHTML = '';
    
    const loginPrompt = document.createElement('div');
    loginPrompt.id = 'join-agrosync-section'; 
    loginPrompt.style.cssText = `
        text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-purple) 100%); border-radius: var(--border-radius-xl); margin: 1rem 0; color: white; position: relative; overflow: hidden; box-shadow: var(--shadow-xl);
    `;
    loginPrompt.innerHTML = `
        <div style="position: relative; z-index: 2;">
            <i class="fas fa-lock" style="font-size: 4rem; margin-bottom: 1rem; display: block; opacity: 0.9;"></i>
            <h3 style="margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">🌱 ¡Únete a AgroSync!</h3>
            <p style="margin-bottom: 2rem; font-size: 1.1rem; opacity: 0.95; line-height: 1.6;">
                Para gestionar tus plantas necesitas una cuenta.<br>
                <strong>Es gratis</strong> y solo toma unos segundos.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="window.location.href='register.html'" style="background: white; color: var(--primary-blue); border: none; padding: 1rem 2rem; border-radius: var(--border-radius-lg); cursor: pointer; font-weight: 700; transition: var(--transition); display: inline-flex; align-items: center; gap: 0.75rem; box-shadow: 0 8px 25px rgba(0,0,0,0.2); font-size: 1.1rem;">
                    <i class="fas fa-user-plus"></i> Crear Cuenta Gratis
                </button>
                <button onclick="window.location.href='login.html'" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 1rem 2rem; border-radius: var(--border-radius-lg); cursor: pointer; font-weight: 600; transition: var(--transition); display: inline-flex; align-items: center; gap: 0.75rem; backdrop-filter: blur(10px); font-size: 1rem;">
                    <i class="fas fa-sign-in-alt"></i> Ya tengo cuenta
                </button>
            </div>
        </div>
    `;
    plantsListContainer.appendChild(loginPrompt);
}

async function fetchAndDisplayPlants() {
    if (!plantsListContainer) {
        console.error("Contenedor de lista de plantas no encontrado.");
        return;
    }

    const user = await checkLoginStatus();

    if (!user || !user.id) {
        console.log("Usuario no logueado, mostrando prompt de login");
        showLoginPrompt();
        return;
    }

    console.log(`Fetching plants for user ID: ${user.id}`);

    plantsListContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-500);"><i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i> Cargando...</div>`;

    try {
        const response = await fetch(`backend/get_plants.php?user_id=${user.id}`); 
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const plants = await response.json();
        plantsListContainer.innerHTML = ''; 
        
        if (plants.length === 0) {
            const noPlants = document.createElement('div');
            noPlants.innerHTML = `
                <div style="text-align: center; color: var(--gray-500); padding: 2rem 1rem;">
                    <i class="fas fa-seedling" style="font-size: 3rem; color: var(--primary-green);"></i>
                    <h4 style="margin: 1rem 0;">¡Aún no tienes plantas!</h4>
                    <p>Añade tu primera planta desde tu perfil para empezar.</p>
                </div>
            `;
            plantsListContainer.appendChild(noPlants);
        } else {
            plants.forEach(plant => renderPlant(plant));
        }
    } catch (error) {
        console.error("Error al obtener las plantas:", error);
        plantsListContainer.innerHTML = `<div style="color: var(--danger); text-align: center; padding: 2rem;">Error al cargar las plantas.</div>`;
    }
}