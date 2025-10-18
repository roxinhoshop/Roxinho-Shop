// Elementos do DOM
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotMessages = document.getElementById('chatbotMessages');

// Opções e respostas do chatbot
const chatOptions = [
    { number: 1, text: 'Ver promoções', response: '🎉 Temos ótimas promoções hoje! Confira nossa seção de ofertas com até 50% de desconto em produtos selecionados de PC Gamer, Hardware e Periféricos!' },
    { number: 2, text: 'Produtos mais vendidos', response: '⭐ Nossos produtos mais vendidos:\n\n• Headset Gamer RGB - R$ 299,90\n• Mouse Wireless Pro - R$ 149,90\n• Teclado Mecânico - R$ 399,90\n• Monitor 144Hz - R$ 899,90\n\nTodos com garantia e entrega rápida!' },
    { number: 3, text: 'Informações de entrega', response: '📦 Trabalhamos com entrega para todo o Brasil!\n\n⏱️ Prazo: 3 a 15 dias úteis\n📍 Varia de acordo com sua região\n🚚 Frete grátis para compras acima de R$ 299,00' },
    { number: 4, text: 'Formas de pagamento', response: '💳 Aceitamos as seguintes formas de pagamento:\n\n• Cartão de crédito (até 12x sem juros)\n• Cartão de débito\n• PIX (5% de desconto)\n• Boleto bancário\n\n✨ Pagamento seguro e protegido!' },
    { number: 5, text: 'Horário de atendimento', response: '🕐 Nosso horário de atendimento:\n\n• Segunda a Sexta: 9h às 18h\n• Sábado: 9h às 13h\n• Domingo: Fechado\n\nEstamos sempre prontos para ajudar!' },
    { number: 6, text: 'Política de trocas', response: '🔄 Política de trocas e devoluções:\n\n✅ Você tem até 7 dias para solicitar troca ou devolução\n📋 Produto deve estar em perfeito estado\n📦 Embalagem original preservada\n🚀 Processo simples e rápido!' }
];

// Toggle do chatbot
chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.add('active');
    chatbotToggle.classList.add('hidden');
    chatbotInput.focus();
    
    // Mostrar mensagem de boas-vindas e opções ao abrir
    if (chatbotMessages.children.length === 0) {
        showWelcomeMessage();
    }
});

chatbotClose.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
    chatbotToggle.classList.remove('hidden');
});

// Mostrar mensagem de boas-vindas
function showWelcomeMessage() {
    addBotMessage('Olá! 👋 Bem-vindo à Roxinho Shop!\n\nComo posso ajudá-lo hoje? Escolha uma das opções abaixo:');
    addOptions();
}

// Enviar mensagem
function sendMessage() {
    const input = chatbotInput.value.trim();
    
    if (input === '') return;
    
    // Adicionar mensagem do usuário
    addUserMessage(input);
    
    // Limpar input
    chatbotInput.value = '';
    
    // Processar entrada
    processUserInput(input);
}

// Processar entrada do usuário
function processUserInput(input) {
    const optionNumber = parseInt(input);
    
    if (isNaN(optionNumber)) {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addBotMessage('❌ Por favor, digite apenas o número da opção desejada (1 a 6).');
            addOptions();
        }, 800);
        return;
    }
    
    const selectedOption = chatOptions.find(opt => opt.number === optionNumber);
    
    if (!selectedOption) {
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addBotMessage('❌ Opção inválida. Por favor, escolha um número entre 1 e 6.');
            addOptions();
        }, 800);
        return;
    }
    
    // Mostrar resposta da opção selecionada
    showTypingIndicator();
    setTimeout(() => {
        removeTypingIndicator();
        addBotMessage(selectedOption.response);
        
        // Perguntar se deseja mais alguma coisa
        setTimeout(() => {
            addBotMessage('Posso ajudar com mais alguma coisa? Escolha outra opção:');
            addOptions();
        }, 500);
    }, 1000 + Math.random() * 500);
}

// Adicionar mensagem do usuário
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        </div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Adicionar mensagem do bot
function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
        </div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Adicionar opções numeradas
function addOptions() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    let optionsHTML = '<div class="options-container">';
    
    chatOptions.forEach(option => {
        optionsHTML += `
            <div class="option-item" data-option="${option.number}">
                <div class="option-number">${option.number}</div>
                <div class="option-text">${option.text}</div>
            </div>
        `;
    });
    
    optionsHTML += '</div>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
        </div>
        <div class="message-content">
            ${optionsHTML}
        </div>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    
    // Adicionar event listeners para clique nas opções
    const optionItems = messageDiv.querySelectorAll('.option-item');
    optionItems.forEach(item => {
        item.addEventListener('click', () => {
            const optionId = item.getAttribute('data-option');
            chatbotInput.value = optionId;
            sendMessage();
        });
    });
    
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Mostrar indicador de digitação
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Remover indicador de digitação
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Event listeners
chatbotSend.addEventListener('click', sendMessage);

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});



