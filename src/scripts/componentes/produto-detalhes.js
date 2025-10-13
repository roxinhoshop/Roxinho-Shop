/**
 * Sistema de Detalhes do Produto
 * Gerencia a exibição completa do produto com comparação de preços
 */

class ProdutoDetalhes {
    constructor() {
        this.apiBase = 'https://roxinho-shop-backend.vercel.app/api';
        this.produtoId = null;
        this.produto = null;
        this.imagens = [];
        this.init();
    }

    init() {
        // Pegar ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        this.produtoId = urlParams.get('id');

        if (!this.produtoId) {
            this.showError();
            return;
        }

        // Carregar produto
        this.loadProduto();
    }

    async loadProduto() {
        try {
            // Buscar dados do produto
            const response = await fetch(`${this.apiBase}/products/${this.produtoId}`);
            
            if (!response.ok) {
                throw new Error('Produto não encontrado');
            }

            const data = await response.json();
            this.produto = data.product;

            // Buscar imagens
            await this.loadImagens();

            // Renderizar produto
            this.renderProduto();

            // Ocultar loading e mostrar conteúdo
            document.getElementById('loading-produto').style.display = 'none';
            document.getElementById('produto-content').style.display = 'block';

        } catch (error) {
            this.showError();
        }
    }

    async loadImagens() {
        try {
            const response = await fetch(`${this.apiBase}/product-images/product/${this.produtoId}`);
            
            if (response.ok) {
                const data = await response.json();
                this.imagens = data.images || [];
            }

            // Se não houver imagens na tabela, usar galeria_imagens do produto
            if (this.imagens.length === 0 && this.produto.galeria_imagens) {
                try {
                    const galeriaArray = JSON.parse(this.produto.galeria_imagens);
                    this.imagens = galeriaArray.map((url, index) => ({
                        url: url,
                        tipo: index === 0 ? 'principal' : 'galeria',
                        ordem: index
                    }));
                } catch (e) {
                    // Se falhar, usar apenas imagem principal
                    if (this.produto.imagem_principal) {
                        this.imagens = [{
                            url: this.produto.imagem_principal,
                            tipo: 'principal',
                            ordem: 0
                        }];
                    }
                }
            }

            // Se ainda não houver imagens, usar placeholder
            if (this.imagens.length === 0) {
                this.imagens = [{
                    url: 'https://via.placeholder.com/400?text=Produto',
                    tipo: 'principal',
                    ordem: 0
                }];
            }

        } catch (error) {
            // Usar imagem principal como fallback
            this.imagens = [{
                url: this.produto.imagem_principal || 'https://via.placeholder.com/400?text=Produto',
                tipo: 'principal',
                ordem: 0
            }];
        }
    }

    renderProduto() {
        // Título e meta
        document.getElementById('produto-nome').textContent = this.produto.nome;
        document.getElementById('produto-sku').textContent = this.produto.sku || this.produto.id;
        document.title = `${this.produto.nome} - Roxinho Shop`;

        // Estoque
        const estoqueEl = document.getElementById('produto-estoque');
        if (this.produto.estoque > 0) {
            estoqueEl.textContent = `✓ Em estoque (${this.produto.estoque} unidades)`;
            estoqueEl.className = 'produto-estoque em-estoque';
        } else {
            estoqueEl.textContent = '✕ Fora de estoque';
            estoqueEl.className = 'produto-estoque sem-estoque';
        }

        // Descrição
        document.getElementById('produto-descricao-curta').textContent = 
            this.produto.descricao_curta || this.produto.descricao?.substring(0, 200) || 'Produto de qualidade';
        
        document.getElementById('produto-descricao').innerHTML = 
            this.formatarDescricao(this.produto.descricao || 'Descrição não disponível');

        // Galeria
        this.renderGaleria();

        // Comparação de preços
        this.renderComparacaoPrecos();

        // Botão de compra
        this.setupBotaoCompra();
    }

    renderGaleria() {
        // Imagem principal
        const imagemPrincipal = this.imagens[0];
        document.getElementById('imagem-principal').src = imagemPrincipal.url;
        document.getElementById('imagem-principal').alt = this.produto.nome;

        // Thumbnails
        const thumbnailsContainer = document.getElementById('galeria-thumbnails');
        thumbnailsContainer.innerHTML = '';

        this.imagens.forEach((imagem, index) => {
            const thumb = document.createElement('div');
            thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${imagem.url}" alt="${this.produto.nome}">`;
            
            thumb.addEventListener('click', () => {
                document.getElementById('imagem-principal').src = imagem.url;
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });

            thumbnailsContainer.appendChild(thumb);
        });
    }

    renderComparacaoPrecos() {
        const precosGrid = document.getElementById('precos-grid');
        const melhorPrecoDiv = document.getElementById('melhor-preco');
        
        const precos = [];

        // Roxinho Shop (preço principal)
        if (this.produto.preco) {
            precos.push({
                plataforma: 'Roxinho Shop',
                logo: '🛍️',
                valor: parseFloat(this.produto.preco),
                link: null // Compra interna
            });
        }

        // Amazon
        if (this.produto.link_amazon && this.produto.preco_amazon) {
            precos.push({
                plataforma: 'Amazon',
                logo: '📦',
                valor: parseFloat(this.produto.preco_amazon),
                link: this.produto.link_amazon
            });
        }

        // Mercado Livre
        if (this.produto.link_mercado_livre && this.produto.preco_mercado_livre) {
            precos.push({
                plataforma: 'Mercado Livre',
                logo: '🛒',
                valor: parseFloat(this.produto.preco_mercado_livre),
                link: this.produto.link_mercado_livre
            });
        }

        // Ordenar por preço
        precos.sort((a, b) => a.valor - b.valor);

        // Renderizar preços
        precosGrid.innerHTML = '';
        precos.forEach((preco, index) => {
            const precoItem = document.createElement('div');
            precoItem.className = 'preco-item';
            precoItem.innerHTML = `
                <div class="preco-plataforma">
                    <div class="plataforma-logo">${preco.logo}</div>
                    <span class="plataforma-nome">${preco.plataforma}</span>
                </div>
                <div class="preco-valor">R$ ${preco.valor.toFixed(2)}</div>
                ${preco.link ? 
                    `<a href="${preco.link}" target="_blank" class="preco-link">Ver Oferta</a>` :
                    `<button class="preco-link" onclick="window.produtoDetalhes.comprarRoxinho()">Comprar</button>`
                }
            `;
            precosGrid.appendChild(precoItem);
        });

        // Mostrar melhor preço
        if (precos.length > 1) {
            const melhorPreco = precos[0];
            const maiorPreco = precos[precos.length - 1];
            const economia = maiorPreco.valor - melhorPreco.valor;

            melhorPrecoDiv.innerHTML = `
                <div class="melhor-preco-badge">✨ Melhor Oferta</div>
                <div class="melhor-preco-info">
                    ${melhorPreco.plataforma} - R$ ${melhorPreco.valor.toFixed(2)}
                </div>
                <div class="economia">
                    Economize R$ ${economia.toFixed(2)} comprando aqui!
                </div>
            `;
        } else {
            melhorPrecoDiv.style.display = 'none';
        }
    }

    formatarDescricao(descricao) {
        // Converter quebras de linha em parágrafos
        return descricao
            .split('\n')
            .filter(p => p.trim())
            .map(p => `<p>${p.trim()}</p>`)
            .join('');
    }

    setupBotaoCompra() {
        const btnComprar = document.getElementById('btn-comprar-roxinho');
        btnComprar.addEventListener('click', () => this.comprarRoxinho());
    }

    comprarRoxinho() {
        // Verificar se está logado
        const token = localStorage.getItem('token');
        if (!token) {
            if (window.modalManager) {
                window.modalManager.showWarning(
                    'Login Necessário',
                    'Você precisa estar logado para comprar produtos.',
                    null,
                    () => {
                        window.location.href = 'entrar.html?redirect=' + encodeURIComponent(window.location.href);
                    }
                );
            } else {
                alert('Você precisa estar logado para comprar');
                window.location.href = 'entrar.html';
            }
            return;
        }

        // Verificar estoque
        if (this.produto.estoque <= 0) {
            if (window.modalManager) {
                window.modalManager.showError(
                    'Produto Indisponível',
                    'Este produto está fora de estoque no momento.'
                );
            } else {
                alert('Produto fora de estoque');
            }
            return;
        }

        // Adicionar ao carrinho (implementar depois)
        if (window.modalManager) {
            window.modalManager.showSuccess(
                'Adicionado ao Carrinho!',
                `${this.produto.nome} foi adicionado ao seu carrinho.`,
                {
                    'Produto': this.produto.nome,
                    'Preço': `R$ ${this.produto.preco}`,
                    'Quantidade': '1'
                }
            );
        } else {
            alert('Produto adicionado ao carrinho!');
        }
    }

    showError() {
        document.getElementById('loading-produto').style.display = 'none';
        document.getElementById('produto-erro').style.display = 'block';
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.produtoDetalhes = new ProdutoDetalhes();
    });
} else {
    window.produtoDetalhes = new ProdutoDetalhes();
}

