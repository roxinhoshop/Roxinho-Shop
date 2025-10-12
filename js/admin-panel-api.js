
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
        this.editingCategory = null; // Adicionado para controle de edição de categoria
        
        this.initializeSystem();
    }

    /**
     * Inicializa o sistema administrativo
     */
    async initializeSystem() {
        // Verificar se é admin
        if (!window.authSystem || !window.authSystem.isAdmin()) {
            window.authSystem.showMessage("Acesso negado. Área restrita para administradores.", "error");
            window.location.href = "login.html"; // Redirecionar para a página de login
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
            // Assumindo que o backend tem um endpoint para dashboard admin
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/admin/dashboard`);
            
            if (response && response.status === 'success') {
                this.renderDashboard(response);
            } else {
                console.error("❌ Erro ao carregar dashboard: ", response.message);
                window.authSystem.showMessage(response.message || "Erro ao carregar dados do dashboard.", "error");
            }
        } catch (error) {
            console.error("❌ Erro ao carregar dashboard: ", error);
            window.authSystem.showMessage("Erro de conexão ao carregar dados do dashboard.", "error");
        }
    }

    /**
     * Renderiza o dashboard
     */
    renderDashboard(data) {
        const dashboardContainer = document.getElementById('dashboard-stats');
        if (!dashboardContainer) return;

        // Dados simulados ou reais, dependendo da resposta da API
        const stats = data.stats || { totalUsers: 0, totalProducts: 0, totalPurchases: 0, totalRevenue: 0 };
        const recentProducts = data.recentProducts || [];

        dashboardContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.totalUsers}</h3>
                        <p>Usuários Cadastrados</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.totalProducts}</h3>
                        <p>Produtos Ativos</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${stats.totalPurchases}</h3>
                        <p>Total de Vendas</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-info">
                        <h3>R$ ${(stats.totalRevenue || 0).toFixed(2).replace('.', ',')}</h3>
                        <p>Receita Total</p>
                    </div>
                </div>
            </div>
        `;

        const recentProductsContainer = document.getElementById('recent-products');
        if (recentProductsContainer) {
            if (recentProducts.length > 0) {
                recentProductsContainer.innerHTML = `
                    <h3>Produtos Recém-Adicionados</h3>
                    <div class="recent-products-list">
                        ${recentProducts.map(product => `
                            <div class="recent-product-item">
                                <img src="${product.imagem_principal || '/imagens/default.png'}" alt="${product.nome}">
                                <div class="product-info">
                                    <h4>${product.nome}</h4>
                                    <p>Preço: R$ ${parseFloat(product.preco).toFixed(2).replace('.', ',')}</p>
                                    <p>Estoque: ${product.estoque}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                recentProductsContainer.innerHTML = `<p>Nenhum produto recente para exibir.</p>`;
            }
        }
    }

    /**
     * Carrega as categorias
     */
    async loadCategories() {
        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/categorias`);
            
            if (response && response.status === 'success') {
                this.currentCategories = response.categories;
                this.renderCategoryOptions();
                this.renderCategoriesTable();
            } else {
                console.error("❌ Erro ao carregar categorias: ", response.message);
                window.authSystem.showMessage(response.message || "Erro ao carregar categorias.", "error");
            }
        } catch (error) {
            console.error("❌ Erro ao carregar categorias: ", error);
            window.authSystem.showMessage("Erro de conexão ao carregar categorias.", "error");
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

            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/produtos?${params}`);
            
            if (response && response.status === 'success') {
                this.currentProducts = response.products;
                this.renderProductsTable();
            } else {
                console.error("❌ Erro ao carregar produtos: ", response.message);
                window.authSystem.showMessage(response.message || "Erro ao carregar produtos.", "error");
            }
        } catch (error) {
            console.error("❌ Erro ao carregar produtos: ", error);
            window.authSystem.showMessage("Erro de conexão ao carregar produtos.", "error");
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
     * Renderiza as opções de categoria para selects
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
        const addProductBtn = document.getElementById('btn-add-product');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showProductModal());
        }

        // Formulário de produto
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        // Busca de produtos
        const searchInput = document.getElementById('admin-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.loadProducts({ search: e.target.value });
                }, 500);
            });
        }

        // Modal de Produto
        const productModal = document.getElementById('product-modal');
        if (productModal) {
            productModal.querySelector('.modal-close').addEventListener('click', () => this.hideProductModal());
            productModal.addEventListener('click', (e) => {
                if (e.target === productModal) this.hideProductModal();
            });
        }

        // Botão adicionar categoria
        const addCategoryBtn = document.getElementById('btn-add-category');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.showCategoryModal());
        }

        // Formulário de categoria
        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
        }

        // Modal de Categoria
        const categoryModal = document.getElementById('category-modal');
        if (categoryModal) {
            categoryModal.querySelector('.modal-close').addEventListener('click', () => this.hideCategoryModal());
            categoryModal.addEventListener('click', (e) => {
                if (e.target === categoryModal) this.hideCategoryModal();
            });
        }

        // Gerar slug automaticamente para categoria
        const categoryNameInput = document.getElementById('category-name');
        const categorySlugInput = document.getElementById('category-slug');
        if (categoryNameInput && categorySlugInput) {
            categoryNameInput.addEventListener('input', () => {
                if (!this.editingCategory) { // Gerar slug apenas ao adicionar, não ao editar
                    categorySlugInput.value = this.generateSlug(categoryNameInput.value);
                }
            });
        }

        // Listener para o input de arquivo de imagem
        const productImageInput = document.getElementById('product-image');
        if (productImageInput) {
            productImageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    /**
     * Gera um slug a partir de uma string.
     * @param {string} text - O texto para gerar o slug.
     * @returns {string} O slug gerado.
     */
    generateSlug(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Substitui espaços por hífens
            .replace(/[^\w\-]+/g, '')       // Remove caracteres não-palavra
            .replace(/\-\-+/g, '-')         // Substitui múltiplos hífens por um único
            .replace(/^-+/, '')             // Remove hífens do início
            .replace(/\-$/, '');            // Remove hífens do fim
    }

    /**
     * Renderiza a tabela de categorias
     */
    renderCategoriesTable() {
        const tableContainer = document.getElementById('categories-table');
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
                    ${this.currentCategories.map(category => this.renderCategoryRow(category)).join('')}
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
        document.querySelectorAll('.btn-edit-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.categoryId;
                this.editCategory(categoryId);
            });
        });

        document.querySelectorAll('.btn-delete-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.categoryId;
                this.deleteCategory(categoryId);
            });
        });
    }

    /**
     * Mostra o modal de categoria
     */
    showCategoryModal(category = null) {
        const modal = document.getElementById('category-modal');
        if (!modal) return;

        this.editingCategory = category;

        const form = document.getElementById('category-form');
        if (form) {
            form.reset();
        }

        if (category) {
            document.getElementById('category-name').value = category.nome || '';
            document.getElementById('category-slug').value = category.slug || '';
            document.querySelector('#category-modal .modal-title').textContent = 'Editar Categoria';
        } else {
            document.querySelector('#category-modal .modal-title').textContent = 'Adicionar Categoria';
        }

        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    /**
     * Esconde o modal de categoria
     */
    hideCategoryModal() {
        const modal = document.getElementById('category-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
        this.editingCategory = null;
    }

    /**
     * Manipula o envio do formulário de categoria
     */
    async handleCategorySubmit(event) {
        event.preventDefault();

        const categoryName = document.getElementById('category-name').value.trim();
        let categorySlug = document.getElementById('category-slug').value.trim();

        if (!categoryName) {
            window.authSystem.showMessage('O nome da categoria é obrigatório.', 'error');
            return;
        }

        if (!categorySlug) {
            categorySlug = this.generateSlug(categoryName);
        }

        const categoryData = { nome: categoryName, slug: categorySlug };

        try {
            let response;
            if (this.editingCategory) {
                response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/categorias/${this.editingCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoryData),
                });
            } else {
                response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/categorias`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(categoryData),
                });
            }

            if (response && response.status === 'success') {
                window.authSystem.showMessage(
                    this.editingCategory ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!',
                    'success'
                );
                this.hideCategoryModal();
                await this.loadCategories(); // Recarregar categorias para atualizar a tabela e selects
            } else {
                window.authSystem.showMessage(response.message || 'Erro ao salvar categoria.', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            window.authSystem.showMessage('Erro de conexão ao salvar categoria.', 'error');
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
        if (!confirm('Tem certeza que deseja deletar esta categoria? Isso pode afetar produtos associados.')) {
            return;
        }
        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/categorias/${categoryId}`, {
                method: 'DELETE',
            });

            if (response && response.status === 'success') {
                window.authSystem.showMessage('Categoria deletada com sucesso!', 'success');
                await this.loadCategories();
            } else {
                window.authSystem.showMessage(response.message || 'Erro ao deletar categoria.', 'error');
            }
        } catch (error) {
            console.error('Erro ao deletar categoria:', error);
            window.authSystem.showMessage('Erro de conexão ao deletar categoria.', 'error');
        }
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
        this.removeImage(); // Limpar preview de imagem

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
            document.getElementById('product-specs').value = product.especificacoes ? JSON.stringify(product.especificacoes, null, 2) : '';
            document.getElementById('product-featured').checked = product.destaque == 1;

            if (product.imagem_principal) {
                document.getElementById('product-image-url').value = product.imagem_principal;
                this.showImagePreview(product.imagem_principal);
            }

            document.querySelector('#product-modal .modal-title').textContent = 'Editar Produto';
        } else {
            document.querySelector('#product-modal .modal-title').textContent = 'Adicionar Produto';
        }

        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    /**
     * Esconde o modal de produto
     */
    hideProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
        this.editingProduct = null;
        this.removeImage(); // Limpar preview de imagem ao fechar
    }

    /**
     * Manipula o envio do formulário de produto
     */
    async handleProductSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        
        // Adicionar imagem principal se for uma URL e não um arquivo novo
        const imageUrl = document.getElementById('product-image-url').value;
        if (imageUrl && !formData.get('imagem')) {
            formData.append('imagem_principal', imageUrl);
        }

        // Converter especificações para JSON string se não estiver vazio
        const specs = formData.get('especificacoes');
        if (specs) {
            try {
                JSON.parse(specs);
            } catch (e) {
                window.authSystem.showMessage('Especificações devem ser um JSON válido.', 'error');
                return;
            }
        }

        try {
            let response;
            
            if (this.editingProduct) {
                // Atualizar produto existente
                response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/produtos/${this.editingProduct.id}`, {
                    method: 'PUT',
                    body: formData,
                    // Headers Content-Type não é necessário para FormData, o navegador define
                });
            } else {
                // Criar novo produto
                response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/produtos`, {
                    method: 'POST',
                    body: formData,
                });
            }

            if (response && response.status === 'success') {
                window.authSystem.showMessage(
                    this.editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!',
                    'success'
                );
                this.hideProductModal();
                await this.loadProducts();
                await this.loadDashboardData();
            } else {
                window.authSystem.showMessage(response.message || 'Erro ao salvar produto', 'error');
            }

        } catch (error) {
            console.error('❌ Erro ao salvar produto:', error);
            window.authSystem.showMessage('Erro de conexão ao salvar produto', 'error');
        }
    }

    /**
     * Edita um produto
     */
    async editProduct(productId) {
        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/produtos/${productId}`);
            
            if (response && response.status === 'success') {
                this.showProductModal(response.product);
            } else {
                window.authSystem.showMessage(response.message || 'Produto não encontrado', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar produto:', error);
            window.authSystem.showMessage('Erro de conexão ao carregar produto', 'error');
        }
    }

    /**
     * Deleta um produto (soft delete)
     */
    async deleteProduct(productId) {
        const product = this.currentProducts.find(p => p.id == productId);
        
        if (!confirm(`Tem certeza que deseja remover o produto "${product?.nome}"?`)) {
            return;
        }

        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/produtos/${productId}`, {
                method: 'DELETE'
            });

            if (response && response.status === 'success') {
                window.authSystem.showMessage('Produto removido com sucesso!', 'success');
                await this.loadProducts();
                await this.loadDashboardData();
            } else {
                window.authSystem.showMessage(response.message || 'Erro ao remover produto', 'error');
            }

        } catch (error) {
            console.error('❌ Erro ao remover produto:', error);
            window.authSystem.showMessage('Erro de conexão ao remover produto', 'error');
        }
    }

    /**
     * Manipula o upload de imagem
     */
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            window.authSystem.showMessage('Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP', 'error');
            return;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            window.authSystem.showMessage('Arquivo muito grande. Tamanho máximo: 5MB', 'error');
            return;
        }

        // Criar FormData para enviar o arquivo
        const formData = new FormData();
        formData.append('imagem', file);

        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/upload-image`, {
                method: 'POST',
                body: formData,
                // Content-Type não é definido aqui para FormData, o navegador faz isso automaticamente
            });

            if (response && response.status === 'success') {
                this.currentImageUrl = response.url;
                this.showImagePreview(response.url);
                document.getElementById('product-image-url').value = response.url;
                window.authSystem.showMessage('Imagem enviada com sucesso!', 'success');
            } else {
                throw new Error(response.message || 'Erro ao enviar imagem');
            }
        } catch (error) {
            console.error('Erro no upload: ', error);
            window.authSystem.showMessage(error.message, 'error');
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
            preview.style.display = 'flex';
        }
    }

    /**
     * Remove a imagem selecionada
     */
    removeImage() {
        this.currentImageUrl = null;
        document.getElementById('product-image-url').value = '';
        document.getElementById('preview-img').src = '';
        document.getElementById('image-preview').style.display = 'none';
        document.getElementById('product-image').value = ''; // Limpar o input file também
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
        
        galleryGrid.innerHTML = `<div class="loading-state"><i class="fas fa-spinner"></i><p>Carregando imagens...</p></div>`;

        try {
            const response = await window.authSystem.authenticatedRequest(`${this.apiBaseUrl}/images`);
            
            if (response && response.status === 'success' && response.images.length > 0) {
                galleryGrid.innerHTML = '';
                
                response.images.forEach(image => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.innerHTML = `
                        <img src="${image.url}" alt="${image.name}">
                        <div class="gallery-item-overlay">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    `;
                    item.addEventListener('click', () => this.selectImageFromGallery(image.url));
                    galleryGrid.appendChild(item);
                });
            } else if (response && response.status === 'success' && response.images.length === 0) {
                galleryGrid.innerHTML = `
                    <div class="gallery-empty">
                        <i class="fas fa-images"></i>
                        <p>Nenhuma imagem encontrada</p>
                        <p style="font-size: 0.9rem; color: #999;">Faça upload de imagens para começar</p>
                    </div>
                `;
            } else {
                throw new Error(response.message || 'Erro ao carregar imagens da galeria.');
            }
        } catch (error) {
            console.error('Erro ao carregar galeria: ', error);
            galleryGrid.innerHTML = `
                <div class="gallery-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar galeria</p>
                </div>
            `;
            window.authSystem.showMessage('Erro de conexão ao carregar galeria de imagens.', 'error');
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
        window.authSystem.showMessage('Imagem selecionada!', 'success');
    }

    /**
     * Configura listeners da tabela de produtos
     */
    setupProductTableListeners() {
        // Botões editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this.editProduct(productId);
            });
        });

        // Botões deletar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.productId;
                this.deleteProduct(productId);
            });
        });
    }
}

// Instanciar a API do painel administrativo globalmente
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
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .stat-icon {
                font-size: 2.5rem;
                color: #7c3aed;
            }
            .stat-info h3 {
                margin: 0;
                font-size: 1.8rem;
                color: #333;
            }
            .stat-info p {
                margin: 0;
                color: #666;
                font-size: 0.9rem;
            }
            .recent-products-list, .recent-sales-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 15px;
            }
            .recent-product-item, .sale-item {
                background-color: #fff;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .recent-product-item img, .sale-item img {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 4px;
            }
            .product-info h4, .sale-info h4 {
                margin: 0 0 5px 0;
                font-size: 1rem;
                color: #333;
            }
            .product-info p, .sale-info p {
                margin: 0;
                font-size: 0.85rem;
                color: #666;
            }
            .admin-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            .admin-table th, .admin-table td {
                border: 1px solid #eee;
                padding: 12px 15px;
                text-align: left;
            }
            .admin-table th {
                background-color: #f8f8f8;
                font-weight: 600;
                color: #333;
            }
            .admin-table tbody tr:nth-child(even) {
                background-color: #fdfdfd;
            }
            .admin-table tbody tr:hover {
                background-color: #f5f5f5;
            }
            .product-thumb {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 4px;
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
                justify-content: center;
                align-items: center;
            }
            .modal.show {
                display: flex;
            }
            .modal-content {
                background-color: white;
                margin: auto;
                padding: 0;
                border-radius: 8px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
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
            .image-upload-container {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .image-upload-container input[type="text"] {
                flex-grow: 1;
            }
            .image-preview {
                margin-top: 10px;
                border: 1px solid #eee;
                padding: 10px;
                border-radius: 4px;
                display: none; /* Hidden by default */
                align-items: center;
                gap: 10px;
                position: relative;
            }
            .image-preview img {
                max-width: 100px;
                max-height: 100px;
                object-fit: contain;
            }
            .btn-remove-image {
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                font-size: 0.8rem;
                position: absolute;
                top: 5px;
                right: 5px;
            }
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 10px;
                max-height: 400px;
                overflow-y: auto;
                padding: 10px;
                border: 1px solid #eee;
                border-radius: 4px;
            }
            .gallery-item {
                border: 2px solid transparent;
                border-radius: 4px;
                overflow: hidden;
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease-in-out;
            }
            .gallery-item img {
                width: 100%;
                height: 100px;
                object-fit: cover;
                display: block;
            }
            .gallery-item:hover {
                border-color: #7c3aed;
            }
            .gallery-item.selected {
                border-color: #28a745;
                box-shadow: 0 0 0 2px #28a745;
            }
            .gallery-item-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                font-size: 2rem;
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            }
            .gallery-item.selected .gallery-item-overlay {
                opacity: 1;
            }
            .gallery-empty {
                text-align: center;
                padding: 20px;
                color: #999;
            }
            .gallery-empty i {
                font-size: 3rem;
                margin-bottom: 10px;
            }
            .loading-state {
                text-align: center;
                padding: 20px;
                color: #7c3aed;
            }
            .loading-state i {
                font-size: 2rem;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
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


