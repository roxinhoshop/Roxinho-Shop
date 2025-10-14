/**
 * Product URL Loader - Sistema de Carregamento de Produtos via Link
 * Permite adicionar produtos ao sistema através de links do Mercado Livre e Amazon
 */

class ProductURLLoader {
    constructor() {
        this.apiBase = 'https://roxinho-shop-backend.vercel.app/api';
        this.productData = null;

        // Vincular elementos do DOM após o carregamento
        document.addEventListener('DOMContentLoaded', () => this.bindDOMElements());
    }

    bindDOMElements() {
        this.modalElement = document.getElementById('product-url-modal');
        this.productUrlForm = document.getElementById('product-url-form');
        this.productUrlInput = document.getElementById('product-url');
        this.productUrlLoaderDiv = document.getElementById('product-url-loader');
        this.productUrlResultDiv = document.getElementById('product-url-result');
        
        // Os botões de carregar e salvar são dinâmicos na pré-visualização, então os buscamos quando necessário.

        if (this.productUrlForm) {
            this.productUrlForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.extractData();
            });
        }

        const closeButton = this.modalElement.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeModal());
        }

        const cancelButton = this.modalElement.querySelector('.btn-secondary');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => this.closeModal());
        }
    }

    openModal() {
        if (!this.modalElement) return;
        this.modalElement.classList.add('show');
        this.resetModalState();
    }

    closeModal() {
        if (!this.modalElement) return;
        this.modalElement.classList.remove('show');
    }

    resetModalState() {
        if (this.productUrlInput) this.productUrlInput.value = '';
        if (this.productUrlResultDiv) this.productUrlResultDiv.style.display = 'none';
        if (this.productUrlLoaderDiv) this.productUrlLoaderDiv.style.display = 'none';
        this.productData = null;
        // Redefinir para o formulário inicial
        this.showInitialForm();
    }

    showInitialForm() {
        if (!this.productUrlForm) return;
        this.productUrlForm.innerHTML = `
            <div class="grupo-formulario">
                <label for="product-url">URL do Produto (Mercado Livre ou Amazon)</label>
                <input type="url" id="product-url" name="url" required placeholder="Cole a URL do produto aqui">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="window.productURLLoader.closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Extrair Dados</button>
            </div>
        `;
        // Re-vincular elementos do formulário
        this.productUrlInput = document.getElementById('product-url');
    }

    async extractData() {
        if (!this.productUrlInput) return;
        const url = this.productUrlInput.value.trim();

        if (!url) {
            this.showAdminMessage('Por favor, insira um link válido', 'error');
            return;
        }

        this.showLoading('Extraindo dados do produto...');

        try {
            const response = await fetch(`${this.apiBase}/product-scraper/extract-from-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            this.hideLoading();

            if (response.ok && data.success) {
                this.productData = data.product;
                this.displayProductPreview();
            } else {
                throw new Error(data.message || 'Erro ao extrair dados do produto');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Erro ao extrair dados:', error);
            this.showAdminMessage(error.message, 'error');
        }
    }

    displayProductPreview() {
        if (!this.productData || !this.productUrlForm) return;

        this.productUrlForm.innerHTML = `
            <div class="product-preview-container">
                <img src="${this.productData.imagem || 'https://via.placeholder.com/150?text=Sem+Imagem'}" alt="Prévia do Produto" class="preview-image">
                <div class="preview-info">
                    <h4>${this.productData.nome}</h4>
                    <p>Preço: R$ ${parseFloat(this.productData.preco).toFixed(2)}</p>
                    <p class="description">${this.productData.descricao ? this.productData.descricao.substring(0, 100) + '...' : 'Sem descrição'}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="window.productURLLoader.resetModalState()">Cancelar</button>
                <button type="button" class="btn btn-success" id="btn-save-product-from-url">Salvar Produto</button>
            </div>
        `;

        const saveButton = document.getElementById('btn-save-product-from-url');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveProduct());
        }
    }

    async saveProduct() {
        if (!this.productData) {
            this.showAdminMessage('Nenhum dado de produto para salvar.', 'warning');
            return;
        }

        this.showLoading('Salvando produto...');

        try {
            const response = await fetch(`${this.apiBase}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.productData)
            });

            const data = await response.json();
            this.hideLoading();

            if (response.ok && (data.success || data.status === 'success')) {
                this.showAdminMessage('Produto adicionado com sucesso!', 'success');
                this.closeModal();
                // Assumindo que existe uma função global para recarregar os produtos no painel
                if (typeof window.adminPanelAPI.loadProducts === 'function') {
                    window.adminPanelAPI.loadProducts();
                }
            } else {
                throw new Error(data.message || 'Erro ao salvar o produto');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Erro ao salvar produto:', error);
            this.showAdminMessage(error.message, 'error');
        }
    }

    showAdminMessage(message, type = 'info') {
        if (!this.productUrlResultDiv) return;
        this.productUrlResultDiv.innerHTML = `<div class="admin-message ${type}"><i class="fas fa-info-circle"></i> ${message}</div>`;
        this.productUrlResultDiv.style.display = 'block';
        setTimeout(() => {
            if (this.productUrlResultDiv) this.productUrlResultDiv.style.display = 'none';
        }, 5000);
    }

    showLoading(text = 'Carregando...') {
        if (!this.productUrlLoaderDiv) return;
        this.productUrlLoaderDiv.innerHTML = `<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>${text}</p></div>`;
        this.productUrlLoaderDiv.style.display = 'block';
    }

    hideLoading() {
        if (!this.productUrlLoaderDiv) return;
        this.productUrlLoaderDiv.style.display = 'none';
    }
}

// Criar instância global e anexar à janela
window.productURLLoader = new ProductURLLoader();

// Funções globais para interagir com o loader a partir do HTML
function openProductURLLoader() {
    window.productURLLoader.openModal();
}

function closeProductURLLoader() {
    window.productURLLoader.closeModal();
}
