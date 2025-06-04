// js/assistant.js

// Seleccionar elementos del DOM para el chat una vez (se puede hacer en main.js y pasar)
// Por ahora, los seleccionamos aquí asumiendo que este script se carga cuando la página del asistente es visible o está en el DOM.
// Para un mejor rendimiento, es ideal seleccionar solo cuando la página del asistente esté activa.
let chatMessagesContainerAssistant; // Se asignará en DOMContentLoaded o cuando se muestre la página
let userInputAssistant;
let sendMessageBtnAssistant;

// Historial de la conversación para dar contexto a Gemini
let chatHistory = []; // Aún no se usa activamente para enviar turnos múltiples, pero está listo.

/**
 * Añade un mensaje al contenedor de chat.
 * @param {string} text - El texto del mensaje.
 * @param {string} sender - 'user', 'bot', 'bot-loading', o 'bot-error'.
 */
function addMessageToChat(text, sender) {
    if (!chatMessagesContainerAssistant) {
        // Intentar seleccionar de nuevo si no se hizo antes (ej. si la página se carga dinámicamente)
        chatMessagesContainerAssistant = document.querySelector('#assistant .chat-messages');
        if (!chatMessagesContainerAssistant) {
            console.error("ContenedOR de mensajes del chat no encontrado.");
            return;
        }
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text; 
    chatMessagesContainerAssistant.appendChild(messageDiv);
    chatMessagesContainerAssistant.scrollTop = chatMessagesContainerAssistant.scrollHeight;
}

/**
 * Obtiene una respuesta del modelo Gemini API.
 * @param {string} userPrompt - El mensaje del usuario.
 */
async function getGeminiResponse(userPrompt) {
    addMessageToChat("AgriBot está pensando... 🤔", 'bot-loading'); 

    // Clave API proporcionada por el usuario
    const apiKey = "AIzaSyCObTKToTanRgfD4TaQLLRWKMRmPjH7ubM"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Texto de la instrucción del sistema
    const systemPromptText = `Eres AgriBot, un asistente virtual experto en jardinería y agricultura para la aplicación AgriSmart. 
        Tu propósito es ayudar a los usuarios con sus preguntas sobre el cultivo de plantas, compostaje, diagnóstico de enfermedades de plantas y el uso general de la aplicación AgriSmart.
        Siempre que sea apropiado, incluye emojis relevantes en tus respuestas para hacer la conversación más amigable y visual. 🌱💧☀️🐛
        Si te preguntan sobre temas no relacionados con jardinería, agricultura o la aplicación AgriSmart, responde amablemente que no tienes información sobre ese tema (quizás con un emoji como 🤷‍♂️ o 🚫), pero que estarás encantado de ayudar con cualquier consulta sobre plantas o la app.
        Puedes responder preguntas sobre cómo usar la calculadora de compostaje, la función de diagnóstico, el perfil de usuario, etc., dentro de AgriSmart.
        Mantén tus respuestas concisas, amigables y útiles.`;

    // La conversación actual solo incluye el prompt del usuario.
    const currentConversationForAPI = [
        { role: "user", parts: [{ text: userPrompt }] }
    ];
    
    const payload = {
        contents: currentConversationForAPI, 
        systemInstruction: { 
            parts: [{ text: systemPromptText }]
        },
        // Opcional: Configuración de generación
        // generationConfig: {
        //   temperature: 0.7, // Un valor más alto puede dar respuestas más creativas (y con más emojis)
        //   topK: 1,
        //   topP: 1,
        //   maxOutputTokens: 300, // Aumentar un poco por si los emojis ocupan más
        // }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const loadingMessage = chatMessagesContainerAssistant.querySelector('.bot-loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: "No se pudo obtener detalle del error."} })); 
            console.error("Error de API Gemini:", response.status, errorData);
            let errorMessage = `Lo siento, no pude procesar tu solicitud en este momento (Error: ${response.status}) 😔.`;
            if (errorData && errorData.error && errorData.error.message) {
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

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const botResponseText = result.candidates[0].content.parts[0].text;
            addMessageToChat(botResponseText, 'bot');
            
        } else if (result.promptFeedback && result.promptFeedback.blockReason) {
            console.warn("Respuesta bloqueada por la API de Gemini:", result.promptFeedback.blockReason);
            let blockedMessage = "Lo siento, no puedo responder a esa pregunta porque el contenido ha sido bloqueado 🚫.";
            if(result.promptFeedback.blockReason === "SAFETY") {
                blockedMessage = "Lo siento, tu pregunta ha activado nuestros filtros de seguridad y no puedo procesarla 🛡️.";
            }
            addMessageToChat(blockedMessage, 'bot-error');
        }
        else {
            console.error("Respuesta inesperada de la API de Gemini:", result);
            addMessageToChat("Recibí una respuesta inesperada 😕. Por favor, intenta reformular tu pregunta o inténtalo más tarde.", 'bot-error');
        }
    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        const loadingMessage = chatMessagesContainerAssistant.querySelector('.bot-loading');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        addMessageToChat("Hubo un problema de conexión al intentar obtener una respuesta 🌐🔌. Verifica tu conexión a internet e inténtalo de nuevo.", 'bot-error');
    }
}
