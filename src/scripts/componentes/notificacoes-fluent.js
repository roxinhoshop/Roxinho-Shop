/**
 * Sistema de Notificações Fluent Design
 * Roxinho Shop - Estilo Windows 11
 * Posicionamento: Canto inferior esquerdo
 */

// Contador de notificações ativas
let activeNotifications = 0;
const MAX_VISIBLE_NOTIFICATIONS = 3;

/**
 * Cria o container de notificações se não existir
 */
function createNotificationContainer() {
    let container = document.getElementById("notification-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "notification-container";
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Mostra uma notificação moderna estilo Fluent Design
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo: "success", "error", "warning", "info"
 * @param {number} duration - Duração em ms (padrão: 4000)
 */
function showNotification(message, type = "info", duration = 4000) {
    const container = createNotificationContainer();

    // Ícones para cada tipo (Font Awesome)
    const icons = {
        success: "fas fa-check-circle",
        error: "fas fa-times-circle",
        warning: "fas fa-exclamation-triangle",
        info: "fas fa-info-circle",
    };

    // Títulos para cada tipo
    const titles = {
        success: "Sucesso",
        error: "Erro",
        warning: "Atenção",
        info: "Informação",
    };

    // Criar elemento de notificação
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icons[type] || icons.info}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${titles[type] || titles.info}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" aria-label="Fechar notificação">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Adicionar ao container
    container.appendChild(notification);
    activeNotifications++;

    // Limitar número de notificações visíveis
    updateNotificationVisibility();

    // Botão de fechar
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        removeNotification(notification);
    };

    // Fechar ao clicar na notificação
    notification.onclick = () => {
        removeNotification(notification);
    };

    // Auto-remover após duração
    const timeoutId = setTimeout(() => {
        removeNotification(notification);
    }, duration);

    // Pausar timer ao passar o mouse
    notification.addEventListener("mouseenter", () => {
        clearTimeout(timeoutId);
    });

    // Retomar timer ao sair o mouse
    notification.addEventListener("mouseleave", () => {
        setTimeout(() => {
            removeNotification(notification);
        }, 2000);
    });
}

/**
 * Remove uma notificação com animação
 * @param {HTMLElement} notification - Elemento da notificação
 */
function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;

    notification.classList.add("fade-out");

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
            activeNotifications--;
            updateNotificationVisibility();
        }
    }, 300);
}

/**
 * Atualiza visibilidade das notificações (máximo 3 visíveis)
 */
function updateNotificationVisibility() {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const notifications = container.querySelectorAll(".notification");

    notifications.forEach((notif, index) => {
        if (index >= MAX_VISIBLE_NOTIFICATIONS) {
            notif.style.display = "none";
        } else {
            notif.style.display = "flex";
        }
    });

    // Mostrar contador se houver notificações ocultas
    const hiddenCount = notifications.length - MAX_VISIBLE_NOTIFICATIONS;
    updateNotificationCounter(hiddenCount);
}

/**
 * Atualiza contador de notificações ocultas
 * @param {number} count - Número de notificações ocultas
 */
function updateNotificationCounter(count) {
    let counter = document.getElementById("notification-counter");

    if (count > 0) {
        if (!counter) {
            counter = document.createElement("div");
            counter.id = "notification-counter";
            document.body.appendChild(counter);
        }
        counter.textContent = `+${count} notificações`;
        counter.classList.add("show");
    } else if (counter) {
        counter.classList.remove("show");
    }
}

