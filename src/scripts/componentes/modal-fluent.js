// ======================= MODAL FLUENT DESIGN =======================

// Criar modal
function criarModal() {
    if (document.getElementById('modal-fluent')) return;
    
    const modalHTML = `
        <div id="modal-fluent" class="modal-fluent">
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <i class="modal-icon"></i>
                    <h3 class="modal-title"></h3>
                </div>
                <div class="modal-body">
                    <p class="modal-message"></p>
                </div>
                <div class="modal-footer">
                    <button class="btn-modal btn-cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-modal btn-confirm">
                        <i class="fas fa-check"></i> Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Mostrar modal de confirmação (com Promise)
function confirmarFluent(titulo, mensagem, icone = 'fas fa-question-circle', textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar') {
    return new Promise((resolve) => {
        criarModal();
        
        const modal = document.getElementById('modal-fluent');
        const modalIcon = modal.querySelector('.modal-icon');
        const modalTitle = modal.querySelector('.modal-title');
        const modalMessage = modal.querySelector('.modal-message');
        const btnConfirm = modal.querySelector('.btn-confirm');
        const btnCancel = modal.querySelector('.btn-cancel');
        const overlay = modal.querySelector('.modal-overlay');
        
        // Configurar conteúdo
        modalIcon.className = `modal-icon ${icone}`;
        modalTitle.textContent = titulo;
        modalMessage.textContent = mensagem;
        
        // Mostrar modal
        modal.classList.add('active');
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Função para fechar
        const fecharModal = (resultado) => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.remove('active');
                resolve(resultado);
            }, 300);
        };
        
        // Configurar botões
        btnConfirm.innerHTML = `<i class="fas fa-check"></i> ${textoConfirmar}`;
        btnCancel.innerHTML = `<i class="fas fa-times"></i> ${textoCancelar}`;

        // Event listeners
        btnConfirm.onclick = () => fecharModal(true);
        btnCancel.onclick = () => fecharModal(false);
        overlay.onclick = () => fecharModal(false);
        
        // ESC para fechar
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                fecharModal(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}

// Mostrar alerta
function alertaFluent(titulo, mensagem, icone = 'fas fa-info-circle') {
    return new Promise((resolve) => {
        criarModal();
        
        const modal = document.getElementById('modal-fluent');
        const modalIcon = modal.querySelector('.modal-icon');
        const modalTitle = modal.querySelector('.modal-title');
        const modalMessage = modal.querySelector('.modal-message');
        const btnConfirm = modal.querySelector('.btn-confirm');
        const btnCancel = modal.querySelector('.btn-cancel');
        const overlay = modal.querySelector('.modal-overlay');
        
        // Configurar conteúdo
        modalIcon.className = `modal-icon ${icone}`;
        modalTitle.textContent = titulo;
        modalMessage.textContent = mensagem;
        
        // Esconder botão cancelar
        btnCancel.style.display = 'none';
        btnConfirm.innerHTML = '<i class="fas fa-check"></i> OK';
        
        // Mostrar modal
        modal.classList.add('active');
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Função para fechar
        const fecharModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.remove('active');
                btnCancel.style.display = '';
                btnConfirm.innerHTML = '<i class="fas fa-check"></i> Confirmar';
                resolve(true);
            }, 300);
        };
        
        // Event listeners
        btnConfirm.onclick = fecharModal;
        overlay.onclick = fecharModal;
        
        // ESC para fechar
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                fecharModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}

// Mostrar modal de confirmação (com Callback) - Novo
function showFluentConfirm(titulo, mensagem, textoConfirmar, textoCancelar, callbackConfirmar, icone = 'fas fa-question-circle') {
    criarModal();
    
    const modal = document.getElementById('modal-fluent');
    const modalIcon = modal.querySelector('.modal-icon');
    const modalTitle = modal.querySelector('.modal-title');
    const modalMessage = modal.querySelector('.modal-message');
    const btnConfirm = modal.querySelector('.btn-confirm');
    const btnCancel = modal.querySelector('.btn-cancel');
    const overlay = modal.querySelector('.modal-overlay');
    
    // Configurar conteúdo
    modalIcon.className = `modal-icon ${icone}`;
    modalTitle.textContent = titulo;
    modalMessage.textContent = mensagem;
    
    // Configurar botões
    btnConfirm.innerHTML = `<i class="fas fa-check"></i> ${textoConfirmar}`;
    btnCancel.innerHTML = `<i class="fas fa-times"></i> ${textoCancelar}`;

    // Mostrar modal
    modal.classList.add('active');
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Função para fechar
    const fecharModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.remove('active');
        }, 300);
    };
    
    // Event listeners
    btnConfirm.onclick = () => {
        fecharModal();
        if (callbackConfirmar) {
            callbackConfirmar();
        }
    };
    btnCancel.onclick = fecharModal;
    overlay.onclick = fecharModal;
    
    // ESC para fechar
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            fecharModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Tornar funções globais
window.confirmarFluent = confirmarFluent;
window.alertaFluent = alertaFluent;
window.showFluentConfirm = showFluentConfirm;

