
document.addEventListener(\'DOMContentLoaded\', () => {
    const historicoVazioDiv = document.getElementById(\'historico-vazio\');
    const conteudoHistoricoDiv = document.getElementById(\'conteudo-historico\');
    const listaProdutosVistosDiv = document.getElementById(\'lista-produtos-vistos\');
    const btnLimparHistorico = document.getElementById(\'btn-limpar-historico\');

    let usuarioLogado = null;

    // Função para obter o usuário logado (simulado)
    function getUsuarioLogado() {
        // Em um ambiente real, isso viria de uma sessão ou token de autenticação
        // Por enquanto, vamos simular um usuário logado com ID 1
        return { id: 1 }; 
    }

    async function fetchHistoricoProdutos() {
        usuarioLogado = getUsuarioLogado();
        if (!usuarioLogado) {
            console.log(\'Nenhum usuário logado. Não é possível buscar o histórico.\');
            historicoVazioDiv.style.display = \'flex\';
            conteudoHistoricoDiv.style.display = \'none\';
            return;
        }

        try {
            const response = await fetch(`/php/api.php/historico/${usuarioLogado.id}`);
            const data = await response.json();

            if (response.ok && data.historico && data.historico.length > 0) {
                displayHistorico(data.historico);
                historicoVazioDiv.style.display = \'none\';
                conteudoHistoricoDiv.style.display = \'block\';
            } else {
                historicoVazioDiv.style.display = \'flex\';
                conteudoHistoricoDiv.style.display = \'none\';
            }
        } catch (error) {
            console.error(\'Erro ao buscar histórico de produtos:\', error);
            historicoVazioDiv.style.display = \'flex\';
            conteudoHistoricoDiv.style.display = \'none\';
        }
    }

    function displayHistorico(historico) {
        listaProdutosVistosDiv.innerHTML = \'\';
        historico.forEach(item => {
            const produtoCard = document.createElement(\'div\');
            produtoCard.classList.add(\'cartao-produto-historico\'); // Nova classe para estilização
            produtoCard.innerHTML = `
                <a href="produto.html?id=${item.produto_id}" class="link-produto">
                    <img src="${item.imagem_url}" alt="${item.produto_nome}" class="imagem-produto-historico">
                    <div class="detalhes-produto-historico">
                        <h3 class="nome-produto-historico">${item.produto_nome}</h3>
                        <p class="preco-produto-historico">R$ ${parseFloat(item.preco).toFixed(2).replace(\'.\', \',\')}</p>
                        <p class="data-visualizacao">Visto em: ${new Date(item.data_visualizacao).toLocaleDateString(\'pt-BR\', { day: \'2-digit\', month: \'2-digit\', year: \'numeric\', hour: \'2-digit\', minute: \'2-digit\' })}</p>
                    </div>
                </a>
            `;
            listaProdutosVistosDiv.appendChild(produtoCard);
        });
    }

    btnLimparHistorico.addEventListener(\'click\', async () => {
        if (!usuarioLogado) {
            showNotification(\'Você precisa estar logado para limpar o histórico.\', \'error\');
            return;
        }

        if (confirm(\'Tem certeza que deseja limpar todo o seu histórico de produtos vistos?\')) {
            try {
                const response = await fetch(`/php/api.php/historico/${usuarioLogado.id}`, {
                    method: \'DELETE\',
                });
                const data = await response.json();

                if (response.ok) {
                    showNotification(data.message, \'success\');
                    fetchHistoricoProdutos(); // Recarregar o histórico
                } else {
                    showNotification(data.error || \'Erro ao limpar histórico.\', \'error\');
                }
            } catch (error) {
                console.error(\'Erro ao limpar histórico:\', error);
                showNotification(\'Erro de conexão ao limpar histórico.\', \'error\');
            }
        }
    });

    fetchHistoricoProdutos();
});

