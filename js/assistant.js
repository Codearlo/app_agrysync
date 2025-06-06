// js/assistant.js

let chatMessagesContainerAssistant; 
let userInputAssistant;
let sendMessageBtnAssistant;
let chatHistory = []; 

function addMessageToChat(text, sender) {
    if (!chatMessagesContainerAssistant) {
        chatMessagesContainerAssistant = document.querySelector('#assistant .chat-messages');
        if (!chatMessagesContainerAssistant) {
            console.error("Contenedor de mensajes del chat no encontrado en addMessageToChat.");
            return;
        }
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text; 
    chatMessagesContainerAssistant.appendChild(messageDiv);
    chatMessagesContainerAssistant.scrollTop = chatMessagesContainerAssistant.scrollHeight;
}

function showLoginRequiredMessage() {
    if (!chatMessagesContainerAssistant) {
        chatMessagesContainerAssistant = document.querySelector('#assistant .chat-messages');
        if (!chatMessagesContainerAssistant) {
            console.error("Contenedor de mensajes del chat no encontrado.");
            return;
        }
    }
    
    // Limpiar mensajes existentes
    chatMessagesContainerAssistant.innerHTML = '';
    
    // Crear mensaje de login requerido
    const loginMessage = document.createElement('div');
    loginMessage.classList.add('message', 'bot');
    loginMessage.innerHTML = `
        🔒 Para acceder al asistente AgriBot necesitas una cuenta en AgroSync.
        <br><br>
        Con una cuenta podrás:
        <br>• Hacer preguntas sobre jardinería 🌱
        <br>• Obtener consejos personalizados 💡
        <br>• Guardar conversaciones 💾
        <br>• Gestionar tus plantas 🪴
        <br><br>
        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
            <button onclick="window.location.href='login.html'" 
                    style="background: var(--primary-blue); color: white; border: none; padding: 0.75rem 1.5rem; 
                           border-radius: var(--border-radius); cursor: pointer; font-weight: 600;
                           transition: var(--transition); display: inline-flex; align-items: center; gap: 0.5rem;
                           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                <i class="fas fa-sign-in-alt"></i> Iniciar Sesión
            </button>
            <button onclick="window.location.href='register.html'" 
                    style="background: var(--success); color: white; border: none; padding: 0.75rem 1.5rem; 
                           border-radius: var(--border-radius); cursor: pointer; font-weight: 600;
                           transition: var(--transition); display: inline-flex; align-items: center; gap: 0.5rem;
                           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                <i class="fas fa-user-plus"></i> Crear Cuenta
            </button>
        </div>
    `;
    chatMessagesContainerAssistant.appendChild(loginMessage);
    
    // Deshabilitar el input y botón
    if (userInputAssistant) {
        userInputAssistant.disabled = true;
        userInputAssistant.placeholder = "Inicia sesión para chatear con AgriBot...";
    }
    if (sendMessageBtnAssistant) {
        sendMessageBtnAssistant.disabled = true;
        sendMessageBtnAssistant.style.opacity = "0.5";
    }
}

async function getGeminiResponse(userPrompt) {
    addMessageToChat("AgriBot está pensando... 🤔", 'bot-loading'); 
    const apiKey = "AIzaSyCObTKToTanRgfD4TaQLLRWKMRmPjH7ubM"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const systemPromptText = `Eres AgriBot, un asistente virtual experto en jardinería y agricultura para la aplicación AgroSync. 
        Tu propósito es ayudar a los usuarios con sus preguntas sobre el cultivo de plantas, compostaje, diagnóstico de enfermedades de plantas y el uso general de la aplicación AgroSync.
        Siempre que sea apropiado, incluye emojis relevantes en tus respuestas para hacer la conversación más amigable y visual. 🌱💧☀️🐛
        Si te preguntan sobre temas no relacionados con jardinería, agricultura o la aplicación AgroSync, responde amablemente que no tienes información sobre ese tema (quizás con un emoji como 🤷‍♂️ o 🚫), pero que estarás encantado de ayudar con cualquier consulta sobre plantas o la app.
        Puedes responder preguntas sobre cómo usar la calculadora de compostaje, la función de diagnóstico, el perfil de usuario, etc., dentro de AgroSync.
        Mantén tus respuestas concisas, amigables y útiles.`;
    const currentConversationForAPI = [{ role: "user", parts: [{ text: userPrompt }] }];
    const payload = {
        contents: currentConversationForAPI, 
        systemInstruction: { parts: [{ text: systemPromptText }] },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const loadingMessage = chatMessagesContainerAssistant?.querySelector('.bot-loading');
        if (loadingMessage) loadingMessage.remove();

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: "No se pudo obtener detalle del error."} })); 
            console.error("Error de API Gemini:", response.status, errorData);
            let errorMessage = `Lo siento, no pude procesar tu solicitud en este momento (Error: ${response.status}) 😔.`;
            if (errorData?.error?.message) {
                if (errorData.error.message.includes("API key not valid")) {
                    errorMessage = "Lo siento, parece que hay un problema con la configuración de la API 🔑. Por favor, contacta al administrador.";
                } else if (response.status === 400) {
                     errorMessage = "Parece que hubo un problema con la solicitud (Error 400) 🤔. Intenta reformular tu pregunta.";
                }
            }
            addMessageToChat(errorMessage, 'bot-error');
            return;
        }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            addMessageToChat(result.candidates[0].content.parts[0].text, 'bot');
        } else if (result.promptFeedback?.blockReason) {
            console.warn("Respuesta bloqueada por la API de Gemini:", result.promptFeedback.blockReason);
            let blockedMessage = "Lo siento, no puedo responder a esa pregunta porque el contenido ha sido bloqueado 🚫.";
            if(result.promptFeedback.blockReason === "SAFETY") {
                blockedMessage = "Lo siento, tu pregunta ha activado nuestros filtros de seguridad y no puedo procesarla 🛡️.";
            }
            addMessageToChat(blockedMessage, 'bot-error');
        } else {
            console.error("Respuesta inesperada de la API de Gemini:", result);
            addMessageToChat("Recibí una respuesta inesperada 😕. Por favor, intenta reformular tu pregunta o inténtalo más tarde.", 'bot-error');
        }
    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        const loadingMessage = chatMessagesContainerAssistant?.querySelector('.bot-loading');
        if (loadingMessage) loadingMessage.remove();
        addMessageToChat("Hubo un problema de conexión al intentar obtener una respuesta 🌐🔌. Verifica tu conexión a internet e inténtalo de nuevo.", 'bot-error');
    }
}

/**
 * Inicializa los event listeners para la interfaz de chat del asistente.
 */
function initializeAssistantChat() {
    const assistantPage = document.getElementById('assistant');
    if (!assistantPage) return; // No hacer nada si la página del asistente no está

    chatMessagesContainerAssistant = assistantPage.querySelector('.chat-messages');
    userInputAssistant = assistantPage.querySelector('#userInput'); 
    sendMessageBtnAssistant = assistantPage.querySelector('#sendMessageBtn');  

    if (sendMessageBtnAssistant && userInputAssistant && chatMessagesContainerAssistant) {
        sendMessageBtnAssistant.addEventListener('click', () => {
            // Verificar si el usuario está logueado
            const user = checkLoginStatus();
            if (!user) {
                showLoginRequiredMessage();
                return;
            }

            const messageText = userInputAssistant.value.trim();
            if (messageText) {
                addMessageToChat(messageText, 'user');
                getGeminiResponse(messageText); 
                userInputAssistant.value = '';
                userInputAssistant.focus();
            }
        });

        userInputAssistant.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const user = checkLoginStatus();
                if (!user) {
                    showLoginRequiredMessage();
                    return;
                }
                if(sendMessageBtnAssistant) sendMessageBtnAssistant.click();
            }
        });

        // Verificar cuando el usuario trata de escribir sin estar logueado
        userInputAssistant.addEventListener('focus', () => {
            const user = checkLoginStatus();
            if (!user) {
                showLoginRequiredMessage();
                userInputAssistant.blur();
            }
        });

        console.log("Chat del asistente inicializado.");
    } else {
        console.warn("No se pudieron encontrar todos los elementos para inicializar el chat del asistente.");
    }
}

/**
 * Función para actualizar el chat cuando el usuario inicia o cierra sesión
 */
function updateAssistantForUser() {
    const user = checkLoginStatus();
    if (!chatMessagesContainerAssistant) {
        chatMessagesContainerAssistant = document.querySelector('#assistant .chat-messages');
    }
    
    if (!chatMessagesContainerAssistant) return;
    
    if (user) {
        // Usuario logueado - mostrar mensaje de bienvenida y habilitar interfaz
        chatMessagesContainerAssistant.innerHTML = '';
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('message', 'bot');
        welcomeMessage.textContent = `¡Hola ${user.username}! 🌱 Soy AgriBot, tu asistente personal de jardinería en AgroSync. ¿En qué puedo ayudarte con tu jardín hoy? 🌿`;
        chatMessagesContainerAssistant.appendChild(welcomeMessage);
        
        // Habilitar input y botón
        if (userInputAssistant) {
            userInputAssistant.disabled = false;
            userInputAssistant.placeholder = "Escribe tu pregunta aquí...";
        }
        if (sendMessageBtnAssistant) {
            sendMessageBtnAssistant.disabled = false;
            sendMessageBtnAssistant.style.opacity = "1";
        }
    } else {
        // Usuario no logueado - mostrar mensaje de login requerido
        showLoginRequiredMessage();
    }
}