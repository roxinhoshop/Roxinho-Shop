/**
 * Product URL Loader - Sistema de Carregamento de Produtos via Link
 * Permite adicionar produtos ao sistema através de links do Mercado Livre e Amazon
 */

class ProductURLLoader {
    constructor() {
        this.apiBase = 'https://roxinho-shop-backend.vercel.app/api';
        this.modalElement = null;
    }

    /**
     * Abre modal para adicionar produto via URL
     */
    openModal() {
        this.createModal();
    }

    /**
     * Cria modal de adição de produto via URL
     */
    createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'product-url-loader-overlay';
        overlay.innerHTML = `
            <div class="product-url-loader-modal">
                <div class="product-url-loader-header">
                    <h2>Adicionar Produto via Link</h2>
                    <button class="product-url-loader-close" onclick="productURLLoader.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="product-url-loader-body">
                    <form id="product-url-form">
                        <div class="form-group">
                            <label for="product-url">
                                <i class="fas fa-link"></i> Link do Produto
                            </label>
                            <input 
                                type="url" 
                                id="product-url" 
                                placeholder="Cole o link do Mercado Livre ou Amazon aqui" 
                                required
                            >
                            <small>Suporta links do Mercado Livre e Amazon</small>
                        </div>
                        
                        <div id="product-preview" class="product-preview" style="display: none;">
                            <h3>Prévia do Produto</h3>
                            <div class="preview-content">
                                <img id="preview-image" src="" alt="Produto">
                                <div class="preview-details">
                                    <h4 id="preview-name"></h4>
                                    <p class="preview-price" id="preview-price"></p>
                                    <p class="preview-description" id="preview-description"></p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="product-url-loader-actions">
                            <button type="button" class="btn btn-secondary" onclick="productURLLoader.closeModal()">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-primary" id="btn-load-product">
                                <i class="fas fa-download"></i> Carregar Dados
                            </button>
                            <button type="submit" class="btn btn-success" id="btn-save-product" style="display: none;">
                                <i class="fas fa-save"></i> Salvar Produto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.modalElement = overlay;
        
        // Event listeners
        document.getElementById('btn-load-product').addEventListener('click', () => this.loadProductData());
        document.getElementById('product-url-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
        
        setTimeout(() => overlay.classList.add('show'), 10);
    }

    /**
     * Carrega dados do produto a partir da URL
     */
    async loadProductData() {
        const urlInput = document.getElementById('product-url');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showNotification('Erro', 'Por favor, insira um link válido', 'error');
            return;
        }
        
        this.showLoading('Carregando dados do produto...');
        
        try {
            const response = await fetch(`${this.apiBase}/products/extract-from-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json();
            
            this.hideLoading();
            
            if (response.ok && data.success) {
                this.displayProductPreview(data.product);
                document.getElementById('btn-load-product').style.display = 'none';
                document.getElementById('btn-save-product').style.display = 'inline-block';
            } else {
                throw new Error(data.message || 'Erro ao carregar dados do produto');
            }
            
        } catch (error) {
            this.hideLoading();
            console.error('Erro ao carregar produto:', error);
            this.showNotification('Erro', error.message || 'Não foi possível carregar os dados do produto', 'error');
        }
    }

    /**
     * Exibe prévia do produto carregado
     */
    displayProductPreview(product) {
        const previewDiv = document.getElementById('product-preview');
        
        document.getElementById('preview-image').src = product.imagem || 'https://via.placeholder.com/150?text=Produto';
        document.getElementById('preview-name').textContent = product.nome;
        document.getElementById('preview-price').textContent = `R$ ${parseFloat(product.preco).toFixed(2)}`;
        document.getElementById('preview-description').textContent = product.descricao || 'Sem descrição';
        
        previewDiv.style.display = 'block';
        
        // Armazenar dados do produto para salvar depois
        this.productData = product;
    }

    /**
     * Salva o produto no banco de dados
     */
    async saveProduct() {
        if (!this.productData) {
            this.showNotification('Erro', 'Nenhum produto carregado', 'error');
            return;
        }
        
        this.showLoading('Salvando produto...');
        
        try {
            const response = await fetch(`${this.apiBase}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.productData)
            });
            
            const data = await response.json();
            
            this.hideLoading();
            
            if (response.ok && (data.success || data.status === 'success')) {
                await this.showNotification('Sucesso!', 'Produto adicionado com sucesso', 'success');
                this.closeModal();
                
                // Recarregar lista de produtos
                if (typeof loadProducts === 'function') {
                    loadProducts();
                }
            } else {
                throw new Error(data.message || 'Erro ao salvar produto');
            }
            
        } catch (error) {
            this.hideLoading();
            console.error('Erro ao salvar produto:', error);
            await this.showNotification('Erro', error.message || 'Não foi possível salvar o produto', 'error');
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
                this.productData = null;
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
        loading.id = 'product-url-loader-loading';
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
        const loading = document.getElementById('product-url-loader-loading');
        if (loading) {
            loading.remove();
        }
    }
}

// Criar instância global
const productURLLoader = new ProductURLLoader();
window.productURLLoader = productURLLoader;

// Função global para abrir modal
window.openProductURLLoader = function() {
    productURLLoader.openModal();
};

