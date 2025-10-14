/**
 * FLUENT DESIGN - Sistema de Alertas e Confirmações
 * Avisos centralizados com design moderno e animações suaves
 */

/**
 * Exibe um alerta Fluent Design centralizado
 * @param {string} titulo - Título do alerta
 * @param {string} mensagem - Mensagem do alerta
 * @param {string} icone - Classe do ícone (ex: 'fas fa-check-circle')
 * @param {string} tipo - Tipo do alerta: 'success', 'error', 'warning', 'info'
 * @returns {Promise} - Resolve quando o alerta for fechado
 */
function alertaFluent(titulo, mensagem, icone = 'fas fa-info-circle', tipo = 'info') {
    return new Promise((resolve) => {
        // Determinar tipo baseado no ícone se não especificado
        if (tipo === 'info') {
            if (icone.includes('check')) tipo = 'success';
            else if (icone.includes('exclamation') || icone.includes('times')) tipo = 'error';
            else if (icone.includes('triangle')) tipo = 'warning';
        }
        
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'fluent-alert-overlay';
        
        // Criar alerta
        const alert = document.createElement('div');
        alert.className = 'fluent-alert';
        alert.innerHTML = `
            <div class="fluent-alert-header">
                <div class="fluent-alert-icon ${tipo}">
                    <i class="${icone}"></i>
                </div>
                <div class="fluent-alert-title">
                    <h3>${titulo}</h3>
                </div>
            </div>
            <div class="fluent-alert-body">
                <p class="fluent-alert-message">${mensagem}</p>
            </div>
            <div class="fluent-alert-footer">
                <button class="fluent-alert-button fluent-alert-button-primary">
                    OK
                </button>
            </div>
        `;
        
        overlay.appendChild(alert);
        document.body.appendChild(overlay);
        
        // Função para fechar
        const fechar = () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(true);
            }, 200);
        };
        
        // Event listeners
        const btnOk = alert.querySelector('.fluent-alert-button-primary');
        btnOk.addEventListener('click', fechar);
        
        // Fechar ao clicar no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                fechar();
            }
        });
        
        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                fechar();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}

/**
 * Exibe um modal de confirmação Fluent Design
 * @param {string} titulo - Título do modal
 * @param {string} mensagem - Mensagem do modal
 * @param {string} textoConfirmar - Texto do botão de confirmação
 * @param {string} textoCancelar - Texto do botão de cancelamento
 * @param {string} tipo - Tipo: 'danger', 'warning', 'info'
 * @returns {Promise<boolean>} - true se confirmado, false se cancelado
 */
function confirmarFluent(titulo, mensagem, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', tipo = 'warning') {
    return new Promise((resolve) => {
        // Determinar ícone baseado no tipo
        let icone = 'fas fa-question-circle';
        let iconeTipo = 'info';
        
        if (tipo === 'danger') {
            icone = 'fas fa-exclamation-triangle';
            iconeTipo = 'error';
        } else if (tipo === 'warning') {
            icone = 'fas fa-exclamation-triangle';
            iconeTipo = 'warning';
        }
        
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'fluent-alert-overlay';
        
        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'fluent-confirm';
        modal.innerHTML = `
            <div class="fluent-alert-header">
                <div class="fluent-alert-icon ${iconeTipo}">
                    <i class="${icone}"></i>
                </div>
                <div class="fluent-alert-title">
                    <h3>${titulo}</h3>
                </div>
            </div>
            <div class="fluent-alert-body">
                <p class="fluent-alert-message">${mensagem}</p>
            </div>
            <div class="fluent-alert-footer">
                <button class="fluent-alert-button fluent-alert-button-secondary btn-cancelar">
                    ${textoCancelar}
                </button>
                <button class="fluent-alert-button ${tipo === 'danger' ? 'fluent-alert-button-danger' : 'fluent-alert-button-primary'} btn-confirmar">
                    ${textoConfirmar}
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Função para fechar
        const fechar = (resultado) => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(resultado);
            }, 200);
        };
        
        // Event listeners
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        const btnCancelar = modal.querySelector('.btn-cancelar');
        
        btnConfirmar.addEventListener('click', () => fechar(true));
        btnCancelar.addEventListener('click', () => fechar(false));
        
        // Fechar ao clicar no overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                fechar(false);
            }
        });
        
        // Fechar com ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                fechar(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // Focar no botão de confirmação
        btnConfirmar.focus();
    });
}

/**
 * Exibe um alerta de loading
 * @param {string} mensagem - Mensagem do loading
 * @returns {Object} - Objeto com método close() para fechar o loading
 */
function loadingFluent(mensagem = 'Carregando...') {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'fluent-alert-overlay';
    
    // Criar alerta
    const alert = document.createElement('div');
    alert.className = 'fluent-alert';
    alert.innerHTML = `
        <div class="fluent-alert-header">
            <div class="fluent-alert-icon info">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="fluent-alert-title">
                <h3>Aguarde</h3>
            </div>
        </div>
        <div class="fluent-alert-body">
            <p class="fluent-alert-message">${mensagem}</p>
        </div>
    `;
    
    overlay.appendChild(alert);
    document.body.appendChild(overlay);
    
    // Retornar objeto com método close
    return {
        close: () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 200);
        },
        updateMessage: (novaMensagem) => {
            const messageEl = alert.querySelector('.fluent-alert-message');
            if (messageEl) {
                messageEl.textContent = novaMensagem;
            }
        }
    };
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.alertaFluent = alertaFluent;
    window.confirmarFluent = confirmarFluent;
    window.loadingFluent = loadingFluent;
}

