// ===== ROXINHO SHOP - PÁGINA DO PRODUTO ATUALIZADA =====
// Desenvolvido por Gabriel (gabwvr) e adaptado por Manus
// Sistema de avaliações da página do produto integrado com back-end
// Comentários didáticos para facilitar o entendimento

const API_BASE_URL = "https://8000-i0rq7d4vghqcu0v23lypv-648d7310.manusvm.computer"; // URL da API do FastAPI

class SistemaAvaliacoes {
  constructor() {
    this.produtoAtual = null;
    this.avaliacoes = [];
    this.filtroAtivo = 'todas';
    this.ordenacaoAtiva = 'mais-recentes';
    this.paginaAtual = 1;
    this.itensPorPagina = 5;
    this.notaSelecionadaModal = 0;
    this.fotosUpload = [];
    
    this.inicializar();
  }

  // Inicialização do sistema
  inicializar() {
    this.carregarProdutoDaURL();
    this.configurarEventListeners();
    // this.gerarAvaliacoesFalsas(); // Removido, dados virão do BD
  }

  // Carrega produto baseado no ID da URL
  async carregarProdutoDaURL() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = parseInt(params.get("id")) || 1;
    
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${idProduto}`);
        if (!response.ok) {
            throw new Error('Produto não encontrado');
        }
        this.produtoAtual = await response.json();
        
        this.renderizarProduto();
        this.carregarProdutosRelacionados();
        this.carregarAvaliacoes();
        this.registrarVisualizacao();
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        this.exibirErroProduto();
    }
  }

  // Exibe mensagem de erro quando produto não é encontrado
  exibirErroProduto() {
    const container = document.querySelector('.container-produto');
    if (container) {
      container.innerHTML = `
        <div class="erro-produto">
          <h2>Produto não encontrado</h2>
          <p>O produto que você está procurando não existe ou foi removido.</p>
          <a href="produtos.html" class="btn-voltar">Voltar aos produtos</a>
        </div>
      `;
    }
  }

  // Renderiza informações básicas do produto
  renderizarProduto() {
    const produto = this.produtoAtual;
    
    // Branding
    document.title = `${produto.nome} | Roxinho Shop`;
    
    // Breadcrumb - com verificação de elemento
    const breadcrumb = document.getElementById("breadcrumb");
    if (breadcrumb) {
      breadcrumb.innerHTML = `
        <b class="texto-voce-esta-em">Você está em:</b>
        <a href="index.html" class="item-caminho">Início</a>
        <span class="separador">></span>
        <span class="item-caminho">${produto.nome}</span>
      `;
    }

    // Informações básicas - com verificações de elementos
    this.definirElementoTexto("imagemProduto", produto.imagem_principal, 'src');
    this.definirElementoTexto("imagemProduto", produto.nome, 'alt');
    this.definirElementoTexto("nomeProduto", produto.nome || '');
    
    // Descrição do produto (substituindo info-entrega)
    const descricaoCompletaProduto = document.getElementById('descricaoCompletaProduto');
    if (descricaoCompletaProduto) {
        descricaoCompletaProduto.innerHTML = produto.descricao || 'Nenhuma descrição disponível.';
    }
    
    // Comparação de Preços
    this.definirElementoTexto("precoML", `R$ ${produto.preco_ml.toFixed(2).replace('.', ',')}`);
    this.definirElementoTexto("linkML", produto.link_ml, 'href');
    this.definirElementoTexto("precoAmazon", `R$ ${produto.preco_amazon.toFixed(2).replace('.', ',')}`);
    this.definirElementoTexto("linkAmazon", produto.link_amazon, 'href');

    // Modal de Avaliação
    this.definirElementoTexto("imagemProdutoModal", produto.imagem_principal, 'src');
    this.definirElementoTexto("nomeProdutoModal", produto.nome);
  }

  // Função auxiliar para definir texto em elementos com verificação
  definirElementoTexto(id, valor, atributo = 'textContent') {
    const elemento = document.getElementById(id);
    if (elemento) {
      if (atributo === 'textContent') {
        elemento.textContent = valor;
      } else {
        elemento.setAttribute(atributo, valor);
      }
    }
  }

  // Carrega produtos relacionados usando a API de backend
  async carregarProdutosRelacionados() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/related/${this.produtoAtual.id}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar produtos relacionados');
        }
        const relacionados = await response.json();
        
        const grade = document.getElementById('gradeRelacionados');
        if (!grade) return;
        
        grade.innerHTML = '';

        relacionados.forEach(produto => {
            const card = this.criarCardProduto(produto);
            grade.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos relacionados:', error);
    }
  }

  criarCardProduto(produto) {
    const card = document.createElement('div');
    card.classList.add('card-produto');
    card.innerHTML = `
      <a href="paginaproduto.html?id=${produto.id}">
        <img src="${produto.imagem_principal}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
        <div class="precos-comparacao">
          <p>ML: <strong>R$ ${produto.preco_ml.toFixed(2).replace('.', ',')}</strong></p>
          <p>Amazon: <strong>R$ ${produto.preco_amazon.toFixed(2).replace('.', ',')}</strong></p>
        </div>
      </a>
    `;
    return card;
  }

  // Configura event listeners
  configurarEventListeners() {
    // Novo botão para abrir modal
    const btnAvaliar = document.getElementById('btnAvaliarProduto');
    if (btnAvaliar) {
        btnAvaliar.addEventListener('click', () => {
            this.abrirModalAvaliacao();
        });
    }
    
    // Listener para enviar avaliação
    const btnEnviarAvaliacao = document.getElementById('btnEnviarAvaliacao');
    if (btnEnviarAvaliacao) {
        btnEnviarAvaliacao.addEventListener('click', () => {
            this.enviarAvaliacao();
        });
    }
    
    // Listener para fechar modal
    const modalAvaliacao = document.getElementById('modalAvaliacao');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const btnCancelar = document.getElementById('btnCancelar');
    
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', () => {
            modalAvaliacao.style.display = 'none';
        });
    }
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modalAvaliacao.style.display = 'none';
        });
    }
    
    // Listeners para seleção de nota
    const estrelas = document.querySelectorAll('#estrelasSelecao i');
    estrelas.forEach(estrela => {
        estrela.addEventListener('click', (e) => {
            this.selecionarNota(parseInt(e.target.dataset.nota));
        });
    });
  }

  // Carrega avaliações do backend
  async carregarAvaliacoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/avaliacoes/${this.produtoAtual.id}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar avaliações');
        }
        this.avaliacoes = await response.json();
        this.renderizarAvaliacoes();
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        // Manter avaliações vazias em caso de erro
        this.avaliacoes = [];
        this.renderizarAvaliacoes();
    }
  }

  // Renderiza a lista de avaliações
  renderizarAvaliacoes() {
    const container = document.getElementById('containerAvaliacoes');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (this.avaliacoes.length === 0) {
      container.innerHTML = '<p class="estado-vazio">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>';
      return;
    }
    
    this.avaliacoes.forEach(avaliacao => {
      const item = this.renderizarAvaliacao(avaliacao);
      container.appendChild(item);
    });
  }

  // Renderiza um item de avaliação
  renderizarAvaliacao(avaliacao) {
    const item = document.createElement('div');
    item.classList.add('item-avaliacao');
    item.innerHTML = `
      <div class="header-avaliacao">
        <div class="info-usuario">
          <span class="nome-usuario">${avaliacao.nome_usuario}</span>
          <span class="data-avaliacao">${new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="nota-estrelas">${this.gerarEstrelas(avaliacao.nota)}</div>
      </div>
      <p class="comentario">${avaliacao.comentario}</p>
      <!-- Botões "Responder" e "Útil" removidos conforme solicitado -->
    `;
    return item;
  }

  // Gera HTML das estrelas
  gerarEstrelas(nota) {
    let html = '';
    const notaArredondada = Math.round(nota);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= notaArredondada) {
        html += '<i class="fas fa-star estrela"></i>';
      } else {
        html += '<i class="fas fa-star estrela vazia"></i>';
      }
    }
    
    return html;
  }

  // Abre modal de avaliação
  abrirModalAvaliacao() {
    const user = getLoggedInUser();
    if (!user) {
        alert("Você precisa estar logado para avaliar um produto.");
        window.location.href = "login.html";
        return;
    }
    document.getElementById('modalAvaliacao').style.display = 'flex';
  }

  // Fecha modal de avaliação
  fecharModalAvaliacao() {
    document.getElementById('modalAvaliacao').style.display = 'none';
    // Limpar campos
    this.notaSelecionadaModal = 0;
    document.querySelectorAll('#estrelasSelecao i').forEach(estrela => estrela.classList.remove('selecionada'));
    document.getElementById('notaSelecionada').innerText = 'Selecione uma nota';
    document.getElementById('tituloAvaliacao').value = '';
    document.getElementById('comentarioAvaliacao').value = '';
  }

  // Seleciona nota no modal
  selecionarNota(nota) {
    this.notaSelecionadaModal = nota;
    // Lógica para destacar as estrelas (ajustar conforme o HTML)
    document.querySelectorAll('#estrelasSelecao i').forEach((estrela, index) => {
        if (index < nota) {
            estrela.classList.add('selecionada');
        } else {
            estrela.classList.remove('selecionada');
        }
    });
    
    const textos = ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'];
    const notaSelecionada = document.getElementById('notaSelecionada');
    if (notaSelecionada) {
      notaSelecionada.textContent = textos[nota] || 'Selecione uma nota';
    }
  }

  // Envia avaliação para o backend
  async enviarAvaliacao() {
    const nota = this.notaSelecionadaModal;
    const comentario = document.getElementById('comentarioAvaliacao').value;
    const user = getLoggedInUser();

    if (nota === 0 || comentario.trim() === '') {
      alert('Por favor, selecione uma nota e escreva um comentário.');
      return;
    }
    
    if (!user) {
        alert("Erro: Usuário não logado.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                produto_id: this.produtoAtual.id,
                nota: nota,
                comentario: comentario,
                usuario_id: user.id // O backend deve usar o ID do usuário logado
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Falha ao enviar avaliação.');
        }

        alert('Avaliação enviada com sucesso!');
        this.fecharModalAvaliacao();
        this.carregarAvaliacoes(); // Recarrega as avaliações do backend
    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        alert(`Erro ao enviar avaliação: ${error.message}`);
    }
  }

  // Função para registrar visualização no histórico
  async registrarVisualizacao() {
    const user = getLoggedInUser();
    if (!user) {
        // Não registra visualização se não estiver logado
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/historico/${this.produtoAtual.id}?user_id=${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
             console.warn('Falha ao registrar visualização no histórico.');
        }
    } catch (error) {
        console.error('Erro ao registrar visualização:', error);
    }
  }
}

// Funções globais
function navegarParaProduto(id) {
  window.location.href = `paginaproduto.html?id=${id}`;
}

// Inicialização
let sistemaAvaliacoes;

document.addEventListener('DOMContentLoaded', function() {
  try {
    // Certifique-se de que a função getLoggedInUser está disponível (do auth.js)
    if (typeof getLoggedInUser !== 'function') {
        console.error('Função getLoggedInUser não encontrada. Verifique se auth.js foi carregado.');
    }
    sistemaAvaliacoes = new SistemaAvaliacoes();
  } catch (error) {
    console.error('Erro ao inicializar sistema de avaliações:', error);
    
    // Mostrar mensagem de erro para o usuário
    const container = document.querySelector('.container-produto') || document.body;
    const erroDiv = document.createElement('div');
    erroDiv.className = 'erro-sistema';
    erroDiv.innerHTML = `
      <div style="text-align: center; padding: 20px; background: #f8d7da; color: #721c24; border-radius: 8px; margin: 20px;">
        <h3>Erro ao carregar página do produto</h3>
        <p>Ocorreu um erro ao inicializar o sistema. Por favor, recarregue a página.</p>
        <button onclick="window.location.reload()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Recarregar Página
        </button>
      </div>
    `;
    container.appendChild(erroDiv);
  }
});

