/**
 * @file historico-compras-api.js
 * @description Sistema de histórico de compras integrado com API backend
 */

class HistoricoComprasAPI {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentPurchases = [];
        this.currentPage = 1;
        this.purchasesPerPage = 10;
        
        this.initializeSystem();
    }

    /**
     * Inicializa o sistema de histórico
     */
    async initializeSystem() {
        // Verificar se está logado
        if (!window.authAPI || !window.authAPI.isAuthenticated()) {
            window.authAPI.showMessage("Faça login para ver seu histórico de compras", "warning");
            window.location.href = "login.html";
            return;
        }

        await this.loadPurchaseHistory();
        this.setupEventListeners();
        console.log("📋 Sistema de histórico de compras inicializado");
    }

    /**
     * Carrega o histórico de compras do usuário
     */
    async loadPurchaseHistory() {
        try {
            const response = await window.authAPI.authenticatedRequest('/purchase-history');
            
            if (response && response.success) {
                this.currentPurchases = response.purchases;
                this.renderPurchaseHistory();
                this.renderPurchaseStats();
                console.log("📋 Histórico carregado:", response.purchases.length, "compras");
            } else {
                this.showEmptyState();
            }
        } catch (error) {
            console.error("❌ Erro ao carregar histórico:", error);
            this.showMessage("Erro ao carregar histórico de compras", "error");
        }
    }

    /**
     * Renderiza o histórico de compras
     */
    renderPurchaseHistory() {
        const historyContainer = document.getElementById('historico-compras') || 
                                document.querySelector('.purchase-history');

        if (!historyContainer) {
            console.warn("⚠️ Container de histórico não encontrado");
            return;
        }

        if (this.currentPurchases.length === 0) {
            this.showEmptyState();
            return;
        }

        // Agrupar compras por data
        const groupedPurchases = this.groupPurchasesByDate(this.currentPurchases);

        historyContainer.innerHTML = Object.entries(groupedPurchases)
            .map(([date, purchases]) => this.renderDateGroup(date, purchases))
            .join('');

        this.setupPurchaseEventListeners();
    }

    /**
     * Agrupa compras por data
     */
    groupPurchasesByDate(purchases) {
        const grouped = {};
        
        purchases.forEach(purchase => {
            const date = new Date(purchase.data_compra).toLocaleDateString('pt-BR');
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(purchase);
        });

        return grouped;
    }

    /**
     * Renderiza um grupo de compras por data
     */
    renderDateGroup(date, purchases) {
        const totalDia = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);

        return `
            <div class="purchase-date-group">
                <div class="date-header">
                    <h3>${date}</h3>
                    <span class="date-total">Total: R$ ${totalDia.toFixed(2).replace('.', ',')}</span>
                </div>
                <div class="purchases-list">
                    ${purchases.map(purchase => this.renderPurchaseCard(purchase)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Renderiza um card de compra
     */
    renderPurchaseCard(purchase) {
        const dataCompra = new Date(purchase.data_compra);
        const statusClass = this.getStatusClass(purchase.status);
        const statusText = this.getStatusText(purchase.status);

        return `
            <div class="purchase-card" data-purchase-id="${purchase.id}">
                <div class="purchase-image">
                    <img src="${purchase.imagem_principal || '/imagens/default.png'}" 
                         alt="${purchase.nome_produto}"
                         onerror="this.src='/imagens/default.png'">
                </div>
                
                <div class="purchase-info">
                    <h4 class="product-name">${purchase.nome_produto}</h4>
                    
                    <div class="purchase-details">
                        <div class="detail-item">
                            <span class="label">Quantidade:</span>
                            <span class="value">${purchase.quantidade}</span>
                        </div>
                        
                        <div class="detail-item">
                            <span class="label">Preço unitário:</span>
                            <span class="value">R$ ${parseFloat(purchase.preco_pago).toFixed(2).replace('.', ',')}</span>
                        </div>
                        
                        <div class="detail-item">
                            <span class="label">Total:</span>
                            <span class="value total-price">R$ ${parseFloat(purchase.total).toFixed(2).replace('.', ',')}</span>
                        </div>
                        
                        <div class="detail-item">
                            <span class="label">Horário:</span>
                            <span class="value">${dataCompra.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    
                    <div class="purchase-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    
                    ${purchase.observacoes ? `
                        <div class="purchase-notes">
                            <strong>Observações:</strong> ${purchase.observacoes}
                        </div>
                    ` : ''}
                </div>
                
                <div class="purchase-actions">
                    <button class="btn btn-sm btn-primary btn-view-product" data-product-id="${purchase.produto_id}">
                        <i class="fas fa-eye"></i>
                        Ver Produto
                    </button>
                    
                    <button class="btn btn-sm btn-success btn-buy-again" data-product-id="${purchase.produto_id}">
                        <i class="fas fa-redo"></i>
                        Comprar Novamente
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza estatísticas de compras
     */
    renderPurchaseStats() {
        const statsContainer = document.getElementById('purchase-stats') || 
                              document.querySelector('.purchase-stats');

        if (!statsContainer) return;

        const totalCompras = this.currentPurchases.length;
        const totalGasto = this.currentPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);
        const totalItens = this.currentPurchases.reduce((sum, purchase) => sum + parseInt(purchase.quantidade), 0);
        
        // Produto mais comprado
        const produtosMaisComprados = {};
        this.currentPurchases.forEach(purchase => {
            if (!produtosMaisComprados[purchase.nome_produto]) {
                produtosMaisComprados[purchase.nome_produto] = 0;
            }
            produtosMaisComprados[purchase.nome_produto] += parseInt(purchase.quantidade);
        });

        const produtoFavorito = Object.entries(produtosMaisComprados)
            .sort(([,a], [,b]) => b - a)[0];

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalCompras}</h3>
                        <p>Total de Compras</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-info">
                        <h3>R$ ${totalGasto.toFixed(2).replace('.', ',')}</h3>
                        <p>Total Gasto</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalItens}</h3>
                        <p>Itens Comprados</p>
                    </div>
                </div>
                
                ${produtoFavorito ? `
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${produtoFavorito[1]}x</h3>
                            <p>${produtoFavorito[0]}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Mostra estado vazio
     */
    showEmptyState() {
        const historyContainer = document.getElementById('historico-compras') || 
                                document.querySelector('.purchase-history');

        if (historyContainer) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>Nenhuma compra encontrada</h3>
                    <p>Você ainda não realizou nenhuma compra. Que tal dar uma olhada em nossos produtos?</p>
                    <a href="produtos.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i>
                        Ver Produtos
                    </a>
                </div>
            `;
        }

        // Limpar estatísticas
        const statsContainer = document.getElementById('purchase-stats');
        if (statsContainer) {
            statsContainer.innerHTML = '';
        }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Filtros de período
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.filterByPeriod(e.target.value);
            });
        }

        // Filtro de status
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }

        // Busca por produto
        const searchInput = document.getElementById('search-purchases');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterByProduct(e.target.value);
                }, 300);
            });
        }
    }

    /**
     * Configura event listeners específicos das compras
     */
    setupPurchaseEventListeners() {
        // Botões "Ver Produto"
        document.querySelectorAll('.btn-view-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.viewProduct(productId);
            });
        });

        // Botões "Comprar Novamente"
        document.querySelectorAll('.btn-buy-again').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                this.buyAgain(productId);
            });
        });
    }

    /**
     * Visualiza um produto
     */
    viewProduct(productId) {
        if (window.productsAPI) {
            window.productsAPI.viewProduct(productId);
        } else {
            window.location.href = `paginaproduto.html?id=${productId}`;
        }
    }

    /**
     * Compra novamente um produto
     */
    async buyAgain(productId) {
        if (window.productsAPI) {
            await window.productsAPI.buyProduct(productId);
            // Recarregar histórico após compra
            setTimeout(() => {
                this.loadPurchaseHistory();
            }, 2000);
        }
    }

    /**
     * Filtra por período
     */
    filterByPeriod(period) {
        let filteredPurchases = [...this.currentPurchases];
        const now = new Date();

        switch (period) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredPurchases = filteredPurchases.filter(p => new Date(p.data_compra) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredPurchases = filteredPurchases.filter(p => new Date(p.data_compra) >= monthAgo);
                break;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                filteredPurchases = filteredPurchases.filter(p => new Date(p.data_compra) >= yearAgo);
                break;
        }

        this.renderFilteredPurchases(filteredPurchases);
    }

    /**
     * Filtra por status
     */
    filterByStatus(status) {
        let filteredPurchases = [...this.currentPurchases];

        if (status) {
            filteredPurchases = filteredPurchases.filter(p => p.status === status);
        }

        this.renderFilteredPurchases(filteredPurchases);
    }

    /**
     * Filtra por produto
     */
    filterByProduct(searchTerm) {
        let filteredPurchases = [...this.currentPurchases];

        if (searchTerm.trim()) {
            filteredPurchases = filteredPurchases.filter(p => 
                p.nome_produto.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        this.renderFilteredPurchases(filteredPurchases);
    }

    /**
     * Renderiza compras filtradas
     */
    renderFilteredPurchases(purchases) {
        const historyContainer = document.getElementById('historico-compras') || 
                                document.querySelector('.purchase-history');

        if (!historyContainer) return;

        if (purchases.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Nenhuma compra encontrada</h3>
                    <p>Tente ajustar os filtros de busca</p>
                </div>
            `;
            return;
        }

        const groupedPurchases = this.groupPurchasesByDate(purchases);
        historyContainer.innerHTML = Object.entries(groupedPurchases)
            .map(([date, purchases]) => this.renderDateGroup(date, purchases))
            .join('');

        this.setupPurchaseEventListeners();
    }

    /**
     * Obtém classe CSS do status
     */
    getStatusClass(status) {
        const statusClasses = {
            'pendente': 'status-pending',
            'confirmado': 'status-confirmed',
            'enviado': 'status-shipped',
            'entregue': 'status-delivered',
            'cancelado': 'status-cancelled'
        };
        return statusClasses[status] || 'status-pending';
    }

    /**
     * Obtém texto do status
     */
    getStatusText(status) {
        const statusTexts = {
            'pendente': 'Pendente',
            'confirmado': 'Confirmado',
            'enviado': 'Enviado',
            'entregue': 'Entregue',
            'cancelado': 'Cancelado'
        };
        return statusTexts[status] || 'Pendente';
    }

    /**
     * Exibe mensagem
     */
    showMessage(message, type = "info") {
        if (window.authAPI && window.authAPI.showMessage) {
            window.authAPI.showMessage(message, type);
        } else {
            alert(message);
        }
    }
}

// Criar instância global
window.historicoComprasAPI = new HistoricoComprasAPI();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar estilos para histórico se não existirem
    if (!document.getElementById('purchase-history-styles')) {
        const styles = document.createElement('style');
        styles.id = 'purchase-history-styles';
        styles.textContent = `
            .purchase-date-group {
                margin-bottom: 30px;
            }
            
            .date-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px 8px 0 0;
                margin-bottom: 0;
            }
            
            .date-header h3 {
                margin: 0;
                font-size: 1.1rem;
            }
            
            .date-total {
                font-weight: bold;
                font-size: 1rem;
            }
            
            .purchases-list {
                background: white;
                border: 1px solid #e0e0e0;
                border-top: none;
                border-radius: 0 0 8px 8px;
            }
            
            .purchase-card {
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 20px;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.3s ease;
            }
            
            .purchase-card:last-child {
                border-bottom: none;
            }
            
            .purchase-card:hover {
                background-color: #f8f9fa;
            }
            
            .purchase-image {
                flex-shrink: 0;
            }
            
            .purchase-image img {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
            }
            
            .purchase-info {
                flex: 1;
            }
            
            .product-name {
                margin: 0 0 10px 0;
                font-size: 1.1rem;
                font-weight: 600;
                color: #333;
            }
            
            .purchase-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .detail-item .label {
                color: #666;
                font-size: 0.9rem;
            }
            
            .detail-item .value {
                font-weight: 500;
                color: #333;
            }
            
            .total-price {
                color: #28a745 !important;
                font-weight: bold !important;
                font-size: 1.1rem !important;
            }
            
            .purchase-status {
                margin: 10px 0;
            }
            
            .status-badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .status-pending {
                background: #fff3cd;
                color: #856404;
            }
            
            .status-confirmed {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .status-shipped {
                background: #d4edda;
                color: #155724;
            }
            
            .status-delivered {
                background: #d4edda;
                color: #155724;
            }
            
            .status-cancelled {
                background: #f8d7da;
                color: #721c24;
            }
            
            .purchase-notes {
                margin-top: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
                font-size: 0.9rem;
                color: #666;
            }
            
            .purchase-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
                flex-shrink: 0;
            }
            
            .purchase-actions .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: background-color 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                min-width: 140px;
            }
            
            .btn-primary {
                background: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background: #0056b3;
            }
            
            .btn-success {
                background: #28a745;
                color: white;
            }
            
            .btn-success:hover {
                background: #1e7e34;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                color: white;
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
            }
            
            .stat-info h3 {
                margin: 0;
                font-size: 1.3rem;
                color: #333;
            }
            
            .stat-info p {
                margin: 5px 0 0 0;
                color: #666;
                font-size: 0.9rem;
            }
            
            .empty-state,
            .no-results {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }
            
            .empty-state .empty-icon,
            .no-results i {
                font-size: 4rem;
                color: #ddd;
                margin-bottom: 20px;
            }
            
            .empty-state h3,
            .no-results h3 {
                margin: 0 0 10px 0;
                color: #333;
            }
            
            .empty-state p,
            .no-results p {
                margin: 0 0 20px 0;
                font-size: 1rem;
            }
            
            .filters-container {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .filter-group label {
                font-size: 0.9rem;
                font-weight: 500;
                color: #333;
            }
            
            .filter-group select,
            .filter-group input {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                .purchase-card {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 15px;
                }
                
                .purchase-details {
                    grid-template-columns: 1fr;
                }
                
                .purchase-actions {
                    flex-direction: row;
                    width: 100%;
                }
                
                .purchase-actions .btn {
                    flex: 1;
                    min-width: auto;
                }
                
                .date-header {
                    flex-direction: column;
                    gap: 5px;
                    text-align: center;
                }
                
                .filters-container {
                    flex-direction: column;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    }
});

console.log("📋 Sistema de histórico de compras API carregado");
