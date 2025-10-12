/**
 * @file price-comparison.js
 * @description Sistema de comparação de preços entre Roxinho Shop, Mercado Livre e Amazon
 * @author Roxinho Shop Dev Team
 */

class PriceComparison {
    constructor() {
        this.stores = {
            roxinho: { name: 'Roxinho Shop', color: '#8b5cf6', icon: '🛒' },
            mercadoLivre: { name: 'Mercado Livre', color: '#FFE600', icon: '📦' },
            amazon: { name: 'Amazon', color: '#FF9900', icon: '📦' }
        };
    }

    /**
     * Gera o HTML do componente de comparação de preços
     * @param {Object} product - Objeto do produto com informações de preços
     * @returns {string} HTML do componente
     */
    generateComparisonHTML(product) {
        const prices = this.getPrices(product);
        
        if (prices.length === 0) {
            return ''; // Não exibir nada se não houver preços para comparar
        }

        // Ordenar preços do menor para o maior
        prices.sort((a, b) => a.price - b.price);

        let html = `
            <div class="price-comparison-container">
                <h3 class="comparison-title">
                    <i class="fas fa-chart-line"></i>
                    Comparação de Preços
                </h3>
                <div class="comparison-cards">
        `;

        prices.forEach((priceData, index) => {
            const isBestPrice = index === 0;
            const discount = index > 0 ? this.calculateDiscount(prices[0].price, priceData.price) : 0;

            html += `
                <div class="price-card ${isBestPrice ? 'best-price' : ''}" data-store="${priceData.store}">
                    ${isBestPrice ? '<div class="best-price-badge"><i class="fas fa-crown"></i> Melhor Preço</div>' : ''}
                    <div class="store-header">
                        <span class="store-icon">${this.stores[priceData.store].icon}</span>
                        <span class="store-name">${this.stores[priceData.store].name}</span>
                    </div>
                    <div class="price-value">
                        R$ ${priceData.price.toFixed(2).replace('.', ',')}
                    </div>
                    ${discount > 0 ? `
                        <div class="price-difference">
                            <i class="fas fa-arrow-up"></i>
                            ${discount}% mais caro
                        </div>
                    ` : ''}
                    ${priceData.link ? `
                        <a href="${priceData.link}" target="_blank" rel="noopener noreferrer" class="store-link">
                            <i class="fas fa-external-link-alt"></i>
                            Ver na loja
                        </a>
                    ` : `
                        <button class="store-link add-to-cart-btn" data-product-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            Adicionar ao Carrinho
                        </button>
                    `}
                </div>
            `;
        });

        html += `
                </div>
                <div class="comparison-footer">
                    <p class="comparison-note">
                        <i class="fas fa-info-circle"></i>
                        Preços atualizados em tempo real. Valores podem variar.
                    </p>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Extrai os preços disponíveis do produto
     * @param {Object} product - Objeto do produto
     * @returns {Array} Array de objetos com informações de preço
     */
    getPrices(product) {
        const prices = [];

        // Preço Roxinho Shop
        if (product.preco) {
            prices.push({
                store: 'roxinho',
                price: parseFloat(product.preco),
                link: null // Link interno, não precisa de URL externa
            });
        }

        // Preço Mercado Livre
        if (product.preco_mercado_livre && product.link_mercado_livre) {
            prices.push({
                store: 'mercadoLivre',
                price: parseFloat(product.preco_mercado_livre),
                link: product.link_mercado_livre
            });
        }

        // Preço Amazon
        if (product.preco_amazon && product.link_amazon) {
            prices.push({
                store: 'amazon',
                price: parseFloat(product.preco_amazon),
                link: product.link_amazon
            });
        }

        return prices;
    }

    /**
     * Calcula a porcentagem de desconto entre dois preços
     * @param {number} bestPrice - Melhor preço
     * @param {number} currentPrice - Preço atual
     * @returns {number} Porcentagem de diferença
     */
    calculateDiscount(bestPrice, currentPrice) {
        return Math.round(((currentPrice - bestPrice) / bestPrice) * 100);
    }

    /**
     * Inicializa os event listeners para os botões de adicionar ao carrinho
     */
    initEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const button = e.target.closest('.add-to-cart-btn');
                const productId = button.dataset.productId;
                
                // Integração com o sistema de carrinho existente
                if (typeof window.adicionarAoCarrinho === 'function') {
                    window.adicionarAoCarrinho(productId);
                } else {
                    console.warn('Função adicionarAoCarrinho não encontrada');
                }
            }
        });
    }
}

// Criar instância global
window.priceComparison = new PriceComparison();

// Inicializar event listeners quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.priceComparison.initEventListeners();
    });
} else {
    window.priceComparison.initEventListeners();
}

