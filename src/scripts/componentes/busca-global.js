// Sistema de Busca Global com Histórico e Sugestões

class SistemaBuscaGlobal {
    constructor() {
        this.campoBusca = document.getElementById('campo-busca-global');
        this.botaoBusca = document.getElementById('botao-busca-global');
        this.containerSugestoes = document.getElementById('sugestoes-busca');
        this.historicoMax = 10;
        this.debounceTimeout = null;
        
        this.inicializar();
    }
    
    inicializar() {
        if (!this.campoBusca) return;
        
        // Event listeners
        this.campoBusca.addEventListener('input', (e) => this.handleInput(e));
        this.campoBusca.addEventListener('focus', () => this.mostrarHistorico());
        this.campoBusca.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.realizarBusca();
            }
        });
        
        if (this.botaoBusca) {
            this.botaoBusca.addEventListener('click', () => this.realizarBusca());
        }
        
        // Fechar sugestões ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.campoBusca.contains(e.target) && !this.containerSugestoes.contains(e.target)) {
                this.ocultarSugestoes();
            }
        });
    }
    
    handleInput(e) {
        const termo = e.target.value.trim();
        
        clearTimeout(this.debounceTimeout);
        
        if (termo.length === 0) {
            this.mostrarHistorico();
            return;
        }
        
        if (termo.length < 2) {
            this.ocultarSugestoes();
            return;
        }
        
        // Debounce para não fazer muitas requisições
        this.debounceTimeout = setTimeout(() => {
            this.buscarSugestoes(termo);
        }, 300);
    }
    
    async buscarSugestoes(termo) {
        try {
            // Buscar produtos que correspondem ao termo
            const response = await fetch(`https://roxinho-shop-backend.vercel.app/api/products/search?q=${encodeURIComponent(termo)}`);
            const data = await response.json();
            
            if (data.status === 'success' && data.products && data.products.length > 0) {
                this.mostrarSugestoesProdutos(data.products.slice(0, 5), termo);
            } else {
                this.mostrarSemResultados(termo);
            }
        } catch (error) {
            console.error('Erro ao buscar sugestões:', error);
            this.ocultarSugestoes();
        }
    }
    
    mostrarSugestoesProdutos(produtos, termo) {
        if (!this.containerSugestoes) return;
        
        const html = `
            <div class="sugestoes-header">
                <span>Sugestões para "${termo}"</span>
            </div>
            <div class="sugestoes-lista">
                ${produtos.map(produto => `
                    <a href="pagina-produto.html?id=${produto.id}" class="sugestao-item">
                        <img src="${produto.imagem_principal || '../recursos/imagens/placeholder-product.png'}" 
                             alt="${produto.nome}"
                             onerror="this.src='../recursos/imagens/placeholder-product.png'">
                        <div class="sugestao-info">
                            <div class="sugestao-nome">${this.destacarTermo(produto.nome, termo)}</div>
                            <div class="sugestao-preco">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</div>
                        </div>
                    </a>
                `).join('')}
            </div>
            <div class="sugestoes-footer">
                <button onclick="sistemaBuscaGlobal.realizarBusca()">
                    Ver todos os resultados para "${termo}"
                </button>
            </div>
        `;
        
        this.containerSugestoes.innerHTML = html;
        this.containerSugestoes.style.display = 'block';
    }
    
    mostrarSemResultados(termo) {
        if (!this.containerSugestoes) return;
        
        const html = `
            <div class="sugestoes-vazio">
                <i class="fas fa-search"></i>
                <p>Nenhum resultado para "${termo}"</p>
                <small>Tente buscar por outro termo</small>
            </div>
        `;
        
        this.containerSugestoes.innerHTML = html;
        this.containerSugestoes.style.display = 'block';
    }
    
    mostrarHistorico() {
        const historico = this.obterHistorico();
        
        if (historico.length === 0) {
            this.ocultarSugestoes();
            return;
        }
        
        const html = `
            <div class="sugestoes-header">
                <span>Buscas Recentes</span>
                <button onclick="sistemaBuscaGlobal.limparHistorico()" class="btn-limpar-historico">
                    <i class="fas fa-trash"></i> Limpar
                </button>
            </div>
            <div class="sugestoes-lista">
                ${historico.map(termo => `
                    <div class="sugestao-item historico-item">
                        <i class="fas fa-clock-rotate-left"></i>
                        <span onclick="sistemaBuscaGlobal.buscarTermo('${termo}')">${termo}</span>
                        <button onclick="sistemaBuscaGlobal.removerDoHistorico('${termo}')" class="btn-remover">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.containerSugestoes.innerHTML = html;
        this.containerSugestoes.style.display = 'block';
    }
    
    destacarTermo(texto, termo) {
        const regex = new RegExp(`(${termo})`, 'gi');
        return texto.replace(regex, '<strong>$1</strong>');
    }
    
    realizarBusca() {
        const termo = this.campoBusca.value.trim();
        
        if (termo.length === 0) return;
        
        // Adicionar ao histórico
        this.adicionarAoHistorico(termo);
        
        // Redirecionar para página de produtos com busca
        window.location.href = `produtos.html?busca=${encodeURIComponent(termo)}`;
    }
    
    buscarTermo(termo) {
        this.campoBusca.value = termo;
        this.realizarBusca();
    }
    
    adicionarAoHistorico(termo) {
        let historico = this.obterHistorico();
        
        // Remover se já existe
        historico = historico.filter(t => t.toLowerCase() !== termo.toLowerCase());
        
        // Adicionar no início
        historico.unshift(termo);
        
        // Limitar tamanho
        historico = historico.slice(0, this.historicoMax);
        
        // Salvar
        localStorage.setItem('historicoBuscas', JSON.stringify(historico));
    }
    
    obterHistorico() {
        try {
            return JSON.parse(localStorage.getItem('historicoBuscas') || '[]');
        } catch {
            return [];
        }
    }
    
    removerDoHistorico(termo) {
        let historico = this.obterHistorico();
        historico = historico.filter(t => t !== termo);
        localStorage.setItem('historicoBuscas', JSON.stringify(historico));
        this.mostrarHistorico();
    }
    
    limparHistorico() {
        localStorage.removeItem('historicoBuscas');
        this.ocultarSugestoes();
    }
    
    ocultarSugestoes() {
        if (this.containerSugestoes) {
            this.containerSugestoes.style.display = 'none';
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaBuscaGlobal = new SistemaBuscaGlobal();
});

