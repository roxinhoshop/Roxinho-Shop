/**
 * Admin Panel - Gerenciamento de Produtos
 */

// Inicializar scraper
const scraper = new ProductScraper();
let currentPreviewData = null;

// ======================= TABS =======================
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remover active de todos
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Adicionar active no clicado
        button.classList.add('active');
        const tabId = 'tab-' + button.dataset.tab;
        document.getElementById(tabId).classList.add('active');

        // Atualizar conteúdo se necessário
        if (button.dataset.tab === 'products') {
            loadProducts();
        } else if (button.dataset.tab === 'stats') {
            loadStats();
        }
    });
});

// ======================= IMPORTAR PRODUTO =======================
document.getElementById('import-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('product-url').value.trim();
    const btnImport = document.querySelector('.btn-import');
    
    // Validar URL
    if (!url.includes('amazon') && !url.includes('mercado')) {
        mostrarNotificacao('URL inválida. Use Amazon ou Mercado Livre.', 'error');
        return;
    }

    // Loading
    btnImport.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...';
    btnImport.disabled = true;

    try {
        const productData = await scraper.scrapeProduct(url);
        currentPreviewData = productData;
        
        // Mostrar preview
        showPreview(productData);
        
        btnImport.innerHTML = '<i class="fas fa-magic"></i> Importar';
        btnImport.disabled = false;
        
        mostrarNotificacao('Produto carregado! Confira o preview abaixo.', 'success');
    } catch (error) {
        console.error(error);
        mostrarNotificacao('Erro ao importar produto: ' + error.message, 'error');
        
        btnImport.innerHTML = '<i class="fas fa-magic"></i> Importar';
        btnImport.disabled = false;
    }
});

// ======================= PREVIEW =======================
function showPreview(data) {
    document.getElementById('preview-img').src = data.image;
    document.getElementById('preview-name').textContent = data.name;
    document.getElementById('preview-price').textContent = `R$ ${data.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('preview-source').textContent = data.source;
    document.getElementById('preview-description').textContent = data.description;
    
    document.getElementById('product-preview').style.display = 'block';
    document.getElementById('product-preview').scrollIntoView({ behavior: 'smooth' });
}

// Confirmar importação
document.getElementById('btn-confirm-import').addEventListener('click', async () => {
    if (!currentPreviewData) return;

    try {
        // Preparar dados do produto para a API
        const produtoAPI = {
            nome: currentPreviewData.name,
            descricao: currentPreviewData.description,
            preco: currentPreviewData.price,
            imagem: currentPreviewData.image,
            categoria: 'eletronicos', // Categoria padrão, pode ser melhorado
            subcategoria: '',
            origem: currentPreviewData.source,
            link_original: currentPreviewData.url,
            estoque: 10 // Estoque padrão
        };

        // Usar função da API se disponível
        if (typeof criarProduto === 'function') {
            const id = await criarProduto(produtoAPI);
            
            if (id) {
                await alertaFluent('Sucesso!', 'Produto importado e salvo no banco de dados!', 'fas fa-check-circle');
                
                // Limpar formulário e preview
                document.getElementById('import-form').reset();
                document.getElementById('product-preview').style.display = 'none';
                currentPreviewData = null;

                // Mudar para aba de produtos
                document.querySelector('[data-tab="products"]').click();
            }
        } else {
            // Fallback para localStorage
            currentPreviewData.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            products.push(currentPreviewData);
            localStorage.setItem('products', JSON.stringify(products));

            mostrarNotificacao('Produto importado com sucesso!', 'success');
            
            // Limpar formulário e preview
            document.getElementById('import-form').reset();
            document.getElementById('product-preview').style.display = 'none';
            currentPreviewData = null;

            // Mudar para aba de produtos
            document.querySelector('[data-tab="products"]').click();
        }
    } catch (error) {
        mostrarNotificacao('Erro ao salvar produto: ' + error.message, 'error');
    }
});

// Cancelar importação
document.getElementById('btn-cancel-import').addEventListener('click', () => {
    document.getElementById('product-preview').style.display = 'none';
    currentPreviewData = null;
});

// ======================= LISTAR PRODUTOS =======================
async function loadProducts() {
    const container = document.getElementById('products-list');
    
    // Mostrar loading
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando produtos...</div>';
    
    try {
        let products = [];
        
        // Tentar carregar da API primeiro
        if (typeof listarProdutos === 'function') {
            products = await listarProdutos();
        } else {
            // Fallback para localStorage
            products = scraper.listProducts();
        }

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>Nenhum produto cadastrado</h3>
                    <p>Importe produtos usando a aba "Importar Produto"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const nome = product.nome || product.name;
            const preco = product.preco || product.price;
            const imagem = product.imagem || product.image;
            const categoria = product.categoria || product.category;
            const origem = product.origem || product.source || 'manual';
            
            return `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-image">
                        <img src="${imagem}" alt="${nome}">
                        <span class="product-source badge-${origem.toLowerCase().replace(' ', '-')}">
                            ${origem}
                        </span>
                    </div>
                    <div class="product-info">
                        <h4>${nome}</h4>
                        <p class="product-price">R$ ${parseFloat(preco).toFixed(2).replace('.', ',')}</p>
                        <p class="product-category"><i class="fas fa-tag"></i> ${categoria}</p>
                        <div class="product-actions">
                            <button class="btn-icon btn-edit" onclick="editProduct('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="deleteProduct('${product.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar produtos</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ======================= EDITAR PRODUTO =======================
function editProduct(productId) {
    const products = scraper.listProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return;

    // Preencher modal
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-description').value = product.description;
    document.getElementById('edit-image').value = product.image;

    // Mostrar modal
    document.getElementById('edit-modal').style.display = 'flex';
}

// Salvar edição
document.getElementById('edit-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const productId = document.getElementById('edit-product-id').value;
    const updatedData = {
        name: document.getElementById('edit-name').value,
        price: parseFloat(document.getElementById('edit-price').value),
        category: document.getElementById('edit-category').value,
        description: document.getElementById('edit-description').value,
        image: document.getElementById('edit-image').value
    };

    try {
        scraper.updateProduct(productId, updatedData);
        mostrarNotificacao('Produto atualizado com sucesso!', 'success');
        
        // Fechar modal e recarregar
        document.getElementById('edit-modal').style.display = 'none';
        loadProducts();
    } catch (error) {
        mostrarNotificacao('Erro ao atualizar produto: ' + error.message, 'error');
    }
});

// Fechar modal
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
});

document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
});

// ======================= DELETAR PRODUTO =======================
function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
        scraper.deleteProduct(productId);
        mostrarNotificacao('Produto excluído com sucesso!', 'success');
        loadProducts();
        loadStats();
    } catch (error) {
        mostrarNotificacao('Erro ao excluir produto: ' + error.message, 'error');
    }
}

// ======================= ESTATÍSTICAS =======================
function loadStats() {
    const products = scraper.listProducts();
    
    const total = products.length;
    const amazon = products.filter(p => p.source === 'amazon').length;
    const ml = products.filter(p => p.source === 'mercadolivre').length;
    
    const today = new Date().toDateString();
    const importedToday = products.filter(p => {
        const importDate = new Date(p.importedAt).toDateString();
        return importDate === today;
    }).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-amazon').textContent = amazon;
    document.getElementById('stat-ml').textContent = ml;
    document.getElementById('stat-today').textContent = importedToday;
}

// ======================= BUSCA =======================
document.getElementById('search-products').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        if (name.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// ======================= LOGOUT =======================
document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('usuario');
        window.location.href = '../paginas/entrar.html';
    }
});

// ======================= INICIALIZAÇÃO =======================
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação (comentado para permitir acesso direto)
    // const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    // if (!usuario.tipo || usuario.tipo !== 'admin') {
    //     window.location.href = '../paginas/entrar.html';
    //     return;
    // }

    // Carregar estatísticas iniciais
    loadStats();
});

// Tornar funções globais
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;

