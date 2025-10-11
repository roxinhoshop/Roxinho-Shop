/**
 * @file admin-panel-api.js
 * @description Painel administrativo integrado com API backend para gerenciar produtos
 */

class AdminPanelAPI {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentProducts = [];
        this.currentCategories = [];
        this.currentPage = 1;
        this.productsPerPage = 10;
        this.editingProduct = null;
        
        this.initializeSystem();
    }

    /**
     * Inicializa o sistema administrativo
     */
    async initializeSystem() {
        // Verificar se é admin
        if (!window.authAPI || !window.authAPI.isAdmin()) {
            window.authAPI.showMessage("Acesso negado. Área restrita para administradores.", "error");
            window.location.href = "/";
            return;
        }

        await this.loadDashboardData();
        await this.loadCategories();
        await this.loadProducts();
        this.setupEventListeners();
        console.log("👑 Painel administrativo inicializado");
    }

    /**
     * Carrega dados do dashboard
     */
    async loadDashboardData() {
        try {
            const response = await window.authAPI.authenticatedRequest('/admin/dashboard');
            
            if (response && response.success) {
                this.renderDashboard(response);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar dashboard:", error);
        }
    }

    /**
     * Renderiza o dashboard
     */
    renderDashboard(data) {
        const dashboardContainer = document.getElementById('dashboard-stats');
        if (!dashboardContainer) return;

        dashboardContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${data.stats.totalUsers}</h3>
                        <p>Usuários Cadastrados</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${data.stats.totalProducts}</h3>
                        <p>Produtos Ativos</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${data.stats.totalPurchases}</h3>
                        <p>Total de Vendas</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-info">
                        <h3>R$ ${(data.stats.totalRevenue || 0).toFixed(2).replace('.', ',')}</h3>
                        <p>Receita Total</p>
                    </div>
                </div>
            </div>
        `;

        // Renderizar produtos mais vendidos
        const topProductsContainer = document.getElementById('top-products');
        if (topProductsContainer && data.topProducts) {
            topProductsContainer.innerHTML = `
                <h3>Produtos Mais Vendidos</h3>
                <div class="top-products-list">
                    ${data.topProducts.map(product => `
                        <div class="top-product-item">
                            <img src="${product.imagem_principal || '/imagens/default.png'}" alt="${product.nome}">
                            <div class="product-info">
                                <h4>${product.nome}</h4>
                                <p>${product.total_vendido} vendidos</p>
                                <p>R$ ${(product.receita || 0).toFixed(2).replace('.', ',')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Renderizar vendas recentes
        const recentSalesContainer = document.getElementById('recent-sales');
        if (recentSalesContainer && data.recentSales) {
            recentSalesContainer.innerHTML = `
                <h3>Vendas Recentes</h3>
                <div class="recent-sales-list">
                    ${data.recentSales.map(sale => `
                        <div class="sale-item">
                            <img src="${sale.imagem_principal || '/imagens/default.png'}" alt="${sale.nome_produto}">
                            <div class="sale-info">
                                <h4>${sale.nome_produto}</h4>
                                <p>Cliente: ${sale.nome} ${sale.sobrenome}</p>
                                <p>Quantidade: ${sale.quantidade}</p>
                                <p>Total: R$ ${sale.total.toFixed(2).replace('.', ',')}</p>
                                <p>Data: ${new Date(sale.data_compra).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    /**
     * Carrega as categorias
     */
    async loadCategories() {
        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/categories`);
            
            if (response && response.success) {
                this.currentCategories = response.categories;
                this.renderCategoryOptions();
                this.renderCategoriesTable(); // Renderizar a tabela de categorias também
            } else {
                console.error("❌ Erro ao carregar categorias:", response.error);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar categorias:", error);
        }
    }

    /**
     * Carrega os produtos para administração
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
                this.renderProductsTable();
            }
        } catch (error) {
            console.error("❌ Erro ao carregar produtos:", error);
        }
    }

    /**
     * Renderiza a tabela de produtos
     */
    renderProductsTable() {
        const tableContainer = document.getElementById('products-table');
        if (!tableContainer) return;

        if (this.currentProducts.length === 0) {
            tableContainer.innerHTML = `
                <div class="no-products">
                    <p>Nenhum produto encontrado</p>
                </div>
            `;
            return;
        }

        tableContainer.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.currentProducts.map(product => this.renderProductRow(product)).join('')}
                </tbody>
            </table>
        `;

        this.setupProductTableListeners();
    }

    /**
     * Renderiza uma linha da tabela de produtos
     */
    renderProductRow(product) {
        const precoFinal = product.preco_promocional || product.preco;
        
        return `
            <tr data-product-id="${product.id}">
                <td>
                    <img src="${product.imagem_principal || '/imagens/default.png'}" 
                         alt="${product.nome}" 
                         class="product-thumb">
                </td>
                <td>
                    <div class="product-name">
                        ${product.nome}
                        ${product.destaque ? '<span class="badge badge-warning">Destaque</span>' : ''}
                    </div>
                </td>
                <td>${product.categoria_nome || 'Sem categoria'}</td>
                <td>
                    <div class="product-price">
                        ${product.preco_promocional ? `
                            <span class="price-original">R$ ${parseFloat(product.preco).toFixed(2).replace('.', ',')}</span><br>
                            <span class="price-promo">R$ ${parseFloat(product.preco_promocional).toFixed(2).replace('.', ',')}</span>
                        ` : `
                            <span class="price-current">R$ ${parseFloat(product.preco).toFixed(2).replace('.', ',')}</span>
                        `}
                    </div>
                </td>
                <td>
                    <span class="stock-badge ${product.estoque <= 0 ? 'stock-empty' : product.estoque <= 5 ? 'stock-low' : 'stock-ok'}">
                        ${product.estoque}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.ativo ? 'status-active' : 'status-inactive'}">
                        ${product.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary btn-edit" data-product-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-delete" data-product-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Renderiza as opções de categoria
     */
    renderCategoryOptions() {
        const categorySelects = document.querySelectorAll('.category-select');
        
        const optionsHTML = this.currentCategories.map(category => 
            `<option value="${category.id}">${category.nome}</option>`
        ).join('');

        categorySelects.forEach(select => {
            select.innerHTML = `
                <option value="">Selecione uma categoria</option>
                ${optionsHTML}
            `;
        });
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Botão adicionar produto
        const addProductBtn = document.getElementById(\'btn-add-product\');
        if (addProductBtn) {
            addProductBtn.addEventListener(\'click\', () => this.showProductModal());
        }

        // Formulário de produto
        const productForm = document.getElementById(\'product-form\');
        if (productForm) {
            productForm.addEventListener(\'submit\', (e) => this.handleProductSubmit(e));
        }

        // Busca de produtos
        const searchInput = document.getElementById(\'admin-search\');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener(\'input\', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.loadProducts({ search: e.target.value });
                }, 500);
            });
        }

        // Modal de Produto
        const productModal = document.getElementById(\'product-modal\');
        if (productModal) {
            productModal.querySelector(\'.modal-close\').addEventListener(\'click\', () => this.hideProductModal());
            productModal.addEventListener(\'click\', (e) => {
                if (e.target === productModal) this.hideProductModal();
            });
        }

        // Botão adicionar categoria
        const addCategoryBtn = document.getElementById(\'btn-add-category\');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener(\'click\', () => this.showCategoryModal());
        }

        // Formulário de categoria
        const categoryForm = document.getElementById(\'category-form\');
        if (categoryForm) {
            categoryForm.addEventListener(\'submit\', (e) => this.handleCategorySubmit(e));
        }

        // Modal de Categoria
        const categoryModal = document.getElementById(\'category-modal\');
        if (categoryModal) {
            categoryModal.querySelector(\'.modal-close\').addEventListener(\'click\', () => this.hideCategoryModal());
            categoryModal.addEventListener(\'click\', (e) => {
                if (e.target === categoryModal) this.hideCategoryModal();
            });
        }

        // Gerar slug automaticamente para categoria
        const categoryNameInput = document.getElementById(\'category-name\');
        const categorySlugInput = document.getElementById(\'category-slug\');
        if (categoryNameInput && categorySlugInput) {
            categoryNameInput.addEventListener(\'input\', () => {
                if (!this.editingCategory) { // Gerar slug apenas ao adicionar, não ao editar
                    categorySlugInput.value = this.generateSlug(categoryNameInput.value);
                }
            });
        }
    }

    /**
     * Gera um slug a partir de uma string.
     * @param {string} text - O texto para gerar o slug.
     * @returns {string} O slug gerado.
     */
    generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, \'-\
')           // Substitui espaços por hífens
            .replace(/[^\w\-]+/g, \'\
')       // Remove caracteres não-palavra
            .replace(/\-\-+/g, \'-\
')         // Substitui múltiplos hífens por um único
            .replace(/^-+/, \'\
')             // Remove hífens do início
            .replace(/\-$/, \'\
');            // Remove hífens do fim
    }

    /**
     * Renderiza a tabela de categorias
     */
    renderCategoriesTable() {
        const tableContainer = document.getElementById(\'categories-table\');
        if (!tableContainer) return;

        if (this.currentCategories.length === 0) {
            tableContainer.innerHTML = `
                <div class="no-categories">
                    <p>Nenhuma categoria encontrada.</p>
                </div>
            `;
            return;
        }

        tableContainer.innerHTML = `
            <table class="admin-table category-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Slug</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.currentCategories.map(category => this.renderCategoryRow(category)).join(\'\
')}
                </tbody>
            </table>
        `;

        this.setupCategoryTableListeners();
    }

    /**
     * Renderiza uma linha da tabela de categorias
     */
    renderCategoryRow(category) {
        return `
            <tr data-category-id="${category.id}">
                <td>${category.id}</td>
                <td>${category.nome}</td>
                <td>${category.slug}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary btn-edit-category" data-category-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete-category" data-category-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Configura listeners da tabela de categorias
     */
    setupCategoryTableListeners() {
        document.querySelectorAll(\'.btn-edit-category\').forEach(btn => {
            btn.addEventListener(\'click\', (e) => {
                const categoryId = e.target.closest(\'[data-category-id]\').dataset.categoryId;
                this.editCategory(categoryId);
            });
        });

        document.querySelectorAll(\'.btn-delete-category\').forEach(btn => {
            btn.addEventListener(\'click\', (e) => {
                const categoryId = e.target.closest(\'[data-category-id]\').dataset.categoryId;
                this.deleteCategory(categoryId);
            });
        });
    }

    /**
     * Mostra o modal de categoria
     */
    showCategoryModal(category = null) {
        const modal = document.getElementById(\'category-modal\');
        if (!modal) return;

        this.editingCategory = category;

        const form = document.getElementById(\'category-form\');
        form.reset();

        if (category) {
            document.getElementById(\'category-name\').value = category.nome;
            document.getElementById(\'category-slug\').value = category.slug;
            modal.querySelector(\'.modal-title\').textContent = \'Editar Categoria\';
        } else {
            modal.querySelector(\'.modal-title\').textContent = \'Adicionar Categoria\';
        }
        modal.classList.add(\'show\');
    }

    /**
     * Esconde o modal de categoria
     */
    hideCategoryModal() {
        const modal = document.getElementById(\'category-modal\');
        if (modal) {
            modal.classList.remove(\'show\');
        }
        this.editingCategory = null;
    }

    /**
     * Manipula o envio do formulário de categoria
     */
    async handleCategorySubmit(event) {
        event.preventDefault();

        const categoryName = document.getElementById(\'category-name\').value.trim();
        let categorySlug = document.getElementById(\'category-slug\').value.trim();

        if (!categoryName) {
            window.authSystem.showMessage(\'O nome da categoria é obrigatório.\', \'error\');
            return;
        }

        if (!categorySlug) {
            categorySlug = this.generateSlug(categoryName);
        }

        const categoryData = { nome: categoryName, slug: categorySlug };

        try {
            let response;
            if (this.editingCategory) {
                response = await window.authSystem.authenticatedRequest(`/categories/${this.editingCategory.id}`, {
                    method: \'PUT\',
                    headers: { \'Content-Type\': \'application/json\' },
                    body: JSON.stringify(categoryData),
                });
            } else {
                response = await window.authSystem.authenticatedRequest(\'/categories\', {
                    method: \'POST\',
                    headers: { \'Content-Type\': \'application/json\' },
                    body: JSON.stringify(categoryData),
                });
            }

            if (response && response.success) {
                window.authSystem.showMessage(
                    this.editingCategory ? \'Categoria atualizada com sucesso!\' : \'Categoria criada com sucesso!\',
                    \'success\'
                );
                this.hideCategoryModal();
                await this.loadCategories(); // Recarregar categorias para atualizar a tabela e selects
            } else {
                window.authSystem.showMessage(response.error || \'Erro ao salvar categoria.\', \'error\');
            }
        } catch (error) {
            console.error(\'Erro ao salvar categoria:\', error);
            window.authSystem.showMessage(\'Erro de conexão ao salvar categoria.\', \'error\');
        }
    }

    /**
     * Edita uma categoria existente.
     * @param {string} categoryId - O ID da categoria a ser editada.
     */
    editCategory(categoryId) {
        const category = this.currentCategories.find(cat => cat.id == categoryId);
        if (category) {
            this.showCategoryModal(category);
        }
    }

    /**
     * Deleta uma categoria.
     * @param {string} categoryId - O ID da categoria a ser deletada.
     */
    async deleteCategory(categoryId) {
        if (!confirm(\'Tem certeza que deseja deletar esta categoria? Isso pode afetar produtos associados.\')) {
            return;
        }
        try {
            const response = await window.authSystem.authenticatedRequest(`/categories/${categoryId}`, {
                method: \'DELETE\',
            });

            if (response && response.success) {
                window.authSystem.showMessage(\'Categoria deletada com sucesso!\', \'success\');
                await this.loadCategories();
            } else {
                window.authSystem.showMessage(response.error || \'Erro ao deletar categoria.\', \'error\');
            }
        } catch (error) {
            console.error(\'Erro ao deletar categoria:\', error);
            window.authSystem.showMessage(\'Erro de conexão ao deletar categoria.\', \'error\');
        }
    }

    // ... (restante do código, incluindo métodos de imagem) ...

    /**
     * Carrega as categorias
     */
    async loadCategories() {
        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/categories`);
            
            if (response && response.success) {
                this.currentCategories = response.categories;
                this.renderCategoryOptions();
                this.renderCategoriesTable(); // Renderizar a tabela de categorias também
            } else {
                console.error("❌ Erro ao carregar categorias:", response.error);
            }
        } catch (error) {
            console.error("❌ Erro ao carregar categorias:", error);
        }
    }

    // ... (restante do código) ...

    /**
     * Inicializa o sistema administrativo
     */
    async initializeSystem() {
        // Verificar se é admin
        if (!window.authSystem || !window.authSystem.isAdmin()) {
            // Redirecionar para a página de login se não for admin
            window.location.href = "login.html";
            return;
        }

        // Carregar dados do dashboard, categorias e produtos
        await this.loadDashboardData();
        await this.loadCategories();
        await this.loadProducts();
        this.setupEventListeners();
        console.log("👑 Painel administrativo inicializado");
    }

    // ... (outros métodos) ...

    // Métodos de imagem (mantidos como estão)
    openImageGallery() {
        const modal = document.getElementById(\'image-gallery-modal\');
        if (modal) {
            modal.classList.add(\'show\');
            this.loadImagesForGallery();
        }
    }

    closeImageGallery() {
        const modal = document.getElementById(\'image-gallery-modal\');
        if (modal) {
            modal.classList.remove(\'show\');
        }
    }

    async loadImagesForGallery() {
        const galleryGrid = document.getElementById(\'gallery-grid\');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = `<div class="loading-state"><i class="fas fa-spinner"></i><p>Carregando imagens...</p></div>`;

        try {
            const response = await window.authSystem.authenticatedRequest(\'/images\');
            if (response && response.success) {
                if (response.images.length === 0) {
                    galleryGrid.innerHTML = `<p class="text-center">Nenhuma imagem encontrada.</p>`;
                    return;
                }
                galleryGrid.innerHTML = response.images.map(image => `
                    <div class="gallery-item" data-image-url="${image.url}">
                        <img src="${image.url}" alt="${image.name}">
                        <div class="overlay"><i class="fas fa-check-circle"></i></div>
                    </div>
                `).join(\'\
');
                this.setupGallerySelection();
            } else {
                galleryGrid.innerHTML = `<p class="text-center text-danger">Erro ao carregar imagens: ${response.error || \'Desconhecido\'}</p>`;
            }
        } catch (error) {
            console.error(\'Erro ao carregar imagens para galeria:\', error);
            galleryGrid.innerHTML = `<p class="text-center text-danger">Erro de conexão ao carregar imagens.</p>`;
        }
    }

    setupGallerySelection() {
        document.querySelectorAll(\'.gallery-item\').forEach(item => {
            item.addEventListener(\'click\', () => {
                document.querySelectorAll(\'.gallery-item\').forEach(i => i.classList.remove(\'selected\'));
                item.classList.add(\'selected\');
                const imageUrl = item.dataset.imageUrl;
                document.getElementById(\'product-image-url\').value = imageUrl;
                document.getElementById(\'preview-img\').src = imageUrl;
                document.getElementById(\'image-preview\').style.display = \'flex\';
                this.closeImageGallery();
            });
        });
    }

    removeImage() {
        document.getElementById(\'product-image-url\').value = \'\
';
        document.getElementById(\'preview-img\').src = \'\
';
        document.getElementById(\'image-preview\').style.display = \'none\';
        document.getElementById(\'product-image\').value = \'\
'; // Limpar o input file também
    }

    // Preencher formulário de produto (corrigido)
    preencherFormularioProduto(product) {
        document.getElementById(\'product-name\').value = product.nome || \'\
';
        document.getElementById(\'product-description\').value = product.descricao || \'\
';
        document.getElementById(\'product-short-description\').value = product.descricao_curta || \'\
';
        document.getElementById(\'product-category\').value = product.categoria_id || \'\
';
        document.getElementById(\'product-brand\').value = product.marca || \'\
';
        document.getElementById(\'product-model\').value = product.modelo || \'\
';
        document.getElementById(\'product-sku\').value = product.sku || \'\
';
        document.getElementById(\'product-price\').value = product.preco || \'\
';
        document.getElementById(\'product-promo-price\').value = product.preco_promocional || \'\
';
        document.getElementById(\'product-stock\').value = product.estoque || \'\
';
        document.getElementById(\'product-weight\').value = product.peso || \'\
';
        document.getElementById(\'product-dimensions\').value = product.dimensoes || \'\
';
        document.getElementById(\'product-specs\').value = product.especificacoes || \'\
';
        document.getElementById(\'product-featured\').checked = product.destaque == 1;

        // Lógica para imagem principal
        const imageUrlInput = document.getElementById(\'product-image-url\');
        const previewImg = document.getElementById(\'preview-img\');
        const imagePreviewContainer = document.getElementById(\'image-preview\');

        if (product.imagem_principal) {
            imageUrlInput.value = product.imagem_principal;
            previewImg.src = product.imagem_principal;
            imagePreviewContainer.style.display = \'flex\';
        } else {
            imageUrlInput.value = \'\
';
            previewImg.src = \'\
';
            imagePreviewContainer.style.display = \'none\';
        }
    }

    // ... (restante do código) ...

}

// Instanciar a API do painel administrativo globalmente
window.adminPanelAPI = new AdminPanelAPI();


    /**
     * Configura listeners da tabela de produtos
     */
    setupProductTableListeners() {
        // Botões editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.btn-edit').dataset.productId;
                this.editProduct(productId);
            });
        });

        // Botões deletar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.btn-delete').dataset.productId;
                this.deleteProduct(productId);
            });
        });
    }

    /**
     * Mostra o modal de produto
     */
    showProductModal(product = null) {
        const modal = document.getElementById('product-modal');
        if (!modal) return;

        this.editingProduct = product;

        // Limpar formulário
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
        }

        // Preencher dados se editando
        if (product) {
            document.getElementById('product-name').value = product.nome || '';
            document.getElementById('product-description').value = product.descricao || '';
            document.getElementById('product-short-description').value = product.descricao_curta || '';
            document.getElementById('product-category').value = product.categoria_id || '';
            document.getElementById('product-brand').value = product.marca || '';
            document.getElementById('product-model').value = product.modelo || '';
            document.getElementById('product-sku').value = product.sku || '';
            document.getElementById('product-price').value = product.preco || '';
            document.getElementById('product-promo-price').value = product.preco_promocional || '';
            document.getElementById('product-stock').value = product.estoque || '';
            document.getElementById('product-weight').value = product.peso || '';
            document.getElementById('product-dimensions').value = product.dimensoes || '';
            document.getElementById('product-specs').value = product.especificacoes || '';
            document.getElementById('product-featured').checked = product.destaque || false;

            document.querySelector('.modal-title').textContent = 'Editar Produto';
        } else {
            document.querySelector('.modal-title').textContent = 'Adicionar Produto';
        }

        modal.style.display = 'block';
    }

    /**
     * Esconde o modal de produto
     */
    hideProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.editingProduct = null;
    }

    /**
     * Manipula o envio do formulário de produto
     */
    async handleProductSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        
        try {
            let response;
            
            if (this.editingProduct) {
                // Atualizar produto existente
                response = await window.authAPI.authenticatedRequest(`/products/${this.editingProduct.id}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {} // Remover Content-Type para FormData
                });
            } else {
                // Criar novo produto
                response = await window.authAPI.authenticatedRequest('/products', {
                    method: 'POST',
                    body: formData,
                    headers: {} // Remover Content-Type para FormData
                });
            }

            if (response && response.success) {
                window.authAPI.showMessage(
                    this.editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
                    'success'
                );
                this.hideProductModal();
                await this.loadProducts();
                await this.loadDashboardData();
            } else {
                window.authAPI.showMessage(response?.error || 'Erro ao salvar produto', 'error');
            }

        } catch (error) {
            console.error('❌ Erro ao salvar produto:', error);
            window.authAPI.showMessage('Erro ao salvar produto', 'error');
        }
    }

    /**
     * Edita um produto
     */
    async editProduct(productId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/products/${productId}`);
            const data = await response.json();

            if (data.success) {
                this.showProductModal(data.product);
            } else {
                window.authAPI.showMessage('Produto não encontrado', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar produto:', error);
            window.authAPI.showMessage('Erro ao carregar produto', 'error');
        }
    }

    /**
     * Deleta um produto
     */
    async deleteProduct(productId) {
        const product = this.currentProducts.find(p => p.id == productId);
        
        if (!confirm(`Tem certeza que deseja remover o produto "${product?.nome}"?`)) {
            return;
        }

        try {
            const response = await window.authAPI.authenticatedRequest(`/products/${productId}`, {
                method: 'DELETE'
            });

            if (response && response.success) {
                window.authAPI.showMessage('Produto removido com sucesso!', 'success');
                await this.loadProducts();
                await this.loadDashboardData();
            } else {
                window.authAPI.showMessage(response?.error || 'Erro ao remover produto', 'error');
            }

        } catch (error) {
            console.error('❌ Erro ao remover produto:', error);
            window.authAPI.showMessage('Erro ao remover produto', 'error');
        }
    }
}

// Criar instância global
window.adminPanelAPI = new AdminPanelAPI();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar estilos para o painel admin se não existirem
    if (!document.getElementById('admin-panel-styles')) {
        const styles = document.createElement('style');
        styles.id = 'admin-panel-styles';
        styles.textContent = `
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            }
            
            .stat-info h3 {
                margin: 0;
                font-size: 1.5rem;
                color: #333;
            }
            
            .stat-info p {
                margin: 5px 0 0 0;
                color: #666;
                font-size: 0.9rem;
            }
            
            .admin-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .admin-table th,
            .admin-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            
            .admin-table th {
                background: #f8f9fa;
                font-weight: 600;
                color: #333;
            }
            
            .product-thumb {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 4px;
            }
            
            .product-name {
                font-weight: 500;
            }
            
            .badge {
                display: inline-block;
                padding: 2px 6px;
                font-size: 0.75rem;
                border-radius: 3px;
                margin-left: 5px;
            }
            
            .badge-warning {
                background: #ffc107;
                color: #000;
            }
            
            .price-original {
                text-decoration: line-through;
                color: #999;
                font-size: 0.9rem;
            }
            
            .price-promo {
                color: #28a745;
                font-weight: bold;
            }
            
            .price-current {
                color: #333;
                font-weight: bold;
            }
            
            .stock-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: bold;
            }
            
            .stock-ok {
                background: #d4edda;
                color: #155724;
            }
            
            .stock-low {
                background: #fff3cd;
                color: #856404;
            }
            
            .stock-empty {
                background: #f8d7da;
                color: #721c24;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: bold;
            }
            
            .status-active {
                background: #d4edda;
                color: #155724;
            }
            
            .status-inactive {
                background: #f8d7da;
                color: #721c24;
            }
            
            .action-buttons {
                display: flex;
                gap: 5px;
            }
            
            .btn-sm {
                padding: 6px 10px;
                font-size: 0.8rem;
            }
            
            .btn-primary {
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .btn-primary:hover {
                background: #0056b3;
            }
            
            .btn-danger {
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .btn-danger:hover {
                background: #c82333;
            }
            
            .btn-success {
                background: #28a745;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                padding: 10px 20px;
            }
            
            .btn-success:hover {
                background: #218838;
            }
            
            .modal {
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
                margin: 2% auto;
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
            
            .modal-body {
                padding: 20px;
            }
            
            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }
            
            .form-group-full {
                grid-column: 1 / -1;
            }
            
            .checkbox-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .checkbox-group input[type="checkbox"] {
                width: auto;
            }
            
            .top-products-list,
            .recent-sales-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .top-product-item,
            .sale-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 6px;
            }
            
            .top-product-item img,
            .sale-item img {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 4px;
            }
            
            .product-info h4,
            .sale-info h4 {
                margin: 0 0 5px 0;
                font-size: 0.9rem;
            }
            
            .product-info p,
            .sale-info p {
                margin: 2px 0;
                font-size: 0.8rem;
                color: #666;
            }
            
            @media (max-width: 768px) {
                .form-grid {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
                
                .admin-table {
                    font-size: 0.8rem;
                }
                
                .admin-table th,
                .admin-table td {
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(styles);
    }
});

console.log("👑 Painel administrativo API carregado");



    /**
     * Manipula o upload de imagem
     */
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            window.authAPI.showMessage('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP', 'error');
            return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            window.authAPI.showMessage('Arquivo muito grande. Tamanho máximo: 5MB', 'error');
            return;
        }

        // Criar FormData
        const formData = new FormData();
        formData.append('imagem', file);

        try {
            const response = await fetch('/php/upload.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.currentImageUrl = result.url;
                this.showImagePreview(result.url);
                document.getElementById('product-image-url').value = result.url;
                window.authAPI.showMessage('Imagem enviada com sucesso!', 'success');
            } else {
                throw new Error(result.error || 'Erro ao enviar imagem');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            window.authAPI.showMessage(error.message, 'error');
        }
    }

    /**
     * Mostra preview da imagem
     */
    showImagePreview(url) {
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        
        if (preview && img) {
            img.src = url;
            preview.style.display = 'block';
        }
    }

    /**
     * Remove a imagem selecionada
     */
    removeImage() {
        this.currentImageUrl = null;
        document.getElementById('product-image-url').value = '';
        document.getElementById('image-preview').style.display = 'none';
        document.getElementById('product-image').value = '';
    }

    /**
     * Abre a galeria de imagens
     */
    async openImageGallery() {
        const modal = document.getElementById('image-gallery-modal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            await this.loadImageGallery();
        }
    }

    /**
     * Fecha a galeria de imagens
     */
    closeImageGallery() {
        const modal = document.getElementById('image-gallery-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }

    /**
     * Carrega a galeria de imagens
     */
    async loadImageGallery() {
        const galleryGrid = document.getElementById('gallery-grid');
        if (!galleryGrid) return;
        
        try {
            const response = await fetch('/php/listar-imagens.php');
            const result = await response.json();

            if (result.success && result.images.length > 0) {
                galleryGrid.innerHTML = '';
                
                result.images.forEach(image => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.innerHTML = `
                        <img src="${image.url}" alt="${image.filename}">
                        <div class="gallery-item-overlay">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    `;
                    item.addEventListener('click', () => this.selectImageFromGallery(image.url));
                    galleryGrid.appendChild(item);
                });
            } else {
                galleryGrid.innerHTML = `
                    <div class="gallery-empty">
                        <i class="fas fa-images"></i>
                        <p>Nenhuma imagem encontrada</p>
                        <p style="font-size: 0.9rem; color: #999;">Faça upload de imagens para começar</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar galeria:', error);
            galleryGrid.innerHTML = `
                <div class="gallery-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar galeria</p>
                </div>
            `;
        }
    }

    /**
     * Seleciona uma imagem da galeria
     */
    selectImageFromGallery(url) {
        this.currentImageUrl = url;
        this.showImagePreview(url);
        document.getElementById('product-image-url').value = url;
        this.closeImageGallery();
        window.authAPI.showMessage('Imagem selecionada!', 'success');
    }
}

// Inicializar quando o DOM estiver pronto
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.adminPanelAPI = new AdminPanelAPI();
        
        // Configurar listener para upload de imagem
        const imageInput = document.getElementById('product-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                if (window.adminPanelAPI) {
                    window.adminPanelAPI.handleImageUpload(e);
                }
            });
        }
    });
}

