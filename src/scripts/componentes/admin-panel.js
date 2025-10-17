/**
 * Admin Panel - Versão Melhorada
 * Interface mais interativa e intuitiva
 */

// ======================= INICIALIZAÇÃO =======================
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeProductSearch();
    loadProducts(); // Carrega produtos inicialmente ao carregar a página de produtos
    initializeAddProductForm();
    loadCategoriesIntoSelectNew(); // Carrega as categorias ao iniciar o formulário de adição de produto.
});

// ======================= TABS =======================
function initializeTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Remover active de todos
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Adicionar active no clicado
            button.classList.add('active');
            const tabId = 'tab-' + button.dataset.tab;
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            // Carregar conteúdo específico
            if (button.dataset.tab === 'products') {
                loadProducts();
            } else if (button.dataset.tab === 'stats') {
                loadStats();
            }
        });
    });
}

// ======================= PRODUTOS CADASTRADOS =======================
async function loadProducts() {
    const container = document.getElementById('products-list');
    
    if (!container) {
        console.error('Container products-list não encontrado');
        return;
    }
    
    // Loading
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando produtos...</div>';
    
    try {
        // Buscar produtos da API
        const response = await fetch(`${window.API_BASE_URL}/produtos`);
        const data = await response.json();
        
        let produtos = [];
        if ((data.success || data.status === 'success') && data.products) {
            produtos = data.products;
        } else {
            console.warn('Estrutura de resposta inesperada:', data);
        }
        
        renderProducts(produtos);
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Não foi possível carregar os produtos</p>
                <button onclick="loadProducts()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}

function renderProducts(produtos) {
    const container = document.getElementById('products-list');
    if (!container) return;
    
    if (!produtos || produtos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum produto cadastrado</h3>
                <p>Comece adicionando produtos</p>
                <button onclick="document.getElementById('btn-adicionar-produto').click()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Adicionar Primeiro Produto
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = produtos.map(produto => `
        <div class="product-card" data-id="${produto.id}">
            <div class="product-image">
                <img src="${produto.imagem_principal || produto.imagem || 'https://via.placeholder.com/200'}" 
                     alt="${produto.nome}" 
                     onerror="this.src='https://via.placeholder.com/200?text=Sem+Imagem'">
                ${produto.origem ? `<span class="badge badge-${produto.origem === 'Amazon' ? 'amazon' : 'ml'}">${produto.origem}</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${produto.nome}</h3>
                <p class="product-price">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</p>
                <p class="product-category"><i class="fas fa-tag"></i> ${produto.categoria || 'undefined'}</p>
                <div class="product-actions">
                    <button onclick="editProduct(${produto.id})" class="btn btn-sm btn-edit" title="Editar">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="deleteProduct(${produto.id}, '${produto.nome}')" class="btn btn-sm btn-delete" title="Excluir">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ======================= BUSCA DE PRODUTOS =======================
function initializeProductSearch() {
    const searchInput = document.getElementById('search-products');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        const response = await fetch(`${window.API_BASE_URL}/produtos`);
        const data = await response.json();
        let allProducts = [];
        if ((data.success || data.status === 'success') && data.products) {
            allProducts = data.products;
        }

        if (!query) {
            renderProducts(allProducts);
        } else {
            const filteredProducts = allProducts.filter(produto => 
                produto.nome.toLowerCase().includes(query) ||
                (produto.descricao && produto.descricao.toLowerCase().includes(query)) ||
                (produto.categoria && produto.categoria.toLowerCase().includes(query))
            );
            renderProducts(filteredProducts);
        }
    });
}

// ======================= EDITAR PRODUTO =======================
async function editProduct(id) {
    try {
        window.location.href = `editar-produto.html?id=${id}`;
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        await alertaFluent('Erro', 'Não foi possível editar o produto', 'fas fa-exclamation-triangle');
    }
}

// ======================= EXCLUIR PRODUTO =======================
async function deleteProduct(id, nome) {
    const confirmDelete = await confirmarFluent(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir "${nome}"?`,
        'Excluir',
        'Cancelar'
    );
    
    if (!confirmDelete) return;
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/produtos/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            loadProducts();
        } else {
            await alertaFluent('Erro', 'Não foi possível excluir o produto.', 'fas fa-exclamation-triangle');
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        await alertaFluent('Erro', 'Não foi possível excluir o produto.', 'fas fa-exclamation-triangle');
    }
}

// ======================= ESTATÍSTICAS =======================
async function loadStats() {
    const container = document.getElementById('tab-stats');
    if (!container) return;
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/produtos`);
        const data = await response.json();
        let produtos = [];
        if ((data.success || data.status === 'success') && data.products) {
            produtos = data.products;
        }
        
        const totalProdutos = produtos.length;
        const totalValor = produtos.reduce((sum, p) => sum + parseFloat(p.preco || 0), 0);
        
        const produtosAmazon = produtos.filter(p => 
            p.link_amazon || 
            (p.origem && p.origem.toLowerCase().includes('amazon'))
        ).length;
        
        const produtosMercadoLivre = produtos.filter(p => 
            p.link_mercado_livre || 
            (p.origem && p.origem.toLowerCase().includes('mercado'))
        ).length;
        
        const produtosManuais = produtos.filter(p => 
            !p.link_amazon && 
            !p.link_mercado_livre && 
            (!p.origem || p.origem.toLowerCase() === 'manual')
        ).length;
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-boxes"></i>
                    <h3>${totalProdutos}</h3>
                    <p>Total de Produtos</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-dollar-sign"></i>
                    <h3>R$ ${totalValor.toFixed(2).replace('.', ',')}</h3>
                    <p>Valor Total</p>
                </div>
                <div class="stat-card amazon-stat">
                    <i class="fab fa-amazon"></i>
                    <h3>${produtosAmazon}</h3>
                    <p>Produtos da Amazon</p>
                </div>
                <div class="stat-card ml-stat">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>${produtosMercadoLivre}</h3>
                    <p>Produtos do Mercado Livre</p>
                </div>
                <div class="stat-card manual-stat">
                    <i class="fas fa-edit"></i>
                    <h3>${produtosManuais}</h3>
                    <p>Produtos Manuais</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        container.innerHTML = '<p class="error-message">Erro ao carregar estatísticas</p>';
    }
}

// ======================= ADICIONAR PRODUTO (FORMULÁRIO) =======================
async function loadCategoriesIntoSelect() {
    const select = document.getElementById(\'categoria-produto\');
    if (!select) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/categorias/all`);
        const data = await response.json();
        if (data.status === \'success\' && data.categories) {
            select.innerHTML = \'<option value=\"\">Selecione uma categoria</option>\';
            data.categories.forEach(categoria => {
                select.innerHTML += `<option value="${categoria.id}">${categoria.nome}</option>`;
            });
        } else {
            console.error(\'Erro ao carregar categorias:\', data.message);
        }
    } catch (error) {
        console.error(\'Erro ao carregar categorias:\', error);
    }
}


function initializeAddProductForm() {
    const formAdicionarProduto = document.getElementById('add-product-form');
    
            // Carregar categorias no select
            loadCategoriesIntoSelectNew();

            // Event listener para carregar subcategorias quando a categoria principal muda
            document.getElementById(\'product-category\').addEventListener(\'change\', loadSubcategoriesIntoSelect);

    if (formAdicionarProduto) {
        formAdicionarProduto.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const produto = {
                nome: document.getElementById('product-name').value,
                descricao_longa: document.getElementById('product-description').value,
                descricao: document.getElementById('product-description').value.substring(0, 255),
                valor_mercado_livre: parseFloat(document.getElementById('product-price-ml').value),
                valor_amazon: parseFloat(document.getElementById('product-price-amazon').value),
                preco: parseFloat(document.getElementById('product-price-ml').value),
                    categoria_id: parseInt(document.getElementById(\'product-category\').value),
                    subcategoria_id: document.getElementById(\'product-subcategory\').value ? parseInt(document.getElementById(\'product-subcategory\').value) : null,
                    imagem_principal: document.getElementById(\'product-image-url\').value,     origem: 'Manual',
                ativo: 1,
                estoque: 10
            };

            try {
                const response = await fetch(`${window.API_BASE_URL}/produtos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(produto)
                });

                const result = await response.json();

                if (result.success || result.status === 'success') {
                    if (typeof alertaFluent === 'function') {
                        await alertaFluent('Sucesso!', 'Produto adicionado com sucesso!', 'fas fa-check-circle');
                    } else {
                        alert('Produto adicionado com sucesso!');
                    }
                    formAdicionarProduto.reset();
                    loadProducts();
                } else {
                    if (typeof alertaFluent === 'function') {
                        await alertaFluent('Erro', result.message || 'Não foi possível adicionar o produto.', 'fas fa-exclamation-triangle');
                    } else {
                        alert('Erro: ' + (result.message || 'Não foi possível adicionar o produto.'));
                    }
                }
            } catch (error) {
                console.error('Erro ao adicionar produto:', error);
                if (typeof alertaFluent === 'function') {
                    await alertaFluent('Erro', 'Não foi possível adicionar o produto.', 'fas fa-exclamation-triangle');
                } else {
                    alert('Erro: Não foi possível adicionar o produto.');
                }
            }
        });
    }
}

async function loadCategoriesIntoSelectNew() {
    const select = document.getElementById(\'product-category\');
    if (!select) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/categorias`);
        const data = await response.json();
        if (data.success || data.status === \'success\') {
            select.innerHTML = \'<option value="">Selecione uma categoria</option>\';
            const categories = data.categories || [];
            categories.forEach(categoria => {
                select.innerHTML += `<option value="${categoria.id}">${categoria.nome}</option>`;
            });
        }
    } catch (error) {
        console.error(\'Erro ao carregar categorias:\', error);
    }
}

async function loadSubcategoriesIntoSelect() {
    const categorySelect = document.getElementById(\'product-category\');
    const subcategorySelect = document.getElementById(\'product-subcategory\');
    if (!categorySelect || !subcategorySelect) return;

    const categoryId = categorySelect.value;
    subcategorySelect.innerHTML = \'<option value="">Selecione uma subcategoria (opcional)</option>\';
    subcategorySelect.disabled = true;

    if (categoryId) {
        try {
            const response = await fetch(`${window.API_BASE_URL}/categorias/${categoryId}`);
            const data = await response.json();
            if (data.status === \'success\' && data.subcategorias) {
                if (data.subcategorias.length > 0) {
                    data.subcategorias.forEach(subcategoria => {
                        subcategorySelect.innerHTML += `<option value="${subcategoria.id}">${subcategoria.nome}</option>`;
                    });
                    subcategorySelect.disabled = false;
                }
            }
        } catch (error) {
            console.error(\'Erro ao carregar subcategorias:\', error);
        }
    }
}

async function loadCategoriesIntoSelect() {
    const select = document.getElementById('categoria-produto');
    if (!select) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/categorias`);
        const data = await response.json();
        if (data.success) {
            select.innerHTML = '<option value="">Selecione uma categoria</option>';
            data.categories.forEach(categoria => {
                select.innerHTML += `<option value="${categoria.nome}">${categoria.nome}</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Tornar funções globais
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadProducts = loadProducts;
