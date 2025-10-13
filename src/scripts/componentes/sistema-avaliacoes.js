/**
 * Sistema de Avaliações de Produtos
 * Gerencia criação, exibição e votação de avaliações
 */

class SistemaAvaliacoes {
    constructor() {
        this.apiBase = 'https://roxinho-shop-backend.vercel.app/api';
        this.produtoId = null;
        this.avaliacoes = [];
        this.stats = null;
        this.notaSelecionada = 0;
        this.init();
    }

    init() {
        // Pegar ID do produto da URL
        const urlParams = new URLSearchParams(window.location.search);
        this.produtoId = urlParams.get('id');

        if (!this.produtoId) return;

        // Aguardar DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Configurar sistema de rating
        this.setupRatingInput();

        // Configurar formulário
        this.setupForm();

        // Carregar avaliações
        this.loadAvaliacoes();
    }

    setupRatingInput() {
        const stars = document.querySelectorAll('.rating-input .star');
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                this.notaSelecionada = rating;
                document.getElementById('nota-input').value = rating;
                
                // Atualizar visual
                stars.forEach(s => {
                    const sRating = parseInt(s.getAttribute('data-rating'));
                    if (sRating <= rating) {
                        s.classList.add('active');
                        s.textContent = '★';
                    } else {
                        s.classList.remove('active');
                        s.textContent = '☆';
                    }
                });
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                stars.forEach(s => {
                    const sRating = parseInt(s.getAttribute('data-rating'));
                    if (sRating <= rating) {
                        s.textContent = '★';
                    } else {
                        s.textContent = '☆';
                    }
                });
            });
        });

        document.querySelector('.rating-input').addEventListener('mouseleave', () => {
            stars.forEach(s => {
                const sRating = parseInt(s.getAttribute('data-rating'));
                if (sRating <= this.notaSelecionada) {
                    s.textContent = '★';
                } else {
                    s.textContent = '☆';
                }
            });
        });
    }

    setupForm() {
        const form = document.getElementById('form-avaliacao');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.enviarAvaliacao();
        });
    }

    async loadAvaliacoes() {
        try {
            const response = await fetch(`${this.apiBase}/reviews/product/${this.produtoId}`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar avaliações');
            }

            const data = await response.json();
            this.avaliacoes = data.reviews || [];
            this.stats = data.stats || {};

            this.renderStats();
            this.renderAvaliacoes();
            this.renderResumo();

        } catch (error) {
            // Silenciosamente falhar se não houver avaliações
        }
    }

    renderResumo() {
        const resumoDiv = document.getElementById('avaliacoes-resumo');
        if (!resumoDiv) return;

        if (!this.stats || this.stats.total === 0) {
            resumoDiv.innerHTML = `
                <div class="avaliacoes-info">
                    <div class="media-nota">Sem avaliações</div>
                    <div class="total-avaliacoes">Seja o primeiro a avaliar!</div>
                </div>
            `;
            return;
        }

        const media = parseFloat(this.stats.media).toFixed(1);
        const estrelas = this.renderEstrelas(media);

        resumoDiv.innerHTML = `
            <div class="estrelas-display">${estrelas}</div>
            <div class="avaliacoes-info">
                <div class="media-nota">${media} de 5</div>
                <div class="total-avaliacoes">${this.stats.total} avaliação${this.stats.total !== 1 ? 'ões' : ''}</div>
            </div>
        `;
    }

    renderStats() {
        const statsDiv = document.getElementById('avaliacoes-stats');
        if (!statsDiv) return;

        if (!this.stats || this.stats.total === 0) {
            statsDiv.innerHTML = `
                <div class="sem-avaliacoes">
                    <div class="sem-avaliacoes-icon">📝</div>
                    <p>Ainda não há avaliações para este produto.</p>
                </div>
            `;
            return;
        }

        const media = parseFloat(this.stats.media).toFixed(1);
        const total = parseInt(this.stats.total);

        const distribuicao = [
            { estrelas: 5, count: parseInt(this.stats.cinco_estrelas || 0) },
            { estrelas: 4, count: parseInt(this.stats.quatro_estrelas || 0) },
            { estrelas: 3, count: parseInt(this.stats.tres_estrelas || 0) },
            { estrelas: 2, count: parseInt(this.stats.duas_estrelas || 0) },
            { estrelas: 1, count: parseInt(this.stats.uma_estrela || 0) }
        ];

        const distribuicaoHTML = distribuicao.map(d => {
            const porcentagem = total > 0 ? (d.count / total * 100) : 0;
            return `
                <div class="stats-linha">
                    <div class="stats-estrela-label">
                        ${d.estrelas} ${d.estrelas === 1 ? 'estrela' : 'estrelas'}
                    </div>
                    <div class="stats-barra-container">
                        <div class="stats-barra" style="width: ${porcentagem}%"></div>
                    </div>
                    <div class="stats-quantidade">${d.count}</div>
                </div>
            `;
        }).join('');

        statsDiv.innerHTML = `
            <div class="stats-resumo">
                <div class="stats-media">${media}</div>
                <div class="stats-estrelas">${this.renderEstrelas(media)}</div>
                <div class="stats-total">${total} avaliação${total !== 1 ? 'ões' : ''}</div>
            </div>
            <div class="stats-distribuicao">
                ${distribuicaoHTML}
            </div>
        `;
    }

    renderAvaliacoes() {
        const listaDiv = document.getElementById('avaliacoes-lista');
        if (!listaDiv) return;

        if (this.avaliacoes.length === 0) {
            listaDiv.innerHTML = `
                <div class="sem-avaliacoes">
                    <div class="sem-avaliacoes-icon">💬</div>
                    <p>Nenhuma avaliação ainda. Seja o primeiro!</p>
                </div>
            `;
            return;
        }

        listaDiv.innerHTML = this.avaliacoes.map(av => this.renderAvaliacaoItem(av)).join('');

        // Adicionar event listeners para botões de voto
        this.setupVoteButtons();
    }

    renderAvaliacaoItem(avaliacao) {
        const iniciais = avaliacao.usuario_nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const data = new Date(avaliacao.data_criacao).toLocaleDateString('pt-BR');
        const estrelas = this.renderEstrelas(avaliacao.nota);

        return `
            <div class="avaliacao-item" data-id="${avaliacao.id}">
                <div class="avaliacao-header">
                    <div class="avaliacao-avatar">
                        ${avaliacao.usuario_foto ? 
                            `<img src="${avaliacao.usuario_foto}" alt="${avaliacao.usuario_nome}">` :
                            iniciais
                        }
                    </div>
                    <div class="avaliacao-info">
                        <h4 class="avaliacao-usuario">${avaliacao.usuario_nome}</h4>
                        <div class="avaliacao-estrelas">${estrelas}</div>
                        <div class="avaliacao-data">${data}</div>
                    </div>
                </div>
                ${avaliacao.titulo ? `<h5 class="avaliacao-titulo">${avaliacao.titulo}</h5>` : ''}
                ${avaliacao.comentario ? `<p class="avaliacao-comentario">${avaliacao.comentario}</p>` : ''}
                <div class="avaliacao-footer">
                    <div class="avaliacao-util">
                        <button class="btn-util" data-avaliacao-id="${avaliacao.id}" data-util="true">
                            👍 Útil
                        </button>
                        <span>${avaliacao.util_count || 0} pessoa${avaliacao.util_count !== 1 ? 's' : ''} acharam útil</span>
                    </div>
                    ${avaliacao.verificado ? '<span class="avaliacao-verificada">✓ Compra Verificada</span>' : ''}
                </div>
            </div>
        `;
    }

    renderEstrelas(nota) {
        const notaInt = Math.floor(nota);
        const temMeia = nota - notaInt >= 0.5;
        
        let estrelas = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= notaInt) {
                estrelas += '★';
            } else if (i === notaInt + 1 && temMeia) {
                estrelas += '⯨';
            } else {
                estrelas += '☆';
            }
        }
        return estrelas;
    }

    setupVoteButtons() {
        const buttons = document.querySelectorAll('.btn-util');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const avaliacaoId = btn.getAttribute('data-avaliacao-id');
                const util = btn.getAttribute('data-util') === 'true';
                await this.votarAvaliacao(avaliacaoId, util);
            });
        });
    }

    async enviarAvaliacao() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            if (window.modalManager) {
                window.modalManager.showWarning(
                    'Login Necessário',
                    'Você precisa estar logado para avaliar produtos.'
                );
            }
            return;
        }

        const nota = parseInt(document.getElementById('nota-input').value);
        const titulo = document.getElementById('titulo-input').value.trim();
        const comentario = document.getElementById('comentario-input').value.trim();

        if (!nota || nota < 1 || nota > 5) {
            if (window.modalManager) {
                window.modalManager.showError('Erro', 'Por favor, selecione uma nota de 1 a 5 estrelas.');
            }
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    produto_id: this.produtoId,
                    nota: nota,
                    titulo: titulo || null,
                    comentario: comentario || null
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao enviar avaliação');
            }

            // Limpar formulário
            document.getElementById('form-avaliacao').reset();
            this.notaSelecionada = 0;
            document.querySelectorAll('.rating-input .star').forEach(s => {
                s.classList.remove('active');
                s.textContent = '☆';
            });

            // Recarregar avaliações
            await this.loadAvaliacoes();

            // Mostrar sucesso
            if (window.modalManager) {
                window.modalManager.showSuccess(
                    'Avaliação Enviada!',
                    'Obrigado por avaliar este produto.'
                );
            }

        } catch (error) {
            if (window.modalManager) {
                window.modalManager.showError('Erro', error.message);
            }
        }
    }

    async votarAvaliacao(avaliacaoId, util) {
        const token = localStorage.getItem('token');
        
        if (!token) {
            if (window.modalManager) {
                window.modalManager.showWarning(
                    'Login Necessário',
                    'Você precisa estar logado para votar em avaliações.'
                );
            }
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/reviews/${avaliacaoId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ util: util })
            });

            if (!response.ok) {
                throw new Error('Erro ao votar');
            }

            // Recarregar avaliações
            await this.loadAvaliacoes();

        } catch (error) {
            // Silenciosamente falhar
        }
    }
}

// Inicializar quando o DOM estiver pronto
if (typeof window !== 'undefined') {
    window.sistemaAvaliacoes = new SistemaAvaliacoes();
}

