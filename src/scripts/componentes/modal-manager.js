// Sistema de Gerenciamento de Modais - Roxinho Shop

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Criar container de modais se não existir
        if (!document.getElementById('modal-root')) {
            const modalRoot = document.createElement('div');
            modalRoot.id = 'modal-root';
            document.body.appendChild(modalRoot);
        }
    }

    // Mostrar modal de sucesso
    showSuccess(title, message, details = null, onClose = null) {
        return this.showMessage({
            type: 'success',
            icon: '✓',
            title: title,
            message: message,
            details: details,
            onClose: onClose
        });
    }

    // Mostrar modal de erro
    showError(title, message, details = null, onClose = null) {
        return this.showMessage({
            type: 'error',
            icon: '✕',
            title: title,
            message: message,
            details: details,
            onClose: onClose
        });
    }

    // Mostrar modal de aviso
    showWarning(title, message, details = null, onClose = null) {
        return this.showMessage({
            type: 'warning',
            icon: '⚠',
            title: title,
            message: message,
            details: details,
            onClose: onClose
        });
    }

    // Mostrar modal de informação
    showInfo(title, message, details = null, onClose = null) {
        return this.showMessage({
            type: 'info',
            icon: 'ℹ',
            title: title,
            message: message,
            details: details,
            onClose: onClose
        });
    }

    // Mostrar modal genérico de mensagem
    showMessage(options) {
        const {
            type = 'info',
            icon = 'ℹ',
            title = 'Mensagem',
            message = '',
            details = null,
            onClose = null,
            autoClose = true,
            autoCloseDelay = 3000
        } = options;

        const modalHTML = `
            <div class="modal-overlay active" id="message-modal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <span class="modal-title-icon">${icon}</span>
                            ${title}
                        </h3>
                        <button class="modal-close" onclick="window.modalManager.closeModal('message-modal')">
                            ✕
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="message-modal">
                            <div class="message-icon ${type}">
                                ${icon}
                            </div>
                            <h4 class="message-title">${title}</h4>
                            <p class="message-text">${message}</p>
                            ${details ? this.renderDetails(details) : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-primary" onclick="window.modalManager.closeModal('message-modal')">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHTML);
        this.activeModal = 'message-modal';

        // Auto-fechar se configurado
        if (autoClose && type === 'success') {
            setTimeout(() => {
                this.closeModal('message-modal');
                if (onClose) onClose();
            }, autoCloseDelay);
        }

        return this;
    }

    // Renderizar detalhes
    renderDetails(details) {
        if (typeof details === 'string') {
            return `<div class="message-details"><p>${details}</p></div>`;
        }

        if (typeof details === 'object') {
            const items = Object.entries(details).map(([key, value]) => `
                <div class="message-detail-item">
                    <span class="message-detail-label">${key}:</span>
                    <span class="message-detail-value">${value}</span>
                </div>
            `).join('');

            return `<div class="message-details">${items}</div>`;
        }

        return '';
    }

    // Mostrar modal de confirmação
    showConfirm(title, message, onConfirm, onCancel = null) {
        const modalHTML = `
            <div class="modal-overlay active" id="confirm-modal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <span class="modal-title-icon">?</span>
                            ${title}
                        </h3>
                        <button class="modal-close" onclick="window.modalManager.closeModal('confirm-modal')">
                            ✕
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="message-modal">
                            <div class="message-icon info">
                                ?
                            </div>
                            <h4 class="message-title">${title}</h4>
                            <p class="message-text">${message}</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-secondary" onclick="window.modalManager.handleCancel('confirm-modal')">
                            Cancelar
                        </button>
                        <button class="modal-btn modal-btn-primary" onclick="window.modalManager.handleConfirm('confirm-modal')">
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHTML);
        this.activeModal = 'confirm-modal';
        this.confirmCallback = onConfirm;
        this.cancelCallback = onCancel;

        return this;
    }

    // Mostrar modal customizado
    showCustom(title, content, buttons = [], icon = '📋') {
        const buttonsHTML = buttons.map(btn => `
            <button class="modal-btn ${btn.className || 'modal-btn-secondary'}" 
                    onclick="${btn.onclick || ''}">
                ${btn.text}
            </button>
        `).join('');

        const modalHTML = `
            <div class="modal-overlay active" id="custom-modal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <span class="modal-title-icon">${icon}</span>
                            ${title}
                        </h3>
                        <button class="modal-close" onclick="window.modalManager.closeModal('custom-modal')">
                            ✕
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${buttons.length > 0 ? `
                        <div class="modal-footer">
                            ${buttonsHTML}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.renderModal(modalHTML);
        this.activeModal = 'custom-modal';

        return this;
    }

    // Renderizar modal no DOM
    renderModal(html) {
        const modalRoot = document.getElementById('modal-root');
        modalRoot.innerHTML = html;

        // Adicionar evento de clique no overlay
        const overlay = modalRoot.querySelector('.modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(this.activeModal);
            }
        });

        // Adicionar evento de tecla ESC
        const escHandler = (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal(this.activeModal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // Fechar modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                this.activeModal = null;
            }, 300);
        }
    }

    // Handlers de confirmação
    handleConfirm(modalId) {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.closeModal(modalId);
    }

    handleCancel(modalId) {
        if (this.cancelCallback) {
            this.cancelCallback();
        }
        this.closeModal(modalId);
    }

    // Mostrar loading
    showLoading(message = 'Carregando...') {
        const modalHTML = `
            <div class="modal-overlay active" id="loading-modal">
                <div class="modal-container">
                    <div class="modal-body">
                        <div class="message-modal">
                            <div class="modal-loading"></div>
                            <p class="message-text" style="margin-top: 20px;">${message}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderModal(modalHTML);
        this.activeModal = 'loading-modal';

        return this;
    }

    // Fechar loading
    closeLoading() {
        this.closeModal('loading-modal');
    }
}

// Inicializar gerenciador global
if (typeof window !== 'undefined') {
    window.modalManager = new ModalManager();
}

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
}

