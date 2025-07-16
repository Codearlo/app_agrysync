// js/assistant.js

let chatMessagesContainerAssistant; 
let userInputAssistant;
let sendMessageBtnAssistant;
let assistantContentWrapper;

function setupAssistantChatUI() {
    assistantContentWrapper = document.getElementById('assistant-content-wrapper');
    if (!assistantContentWrapper) return;

    assistantContentWrapper.innerHTML = `
        <div class="chat-interface">
            <div class="chat-messages"></div>
        </div>
        <div class="chat-input-area">
            <input type="text" id="userInput" placeholder="Escribe tu pregunta aquí..." autocomplete="off">
            <button id="sendMessageBtn">
                <i class="fas fa-paper-plane"></i> Enviar
            </button>
        </div>
    `;
    chatMessagesContainerAssistant = assistantContentWrapper.querySelector('.chat-messages');
    userInputAssistant = assistantContentWrapper.querySelector('#userInput');
    sendMessageBtnAssistant = assistantContentWrapper.querySelector('#sendMessageBtn');
    
    initializeAssistantEventListeners();
}

function showLoginPromptForAssistant() {
    assistantContentWrapper = document.getElementById('assistant-content-wrapper');
    if (!assistantContentWrapper) return;
    
    assistantContentWrapper.innerHTML = `
        <div id="seccion-unete-agrosync-asistente" style="text-align: center; padding: 3rem 2rem; background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-purple) 100%); border-radius: var(--border-radius-xl); margin: 1rem 0; color: white; position: relative; overflow: hidden; box-shadow: var(--shadow-xl);">
            <div style="position: relative; z-index: 2;">
                <i class="fas fa-lock" style="font-size: 4rem; margin-bottom: 1rem; display: block; opacity: 0.9;"></i>
                <h3 style="margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">🌱 ¡Únete a AgroSync!</h3>
                <p style="margin-bottom: 2rem; font-size: 1.1rem; opacity: 0.95; line-height: 1.6;">
                    Para chatear con AgriBot necesitas una cuenta.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="window.location.href='register.html'" style="background: white; color: var(--primary-blue); border: none; padding: 1rem 2rem; border-radius: var(--border-radius-lg); cursor: pointer; font-weight: 700;">
                        Crear Cuenta Gratis
                    </button>
                    <button onclick="window.location.href='login.html'" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 1rem 2rem; border-radius: var(--border-radius-lg); cursor: pointer; font-weight: 600;">
                        Ya tengo cuenta
                    </button>
                </div>
            </div>
        </div>
    `;
}

function addMessageToChat(text, sender) {
    if (!chatMessagesContainerAssistant) return;

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
    const systemPromptText = `Eres AgriBot, un asistente virtual experto en jardinería y agricultura para la aplicación AgroSync. Responde en español.`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
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
            addMessageToChat(`Error de API: ${response.status}`, 'bot-error');
            return;
        }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            addMessageToChat(result.candidates[0].content.parts[0].text, 'bot');
        } else {
            addMessageToChat("No se pudo obtener una respuesta.", 'bot-error');
        }
    } catch (error) {
        if (chatMessagesContainerAssistant?.querySelector('.bot-loading')) {
             chatMessagesContainerAssistant.querySelector('.bot-loading').remove();
        }
        addMessageToChat("Error de conexión.", 'bot-error');
    }
}


function initializeAssistantEventListeners() {
    if (sendMessageBtnAssistant && userInputAssistant) {
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
                event.preventDefault();
                sendMessageBtnAssistant.click();
            }
        });
    }
}

/**
 * Actualiza la interfaz del asistente según el estado de la sesión.
 * @param {object|null} user - El objeto de usuario o null.
 */
function updateAssistantUI(user) {
    if (user) {
        setupAssistantChatUI();
        addMessageToChat(`¡Hola ${user.username}! 🌱 Soy AgriBot, ¿en qué puedo ayudarte hoy?`, 'bot');
    } else {
        showLoginPromptForAssistant();
    }
}