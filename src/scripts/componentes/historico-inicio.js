/**
 */

/**
 * Carrega histórico de produtos vistos do localStorage
 */
function carregarHistoricoHome() {
    const container = document.getElementById('historico-produtos-container');
    if (!container) return;
    
    // Obter histórico do localStorage
    const historico = JSON.parse(localStorage.getItem('produtosVistos') || '[]');
    
    if (historico.length === 0) {
        mostrarHistoricoVazio(container);
        return;
    }
    
    // Limitar a 6 produtos mais recentes
    const produtosRecentes = historico.slice(0, 6);
    
    // Renderizar produtos
    renderizarHistoricoProdutos(container, produtosRecentes);
}

/**
 * Mostra estado vazio do histórico
 */
function mostrarHistoricoVazio(container) {
    container.innerHTML = `
        <div class="historico-vazio">
            <div class="historico-vazio-icon">
                <i class="fas fa-eye-slash"></i>
            </div>
            <h3 class="historico-vazio-titulo">Nenhum produto visualizado ainda</h3>
            <p class="historico-vazio-descricao">
                Explore nossa loja e seus produtos visualizados aparecerão aqui!
            </p>
            <a href="produtos.html" class="historico-vazio-btn">
                <i class="fas fa-shopping-bag"></i> Explorar Produtos
            </a>
        </div>
    `;
}

/**
 * Renderiza produtos do histórico
 */
function renderizarHistoricoProdutos(container, produtos) {
    const grid = document.createElement('div');
    grid.className = 'historico-produtos-grid';
    
    produtos.forEach(produto => {
        const card = criarCardProduto(produto);
        grid.appendChild(card);
    });
    
    container.innerHTML = '';
    container.appendChild(grid);
}

/**
 * Cria card de produto
 */
function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.className = 'historico-produto-card';
    card.onclick = () => window.location.href = `pagina-produto.html?id=${produto.id}`;
    
    // Calcular tempo desde visualização
    const tempoVisto = calcularTempoVisto(produto.dataVisualizacao);
    
    card.innerHTML = `
        <div class="historico-produto-imagem-container">
            <img src="${produto.imagem || '../recursos/imagens/placeholder-product.png'}" 
                 alt="${produto.nome}" 
                 class="historico-produto-imagem"
                 onerror="this.src='../recursos/imagens/placeholder-product.png'">
            ${produto.promocao ? '<div class="historico-produto-badge">Promoção</div>' : ''}
        </div>
        <div class="historico-produto-info">
            <div class="historico-produto-categoria">${produto.categoria || 'Produto'}</div>
            <h4 class="historico-produto-nome">${produto.nome}</h4>
            <div class="historico-produto-preco">R$ ${formatarPreco(produto.preco)}</div>
            <div class="historico-produto-footer">
                <span class="historico-produto-visto">
                    <i class="fas fa-clock"></i>
                    ${tempoVisto}
                </span>
                <button class="historico-produto-btn" onclick="event.stopPropagation(); adicionarAoCarrinho(${produto.id})">
                    <i class="fas fa-cart-plus"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Formata preço
 */
function formatarPreco(preco) {
    return parseFloat(preco).toFixed(2).replace('.', ',');
}

/**
 * Calcula tempo desde visualização
 */
function calcularTempoVisto(dataVisualizacao) {
    if (!dataVisualizacao) return 'Recente';
    
    const agora = new Date();
    const data = new Date(dataVisualizacao);
    const diffMs = agora - data;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return 'Há mais de uma semana';
}



/**
 * Adicionar ao carrinho (placeholder)
 */
function adicionarAoCarrinho(produtoId) {
    if (typeof showNotification === 'function') {
        showNotification('Produto adicionado ao carrinho!', 'success');
    } else {
        alert('Produto adicionado ao carrinho!');
    }
}

// Carregar histórico ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarHistoricoHome();
});

// Exportar funções
window.carregarHistoricoHome = carregarHistoricoHome;

