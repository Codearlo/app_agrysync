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
                if(sendMessageBtnAssistant) sendMessageBtnAssistant.click();
            }
        });
        console.log("Chat del asistente inicializado.");
    } else {
        console.warn("No se pudieron encontrar todos los elementos para inicializar el chat del asistente.");
    }
}
