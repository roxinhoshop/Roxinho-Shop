/**
 * @file produtos-api.js
 * @description Sistema de gerenciamento de produtos integrado com API backend
 */

class ProductsAPI {
    constructor() {
        this.apiBaseUrl = 'https://roxinho-shop-backend.vercel.app/api';
        this.currentProducts = [];
        this.currentCategories = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.totalProducts = 0;
        
        this.initializeSystem();
    }

    /**
     * Inicializa o sistema de produtos
     */
    async initializeSystem() {
        await this.loadCategories();
        await this.loadProducts();
        this.setupEventListeners();
        console.log("🛍️ Sistema de produtos API inicializado");
    }

    /**
     * Carrega as categorias da API
     */
    async loadCategories() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/categories`);
            const data = await response.json();

            if (data.success) {
                this.currentCategories = data.categories;
                this.renderCategoryFilter();
                console.log("📂 Categorias carregadas:", data.categories.length);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar categorias:", error);
        }
    }

    /**
     * Carrega os produtos da API
     */
    async loadProducts(filters = {}) {
        try {
            const params = new URLSearchParams({
                limit: this.productsPerPage,
                offset: (this.currentPage - 1) * this.productsPerPage,
                ...filters
            });

            const response = await fetch(`${this.apiBaseUrl}/products?${params}`);
            const data = await response.json();

            if (data.success) {
                this.currentProducts = data.products;
                this.renderProducts();
                this.renderPagination();
                console.log("🛍️ Produtos carregados:", data.products.length);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar produtos:", error);
            this.showMessage("Erro ao carregar produtos", "error");
        }
    }

    /**
     * Busca um produto específico por ID
     */
    async getProduct(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/products/${id}`);
            const data = await response.json();

            if (data.success) {
                return data.product;
            } else {
                throw new Error(data.error || "Produto não encontrado");
            }
        } catch (error) {
            console.error("❌ Erro ao buscar produto:", error);
            return null;
        }
    }

    /**
     * Renderiza os produtos na página
     */
    renderProducts() {
        const productGrid = document.getElementById('grade-produtos') || 
                           document.getElementById('grade-produtos-home') ||
                           document.querySelector('.produtos-grid');

        if (!productGrid) {
            console.warn("⚠️ Container de produtos não encontrado");
            return;
        }

        if (this.currentProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente ajustar os filtros de busca</p>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = this.currentProducts.map(product => this.renderProductCard(product)).join('');
        
        // Adicionar event listeners aos botões
        this.setupProductEventListeners();
    }

    /**
     * Renderiza um card de produto
     */
    renderProductCard(product) {
        const precoOriginal = parseFloat(product.preco);
        const precoPromocional = product.preco_promocional ? parseFloat(product.preco_promocional) : null;
        const precoFinal = precoPromocional || precoOriginal;
        const temDesconto = precoPromocional && precoPromocional < precoOriginal;
        const percentualDesconto = temDesconto ? Math.round(((precoOriginal - precoPromocional) / precoOriginal) * 100) : 0;

        return `
            <div class="produto-card" data-product-id="${product.id}">
                <div class="produto-imagem">
                    <img src="${product.imagem_principal || '/imagens/default.png'}" 
                         alt="${product.nome}" 
                         loading="lazy"
                         onerror="this.src='/imagens/default.png'">
                    ${temDesconto ? `<div class="desconto-badge">-${percentualDesconto}%</div>` : ''}
                    ${product.destaque ? '<div class="destaque-badge">Destaque</div>' : ''}
                    ${product.estoque <= 0 ? '<div class="sem-estoque-badge">Sem estoque</div>' : ''}
                </div>
                <div class="produto-info">
                    <h3 class="produto-nome">${product.nome}</h3>
                    <p class="produto-categoria">${product.categoria_nome || 'Categoria'}</p>
                    ${product.descricao_curta ? `<p class="produto-descricao">${product.descricao_curta}</p>` : ''}
                    
                    <div class="produto-preco">
                        ${temDesconto ? `<span class="preco-original">R$ ${precoOriginal.toFixed(2).replace('.', ',')}</span>` : ''}
                        <span class="preco-atual">R$ ${precoFinal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    
                    <div class="produto-acoes">
                        <button class="btn btn-primary btn-ver-produto" data-product-id="${product.id}">
                            <i class="fas fa-eye"></i>
                            Ver Produto
                        </button>
                        ${product.estoque > 0 ? `
                            <button class="btn btn-success btn-comprar" data-product-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i>
                                Comprar
                            </button>
                        ` : `
                            <button class="btn btn-secondary" disabled>
                                <i class="fas fa-times"></i>
                                Indisponível
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza o filtro de categorias
     */
    renderCategoryFilter() {
        const categoryFilter = document.getElementById('filtro-categorias') || 
                              document.querySelector('.category-filter');

        if (!categoryFilter) return;

        const categoriesHTML = this.currentCategories.map(category => `
            <option value="${category.slug}">${category.nome}</option>
        `).join('');

        categoryFilter.innerHTML = `
            <option value="">Todas as categorias</option>
            ${categoriesHTML}
        `;
    }

    /**
     * Renderiza a paginação
     */
    renderPagination() {
        const paginationContainer = document.getElementById('paginacao') || 
                                   document.querySelector('.pagination');

        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.totalProducts / this.productsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Botão anterior
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="btn-pagination" data-page="${this.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }

        // Números das páginas
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="btn-pagination active" data-page="${i}">${i}</button>`;
            } else if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `<button class="btn-pagination" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }

        // Botão próximo
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button class="btn-pagination" data-page="${this.currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationContainer.innerHTML = paginationHTML;

        // Adicionar event listeners
        paginationContainer.querySelectorAll('.btn-pagination').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadProducts(this.getCurrentFilters());
                }
            });
        });
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Filtro de busca
        const searchInput = document.getElementById('busca-produtos') || 
                           document.querySelector('input[placeholder*="Buscar"]');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentPage = 1;
                    this.loadProducts(this.getCurrentFilters());
                }, 500);
            });
        }

        // Filtro de categoria
        const categoryFilter = document.getElementById('filtro-categorias') || 
                              document.querySelector('.category-filter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.currentPage = 1;
                this.loadProducts(this.getCurrentFilters());
            });
        }

        // Ordenação
        const sortSelect = document.getElementById('ordenacao') || 
                          document.querySelector('.sort-select');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentPage = 1;
                this.loadProducts(this.getCurrentFilters());
            });
        }
    }

    /**
     * Configura event listeners específicos dos produtos
     */
    setupProductEventListeners() {
        // Botões "Ver Produto"
        document.querySelectorAll('.btn-ver-produto').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.viewProduct(productId);
            });
        });

        // Botões "Comprar"
        document.querySelectorAll('.btn-comprar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.buyProduct(productId);
            });
        });
    }

    /**
     * Obtém os filtros atuais
     */
    getCurrentFilters() {
        const filters = {};

        const searchInput = document.getElementById('busca-produtos') || 
                           document.querySelector('input[placeholder*="Buscar"]');
        if (searchInput && searchInput.value.trim()) {
            filters.search = searchInput.value.trim();
        }

        const categoryFilter = document.getElementById('filtro-categorias') || 
                              document.querySelector('.category-filter');
        if (categoryFilter && categoryFilter.value) {
            filters.categoria = categoryFilter.value;
        }

        return filters;
    }

    /**
     * Visualiza um produto específico
     */
    async viewProduct(productId) {
        try {
            const product = await this.getProduct(productId);
            if (product) {
                // Redirecionar para página do produto ou abrir modal
                if (document.getElementById('produto-modal')) {
                    this.showProductModal(product);
                } else {
                    window.location.href = `paginaproduto.html?id=${productId}`;
                }
            }
        } catch (error) {
            console.error("❌ Erro ao visualizar produto:", error);
            this.showMessage("Erro ao carregar produto", "error");
        }
    }

    /**
     * Compra um produto (adiciona ao histórico)
     */
    async buyProduct(productId) {
        if (!window.authAPI || !window.authAPI.isAuthenticated()) {
            this.showMessage("Faça login para comprar produtos", "warning");
            window.location.href = "login.html";
            return;
        }

        try {
            const product = await this.getProduct(productId);
            if (!product) {
                this.showMessage("Produto não encontrado", "error");
                return;
            }

            if (product.estoque <= 0) {
                this.showMessage("Produto sem estoque", "error");
                return;
            }

            // Confirmar compra
            if (!confirm(`Confirma a compra de "${product.nome}" por R$ ${(product.preco_promocional || product.preco).toFixed(2).replace('.', ',')}?`)) {
                return;
            }

            const purchaseData = {
                produto_id: productId,
                quantidade: 1,
                observacoes: `Compra direta do produto ${product.nome}`
            };

            const response = await window.authAPI.authenticatedRequest('/purchase-history', {
                method: 'POST',
                body: JSON.stringify(purchaseData)
            });

            if (response && response.success) {
                this.showMessage("Compra realizada com sucesso!", "success");
                // Recarregar produtos para atualizar estoque
                await this.loadProducts(this.getCurrentFilters());
            } else {
                this.showMessage(response?.error || "Erro ao processar compra", "error");
            }

        } catch (error) {
            console.error("❌ Erro na compra:", error);
            this.showMessage("Erro ao processar compra", "error");
        }
    }

    /**
     * Mostra modal do produto
     */
    showProductModal(product) {
        const modal = document.getElementById('produto-modal');
        if (!modal) return;

        const precoOriginal = parseFloat(product.preco);
        const precoPromocional = product.preco_promocional ? parseFloat(product.preco_promocional) : null;
        const precoFinal = precoPromocional || precoOriginal;
        const temDesconto = precoPromocional && precoPromocional < precoOriginal;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${product.nome}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-modal-grid">
                        <div class="product-modal-image">
                            <img src="${product.imagem_principal || '/imagens/default.png'}" 
                                 alt="${product.nome}">
                        </div>
                        <div class="product-modal-info">
                            <p class="product-category">${product.categoria_nome}</p>
                            <div class="product-price">
                                ${temDesconto ? `<span class="price-original">R$ ${precoOriginal.toFixed(2).replace('.', ',')}</span>` : ''}
                                <span class="price-current">R$ ${precoFinal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <p class="product-description">${product.descricao || product.descricao_curta || 'Sem descrição disponível'}</p>
                            <div class="product-stock">
                                <strong>Estoque:</strong> ${product.estoque} unidades
                            </div>
                            ${product.especificacoes ? `
                                <div class="product-specs">
                                    <h4>Especificações:</h4>
                                    <pre>${JSON.stringify(JSON.parse(product.especificacoes), null, 2)}</pre>
                                </div>
                            ` : ''}
                            <div class="modal-actions">
                                ${product.estoque > 0 ? `
                                    <button class="btn btn-success" onclick="window.productsAPI.buyProduct(${product.id})">
                                        <i class="fas fa-shopping-cart"></i>
                                        Comprar Agora
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary" disabled>
                                        Produto Indisponível
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';

        // Event listener para fechar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Exibe mensagem de notificação
     */
    showMessage(message, type = "info") {
        if (window.authAPI && window.authAPI.showMessage) {
            window.authAPI.showMessage(message, type);
        } else {
            alert(message);
        }
    }
}

// Criar instância global
window.productsAPI = new ProductsAPI();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar estilos para produtos se não existirem
    if (!document.getElementById('products-styles')) {
        const styles = document.createElement('style');
        styles.id = 'products-styles';
        styles.textContent = `
            .produtos-grid, .grade-produtos-home {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 20px;
                padding: 20px 0;
            }
            
            .produto-card {
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                background: white;
            }
            
            .produto-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            
            .produto-imagem {
                position: relative;
                height: 200px;
                overflow: hidden;
            }
            
            .produto-imagem img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .desconto-badge, .destaque-badge, .sem-estoque-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: bold;
                color: white;
            }
            
            .desconto-badge {
                background: #dc3545;
            }
            
            .destaque-badge {
                background: #ffc107;
                color: #000;
            }
            
            .sem-estoque-badge {
                background: #6c757d;
            }
            
            .produto-info {
                padding: 15px;
            }
            
            .produto-nome {
                font-size: 1.1rem;
                font-weight: 600;
                margin: 0 0 5px 0;
                color: #333;
            }
            
            .produto-categoria {
                color: #666;
                font-size: 0.9rem;
                margin: 0 0 10px 0;
            }
            
            .produto-descricao {
                color: #777;
                font-size: 0.85rem;
                margin: 0 0 15px 0;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .produto-preco {
                margin: 15px 0;
            }
            
            .preco-original {
                text-decoration: line-through;
                color: #999;
                font-size: 0.9rem;
                margin-right: 10px;
            }
            
            .preco-atual {
                font-size: 1.2rem;
                font-weight: bold;
                color: #28a745;
            }
            
            .produto-acoes {
                display: flex;
                gap: 10px;
            }
            
            .produto-acoes .btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background-color 0.3s ease;
            }
            
            .btn-primary {
                background: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background: #0056b3;
            }
            
            .btn-success {
                background: #28a745;
                color: white;
            }
            
            .btn-success:hover {
                background: #1e7e34;
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .no-products {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #666;
            }
            
            .no-products i {
                font-size: 3rem;
                margin-bottom: 20px;
                color: #ccc;
            }
            
            .pagination {
                display: flex;
                justify-content: center;
                gap: 5px;
                margin: 20px 0;
            }
            
            .btn-pagination {
                padding: 8px 12px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
                border-radius: 4px;
            }
            
            .btn-pagination:hover {
                background: #f8f9fa;
            }
            
            .btn-pagination.active {
                background: #007bff;
                color: white;
                border-color: #007bff;
            }
            
            .pagination-dots {
                padding: 8px 4px;
                color: #666;
            }
            
            #produto-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
            }
            
            .modal-content {
                background-color: white;
                margin: 5% auto;
                padding: 0;
                border-radius: 8px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }
            
            .product-modal-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                padding: 20px;
            }
            
            .product-modal-image img {
                width: 100%;
                border-radius: 8px;
            }
            
            @media (max-width: 768px) {
                .product-modal-grid {
                    grid-template-columns: 1fr;
                }
                
                .produtos-grid, .grade-produtos-home {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
});

console.log("🛍️ Sistema de produtos API carregado");
