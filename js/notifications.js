/**
 * @file notifications.js
 * @description Script para gerenciar a exibição de notificações pop-up na Roxinho Shop.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Adiciona o contêiner de notificações ao corpo do documento, se ainda não existir
    if (!document.getElementById("notification-container")) {
        const notificationContainer = document.createElement("div");
        notificationContainer.id = "notification-container";
        document.body.appendChild(notificationContainer);
    }
});

/**
 * Exibe uma notificação pop-up no canto da tela.
 * @param {string} message - A mensagem a ser exibida na notificação.
 * @param {string} type - O tipo da notificação (e.g., 'success', 'error', 'info', 'warning').
 * @param {number} duration - Duração em milissegundos que a notificação ficará visível (padrão: 5000ms).
 */
function showNotification(message, type = 'info', duration = 5000) {
    const notificationContainer = document.getElementById("notification-container");
    if (!notificationContainer) {
        console.error("Contêiner de notificações não encontrado.");
        alert(`Notificação (${type}): ${message}`); // Fallback para alert
        return;
    }

    const notification = document.createElement("div");
    notification.classList.add("notification", `notification-${type}`);
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon"></span>
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;

    notificationContainer.appendChild(notification);

    // Força o reflow para garantir a transição CSS
    void notification.offsetWidth;
    notification.classList.add("show");

    // Fechar notificação ao clicar no botão de fechar
    notification.querySelector(".notification-close").addEventListener("click", () => {
        closeNotification(notification);
    });

    // Fechar notificação automaticamente após a duração
    setTimeout(() => {
        closeNotification(notification);
    }, duration);
}

/**
 * Fecha uma notificação com animação.
 * @param {HTMLElement} notificationElement - O elemento da notificação a ser fechado.
 */
function closeNotification(notificationElement) {
    notificationElement.classList.remove("show");
    notificationElement.classList.add("hide");

    // Remover o elemento do DOM após a animação de saída
    notificationElement.addEventListener("transitionend", () => {
        notificationElement.remove();
    }, { once: true });
}

// Exemplo de uso (pode ser removido após integração)
// showNotification("Bem-vindo à Roxinho Shop!", "info");
// showNotification("Produto adicionado ao carrinho com sucesso!", "success");
// showNotification("Erro ao processar seu pedido.", "error");
// showNotification("Atenção: Seu carrinho contém itens com estoque baixo.", "warning");

