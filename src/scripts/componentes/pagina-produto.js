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

  inicializar() {
    this.carregarProdutoDaURL();
    this.configurarEventListeners();
  }

  async carregarProdutoDaURL() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = parseInt(params.get("id"));
    
    if (isNaN(idProduto)) {
      this.exibirErroProduto("ID do produto inválido.");
      return;
    }

    try {
      const response = await fetch(`${window.API_BASE_URL}/produtos/${idProduto}`);
      const data = await response.json();

      if (data.success && data.product) {
        this.produtoAtual = data.product;
        this.renderizarProduto();
        this.carregarAvaliacoesDoBackend();
        this.carregarProdutosRelacionados();
      } else {
        this.exibirErroProduto(data.message || "Produto não encontrado.");
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      this.exibirErroProduto("Não foi possível carregar o produto. Tente novamente mais tarde.");
    }
  }

  exibirErroProduto(mensagem) {
    const container = document.querySelector('.pagina-produto');
    if (container) {
      container.innerHTML = `
        <div class="erro-produto">
          <h2>Erro ao carregar produto</h2>
          <p>${mensagem}</p>
          <a href="../../index.html" class="btn-voltar">Voltar à página inicial</a>
        </div>
      `;
    }
  }

  renderizarProduto() {
    const produto = this.produtoAtual;
    if (!produto) return;

    document.title = `${produto.nome} | Roxinho Shop`;

    // Breadcrumb
    document.getElementById("breadcrumbCategoria").textContent = produto.categoria || 'Categoria';
    document.getElementById("breadcrumbCategoria").href = `produtos.html?categoria=${encodeURIComponent(produto.categoria || '')}`;
    document.getElementById("breadcrumbProduto").textContent = produto.nome;

    // Imagem Principal
    const imagemProduto = document.getElementById("imagemProduto");
    if (imagemProduto) {
      imagemProduto.src = produto.imagem_principal || produto.imagem || 'https://via.placeholder.com/400?text=Sem+Imagem';
      imagemProduto.alt = produto.nome;
    }

    // Informações do Produto
    document.getElementById("nomeProduto").textContent = produto.nome;
    document.getElementById("descricaoProduto").textContent = produto.descricao_curta || produto.descricao;
    document.getElementById("marcaProduto").textContent = produto.marca || '';
    document.getElementById("estoqueStatus").textContent = produto.estoque > 0 ? "● Em estoque" : "● Indisponível";
    document.getElementById("skuProduto").textContent = `SKU: PROD${produto.id.toString().padStart(5, "0")}`;

    // Preços
    document.getElementById("precoProduto").textContent = `R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`;
    if (produto.preco_original) {
      document.getElementById("precoOriginal").textContent = `De R$ ${parseFloat(produto.preco_original).toFixed(2).replace('.', ',')}`;
      document.getElementById("precoOriginal").style.display = 'block';
    }
    if (produto.desconto && produto.desconto > 0) {
      document.getElementById("descontoProduto").textContent = `-${produto.desconto}%`;
      document.getElementById("descontoProduto").style.display = 'inline-block';
    }
    document.getElementById("parcelamentoProduto").textContent = `ou em até ${produto.parcelamento || "12x sem juros"}`;

    // Preços e links dos marketplaces
    const precoMercadoLivre = document.getElementById("precoMercadoLivre");
    const btnMercadoLivre = document.getElementById("btnMercadoLivre");
    if (produto.preco_mercado_livre && btnMercadoLivre) {
      precoMercadoLivre.textContent = `R$ ${parseFloat(produto.preco_mercado_livre).toFixed(2).replace('.', ',')}`;
      btnMercadoLivre.href = produto.link_mercado_livre || '#';
      precoMercadoLivre.style.display = 'block';
      btnMercadoLivre.style.display = 'flex';
    } else if (precoMercadoLivre && btnMercadoLivre) {
      precoMercadoLivre.style.display = 'none';
      btnMercadoLivre.style.display = 'none';
    }

    const precoAmazon = document.getElementById("precoAmazon");
    const btnAmazon = document.getElementById("btnAmazon");
    if (produto.preco_amazon && btnAmazon) {
      precoAmazon.textContent = `R$ ${parseFloat(produto.preco_amazon).toFixed(2).replace('.', ',')}`;
      btnAmazon.href = produto.link_amazon || '#';
      precoAmazon.style.display = 'block';
      btnAmazon.style.display = 'flex';
    } else if (precoAmazon && btnAmazon) {
      precoAmazon.style.display = 'none';
      btnAmazon.style.display = 'none';
    }

    // Descrição completa
    const descricaoCompleta = document.getElementById("descricaoProdutoCompleta");
    if (descricaoCompleta) {
      descricaoCompleta.textContent = produto.descricao_longa || produto.descricao || 'Nenhuma descrição detalhada disponível.';
    }

    // Miniaturas (se houver)
    const miniaturasContainer = document.getElementById("miniaturas");
    if (miniaturasContainer && produto.imagens_secundarias && produto.imagens_secundarias.length > 0) {
      miniaturasContainer.innerHTML = produto.imagens_secundarias.map(img => `
        <img src="${img}" alt="${produto.nome}" class="miniatura" onclick="sistemaAvaliacoes.trocarImagemPrincipal('${img}')">
      `).join('');
    } else if (miniaturasContainer) {
      miniaturasContainer.innerHTML = ''; // Limpa se não houver miniaturas
    }
  }

  trocarImagemPrincipal(novaImagemSrc) {
    const imagemPrincipal = document.getElementById("imagemProduto");
    if (imagemPrincipal) {
      imagemPrincipal.src = novaImagemSrc;
    }
  }

  configurarEventListeners() {
    const btnAvaliar = document.getElementById('btnAvaliar');
    if (btnAvaliar) {
      btnAvaliar.addEventListener('click', () => this.abrirModalAvaliacao());
    }

    const btnFecharModal = document.getElementById('btnFecharModal');
    if (btnFecharModal) {
      btnFecharModal.addEventListener('click', () => this.fecharModalAvaliacao());
    }

    const estrelasSelecao = document.getElementById('estrelasSelecao');
    if (estrelasSelecao) {
      estrelasSelecao.addEventListener('mouseover', (e) => this.destacarEstrelas(e));
      estrelasSelecao.addEventListener('mouseout', () => this.limparDestaqueEstrelas());
      estrelasSelecao.addEventListener('click', (e) => this.selecionarNota(e));
    }

    const btnAdicionarFoto = document.getElementById('btnAdicionarFoto');
    const fotosAvaliacaoInput = document.getElementById('fotosAvaliacao');
    if (btnAdicionarFoto && fotosAvaliacaoInput) {
      btnAdicionarFoto.addEventListener('click', () => fotosAvaliacaoInput.click());
      fotosAvaliacaoInput.addEventListener('change', (e) => this.handleFotoUpload(e));
    }

    const btnEnviarAvaliacao = document.getElementById('btnEnviarAvaliacao');
    if (btnEnviarAvaliacao) {
      btnEnviarAvaliacao.addEventListener('click', () => this.enviarAvaliacao());
    }

    const ordenarAvaliacoes = document.getElementById('ordenarAvaliacoes');
    if (ordenarAvaliacoes) {
      ordenarAvaliacoes.addEventListener('change', (e) => {
        this.ordenacaoAtiva = e.target.value;
        this.carregarAvaliacoesDoBackend();
      });
    }

    document.querySelectorAll('.filtros-avaliacao .btn-filtro').forEach(button => {
      button.addEventListener('click', (e) => {
        document.querySelectorAll('.filtros-avaliacao .btn-filtro').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.filtroAtivo = e.target.dataset.filtro;
        this.carregarAvaliacoesDoBackend();
      });
    });
  }

  abrirModalAvaliacao() {
    const modal = document.getElementById('modalAvaliacao');
    if (modal) {
      modal.style.display = 'flex';
      this.notaSelecionadaModal = 0;
      this.fotosUpload = [];
      document.getElementById('tituloAvaliacao').value = '';
      document.getElementById('comentarioAvaliacao').value = '';
      document.getElementById('previewFotos').innerHTML = '';
      this.limparDestaqueEstrelas();
      
      const imagemProdutoModal = document.getElementById('imagemProdutoModal');
      const nomeProdutoModal = document.getElementById('nomeProdutoModal');
      if (imagemProdutoModal && nomeProdutoModal && this.produtoAtual) {
        imagemProdutoModal.src = this.produtoAtual.imagem_principal || this.produtoAtual.imagem || 'https://via.placeholder.com/100';
        nomeProdutoModal.textContent = this.produtoAtual.nome;
      }
    }
  }

  fecharModalAvaliacao() {
    const modal = document.getElementById('modalAvaliacao');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  destacarEstrelas(e) {
    const estrelas = document.querySelectorAll('#estrelasSelecao .fa-star');
    const nota = parseInt(e.target.dataset.nota);
    if (!isNaN(nota)) {
      estrelas.forEach((estrela, index) => {
        if (index < nota) {
          estrela.classList.add('hover');
        } else {
          estrela.classList.remove('hover');
        }
      });
    }
  }

  limparDestaqueEstrelas() {
    const estrelas = document.querySelectorAll('#estrelasSelecao .fa-star');
    estrelas.forEach((estrela, index) => {
      if (index < this.notaSelecionadaModal) {
        estrela.classList.add('selected');
      } else {
        estrela.classList.remove('selected', 'hover');
      }
    });
    document.getElementById('notaSelecionada').textContent = this.notaSelecionadaModal > 0 ? `${this.notaSelecionadaModal} estrela${this.notaSelecionadaModal > 1 ? 's' : ''}` : 'Selecione uma nota';
  }

  selecionarNota(e) {
    const nota = parseInt(e.target.dataset.nota);
    if (!isNaN(nota)) {
      this.notaSelecionadaModal = nota;
      this.limparDestaqueEstrelas(); // Aplica a classe 'selected' para a nota escolhida
    }
  }

  handleFotoUpload(e) {
    const files = Array.from(e.target.files);
    const previewFotos = document.getElementById('previewFotos');
    if (!previewFotos) return;

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.classList.add('preview-thumb');
          previewFotos.appendChild(img);
          this.fotosUpload.push(event.target.result); // Armazena base64 ou blob URL
        };
        reader.readAsDataURL(file);
      }
    });
  }

  async enviarAvaliacao() {
    if (!this.produtoAtual) return;

    const nota = this.notaSelecionadaModal;
    const titulo = document.getElementById('tituloAvaliacao').value.trim();
    const comentario = document.getElementById('comentarioAvaliacao').value.trim();

    if (nota === 0) {
      await alertaFluent('Atenção', 'Por favor, selecione uma nota para o produto.', 'fas fa-exclamation-triangle');
      return;
    }
    if (!comentario) {
      await alertaFluent('Atenção', 'Por favor, escreva um comentário para sua avaliação.', 'fas fa-exclamation-triangle');
      return;
    }

    const novaAvaliacao = {
      produto_id: this.produtoAtual.id,
      nome_usuario: "Usuário Anônimo", // TODO: Obter nome do usuário logado
      nota: nota,
      titulo: titulo,
      comentario: comentario,
      data: new Date().toISOString(),
      imagens: this.fotosUpload // Array de imagens em base64 ou URLs
    };

    try {
      const response = await fetch(`${window.API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assumindo que o token está no localStorage
        },
        body: JSON.stringify(novaAvaliacao)
      });

      const result = await response.json();

      if (result.success) {
        await alertaFluent('Sucesso!', 'Sua avaliação foi enviada com sucesso!', 'fas fa-check-circle');
        this.fecharModalAvaliacao();
        this.carregarAvaliacoesDoBackend(); // Recarrega as avaliações para incluir a nova
      } else {
        await alertaFluent('Erro', result.message || 'Não foi possível enviar sua avaliação.', 'fas fa-exclamation-triangle');
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      await alertaFluent('Erro', 'Não foi possível enviar sua avaliação. Tente novamente mais tarde.', 'fas fa-exclamation-triangle');
    }
  }

  async carregarAvaliacoesDoBackend() {
    if (!this.produtoAtual) return;
    const listaAvaliacoes = document.getElementById('listaAvaliacoes');
    if (!listaAvaliacoes) return;

    listaAvaliacoes.innerHTML = '<div class="loading-avaliacoes"><i class="fas fa-spinner fa-spin"></i> Carregando avaliações...</div>';

    try {
      const response = await fetch(`${window.API_BASE_URL}/reviews/product/${this.produtoAtual.id}`);
      const data = await response.json();

      if (data.success && data.reviews) {
        this.avaliacoes = data.reviews.map(av => ({ ...av, data: new Date(av.data) }));
        this.renderizarResumoAvaliacoes();
        this.renderizarListaAvaliacoes();
      } else {
        this.avaliacoes = [];
        listaAvaliacoes.innerHTML = '<p class="sem-avaliacoes">Nenhuma avaliação encontrada para este produto.</p>';
        this.renderizarResumoAvaliacoes();
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações do backend:', error);
      listaAvaliacoes.innerHTML = '<p class="erro-carregamento">Erro ao carregar avaliações. Tente novamente mais tarde.</p>';
      this.avaliacoes = [];
      this.renderizarResumoAvaliacoes();
    }
  }

  renderizarResumoAvaliacoes() {
    const totalAvaliacoes = this.avaliacoes.length;
    const somaNotas = this.avaliacoes.reduce((sum, av) => sum + av.nota, 0);
    const mediaNotas = totalAvaliacoes > 0 ? (somaNotas / totalAvaliacoes) : 0;

    document.getElementById('notaMedia').textContent = mediaNotas.toFixed(1);
    document.getElementById('totalAvaliacoes').textContent = `${totalAvaliacoes} avaliação${totalAvaliacoes !== 1 ? 'ões' : ''}`;
    document.getElementById('estrelasMedia').innerHTML = this.gerarEstrelasCartao(mediaNotas);

    for (let i = 1; i <= 5; i++) {
      const count = this.avaliacoes.filter(av => av.nota === i).length;
      const percent = totalAvaliacoes > 0 ? (count / totalAvaliacoes) * 100 : 0;
      const barra = document.getElementById(`barra${i}`);
      const percentual = document.getElementById(`percentual${i}`);
      if (barra) barra.style.width = `${percent}%`;
      if (percentual) percentual.textContent = `${percent.toFixed(0)}%`;
    }
  }

  renderizarListaAvaliacoes() {
    const listaAvaliacoes = document.getElementById('listaAvaliacoes');
    if (!listaAvaliacoes) return;

    let avaliacoesFiltradas = [...this.avaliacoes];

    // Aplicar filtro
    if (this.filtroAtivo === 'com-foto') {
      avaliacoesFiltradas = avaliacoesFiltradas.filter(av => av.imagens && av.imagens.length > 0);
    } else if (this.filtroAtivo !== 'todas') {
      const notaFiltro = parseInt(this.filtroAtivo);
      if (!isNaN(notaFiltro)) {
        avaliacoesFiltradas = avaliacoesFiltradas.filter(av => av.nota === notaFiltro);
      }
    }

    // Aplicar ordenação
    avaliacoesFiltradas.sort((a, b) => {
      switch (this.ordenacaoAtiva) {
        case 'mais-recentes': return b.data.getTime() - a.data.getTime();
        case 'mais-antigas': return a.data.getTime() - b.data.getTime();
        case 'maior-nota': return b.nota - a.nota;
        case 'menor-nota': return a.nota - b.nota;
        default: return 0;
      }
    });

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    const avaliacoesPaginadas = avaliacoesFiltradas.slice(inicio, fim);

    if (avaliacoesPaginadas.length === 0) {
      listaAvaliacoes.innerHTML = '<p class="sem-avaliacoes">Nenhuma avaliação encontrada com os filtros e ordenação atuais.</p>';
      this.renderizarPaginacao(0, 0);
      return;
    }

    listaAvaliacoes.innerHTML = avaliacoesPaginadas.map(avaliacao => `
      <div class="avaliacao-item">
        <div class="info-usuario">
          <span class="nome-usuario">${avaliacao.nome_usuario || 'Anônimo'}</span>
          <span class="data-avaliacao">${new Date(avaliacao.data).toLocaleDateString()}</span>
        </div>
        <div class="estrelas-avaliacao">
          ${this.gerarEstrelasCartao(avaliacao.nota)}
        </div>
        <h4 class="titulo-comentario">${avaliacao.titulo || ''}</h4>
        <p class="texto-comentario">${avaliacao.comentario}</p>
        ${avaliacao.imagens && avaliacao.imagens.length > 0 ? `
          <div class="galeria-fotos-avaliacao">
            ${avaliacao.imagens.map(img => `<img src="${img}" alt="Foto da avaliação" class="foto-avaliacao-thumb">`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    this.renderizarPaginacao(avaliacoesFiltradas.length, this.paginaAtual);
  }

  renderizarPaginacao(totalItens, paginaAtual) {
    const paginacaoContainer = document.getElementById('paginacaoAvaliacoes');
    if (!paginacaoContainer) return;

    const totalPaginas = Math.ceil(totalItens / this.itensPorPagina);
    paginacaoContainer.innerHTML = '';

    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.classList.add('btn-paginacao');
      if (i === paginaAtual) {
        btn.classList.add('active');
      }
      btn.addEventListener('click', () => {
        this.paginaAtual = i;
        this.renderizarListaAvaliacoes();
      });
      paginacaoContainer.appendChild(btn);
    }
  }

  gerarEstrelasCartao(nota) {
    let estrelasHtml = '';
    for (let i = 1; i <= 5; i++) {
      estrelasHtml += `<i class="fas fa-star ${i <= nota ? 'preenchida' : ''}"></i>`;
    }
    return estrelasHtml;
  }

  // Produtos relacionados
  async carregarProdutosRelacionados() {
    if (!this.produtoAtual) return;
    const gradeRelacionados = document.getElementById('gradeRelacionados');
    if (!gradeRelacionados) return;

    gradeRelacionados.innerHTML = '<div class="loading-relacionados"><i class="fas fa-spinner fa-spin"></i> Carregando produtos relacionados...</div>';

    try {
      const response = await fetch(`${window.API_BASE_URL}/produtos/categoria/${this.produtoAtual.categoria_id}`);
      const data = await response.json();

      if (data.success && data.products) {
        const produtosRelacionados = data.products.filter(p => p.id !== this.produtoAtual.id).slice(0, 4);
        if (produtosRelacionados.length > 0) {
          gradeRelacionados.innerHTML = produtosRelacionados.map(produto => `
            <a href="pagina-produto.html?id=${produto.id}" class="cartao-link">
              <div class="cartao-produto" data-produto-id="${produto.id}">
                <div class="imagem-produto">
                  <img src="${produto.imagem_principal || produto.imagem || 'https://via.placeholder.com/200'}" 
                       alt="${produto.nome}" 
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                  <div class="fundo-gradiente ${produto.imagemFallback || 'gradiente-roxo'}" style="display: none;"></div>
                  <button class="botao-favorito ${this.verificarFavorito(produto.id) ? 'ativo' : ''}" 
                          onclick="event.preventDefault(); event.stopPropagation(); sistemaAvaliacoes.alternarFavorito(${produto.id})">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
                <div class="conteudo-produto">
                  <div class="marca-produto">${produto.marca || ''}</div>
                  <h3 class="nome-produto">${produto.nome}</h3>
                  <div class="avaliacao-produto">
                    <div class="estrelas">
                      ${this.gerarEstrelasCartao(produto.avaliacao || 0)}
                    </div>
                    <span class="numero-avaliacoes">(${produto.avaliacoes || 0})</span>
                  </div>
                  <div class="preco-produto">
                    ${produto.preco_original ? `<span class="preco-original">R$ ${parseFloat(produto.preco_original).toFixed(2).replace('.', ',')}</span>` : ''}
                    <div class="preco-atual">R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}</div>
                    ${produto.desconto && produto.desconto > 0 ? `<span class="desconto-percentual">${produto.desconto}% OFF</span>` : ''}
                  </div>
                  <div class="parcelamento">${produto.parcelamento || '12x sem juros'}</div>
                  <div class="status-produto">
                    ${produto.estoque > 0 ? '<div class="status-item em-estoque2"><i class="fas fa-check"></i> Em estoque</div>' : ''}
                    ${produto.frete_gratis ? '<div class="status-item frete-gratis"><i class="fas fa-check"></i> Frete grátis</div>' : ''}
                  </div>
                </div>
                <div class="botoes-produto-home">
                  <button class="btn-comprar-direto ${produto.estoque <= 0 ? 'disabled' : ''}" 
                          onclick="event.preventDefault(); event.stopPropagation(); ${produto.estoque > 0 ? `comprarDireto(${produto.id})` : `mostrarNotificacao('Produto indisponível', 'aviso')`}"
                          ${produto.estoque <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-bolt"></i>
                    Comprar
                  </button>
                  <button class="btn-adicionar-carrinho ${produto.estoque <= 0 ? 'disabled' : ''}" 
                          onclick="event.preventDefault(); event.stopPropagation(); ${produto.estoque > 0 ? `adicionarProdutoAoCarrinho(${produto.id})` : `mostrarNotificacao('Produto indisponível', 'aviso')`}"
                          ${produto.estoque <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i>
                    Carrinho
                  </button>
                </div>
              </div>
            </a>
          `).join('');
        } else {
          gradeRelacionados.innerHTML = '<p class="sem-relacionados">Nenhum produto relacionado encontrado nesta categoria.</p>';
        }
      } else {
        gradeRelacionados.innerHTML = '<p class="sem-relacionados">Não foi possível carregar produtos relacionados.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar produtos relacionados:', error);
      gradeRelacionados.innerHTML = '<p class="erro-carregamento">Erro ao carregar produtos relacionados. Tente novamente mais tarde.</p>';
    }
  }

  verificarFavorito(produtoId) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    return favoritos.some(fav => fav.id === produtoId);
  }

  alternarFavorito(produtoId) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
    const index = favoritos.findIndex(fav => fav.id === produtoId);
    if (index > -1) {
      favoritos.splice(index, 1);
      mostrarNotificacao('Produto removido dos favoritos!', 'sucesso');
    } else {
      const produto = this.produtoAtual; // Simplificado, idealmente buscaria o produto completo
      if (produto) {
        favoritos.push({ id: produto.id, nome: produto.nome, imagem: produto.imagem_principal || produto.imagem, preco: produto.preco });
        mostrarNotificacao('Produto adicionado aos favoritos!', 'sucesso');
      }
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    this.renderizarProdutosRelacionados(); // Para atualizar o estado do botão de favorito
  }
}

const sistemaAvaliacoes = new SistemaAvaliacoes();

// Tornar funções globais para uso em onclick, se necessário
window.sistemaAvaliacoes = sistemaAvaliacoes;
window.comprarDireto = (id) => console.log('Comprar direto:', id);
window.adicionarProdutoAoCarrinho = (id) => console.log('Adicionar ao carrinho:', id);
window.mostrarNotificacao = (msg, tipo) => console.log(`Notificação (${tipo}): ${msg}`);

