// js/auth.js

const BASE_URL_BACKEND_AUTH = 'backend/'; // Ajusta si tu carpeta backend está en otra ruta

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

    if (!messageElement) {
        console.error("Elemento de mensaje de registro no encontrado.");
        return;
    }

    messageElement.textContent = 'Registrando...';
    messageElement.className = 'form-message'; // Reset class

    try {
        const response = await fetch(`${BASE_URL_BACKEND_AUTH}register_user.php`, {
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
                window.location.href = 'login.html'; // Redirigir a la página de login
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

    if (!messageElement) {
        console.error("Elemento de mensaje de login no encontrado.");
        return;
    }

    messageElement.textContent = 'Iniciando sesión...';
    messageElement.className = 'form-message'; // Reset class

    try {
        const response = await fetch(`${BASE_URL_BACKEND_AUTH}login_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_identifier, password })
        });
        const result = await response.json();

        if (result.success && result.user) {
            // No mostrar mensaje aquí, la redirección es inmediata
            // messageElement.textContent = result.message;
            // messageElement.classList.add('success');
            
            localStorage.setItem('agroSyncUser', JSON.stringify(result.user));
            window.location.href = 'index.html'; // Redirigir a la página principal de la app
            
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
    window.location.href = 'login.html'; // Redirigir a la página de login
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
            localStorage.removeItem('agroSyncUser'); 
            return null;
        }
    }
    return null;
}

/**
 * Actualiza la UI con la información del usuario logueado.
 * Esta función se llamará desde main.js en index.html.
 * @param {object} user - El objeto del usuario.
 */
function updateUIAfterLogin(user) {
    if (user) {
        const profileAvatar = document.getElementById('profile-avatar-initials');
        const profileUsername = document.getElementById('profile-username');
        const profileEmail = document.getElementById('profile-email');

        if (profileAvatar) profileAvatar.textContent = user.username.substring(0, 2).toUpperCase();
        if (profileUsername) profileUsername.textContent = user.username;
        if (profileEmail) profileEmail.textContent = user.email;
    }
}
