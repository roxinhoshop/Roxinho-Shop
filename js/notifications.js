
// notifications.js - Sistema de Notificações Pop-up para Roxinho Shop

function showNotification(message, type = "info", duration = 3000) {
    let notificationContainer = document.getElementById("notification-container");

    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.id = "notification-container";
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            ${type === "success" ? '<i class="fas fa-check-circle"></i>' : ''}
            ${type === "error" ? '<i class="fas fa-times-circle"></i>' : ''}
            ${type === "info" ? '<i class="fas fa-info-circle"></i>' : ''}
            ${type === "warning" ? '<i class="fas fa-exclamation-triangle"></i>' : ''}
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    notificationContainer.appendChild(notification);

    // Forçar reflow para a transição CSS funcionar
    void notification.offsetWidth;
    notification.classList.add("show");

    // Fechar automaticamente após a duração
    const timeoutId = setTimeout(() => {
        notification.classList.remove("show");
        notification.addEventListener("transitionend", () => notification.remove());
    }, duration);

    // Fechar ao clicar no botão de fechar
    notification.querySelector(".notification-close").addEventListener("click", () => {
        clearTimeout(timeoutId);
        notification.classList.remove("show");
        notification.addEventListener("transitionend", () => notification.remove());
    });
}

// Adicionar contêiner de notificação ao DOM quando o script for carregado
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("notification-container")) {
        const notificationContainer = document.createElement("div");
        notificationContainer.id = "notification-container";
        document.body.appendChild(notificationContainer);
    }
});

/**
 * @file notifications-improved.js
 * @description Sistema de notificações melhorado no canto inferior direito
 */

// Criar container de notificações se não existir
function createNotificationContainer() {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Mostra uma notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duração em ms (padrão: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = createNotificationContainer();
    
    // Ícones para cada tipo
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    // Títulos para cada tipo
    const titles = {
        success: 'Sucesso!',
        error: 'Erro!',
        warning: 'Atenção!',
        info: 'Informação'
    };
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icons[type] || icons.info}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${titles[type] || titles.info}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" aria-label="Fechar">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Adicionar ao container
    container.appendChild(notification);
    
    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.onclick = () => removeNotification(notification);
    
    // Auto-remover após duração
    setTimeout(() => {
        removeNotification(notification);
    }, duration);
}

/**
 * Remove uma notificação com animação
 * @param {HTMLElement} notification - Elemento da notificação
 */
function removeNotification(notification) {
    notification.classList.add('fade-out');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Exportar função globalmente
window.showNotification = showNotification;

// Compatibilidade com código antigo
window.showMessage = showNotification;

