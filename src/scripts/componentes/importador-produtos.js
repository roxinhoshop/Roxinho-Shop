/**
 * Importador de Produtos - Sistema Completo
 * Importa produtos do Mercado Livre e Amazon
 */

class ImportadorProdutos {
    constructor() {
        this.apiBase = 'https://roxinho-shop-backend.vercel.app/api';
        this.produtoAtual = null;
        this.inicializar();
    }

    inicializar() {
        document.addEventListener('DOMContentLoaded', () => {
            this.configurarEventos();
        });
    }

    configurarEventos() {
        // Botão para abrir modal de importação
        const btnImportar = document.getElementById('btn-importar-produto');
        if (btnImportar) {
            btnImportar.addEventListener('click', () => this.abrirModal());
        }

        // Formulário de importação
        const formImportar = document.getElementById('form-importar-produto');
        if (formImportar) {
            formImportar.addEventListener('submit', (e) => {
                e.preventDefault();
                this.extrairDadosProduto();
            });
        }

        // Botão salvar produto
        const btnSalvar = document.getElementById('btn-salvar-produto');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => this.salvarProduto());
        }

        // Botão cancelar
        const btnCancelar = document.getElementById('btn-cancelar-importacao');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => this.fecharModal());
        }
    }

    abrirModal() {
        const modal = document.getElementById('modal-importar-produto');
        if (modal) {
            modal.style.display = 'flex';
            this.limparFormulario();
        }
    }

    fecharModal() {
        const modal = document.getElementById('modal-importar-produto');
        if (modal) {
            modal.style.display = 'none';
            this.limparFormulario();
        }
    }

    limparFormulario() {
        const urlInput = document.getElementById('url-produto');
        const previewContainer = document.getElementById('preview-produto');
        
        if (urlInput) urlInput.value = '';
        if (previewContainer) previewContainer.style.display = 'none';
        
        this.produtoAtual = null;
    }

    async extrairDadosProduto() {
        const urlInput = document.getElementById('url-produto');
        const btnExtrair = document.getElementById('btn-extrair-dados');
        
        if (!urlInput || !btnExtrair) return;

        const url = urlInput.value.trim();
        
        if (!url) {
            this.mostrarMensagem('Por favor, insira uma URL válida', 'erro');
            return;
        }

        if (!this.validarUrl(url)) {
            this.mostrarMensagem('URL não suportada. Use links do Mercado Livre ou Amazon', 'erro');
            return;
        }

        // Mostrar loading
        const textoOriginal = btnExtrair.innerHTML;
        btnExtrair.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extraindo...';
        btnExtrair.disabled = true;

        try {
            const response = await fetch(`${this.apiBase}/product-scraper/extract-from-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.produtoAtual = data.product;
                this.mostrarPreview(data.product);
                this.mostrarMensagem('Dados extraídos com sucesso!', 'sucesso');
            } else {
                throw new Error(data.message || 'Erro ao extrair dados do produto');
            }

        } catch (error) {
            console.error('Erro ao extrair dados:', error);
            this.mostrarMensagem(error.message, 'erro');
        } finally {
            btnExtrair.innerHTML = textoOriginal;
            btnExtrair.disabled = false;
        }
    }

    validarUrl(url) {
        return url.includes('mercadolivre.com') || 
               url.includes('mercadolibre.com') || 
               url.includes('amazon.com') || 
               url.includes('amazon.com.br');
    }

    mostrarPreview(produto) {
        const previewContainer = document.getElementById('preview-produto');
        if (!previewContainer) return;

        previewContainer.innerHTML = `
            <div class="preview-card">
                <div class="preview-imagem">
                    <img src="${produto.imagem || 'https://via.placeholder.com/200'}" 
                         alt="${produto.nome}" 
                         onerror="this.src='https://via.placeholder.com/200?text=Sem+Imagem'">
                </div>
                <div class="preview-info">
                    <h3>${produto.nome}</h3>
                    <p class="preco">R$ ${parseFloat(produto.preco || 0).toFixed(2).replace('.', ',')}</p>
                    <p class="descricao">${(produto.descricao || 'Sem descrição').substring(0, 150)}...</p>
                    <div class="preview-detalhes">
                        ${produto.marca ? `<span class="detalhe"><strong>Marca:</strong> ${produto.marca}</span>` : ''}
                        ${produto.modelo ? `<span class="detalhe"><strong>Modelo:</strong> ${produto.modelo}</span>` : ''}
                        <span class="detalhe"><strong>Estoque:</strong> ${produto.estoque || 0}</span>
                    </div>
                </div>
            </div>
            <div class="preview-acoes">
                <button type="button" id="btn-salvar-produto" class="btn btn-sucesso">
                    <i class="fas fa-save"></i> Salvar Produto
                </button>
                <button type="button" id="btn-cancelar-importacao" class="btn btn-secundario">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        `;

        previewContainer.style.display = 'block';
        
        // Reconfigurar eventos dos novos botões
        this.configurarEventos();
    }

    async salvarProduto() {
        if (!this.produtoAtual) {
            this.mostrarMensagem('Nenhum produto para salvar', 'erro');
            return;
        }

        const btnSalvar = document.getElementById('btn-salvar-produto');
        if (btnSalvar) {
            const textoOriginal = btnSalvar.innerHTML;
            btnSalvar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            btnSalvar.disabled = true;
        }

        try {
            const response = await fetch(`${this.apiBase}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.produtoAtual)
            });

            const data = await response.json();

            if (response.ok && (data.success || data.status === 'success')) {
                this.mostrarMensagem('Produto salvo com sucesso!', 'sucesso');
                this.fecharModal();
                
                // Recarregar lista de produtos se a função existir
                if (typeof window.adminPanelAPI?.loadProducts === 'function') {
                    window.adminPanelAPI.loadProducts();
                }
            } else {
                throw new Error(data.message || 'Erro ao salvar produto');
            }

        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            this.mostrarMensagem(error.message, 'erro');
        } finally {
            if (btnSalvar) {
                btnSalvar.innerHTML = btnSalvar.innerHTML.replace('<i class="fas fa-spinner fa-spin"></i> Salvando...', '<i class="fas fa-save"></i> Salvar Produto');
                btnSalvar.disabled = false;
            }
        }
    }

    mostrarMensagem(mensagem, tipo) {
        const container = document.getElementById('mensagens-importacao');
        if (!container) return;

        const icone = tipo === 'sucesso' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        const classe = tipo === 'sucesso' ? 'mensagem-sucesso' : 'mensagem-erro';

        container.innerHTML = `
            <div class="mensagem ${classe}">
                <i class="${icone}"></i>
                <span>${mensagem}</span>
            </div>
        `;

        // Remover mensagem após 5 segundos
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// Criar instância global
window.importadorProdutos = new ImportadorProdutos();

// Funções globais para compatibilidade
function abrirImportadorProdutos() {
    window.importadorProdutos.abrirModal();
}

function fecharImportadorProdutos() {
    window.importadorProdutos.fecharModal();
}