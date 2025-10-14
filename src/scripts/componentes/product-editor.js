/**
 * Product Editor - Sistema de Edição de Produtos
 * Interface completa para editar e gerenciar produtos
 */

class ProductEditor {
    constructor() {
        this.currentProduct = null;
        this.modalElement = null;
    }

    /**
     * Abre modal de edição
     */
    async openEditModal(productId) {
        try {
            // Buscar produto
            const produto = await this.fetchProduct(productId);
            this.currentProduct = produto;
            
            // Criar modal
            this.createEditModal(produto);
            
        } catch (error) {
            console.error('Erro ao abrir editor:', error);
            await this.showNotification('Erro', 'Não foi possível carregar o produto', 'error');
        }
    }

    /**
     * Busca produto da API
     */
    async fetchProduct(id) {
        const response = await fetch(`${window.API_BASE_URL}/products/${id}`);
        const data = await response.json();
        
        if (!data.status === 'success' && !data.success) {
            throw new Error('Produto não encontrado');
        }
        
        return data.product || data.produto;
    }

    /**
     * Cria modal de edição
     */
    createEditModal(produto) {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'product-editor-overlay';
        overlay.innerHTML = `
            <div class="product-editor-modal">
                <div class="product-editor-header">
                    <h2><i class="fas fa-edit"></i> Editar Produto</h2>
                    <button class="product-editor-close" onclick="productEditor.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="product-editor-body">
                    <form id="product-edit-form">
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label for="edit-nome">
                                    <i class="fas fa-tag"></i> Nome do Produto
                                </label>
                                <input 
                                    type="text" 
                                    id="edit-nome" 
                                    value="${this.escapeHtml(produto.nome)}" 
                                    required
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-preco">
                                    <i class="fas fa-dollar-sign"></i> Preço
                                </label>
                                <input 
                                    type="number" 
                                    id="edit-preco" 
                                    value="${produto.preco}" 
                                    step="0.01" 
                                    required
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-estoque">
                                    <i class="fas fa-boxes"></i> Estoque
                                </label>
                                <input 
                                    type="number" 
                                    id="edit-estoque" 
                                    value="${produto.estoque || 0}" 
                                    required
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-marca">
                                    <i class="fas fa-copyright"></i> Marca
                                </label>
                                <input 
                                    type="text" 
                                    id="edit-marca" 
                                    value="${produto.marca || ''}"
                                >
                            </div>
                            
                            <div class="form-group">
                                <label for="edit-modelo">
                                    <i class="fas fa-cube"></i> Modelo
                                </label>
                                <input 
                                    type="text" 
                                    id="edit-modelo" 
                                    value="${produto.modelo || ''}"
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label for="edit-imagem">
                                    <i class="fas fa-image"></i> URL da Imagem
                                </label>
                                <input 
                                    type="url" 
                                    id="edit-imagem" 
                                    value="${produto.imagem_principal || ''}"
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group full-width">
                                <label for="edit-descricao">
                                    <i class="fas fa-align-left"></i> Descrição
                                </label>
                                <textarea 
                                    id="edit-descricao" 
                                    rows="4"
                                >${produto.descricao || ''}</textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>
                                    <i class="fas fa-toggle-on"></i> Status
                                </label>
                                <div class="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        id="edit-ativo" 
                                        ${produto.ativo ? 'checked' : ''}
                                    >
                                    <label for="edit-ativo">
                                        <span class="toggle-label">Ativo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="product-editor-actions">
                            <button type="button" class="btn btn-secondary" onclick="productEditor.closeModal()">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(overlay);
        this.modalElement = overlay;
        
        // Event listener para submit
        document.getElementById('product-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
        
        // Animação de entrada
        setTimeout(() => overlay.classList.add('show'), 10);
    }

    /**
     * Salva alterações do produto
     */
    async saveProduct() {
        try {
            const dados = {
                nome: document.getElementById('edit-nome').value,
                preco: parseFloat(document.getElementById('edit-preco').value),
                estoque: parseInt(document.getElementById('edit-estoque').value),
                marca: document.getElementById('edit-marca').value || null,
                modelo: document.getElementById('edit-modelo').value || null,
                imagem: document.getElementById('edit-imagem').value || null,
                descricao: document.getElementById('edit-descricao').value || null,
                ativo: document.getElementById('edit-ativo').checked ? 1 : 0
            };
            
            // Mostrar loading
            this.showLoading('Salvando alterações...');
            
            // Atualizar via API
            const response = await fetch(`${window.API_BASE_URL}/products/${this.currentProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
            
            const data = await response.json();
            
            this.hideLoading();
            
            if (response.ok && (data.success || data.status === 'success')) {
                await this.showNotification('Sucesso!', 'Produto atualizado com sucesso', 'success');
                this.closeModal();
                
                // Recarregar lista de produtos
                if (typeof loadProducts === 'function') {
                    loadProducts();
                }
            } else {
                throw new Error(data.message || 'Erro ao atualizar produto');
            }
            
        } catch (error) {
            this.hideLoading();
            console.error('Erro ao salvar produto:', error);
            await this.showNotification('Erro', error.message || 'Não foi possível salvar as alterações', 'error');
        }
    }

    /**
     * Fecha modal
     */
    closeModal() {
        if (this.modalElement) {
            this.modalElement.classList.remove('show');
            setTimeout(() => {
                this.modalElement.remove();
                this.modalElement = null;
                this.currentProduct = null;
            }, 300);
        }
    }

    /**
     * Mostra notificação
     */
    async showNotification(title, message, type = 'info') {
        if (typeof alertaFluent === 'function') {
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-triangle',
                warning: 'fas fa-exclamation-circle',
                info: 'fas fa-info-circle'
            };
            await alertaFluent(title, message, icons[type] || icons.info);
        }
    }

    /**
     * Mostra loading
     */
    showLoading(text = 'Carregando...') {
        const loading = document.createElement('div');
        loading.className = 'fluent-loading-overlay';
        loading.id = 'product-editor-loading';
        loading.innerHTML = `
            <div class="fluent-loading-spinner"></div>
            <div class="fluent-loading-text">${text}</div>
        `;
        document.body.appendChild(loading);
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        const loading = document.getElementById('product-editor-loading');
        if (loading) {
            loading.remove();
        }
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Criar instância global
const productEditor = new ProductEditor();
window.productEditor = productEditor;

// Função global para editar produto
window.editProduct = async function(id) {
    await productEditor.openEditModal(id);
};


