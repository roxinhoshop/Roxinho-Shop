
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

