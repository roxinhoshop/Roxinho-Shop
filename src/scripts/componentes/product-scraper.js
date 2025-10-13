/**
 * Product Scraper - Sistema de Importação de Produtos
 * Suporta: Amazon, Mercado Livre
 */

class ProductScraper {
    constructor() {
        this.apiEndpoint = 'https://api.allorigins.win/raw?url=';
    }

    /**
     * Detecta a origem do produto pelo URL
     */
    detectSource(url) {
        if (url.includes('amazon.com') || url.includes('amazon.com.br')) {
            return 'amazon';
        } else if (url.includes('mercadolivre.com') || url.includes('mercadolibre.com')) {
            return 'mercadolivre';
        }
        return 'unknown';
    }

    /**
     * Extrai dados do produto de forma genérica
     */
    async scrapeProduct(url) {
        try {
            const source = this.detectSource(url);
            
            if (source === 'unknown') {
                throw new Error('URL não suportada. Use Amazon ou Mercado Livre.');
            }

            // Usar CORS proxy para acessar o conteúdo
            const response = await fetch(this.apiEndpoint + encodeURIComponent(url));
            const html = await response.text();

            // Parser HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            let productData = {};

            if (source === 'amazon') {
                productData = this.parseAmazon(doc, url);
            } else if (source === 'mercadolivre') {
                productData = this.parseMercadoLivre(doc, url);
            }

            productData.source = source;
            productData.originalUrl = url;
            productData.importedAt = new Date().toISOString();

            return productData;
        } catch (error) {
            console.error('Erro ao fazer scraping:', error);
            throw error;
        }
    }

    /**
     * Parse de produtos da Amazon
     */
    parseAmazon(doc, url) {
        const title = doc.querySelector('#productTitle')?.textContent.trim() || 
                     doc.querySelector('h1')?.textContent.trim() || 
                     'Produto sem título';

        const priceWhole = doc.querySelector('.a-price-whole')?.textContent.trim() || '';
        const priceFraction = doc.querySelector('.a-price-fraction')?.textContent.trim() || '';
        const price = priceWhole && priceFraction ? 
                     `R$ ${priceWhole},${priceFraction}` : 
                     'Preço não disponível';

        const image = doc.querySelector('#landingImage')?.src || 
                     doc.querySelector('.a-dynamic-image')?.src || 
                     doc.querySelector('img[data-old-hires]')?.getAttribute('data-old-hires') ||
                     '../recursos/imagens/default.png';

        const description = doc.querySelector('#feature-bullets')?.textContent.trim() || 
                          doc.querySelector('#productDescription')?.textContent.trim() || 
                          'Sem descrição disponível';

        // Extrair categoria
        const breadcrumb = doc.querySelector('#wayfinding-breadcrumbs_feature_div');
        const category = breadcrumb?.textContent.trim().split('›')[1]?.trim() || 'Geral';

        return {
            name: title,
            price: this.extractPrice(price),
            image: image,
            description: this.cleanDescription(description),
            category: category,
            source: 'Amazon'
        };
    }

    /**
     * Parse de produtos do Mercado Livre
     */
    parseMercadoLivre(doc, url) {
        const title = doc.querySelector('.ui-pdp-title')?.textContent.trim() || 
                     doc.querySelector('h1')?.textContent.trim() || 
                     'Produto sem título';

        const priceElement = doc.querySelector('.andes-money-amount__fraction') ||
                            doc.querySelector('.price-tag-fraction');
        const price = priceElement ? 
                     `R$ ${priceElement.textContent.trim()}` : 
                     'Preço não disponível';

        const image = doc.querySelector('.ui-pdp-image')?.src || 
                     doc.querySelector('img[data-zoom]')?.src || 
                     doc.querySelector('.ui-pdp-gallery__figure img')?.src ||
                     '../recursos/imagens/default.png';

        const description = doc.querySelector('.ui-pdp-description')?.textContent.trim() || 
                          doc.querySelector('.item-description')?.textContent.trim() || 
                          'Sem descrição disponível';

        // Extrair categoria
        const breadcrumb = doc.querySelector('.andes-breadcrumb');
        const category = breadcrumb?.textContent.trim().split('>')[1]?.trim() || 'Geral';

        return {
            name: title,
            price: this.extractPrice(price),
            image: image,
            description: this.cleanDescription(description),
            category: category,
            source: 'Mercado Livre'
        };
    }

    /**
     * Extrai apenas o valor numérico do preço
     */
    extractPrice(priceString) {
        const match = priceString.match(/[\d.,]+/);
        return match ? parseFloat(match[0].replace('.', '').replace(',', '.')) : 0;
    }

    /**
     * Limpa a descrição removendo espaços extras e caracteres especiais
     */
    cleanDescription(description) {
        return description
            .replace(/\s+/g, ' ')
            .replace(/[\n\r\t]/g, ' ')
            .trim()
            .substring(0, 500); // Limita a 500 caracteres
    }

    /**
     * Importa produto e salva no MySQL via API
     */
    async importProduct(url) {
        try {
            const productData = await this.scrapeProduct(url);
            
            // Preparar dados para a API
            const produto = {
                nome: productData.name,
                descricao: productData.description,
                preco: productData.price,
                imagem: productData.image,
                categoria: this.mapCategory(productData.category),
                subcategoria: '',
                origem: productData.source,
                link_original: url,
                estoque: 10,
                ativo: 1
            };

            // Salvar no MySQL via API
            if (typeof criarProduto === 'function') {
                const id = await criarProduto(produto);
                produto.id = id;
                return produto;
            } else {
                throw new Error('Função criarProduto não disponível');
            }
        } catch (error) {
            console.error('Erro ao importar produto:', error);
            throw error;
        }
    }

    /**
     * Mapeia categoria do site para categoria do sistema
     */
    mapCategory(category) {
        const categoryMap = {
            'eletrônicos': 'eletronicos',
            'informática': 'hardware',
            'computadores': 'computadores',
            'celulares': 'celular-smartphone',
            'games': 'games',
            'tv': 'tv-audio',
            'áudio': 'audio',
            'acessórios': 'acessorios'
        };

        const normalized = category.toLowerCase();
        for (const [key, value] of Object.entries(categoryMap)) {
            if (normalized.includes(key)) {
                return value;
            }
        }

        return 'eletronicos'; // Categoria padrão
    }

    /**
     * Lista todos os produtos importados
     */
    listProducts() {
        return JSON.parse(localStorage.getItem('products') || '[]');
    }

    /**
     * Atualiza um produto existente
     */
    updateProduct(productId, updatedData) {
        const products = this.listProducts();
        const index = products.findIndex(p => p.id === productId);
        
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedData };
            localStorage.setItem('products', JSON.stringify(products));
            return products[index];
        }
        
        throw new Error('Produto não encontrado');
    }

    /**
     * Remove um produto
     */
    deleteProduct(productId) {
        const products = this.listProducts();
        const filtered = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(filtered));
    }
}

// Exportar para uso global
window.ProductScraper = ProductScraper;

