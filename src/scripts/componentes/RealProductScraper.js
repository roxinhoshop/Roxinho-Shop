/**
 * Real Product Scraper - Versão Melhorada
 * Extrai dados completos de Amazon e Mercado Livre incluindo múltiplas imagens
 */

class RealProductScraper {
    constructor() {
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
        this.apiBase = window.API_BASE_URL;
    }

    /**
     * Detecta a plataforma do URL
     */
    detectPlatform(url) {
        if (url.includes('amazon.com') || url.includes('amazon.com.br')) return 'amazon';
        if (url.includes('mercadolivre.com') || url.includes('mercadolibre.com')) return 'mercadolivre';
        return null;
    }

    /**
     * Scraping completo do produto com imagens
     */
    async scrapeProduct(url) {
        const platform = this.detectPlatform(url);
        
        if (!platform) {
            throw new Error('Plataforma não suportada. Use Amazon ou Mercado Livre.');
        }

        try {
            const response = await fetch(this.corsProxy + encodeURIComponent(url));
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            if (platform === 'amazon') {
                return this.scrapeAmazon(doc, url);
            } else {
                return this.scrapeMercadoLivre(doc, url);
            }
        } catch (error) {
            throw new Error('Não foi possível acessar a página do produto. Tente novamente.');
        }
    }

    /**
     * Scrape Amazon com múltiplas imagens
     */
    scrapeAmazon(doc, url) {
        const nome = this.extractText(doc, [
            '#productTitle',
            'h1#title',
            'span#productTitle'
        ]) || 'Produto Importado da Amazon';

        const preco = this.extractPrice(doc, [
            '.a-price .a-offscreen',
            '#priceblock_ourprice',
            '#priceblock_dealprice',
            '.a-price-whole'
        ]) || 0;

        // Extrair múltiplas imagens
        const imagens = this.extractAmazonImages(doc);
        const imagemPrincipal = imagens[0] || 'https://via.placeholder.com/400?text=Produto';

        const descricao = this.extractText(doc, [
            '#feature-bullets',
            '#productDescription',
            '.product-description'
        ]) || 'Produto importado da Amazon';

        const marca = this.extractText(doc, [
            '#bylineInfo',
            '.po-brand .po-break-word',
            'a#bylineInfo'
        ]) || null;

        // Extrair SKU/ASIN
        const sku = this.extractAmazonASIN(url, doc);

        return {
            nome: this.cleanText(nome),
            preco: preco,
            imagem_principal: imagemPrincipal,
            galeria_imagens: JSON.stringify(imagens),
            descricao: this.cleanText(descricao).substring(0, 1000),
            descricao_curta: this.cleanText(descricao).substring(0, 200),
            marca: marca ? this.cleanText(marca) : null,
            sku: sku,
            link_amazon: url,
            preco_amazon: preco,
            estoque: 10,
            ativo: 1
        };
    }

    /**
     * Extrair múltiplas imagens da Amazon
     */
    extractAmazonImages(doc) {
        const images = [];
        
        // Imagem principal
        const mainImage = this.extractImage(doc, [
            '#landingImage',
            '#imgBlkFront',
            '#main-image'
        ]);
        if (mainImage) images.push(this.cleanImageUrl(mainImage, 'amazon'));

        // Imagens da galeria
        const thumbs = doc.querySelectorAll('.imageThumbnail img, #altImages img');
        thumbs.forEach(img => {
            const src = img.src || img.getAttribute('data-old-hires');
            if (src && src.startsWith('http') && !images.includes(src)) {
                images.push(this.cleanImageUrl(src, 'amazon'));
            }
        });

        // Se não encontrou imagens, usar placeholder
        if (images.length === 0) {
            images.push('https://via.placeholder.com/400?text=Produto');
        }

        return images.slice(0, 6); // Máximo 6 imagens
    }

    /**
     * Extrair ASIN da Amazon
     */
    extractAmazonASIN(url, doc) {
        // Tentar extrair do URL
        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) return asinMatch[1];

        // Tentar extrair do HTML
        const asinInput = doc.querySelector('input[name="ASIN"]');
        if (asinInput) return asinInput.value;

        return 'ASIN-' + Date.now();
    }

    /**
     * Scrape Mercado Livre com múltiplas imagens
     */
    scrapeMercadoLivre(doc, url) {
        const nome = this.extractText(doc, [
            'h1.ui-pdp-title',
            '.item-title',
            'h1[class*="title"]'
        ]) || 'Produto Importado do Mercado Livre';

        const preco = this.extractPrice(doc, [
            '.price-tag-fraction',
            '.andes-money-amount__fraction',
            'span.price-tag-fraction'
        ]) || 0;

        // Extrair múltiplas imagens
        const imagens = this.extractMLImages(doc);
        const imagemPrincipal = imagens[0] || 'https://via.placeholder.com/400?text=Produto';

        const descricao = this.extractText(doc, [
            '.ui-pdp-description',
            '[class*="description"]',
            '.item-description'
        ]) || 'Produto importado do Mercado Livre';

        const marca = this.extractText(doc, [
            '.ui-pdp-subtitle',
            'span.ui-pdp-subtitle'
        ]) || null;

        // Extrair ID do ML
        const sku = this.extractMLId(url);

        return {
            nome: this.cleanText(nome),
            preco: preco,
            imagem_principal: imagemPrincipal,
            galeria_imagens: JSON.stringify(imagens),
            descricao: this.cleanText(descricao).substring(0, 1000),
            descricao_curta: this.cleanText(descricao).substring(0, 200),
            marca: marca ? this.cleanText(marca) : null,
            sku: sku,
            link_mercado_livre: url,
            preco_mercado_livre: preco,
            estoque: 10,
            ativo: 1
        };
    }

    /**
     * Extrair múltiplas imagens do Mercado Livre
     */
    extractMLImages(doc) {
        const images = [];
        
        // Imagens da galeria
        const galleryImages = doc.querySelectorAll('.ui-pdp-image, img[class*="gallery"], figure img');
        galleryImages.forEach(img => {
            const src = img.src || img.getAttribute('data-src');
            if (src && src.startsWith('http') && !images.includes(src)) {
                images.push(this.cleanImageUrl(src, 'mercadolivre'));
            }
        });

        if (images.length === 0) {
            images.push('https://via.placeholder.com/400?text=Produto');
        }

        return images.slice(0, 6);
    }

    /**
     * Extrair ID do Mercado Livre
     */
    extractMLId(url) {
        const mlMatch = url.match(/ML[A-Z]-(\d+)/);
        if (mlMatch) return mlMatch[0];
        return 'ML-' + Date.now();
    }

    /**
     * Métodos auxiliares de extração
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

    extractPrice(doc, selectors) {
        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
                const price = this.parsePrice(element.textContent.trim());
                if (price > 0) return price;
            }
        }
        return 0;
    }

    extractImage(doc, selectors) {
        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
                if (element.src && element.src.startsWith('http')) {
                    return element.src;
                }
                if (element.getAttribute('data-old-hires')) {
                    return element.getAttribute('data-old-hires');
                }
                if (element.getAttribute('data-src')) {
                    return element.getAttribute('data-src');
                }
            }
        }
        return null;
    }

    parsePrice(priceText) {
        if (!priceText) return 0;
        
        const cleaned = priceText
            .replace(/[^\d,\.]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        
        const price = parseFloat(cleaned);
        return isNaN(price) ? 0 : price;
    }

    cleanText(text) {
        if (!text) return '';
        return text
            .replace(/\s+/g, ' ')
            .replace(/[\n\r\t]/g, ' ')
            .trim();
    }

    cleanImageUrl(url, platform) {
        if (!url) return '';
        
        if (platform === 'amazon') {
            // Melhorar qualidade da imagem Amazon
            return url.split('._')[0] + '._AC_SL1000_.jpg';
        }
        
        if (platform === 'mercadolivre') {
            // Usar imagem em alta resolução do ML
            return url.replace(/\-[A-Z]\.jpg/, '-O.jpg');
        }
        
        return url;
    }

    /**
     * Importar produto completo e salvar no banco
     */
    async importProduct(url, categoriaId = null) {
        try {
            // Mostrar loading
            if (window.modalManager) {
                window.modalManager.showLoading('Importando produto...');
            }

            // Fazer scraping
            const productData = await this.scrapeProduct(url);
            
            // Adicionar categoria se fornecida
            if (categoriaId) {
                productData.categoria_id = categoriaId;
            }

            // Salvar no banco via API
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Você precisa estar logado como admin');
            }

            const response = await fetch(`${this.apiBase}/produtos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao salvar produto');
            }

            const result = await response.json();
            
            // Salvar imagens na tabela produto_imagens
            if (productData.galeria_imagens) {
                await this.saveProductImages(result.id, JSON.parse(productData.galeria_imagens));
            }

            // Fechar loading
            if (window.modalManager) {
                window.modalManager.closeLoading();
            }

            return {
                ...productData,
                id: result.id
            };

        } catch (error) {
            // Fechar loading
            if (window.modalManager) {
                window.modalManager.closeLoading();
            }
            throw error;
        }
    }

    /**
     * Salvar imagens do produto na tabela produto_imagens
     */
    async saveProductImages(produtoId, imagens) {
        const token = localStorage.getItem('token');
        
        for (let i = 0; i < imagens.length; i++) {
            const imageData = {
                produto_id: produtoId,
                url: imagens[i],
                tipo: i === 0 ? 'principal' : 'galeria',
                ordem: i,
                alt_text: `Imagem ${i + 1}`
            };

            await fetch(`${this.apiBase}/product-images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(imageData)
            });
        }
    }
}

// Tornar disponível globalmente
if (typeof window !== 'undefined') {
    window.RealProductScraper = RealProductScraper;
}

