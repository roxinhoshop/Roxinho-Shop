/**
 * Admin Panel - Versão Melhorada
 * Interface mais interativa e intuitiva
 */

// Estado global
let currentPreviewData = null;
let allProducts = [];
let filteredProducts = [];

// ======================= INICIALIZAÇÃO =======================
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeImportForm();
    initializeProductSearch();
    
    // Carregar produtos ao abrir a aba
    const productsTab = document.querySelector('[data-tab="products"]');
    if (productsTab) {
        productsTab.addEventListener('click', loadProducts);
    }
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

// ======================= IMPORTAR PRODUTO =======================
function initializeImportForm() {
    const form = document.getElementById('import-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await importProduct();
    });
    
    // Confirmar importação
    const btnConfirm = document.getElementById('btn-confirm-import');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', confirmImport);
    }
    
    // Cancelar importação
    const btnCancel = document.getElementById('btn-cancel-import');
    if (btnCancel) {
        btnCancel.addEventListener('click', cancelImport);
    }
}

async function importProduct() {
    const urlInput = document.getElementById('product-url');
    const btnImport = document.querySelector('.btn-import');
    
    if (!urlInput || !btnImport) return;
    
    const url = urlInput.value.trim();
    
    // Validar URL
    if (!url) {
        await alertaFluent('Atenção', 'Por favor, cole o link do produto', 'fas fa-exclamation-triangle');
        return;
    }
    
    if (!url.includes('amazon') && !url.includes('mercado')) {
        await alertaFluent('URL Inválida', 'Use links da Amazon ou Mercado Livre', 'fas fa-exclamation-triangle');
        return;
    }
    
    // Loading
    const originalHTML = btnImport.innerHTML;
    btnImport.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...';
    btnImport.disabled = true;
    
    try {
        // Criar instância do scraper
        const scraper = new ProductScraper();
        
        // Importar produto (faz scraping e salva no MySQL)
        const produto = await scraper.importProduct(url);
        
        // Sucesso!
        await alertaFluent('Sucesso!', `Produto "${produto.nome}" importado com sucesso!`, 'fas fa-check-circle');
        
        // Limpar campo
        urlInput.value = '';
        
        // Recarregar lista de produtos
        loadProducts();
        
        btnImport.innerHTML = originalHTML;
        btnImport.disabled = false;
    } catch (error) {
        console.error('Erro ao importar:', error);
        await alertaFluent('Erro', error.message || 'Não foi possível importar o produto', 'fas fa-exclamation-triangle');
        
        btnImport.innerHTML = originalHTML;
        btnImport.disabled = false;
    }
}

async function confirmImport() {
    if (!currentPreviewData) return;
    
    try {
        const produto = {
            nome: currentPreviewData.name,
            descricao: currentPreviewData.description,
            preco: currentPreviewData.price,
            imagem: currentPreviewData.image,
            categoria: 'eletronicos',
            subcategoria: '',
            origem: currentPreviewData.source,
            link_original: currentPreviewData.url,
            estoque: 10
        };
        
        if (typeof criarProduto === 'function') {
            await criarProduto(produto);
            await alertaFluent('Sucesso!', 'Produto importado com sucesso!', 'fas fa-check-circle');
            
            // Limpar preview
            cancelImport();
            
            // Recarregar lista de produtos
            loadProducts();
        }
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        await alertaFluent('Erro', 'Não foi possível salvar o produto', 'fas fa-exclamation-triangle');
    }
}

function cancelImport() {
    currentPreviewData = null;
    const preview = document.getElementById('product-preview');
    if (preview) {
        preview.style.display = 'none';
    }
    const urlInput = document.getElementById('product-url');
    if (urlInput) {
        urlInput.value = '';
    }
}

// ======================= PRODUTOS CADASTRADOS =======================
async function loadProducts() {
    const container = document.getElementById('products-grid');
    const searchInput = document.getElementById('search-products');
    
    if (!container) return;
    
    // Loading
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando produtos...</div>';
    
    try {
        let produtos = [];
        
        if (typeof listarProdutos === 'function') {
            produtos = await listarProdutos({});
        }
        
        allProducts = produtos;
        filteredProducts = produtos;
        
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
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    if (!produtos || produtos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum produto cadastrado</h3>
                <p>Comece importando produtos da Amazon ou Mercado Livre</p>
                <button onclick="document.querySelector('[data-tab=\\'import\\']').click()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Importar Primeiro Produto
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
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            filteredProducts = allProducts;
        } else {
            filteredProducts = allProducts.filter(produto => 
                produto.nome.toLowerCase().includes(query) ||
                (produto.descricao && produto.descricao.toLowerCase().includes(query)) ||
                (produto.categoria && produto.categoria.toLowerCase().includes(query))
            );
        }
        
        renderProducts(filteredProducts);
    });
}

// ======================= EDITAR PRODUTO =======================
async function editProduct(id) {
    await alertaFluent('Em Desenvolvimento', 'A edição de produtos será implementada em breve', 'fas fa-info-circle');
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
        if (typeof excluirProduto === 'function') {
            await excluirProduto(id);
            await alertaFluent('Sucesso!', 'Produto excluído com sucesso', 'fas fa-check-circle');
            loadProducts();
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        await alertaFluent('Erro', 'Não foi possível excluir o produto', 'fas fa-exclamation-triangle');
    }
}

// ======================= ESTATÍSTICAS =======================
async function loadStats() {
    const container = document.getElementById('tab-stats');
    if (!container) return;
    
    try {
        let produtos = [];
        
        if (typeof listarProdutos === 'function') {
            produtos = await listarProdutos({});
        }
        
        const totalProdutos = produtos.length;
        const totalValor = produtos.reduce((sum, p) => sum + parseFloat(p.preco || 0), 0);
        const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <i class="fas fa-boxes"></i>
                    <h3>${totalProdutos}</h3>
                    <p>Produtos Cadastrados</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-dollar-sign"></i>
                    <h3>R$ ${totalValor.toFixed(2).replace('.', ',')}</h3>
                    <p>Valor Total em Estoque</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-tags"></i>
                    <h3>${categorias.length}</h3>
                    <p>Categorias Ativas</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        container.innerHTML = '<p class="error-message">Erro ao carregar estatísticas</p>';
    }
}

// Tornar funções globais
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadProducts = loadProducts;

console.log('✅ Admin Panel Melhorado carregado!');
