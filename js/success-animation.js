/**
 */

function showSuccessAnimation(title, message, redirectUrl, delay = 2000) {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    
    // Criar ícone de sucesso com checkmark SVG
    const icon = document.createElement('div');
    icon.className = 'success-icon';
    icon.innerHTML = `
        <div class="success-circle">
            <svg class="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
        </div>
    `;
    
    // Criar confetes
    for (let i = 0; i < 9; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'success-confetti';
        icon.appendChild(confetti);
    }
    
    // Criar título
    const titleElement = document.createElement('h2');
    titleElement.className = 'success-title';
    titleElement.textContent = title;
    
    // Criar mensagem
    const messageElement = document.createElement('p');
    messageElement.className = 'success-message';
    messageElement.textContent = message;
    
    // Montar modal
    modal.appendChild(icon);
    modal.appendChild(titleElement);
    modal.appendChild(messageElement);
    overlay.appendChild(modal);
    
    // Adicionar ao body
    document.body.appendChild(overlay);
    
    // Redirecionar após delay
    if (redirectUrl) {
        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 300);
        }, delay);
    }
    
    return overlay;
}

function showLoadingAnimation(message = 'Processando...') {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.id = 'loading-overlay';
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    
    // Criar spinner
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    // Criar mensagem
    const messageElement = document.createElement('p');
    messageElement.className = 'success-message';
    messageElement.textContent = message;
    messageElement.style.marginTop = '20px';
    
    // Montar modal
    modal.appendChild(spinner);
    modal.appendChild(messageElement);
    overlay.appendChild(modal);
    
    // Adicionar ao body
    document.body.appendChild(overlay);
    
    return overlay;
}

function hideLoadingAnimation() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

// Adicionar animação de fadeOut ao CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Exportar funções globalmente
window.showSuccessAnimation = showSuccessAnimation;
window.showLoadingAnimation = showLoadingAnimation;
window.hideLoadingAnimation = hideLoadingAnimation;

