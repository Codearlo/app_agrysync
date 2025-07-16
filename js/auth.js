// js/auth.js

const BASE_URL_BACKEND_AUTH = 'backend/'; 

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
    messageElement.className = 'form-message'; 

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
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
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
    messageElement.className = 'form-message'; 

    try {
        const response = await fetch(`${BASE_URL_BACKEND_AUTH}login_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login_identifier, password })
        });
        const result = await response.json();
        if (result.success) {
            window.location.href = 'index.html'; 
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

async function logoutUser() {
    try {
        await fetch(`${BASE_URL_BACKEND_AUTH}logout_user.php`);
    } catch (error) {
        console.error("Error al cerrar sesión en el backend:", error);
    } finally {
        window.location.href = 'login.html';
    }
}

async function checkLoginStatus() {
    try {
        const response = await fetch(`${BASE_URL_BACKEND_AUTH}verificar_sesion.php`, {
            cache: 'no-cache'
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.loggedIn ? data.user : null;
    } catch (error) {
        console.error("Error verificando el estado de la sesión:", error);
        return null;
    }
}

function updateUIAfterLogin(user) {
    if (user) {
        // --- Perfil ---
        const profileLoggedInContent = document.getElementById('profile-logged-in-content');
        const profileGuestContent = document.getElementById('profile-guest-content');
        const profileAvatar = document.getElementById('profile-avatar-initials');
        const profileUsername = document.getElementById('profile-username');
        const profileEmail = document.getElementById('profile-email');

        if (profileAvatar) profileAvatar.textContent = user.username.substring(0, 2).toUpperCase();
        if (profileUsername) profileUsername.textContent = user.username;
        if (profileEmail) profileEmail.textContent = user.email;

        if (profileLoggedInContent) profileLoggedInContent.style.display = 'block';
        if (profileGuestContent) profileGuestContent.style.display = 'none';

        // --- Actualizar Plantas y Asistente ---
        if (typeof fetchAndDisplayPlants === 'function') {
            fetchAndDisplayPlants();
        }
        
        if (typeof updateAssistantForUser === 'function') {
            updateAssistantForUser();
        }
    }
}

function updateUIForGuest() {
    // --- Perfil ---
    const profileLoggedInContent = document.getElementById('profile-logged-in-content');
    const profileGuestContent = document.getElementById('profile-guest-content');
    
    if (profileLoggedInContent) profileLoggedInContent.style.display = 'none';
    if (profileGuestContent) profileGuestContent.style.display = 'block';

    // --- Actualizar Plantas y Asistente para invitado ---
    if (typeof fetchAndDisplayPlants === 'function') {
        fetchAndDisplayPlants(); // Mostrará el prompt de login
    }
    if (typeof updateAssistantForUser === 'function') {
        updateAssistantForUser(); // Mostrará el mensaje de login requerido
    }
}