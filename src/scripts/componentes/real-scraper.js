/**
 * Real Product Scraper - Scraping Real de Produtos
 * Extrai dados reais de Amazon e Mercado Livre
 */

class RealProductScraper {
    constructor() {
        // Usar CORS proxy para acessar sites externos
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
    }

    /**
     * Detecta a plataforma
     */
    detectPlatform(url) {
        if (url.includes('amazon.com')) return 'amazon';
        if (url.includes('mercadolivre.com') || url.includes('mercadolibre.com')) return 'mercadolivre';
        return null;
    }

    /**
     * Faz scraping do produto
     */
    async scrapeProduct(url) {
        const platform = this.detectPlatform(url);
        
        if (!platform) {
            throw new Error('Plataforma não suportada. Use Amazon ou Mercado Livre.');
        }

        try {
            // Buscar HTML da página via CORS proxy
            const response = await fetch(this.corsProxy + encodeURIComponent(url));
            const html = await response.text();
            
            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrair dados baseado na plataforma
            if (platform === 'amazon') {
                return this.scrapeAmazon(doc, url);
            } else {
                return this.scrapeMercadoLivre(doc, url);
            }
        } catch (error) {
            console.error('Erro ao fazer scraping:', error);
            throw new Error('Não foi possível acessar a página do produto. Tente novamente.');
        }
    }

    /**
     * Scrape Amazon
     */
    scrapeAmazon(doc, url) {
        // Título
        const nome = this.extractText(doc, [
            '#productTitle',
            '#title',
            'h1#title',
            'span#productTitle'
        ]) || 'Produto Importado';

        // Preço
        const preco = this.extractPrice(doc, [
            '.a-price .a-offscreen',
            '#priceblock_ourprice',
            '#priceblock_dealprice',
            '.a-price-whole',
            'span.a-price-whole'
        ]) || 99.99;

        // Imagem
        const imagem = this.extractImage(doc, [
            '#landingImage',
            '#imgBlkFront',
            '#main-image',
            '.a-dynamic-image',
            'img[data-old-hires]'
        ]) || 'https://via.placeholder.com/400?text=Produto';

        // Descrição
        const descricao = this.extractText(doc, [
            '#feature-bullets',
            '#productDescription',
            '.product-description'
        ]) || 'Produto importado da Amazon';

        // Marca
        const marca = this.extractText(doc, [
            '#bylineInfo',
            '.po-brand .po-break-word',
            'a#bylineInfo'
        ]) || null;

        return {
            nome: this.cleanText(nome),
            preco: preco,
            imagem: this.cleanImageUrl(imagem),
            descricao: this.cleanText(descricao).substring(0, 500),
            marca: marca ? this.cleanText(marca) : null,
            modelo: null,
            origem: 'Amazon',
            link_original: url,
            estoque: 10,
            ativo: 1
        };
    }

    /**
     * Scrape Mercado Livre
     */
    scrapeMercadoLivre(doc, url) {
        // Título
        const nome = this.extractText(doc, [
            'h1.ui-pdp-title',
            '.item-title',
            'h1[class*="title"]'
        ]) || 'Produto Importado';

        // Preço
        const preco = this.extractPrice(doc, [
            '.price-tag-fraction',
            '.price-tag-amount',
            '.andes-money-amount__fraction',
            'span.price-tag-fraction'
        ]) || 99.99;

        // Imagem
        const imagem = this.extractImage(doc, [
            '.ui-pdp-image',
            'img[class*="gallery"]',
            'figure img',
            '.ui-pdp-gallery__figure img'
        ]) || 'https://via.placeholder.com/400?text=Produto';

        // Descrição
        const descricao = this.extractText(doc, [
            '.ui-pdp-description',
            '[class*="description"]',
            '.item-description'
        ]) || 'Produto importado do Mercado Livre';

        // Marca
        const marca = this.extractText(doc, [
            '.ui-pdp-subtitle',
            'span.ui-pdp-subtitle'
        ]) || null;

        return {
            nome: this.cleanText(nome),
            preco: preco,
            imagem: this.cleanImageUrl(imagem),
            descricao: this.cleanText(descricao).substring(0, 500),
            marca: marca ? this.cleanText(marca) : null,
            modelo: null,
            origem: 'Mercado Livre',
            link_original: url,
            estoque: 10,
            ativo: 1
        };
    }

    /**
     * Extrai texto de múltiplos seletores
     */
    extractText(doc, selectors) {
        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        return null;
    }

    /**
     * Extrai preço e converte para número
     */
    extractPrice(doc, selectors) {
        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
                const priceText = element.textContent.trim();
                const price = this.parsePrice(priceText);
                if (price > 0) return price;
            }
        }
        return 0;
    }

    /**
     * Extrai URL de imagem
     */
    extractImage(doc, selectors) {
        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
                // Tentar src primeiro
                if (element.src && element.src.startsWith('http')) {
                    return element.src;
                }
                // Tentar data-old-hires (Amazon)
                if (element.getAttribute('data-old-hires')) {
                    return element.getAttribute('data-old-hires');
                }
                // Tentar data-src
                if (element.getAttribute('data-src')) {
                    return element.getAttribute('data-src');
                }
            }
        }
        return null;
    }

    /**
     * Parse preço de string para número
     */
    parsePrice(priceText) {
        if (!priceText) return 0;
        
        // Remover tudo exceto números, vírgula e ponto
        const cleaned = priceText
            .replace(/[^\d,\.]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        
        const price = parseFloat(cleaned);
        return isNaN(price) ? 0 : price;
    }

    /**
     * Limpa texto
     */
    cleanText(text) {
        if (!text) return '';
        return text
            .replace(/\s+/g, ' ')
            .replace(/[\n\r\t]/g, ' ')
            .trim();
    }

    /**
     * Limpa URL de imagem
     */
    cleanImageUrl(url) {
        if (!url) return '';
        
        // Remover parâmetros desnecessários da Amazon
        if (url.includes('amazon')) {
            return url.split('._')[0] + '._AC_SL1000_.jpg';
        }
        
        return url;
    }

    /**
     * Importa produto e salva no MySQL
     */
    async importProduct(url) {
        try {
            // Fazer scraping
            const productData = await this.scrapeProduct(url);
            
            // Salvar no MySQL via API
            if (typeof criarProduto === 'function') {
                const id = await criarProduto(productData);
                productData.id = id;
                return productData;
            } else {
                throw new Error('Função criarProduto não disponível');
            }
        } catch (error) {
            console.error('Erro ao importar produto:', error);
            throw error;
        }
    }
}

// Tornar disponível globalmente
window.RealProductScraper = RealProductScraper;
console.log('✅ Real Product Scraper carregado!');

