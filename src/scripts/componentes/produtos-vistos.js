// ======================= PRODUTOS VISTOS =======================

// Carregar produtos vistos do localStorage
function carregarProdutosVistos() {
    const produtosVistos = JSON.parse(localStorage.getItem('produtosVistos') || '[]');
    const container = document.getElementById('historico-lista');
    
    if (!container) return;
    
    if (produtosVistos.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazio">
                <i class="fas fa-eye-slash"></i>
                <p>Você ainda não visualizou nenhum produto</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = produtosVistos.map(produto => `
        <div class="card-produto-visto">
            <div class="imagem-produto">
                <img src="${produto.imagem || '../recursos/imagens/default.png'}" alt="${produto.nome}">
            </div>
            <div class="info-produto">
                <h4>${produto.nome}</h4>
                <p class="preco">R$ ${produto.preco.toFixed(2)}</p>
                <p class="data-visualizacao">
                    <i class="fas fa-clock"></i> ${formatarData(produto.dataVisualizacao)}
                </p>
                <div class="acoes-produto">
                    <a href="${produto.link}" class="btn-ver-produto">
                        <i class="fas fa-eye"></i> Ver Produto
                    </a>
                    <button class="btn-remover-historico" onclick="removerProdutoVisto('${produto.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Formatar data
function formatarData(dataISO) {
    const data = new Date(dataISO);
    const agora = new Date();
    const diff = agora - data;
    
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    
    if (minutos < 1) return 'Agora mesmo';
    if (minutos < 60) return `Há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    if (horas < 24) return `Há ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias < 7) return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
    
    return data.toLocaleDateString('pt-BR');
}

// Adicionar produto visto (chamado ao visualizar um produto)
function adicionarProdutoVisto(produto) {
    let produtosVistos = JSON.parse(localStorage.getItem('produtosVistos') || '[]');
    
    // Remover se já existe
    produtosVistos = produtosVistos.filter(p => p.id !== produto.id);
    
    // Adicionar no início
    produtosVistos.unshift({
        ...produto,
        dataVisualizacao: new Date().toISOString()
    });
    
    // Manter apenas os últimos 20
    produtosVistos = produtosVistos.slice(0, 20);
    
    localStorage.setItem('produtosVistos', JSON.stringify(produtosVistos));
}

// Remover produto visto
function removerProdutoVisto(produtoId) {
    let produtosVistos = JSON.parse(localStorage.getItem('produtosVistos') || '[]');
    produtosVistos = produtosVistos.filter(p => p.id !== produtoId);
    localStorage.setItem('produtosVistos', JSON.stringify(produtosVistos));
    carregarProdutosVistos();
}

// Limpar todo o histórico
function limparHistorico() {
    if (confirm('Deseja realmente limpar todo o histórico de produtos vistos?')) {
        localStorage.removeItem('produtosVistos');
        carregarProdutosVistos();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutosVistos();
    
    // Botão limpar histórico
    const btnLimpar = document.getElementById('limpar-historico-btn');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparHistorico);
    }
});

// Tornar funções globais
window.adicionarProdutoVisto = adicionarProdutoVisto;
window.removerProdutoVisto = removerProdutoVisto;

