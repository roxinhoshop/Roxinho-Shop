/**
 * Product Scraper - Sistema de Importação de Produtos
 * Utiliza o endpoint do backend para extração de dados de produtos via URL
 */

class ProductScraper {
    constructor() {
        this.backendApiUrl = 'https://roxinho-shop-backend.vercel.app/api/products/extract-from-url'; // URL do seu backend
    }

    /**
     * Importa produto e salva no MySQL via API do backend
     */
    async importProduct(url) {
        try {
            const response = await fetch(this.backendApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Adicione cabeçalhos de autenticação se necessário
                    // 'Authorization': `Bearer ${seuTokenDeAutenticacao}`
                },
                body: JSON.stringify({ url: url })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erro ao importar produto do backend.');
            }

            const productData = result.product;

            // Preparar dados para a API (ajustar conforme a estrutura esperada pelo frontend)
            const produto = {
                nome: productData.nome,
                descricao: productData.descricao,
                preco: productData.preco,
                imagem: productData.imagem,
                categoria: productData.categoria_id, // Usar o ID da categoria retornado pelo backend
                subcategoria: '', // O backend não retorna subcategoria diretamente, pode ser ajustado
                origem: result.platform, // Plataforma detectada pelo backend
                link_original: url,
                estoque: productData.estoque,
                ativo: productData.ativo
            };

            // Se a função criarProduto estiver disponível globalmente (como no código original)
            if (typeof criarProduto === 'function') {
                const id = await criarProduto(produto);
                produto.id = id;
                return produto;
            } else {
                // Caso contrário, apenas retorna os dados para o chamador lidar
                return produto;
            }

        } catch (error) {
            console.error('Erro ao importar produto via backend:', error);
            throw error;
        }
    }

    // Métodos de listagem, atualização e remoção de produtos (se ainda forem usados no frontend)
    listProducts() {
        // Esta função pode precisar ser adaptada para buscar produtos do backend
        return JSON.parse(localStorage.getItem('products') || '[]');
    }

    updateProduct(productId, updatedData) {
        // Esta função pode precisar ser adaptada para atualizar produtos no backend
        const products = this.listProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedData };
            localStorage.setItem('products', JSON.stringify(products));
            return products[index];
        }
        
        throw new Error('Produto não encontrado');
    }

    deleteProduct(productId) {
        // Esta função pode precisar ser adaptada para remover produtos no backend
        const products = this.listProducts();
        const filtered = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(filtered));
    }
}

// Exportar para uso global
window.ProductScraper = ProductScraper;

