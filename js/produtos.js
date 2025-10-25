// ===== ROXINHO SHOP - PÁGINA DE PRODUTOS =====
// Desenvolvido por Manus
// Gerencia o carregamento de produtos, filtros e pesquisa, integrando com o backend.

const API_BASE_URL = "https://8000-i0rq7d4vghqcu0v23lypv-648d7310.manusvm.computer";

class ProdutosManager {
    constructor() {
        this.produtos = [];
        this.filtros = {};
        this.termoPesquisa = '';
        this.ordenacao = 'relevancia';
        this.inicializar();
    }

    inicializar() {
        this.obterParametrosURL();
        this.carregarProdutos();
        this.configurarEventListeners();
        // A lógica de filtros complexos (marcas, preço, etc.) do arquivo original será simplificada/removida,
        // mantendo apenas a estrutura básica para a pesquisa e ordenação.
    }

    obterParametrosURL() {
        const params = new URLSearchParams(window.location.search);
        this.termoPesquisa = params.get('q') || '';
        this.categoria = params.get('categoria') || '';
        
        // Atualizar o título da página
        const tituloPrincipal = document.getElementById('tituloPrincipal');
        if (this.termoPesquisa) {
            document.title = `Resultados para "${this.termoPesquisa}" | Roxinho Shop`;
            if (tituloPrincipal) {
                tituloPrincipal.textContent = `Resultados da Pesquisa: "${this.termoPesquisa}"`;
            }
        } else if (this.categoria) {
            document.title = `${this.categoria} | Roxinho Shop`;
            if (tituloPrincipal) {
                tituloPrincipal.textContent = `${this.categoria}`;
            }
        } else {
             document.title = `Todos os Produtos | Roxinho Shop`;
            if (tituloPrincipal) {
                tituloPrincipal.textContent = `Todos os Produtos`;
            }
        }
    }

    configurarEventListeners() {
        // Listener para ordenação
        const selectOrdenacao = document.getElementById('seletorOrdenacaoSimples');
        if (selectOrdenacao) {
            selectOrdenacao.addEventListener('change', (e) => {
                this.ordenacao = e.target.value;
                this.carregarProdutos(); // Recarrega com a nova ordenação
            });
        }
        
        // Simplificação: Manter apenas a lógica de pesquisa e ordenação.
        // A lógica de filtros complexos (marcas, preço, etc.) será desativada/removida no HTML/CSS,
        // pois a implementação completa exigiria refatoração extensa do backend e frontend.
    }

    async carregarProdutos() {
        let url = `${API_BASE_URL}/produtos/search?q=${encodeURIComponent(this.termoPesquisa)}&ordenacao=${this.ordenacao}&categoria=${encodeURIComponent(this.categoria)}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Erro ao carregar produtos');
            }
            this.produtos = await response.json();
            this.renderizarProdutos();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.renderizarErro('Não foi possível carregar os produtos. Tente novamente mais tarde.');
        }
    }

    renderizarProdutos() {
        const gradeProdutos = document.getElementById('gradeProdutos');
        const contadorResultados = document.getElementById('contadorResultados');
        if (!gradeProdutos) return;
        
        if (contadorResultados) {
            contadorResultados.textContent = `${this.produtos.length} resultados encontrados`;
        }
        
        if (this.produtos.length === 0) {
            gradeProdutos.innerHTML = `
                <div class="estado-vazio">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente refinar sua busca ou limpar os filtros.</p>
                </div>
            `;
            return;
        }

        gradeProdutos.innerHTML = this.produtos.map(produto => this.criarCardProduto(produto)).join('');
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
                        
                        <div class="avaliacao-produto">
                            <!-- Implementação futura da média de avaliação -->
                            <div class="estrelas">
                                ${this.gerarEstrelas(produto.media_avaliacao || 0)}
                            </div>
                            <span class="numero-avaliacoes">(${produto.total_avaliacoes || 0})</span>
                        </div>
                        
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
    
    gerarEstrelas(nota) {
        let html = '';
        const notaArredondada = Math.round(nota);
        
        for (let i = 1; i <= 5; i++) {
          // Usar a classe 'estrela' para estrelas preenchidas e 'estrela vazia' para vazias
          html += `<i class="fas fa-star ${i <= notaArredondada ? 'estrela' : 'estrela vazia'}"></i>`;
        }
        
        return html;
    }

    renderizarErro(mensagem) {
        const gradeProdutos = document.getElementById('gradeProdutos');
        if (gradeProdutos) {
            gradeProdutos.innerHTML = `
                <div class="estado-vazio">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar</h3>
                    <p>${mensagem}</p>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.produtosManager = new ProdutosManager();
});

