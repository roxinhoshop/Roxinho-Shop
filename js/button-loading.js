/**
 */

/**
 * Adiciona animação de loading a um botão
 * @param {HTMLElement} button - Elemento do botão
 */
function addButtonLoading(button) {
    if (!button) return;
    
    // Desabilitar botão
    button.disabled = true;
    button.classList.add('btn-loading');
    
    // Salvar texto original
    if (!button.dataset.originalText) {
        button.dataset.originalText = button.innerHTML;
    }
}

/**
 * Remove animação de loading de um botão
 * @param {HTMLElement} button - Elemento do botão
 */
function removeButtonLoading(button) {
    if (!button) return;
    
    // Habilitar botão
    button.disabled = false;
    button.classList.remove('btn-loading');
    
    // Restaurar texto original
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
    }
}

/**
 * Adiciona loading por ID do botão
 * @param {string} buttonId - ID do botão
 */
function startButtonLoading(buttonId) {
    const button = document.getElementById(buttonId);
    addButtonLoading(button);
}

/**
 * Remove loading por ID do botão
 * @param {string} buttonId - ID do botão
 */
function stopButtonLoading(buttonId) {
    const button = document.getElementById(buttonId);
    removeButtonLoading(button);
}

// Exportar funções globalmente
window.addButtonLoading = addButtonLoading;
window.removeButtonLoading = removeButtonLoading;
window.startButtonLoading = startButtonLoading;
window.stopButtonLoading = stopButtonLoading;

