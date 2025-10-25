// ===== ROXINHO SHOP - HISTÓRICO DE VISUALIZAÇÃO =====
// Desenvolvido por Manus
// Gerencia o carregamento do histórico de produtos visualizados.

const API_BASE_URL = "/backend"; // Caminho relativo para a API no Vercel

class HistoricoManager {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        this.carregarHistorico();
    }

    async carregarHistorico() {
        const user = getLoggedInUser();
        const container = document.getElementById('historicoContainer');
        
        if (!user) {
            container.innerHTML = `
                <div class="estado-vazio">
                    <i class="fas fa-user-lock"></i>
                    <h3>Faça login para ver seu histórico</h3>
                    <p>Seu histórico de produtos visualizados aparecerá aqui após o login.</p>
                    <a href="login.html" class="btn-login">Fazer Login</a>
                </div>
            `;
            return;
        }

        try {
            // A API de histórico espera o user_id como parâmetro de query
            const response = await fetch(`${API_BASE_URL}/historico?user_id=${user.id}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar histórico');
            }
            const produtos = await response.json();
            this.renderizarHistorico(produtos, container);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            container.innerHTML = `
                <div class="estado-vazio">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar histórico</h3>
                    <p>Não foi possível carregar seu histórico. Tente novamente mais tarde.</p>
                </div>
            `;
        }
    }

    renderizarHistorico(produtos, container) {
        if (produtos.length === 0) {
            container.innerHTML = `
                <div class="estado-vazio">
                    <i class="fas fa-history"></i>
                    <h3>Seu histórico está vazio</h3>
                    <p>Comece a navegar pelos produtos para preenchê-lo.</p>
                    <a href="produtos.html" class="btn-login">Ver Produtos</a>
                </div>
            `;
            return;
        }

        container.innerHTML = produtos.map(produto => this.criarCardProduto(produto)).join('');
    }

    criarCardProduto(produto) {
        // Adaptação do card de produto para o novo formato de comparação de preços
        return `
            <div class="cartao-produto" data-produto-id="${produto.id}">
                <a href="paginaproduto.html?id=${produto.id}" class="cartao-link">
                    <div class="imagem-produto">
                        <img src="${produto.imagem_principal}" alt="${produto.nome}" class="imagem-produto-real">
                    </div>
                    
                    <div class="conteudo-produto">
                        <h3 class="nome-produto">${produto.nome}</h3>
                        
                        <div class="precos-comparacao">
                            <p>ML: <strong>R$ ${produto.preco_ml.toFixed(2).replace('.', ',')}</strong></p>
                            <p>Amazon: <strong>R$ ${produto.preco_amazon.toFixed(2).replace('.', ',')}</strong></p>
                        </div>
                        
                        <!-- Botões de Ação (Apenas links para ML/Amazon) -->
                        <div class="botoes-produto-home">
                            <a href="${produto.link_ml}" target="_blank" class="btn-comprar-direto ml">
                                <i class="fas fa-external-link-alt"></i>
                                Mercado Livre
                            </a>
                            <a href="${produto.link_amazon}" target="_blank" class="btn-comprar-direto amazon">
                                <i class="fas fa-external-link-alt"></i>
                                Amazon
                            </a>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Certifique-se de que a função getLoggedInUser está disponível (do auth.js)
    if (typeof getLoggedInUser === 'function') {
        window.historicoManager = new HistoricoManager();
    } else {
        console.error('Função getLoggedInUser não encontrada. Verifique se auth.js foi carregado.');
    }
});

