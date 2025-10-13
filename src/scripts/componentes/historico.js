/**
 * Sistema de Histórico de Produtos Visualizados
 * Gerencia o histórico de produtos visualizados pelo usuário
 */

document.addEventListener('DOMContentLoaded', () => {
    const historicoVazioDiv = document.getElementById('historico-vazio');
    const conteudoHistoricoDiv = document.getElementById('conteudo-historico');
    const listaProdutosVistosDiv = document.getElementById('lista-produtos-vistos');
    const btnLimparHistorico = document.getElementById('btn-limpar-historico');

    const apiBase = 'https://roxinho-shop-backend.vercel.app/api';
    let usuarioLogado = null;

    // Função para obter o usuário logado do localStorage
    function getUsuarioLogado() {
        const token = localStorage.getItem('jwtToken');
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        
        if (token && userId) {
            return { 
                id: parseInt(userId), 
                email: userEmail,
                token: token 
            };
        }
        return null;
    }

    async function fetchHistoricoProdutos() {
        usuarioLogado = getUsuarioLogado();
        
        if (!usuarioLogado) {
            historicoVazioDiv.style.display = 'flex';
            conteudoHistoricoDiv.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`${apiBase}/historico/${usuarioLogado.id}`, {
                headers: {
                    'Authorization': `Bearer ${usuarioLogado.token}`
                }
            });
            
            const data = await response.json();

            if (response.ok && data.historico && data.historico.length > 0) {
                displayHistorico(data.historico);
                historicoVazioDiv.style.display = 'none';
                conteudoHistoricoDiv.style.display = 'block';
            } else {
                historicoVazioDiv.style.display = 'flex';
                conteudoHistoricoDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao buscar histórico de produtos:', error);
            historicoVazioDiv.style.display = 'flex';
            conteudoHistoricoDiv.style.display = 'none';
        }
    }

    function displayHistorico(historico) {
        listaProdutosVistosDiv.innerHTML = '';
        historico.forEach(item => {
            const produtoCard = document.createElement('div');
            produtoCard.classList.add('cartao-produto-historico');
            produtoCard.innerHTML = `
                <a href="produto.html?id=${item.produto_id}" class="link-produto">
                    <img src="${item.imagem_url || 'https://via.placeholder.com/150?text=Produto'}" alt="${item.produto_nome}" class="imagem-produto-historico">
                    <div class="detalhes-produto-historico">
                        <h3 class="nome-produto-historico">${item.produto_nome}</h3>
                        <p class="preco-produto-historico">R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</p>
                        <p class="data-visualizacao">Visto em: ${new Date(item.data_visualizacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </a>
            `;
            listaProdutosVistosDiv.appendChild(produtoCard);
        });
    }

    btnLimparHistorico.addEventListener('click', async () => {
        if (!usuarioLogado) {
            if (typeof showNotification === 'function') {
                showNotification('Você precisa estar logado para limpar o histórico.', 'error');
            } else {
                alert('Você precisa estar logado para limpar o histórico.');
            }
            return;
        }

        if (confirm('Tem certeza que deseja limpar todo o seu histórico de produtos vistos?')) {
            try {
                const response = await fetch(`${apiBase}/historico/${usuarioLogado.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${usuarioLogado.token}`
                    }
                });
                
                const data = await response.json();

                if (response.ok) {
                    if (typeof showNotification === 'function') {
                        showNotification(data.message || 'Histórico limpo com sucesso!', 'success');
                    } else {
                        alert(data.message || 'Histórico limpo com sucesso!');
                    }
                    fetchHistoricoProdutos(); // Recarregar o histórico
                } else {
                    if (typeof showNotification === 'function') {
                        showNotification(data.error || 'Erro ao limpar histórico.', 'error');
                    } else {
                        alert(data.error || 'Erro ao limpar histórico.');
                    }
                }
            } catch (error) {
                console.error('Erro ao limpar histórico:', error);
                if (typeof showNotification === 'function') {
                    showNotification('Erro de conexão ao limpar histórico.', 'error');
                } else {
                    alert('Erro de conexão ao limpar histórico.');
                }
            }
        }
    });

    // Carregar histórico ao inicializar
    fetchHistoricoProdutos();
});

