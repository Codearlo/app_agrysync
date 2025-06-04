// js/auth.js

const BASE_URL_BACKEND = 'backend/'; // Ajusta si tu carpeta backend está en otra ruta

/**
 * Maneja el envío del formulario de registro.
 * @param {Event} event - El evento de envío del formulario.
 */
async function handleRegisterFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.elements['register-username'].value.trim();
    const email = form.elements['register-email'].value.trim();
    const password = form.elements['register-password'].value;
    const messageElement = document.getElementById('register-message');

    messageElement.textContent = 'Registrando...';
    messageElement.className = 'form-message'; // Reset class

    try {
        const response = await fetch(`${BASE_URL_BACKEND}register_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = await response.json();

        if (result.success) {
            messageElement.textContent = result.message + " Serás redirigido al inicio de sesión.";
            messageElement.classList.add('success');
            form.reset();
            setTimeout(() => {
                showPage('login'); // Asume que showPage está definida globalmente (en ui.js)
            }, 2000);
        } else {
            messageElement.textContent = result.message || 'Error en el registro.';
            messageElement.classList.add('error');
        }
    } catch (error) {
        console.error("Error en registro:", error);
        messageElement.textContent = 'Error de conexión. Inténtalo de nuevo.';
        messageElement.classList.add('error');
    }
}

/**
 * Maneja el envío del formulario de inicio de sesión.
 * @param {Event} event - El evento de envío del formulario.
 */
async function handleLoginFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const login_identifier = form.elements['login-identifier'].value.trim();
    const password = form.elements['login-password'].value;
    const messageElement = document.getElementById('login-message');

    messageElement.textContent = 'Iniciando sesión...';
    messageElement.className = 'form-message'; // Reset class

    try {
        const response = await fetch(`${BASE_URL_BACKEND}login_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_identifier, password })
        });
        const result = await response.json();

        if (result.success && result.user) {
            messageElement.textContent = result.message;
            messageElement.classList.add('success');
            
            // Guardar información del usuario en localStorage
            localStorage.setItem('agroSyncUser', JSON.stringify(result.user));
            
            // Actualizar UI y redirigir
            updateUIAfterLogin(result.user);
            showPage('home'); // Asume que showPage está definida globalmente (en ui.js)
            document.querySelector('.bottom-nav').style.display = 'flex'; // Mostrar nav
            fetchAndDisplayPlants(); // Cargar plantas del usuario logueado
        } else {
            messageElement.textContent = result.message || 'Error en el inicio de sesión.';
            messageElement.classList.add('error');
        }
    } catch (error) {
        console.error("Error en login:", error);
        messageElement.textContent = 'Error de conexión. Inténtalo de nuevo.';
        messageElement.classList.add('error');
    }
}

/**
 * Cierra la sesión del usuario.
 */
function logoutUser() {
    localStorage.removeItem('agroSyncUser');
    // Limpiar UI y redirigir a login
    document.getElementById('profile-avatar-initials').textContent = '--';
    document.getElementById('profile-username').textContent = 'Nombre de Usuario';
    document.getElementById('profile-email').textContent = 'correo@ejemplo.com';
    document.getElementById('plants-list-container').innerHTML = '<p id="no-plants-message" style="text-align: center; color: var(--gray-500);">Inicia sesión para ver tus plantas.</p>';


    showPage('login');
    document.querySelector('.bottom-nav').style.display = 'none'; // Ocultar nav
}

/**
 * Verifica si hay un usuario logueado al cargar la página.
 * @returns {object|null} - El objeto del usuario si está logueado, sino null.
 */
function checkLoginStatus() {
    const userData = localStorage.getItem('agroSyncUser');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            localStorage.removeItem('agroSyncUser'); // Datos corruptos
            return null;
        }
    }
    return null;
}

/**
 * Actualiza la UI con la información del usuario logueado.
 * @param {object} user - El objeto del usuario.
 */
function updateUIAfterLogin(user) {
    if (user) {
        document.getElementById('profile-avatar-initials').textContent = user.username.substring(0, 2).toUpperCase();
        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-email').textContent = user.email;
        // Aquí podrías cambiar el texto del subtítulo del perfil si lo deseas
        // document.getElementById('profile-subtitle').textContent = `Bienvenido, ${user.username}`;
    }
}
