import { buscarProdutosDaAPI } from "../servicos/banco-dados.js";

// Comentários didáticos para facilitar o entendimento

// Sistema de categorias expandido e produtos unificado
const sistemaCategorias = {
  'Hardware': {
    icone: 'fas fa-microchip',
    subcategorias: ['Processadores', 'Placas de Vídeo', 'Memórias RAM', 'Placas Mãe', 'Fontes', 'Coolers', 'Gabinetes', 'Armazenamento', 'Placas de Som'],
  },
  'Periféricos': {
    icone: 'fas fa-keyboard',
    subcategorias: ['Teclados', 'Mouses', 'Headsets', 'Webcams', 'Microfones', 'Mousepads', 'Controles', 'Caixas de Som', 'Monitores'],
  },
  'Computadores': {
    icone: 'fas fa-desktop',
    subcategorias: ['PCs Gamer', 'Workstations', 'All-in-One', 'Mini PCs', 'Notebooks', 'Chromebooks', 'Ultrabooks', 'Tablets'],
  },
  'Games': {
    icone: 'fas fa-gamepad',
    subcategorias: ['Consoles', 'Jogos PC', 'Jogos Console', 'Acessórios Gaming', 'Cadeiras Gamer', 'Mesas Gamer', 'Controles', 'Volantes'],
  },
  'Celular & Smartphone': {
    icone: 'fas fa-mobile-alt',
    subcategorias: ['Smartphones', 'Capas e Películas', 'Carregadores', 'Fones de Ouvido', 'Power Banks', 'Suportes', 'Smartwatches'],
  },
  'TV & Áudio': {
    icone: 'fas fa-tv',
    subcategorias: ['Smart TVs', 'TVs 4K', 'TVs 8K', 'Suportes TV', 'Conversores', 'Antenas', 'Soundbars', 'Home Theater'],
  },
  'Áudio': {
    icone: 'fas fa-headphones-alt',
    subcategorias: ['Fones de Ouvido', 'Caixas de Som', 'Soundbars', 'Amplificadores', 'Microfones', 'Interfaces de Áudio', 'Monitores de Referência'],
  },
  'Espaço Gamer': {
    icone: 'fas fa-chair',
    subcategorias: ['Cadeiras Gamer', 'Mesas Gamer', 'Suportes Monitor', 'Iluminação RGB', 'Decoração', 'Organizadores', 'Tapetes'],
  },
  'Casa Inteligente': {
    icone: 'fas fa-lightbulb',
    subcategorias: ['Assistentes Virtuais', 'Câmeras Segurança', 'Lâmpadas Smart', 'Tomadas Smart', 'Sensores', 'Fechaduras Digitais', 'Termostatos'],
  },
  'PC Gamer': {
    icone: 'fas fa-laptop-code',
    subcategorias: ['PCs Montados', 'Componentes Gamer', 'Periféricos Gaming', 'Monitores Gamer', 'Cadeiras Gamer'],
  },
  'Giftcards': {
    icone: 'fas fa-gift',
    subcategorias: ['Mais populares','Serviços', 'Jogos', 'Xbox', 'Nintendo'],
  }
};

// Estado global
let todosOsProdutos = [];
let produtosFiltrados = [];
let filtrosAtuais = {
  busca: '',
  categoria: '',
  subcategoria: '',
  marca: '',
  condicao: '',
  precoMinimo: 0,
  precoMaximo: 15000,
  avaliacaoMinima: 0,
  emEstoque: false,
  desconto: false,
  freteGratis: false,
  tags: []
};

// Configurações de paginação
let paginacaoConfig = {
  paginaAtual: 1,
  itensPorPagina: 12,
  totalPaginas: 1
};

let ordenacaoAtual = 'relevancia';
let modoVisualizacao = 'grade';
let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
let categoriaAtivaSelecionada = '';

// Elementos DOM
const campoBusca = document.getElementById('campoBusca');
const botaoAlternarFiltros = document.getElementById('alternarFiltros');
const barraFiltros = document.getElementById('barraFiltros');
const botaoVisualizacaoGrade = document.getElementById('visualizacaoGrade');
const botaoVisualizacaoLista = document.getElementById('visualizacaoLista');
const categoriasRelacionadasContainer = document.getElementById('categoriasRelacionadas');
const seletorMarca = document.getElementById('seletorMarca');
const faixaPrecoMinimo = document.getElementById('faixaPrecoMinimo');
const faixaPrecoMaximo = document.getElementById('faixaPrecoMaximo');
const spanPrecoMinimo = document.getElementById('precoMinimo');
const spanPrecoMaximo = document.getElementById('precoMaximo');
const filtroAvaliacao = document.getElementById('filtroAvaliacao');
const valorAvaliacao = document.getElementById('valorAvaliacao');
const apenasEmEstoque = document.getElementById('apenasEmEstoque');
const apenasComDesconto = document.getElementById('apenasComDesconto');
const apenasFreteGratis = document.getElementById('apenasFreteGratis');
const botaoLimparFiltros = document.getElementById('limparFiltros');
const breadcrumb = document.getElementById('breadcrumb');
const breadcrumbDinamico = document.getElementById('breadcrumbDinamico');
const caminhoBreadcrumb = document.getElementById('caminhoBreadcrumb');
const bannerCategoria = document.getElementById('bannerCategoria');
const tituloCategoria = document.getElementById('tituloCategoria');
const descricaoCategoria = document.getElementById('descricaoCategoria');
const contadorResultados = document.getElementById('contadorResultados');
const infoCategoria = document.getElementById('infoCategoria');
const seletorOrdenacao = document.getElementById('seletorOrdenacaoSimples');
const gradeProdutos = document.getElementById('gradeProdutos');
const semResultados = document.getElementById('semResultados');
const paginacao = document.getElementById('paginacao');

// Inicializar a aplicação
document.addEventListener("DOMContentLoaded", async function() {
  // Carregar produtos da API primeiro
  try {
    const produtosAPI = await buscarProdutosDaAPI();
    todosOsProdutos = produtosAPI.map(p => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao || '',
      preco: parseFloat(p.preco),
      imagem: p.imagem || 'https://via.placeholder.com/300x300?text=Sem+Imagem',
      categoria: p.categoria,
      subcategoria: p.subcategoria || '',
      origem: p.origem || 'manual',
      linkOriginal: p.link_original || '',
      marca: p.marca || '',
      tags: p.tags ? p.tags.split(',').map(tag => tag.trim()) : [],
      condicao: p.condicao || '',
      linkMercadoLivre: p.link_mercado_livre || '',
      precoMercadoLivre: p.preco_mercado_livre ? parseFloat(p.preco_mercado_livre) : null,
      linkAmazon: p.link_amazon || '',
      precoAmazon: p.preco_amazon ? parseFloat(p.preco_amazon) : null,
      estoque: p.estoque || 0,
      emEstoque: (p.estoque || 0) > 0,
      avaliacao: 4.5, // Valor padrão por enquanto
      avaliacoes: 0,
      desconto: 0,
      freteGratis: false,
      parcelamento: `em até 12x de R$ ${(parseFloat(p.preco) / 12).toFixed(2)}`
    }));
  } catch (error) {
    console.error("Erro ao carregar produtos da API:", error);
    todosOsProdutos = [];
  }

  // Renderizar categorias relacionadas na barra lateral
  renderizarCategoriasRelacionadas();

  inicializarFiltros();
  inicializarEventListeners();
  processarParametrosURL();
  
  // Só renderizar produtos se estivermos na página de produtos
  if (gradeProdutos) {
    aplicarFiltros(); // Chamar aplicarFiltros para processar e renderizar os produtos carregados
  }
  
  // Atualizar contador do carrinho se a função existir
  if (typeof atualizarContadorCarrinho === "function") {
    atualizarContadorCarrinho();
  }
});

// Funções de renderização
function renderizarProdutos(produtos) {
  if (!gradeProdutos) return;

  gradeProdutos.innerHTML = '';
  if (produtos.length === 0) {
    semResultados.style.display = 'block';
    paginacao.style.display = 'none';
    contadorResultados.textContent = 'Nenhum produto encontrado.';
    return;
  }
  semResultados.style.display = 'none';

  produtos.forEach(produto => {
    const produtoCard = document.createElement('div');
    produtoCard.classList.add('col-md-4', 'mb-4');
    produtoCard.innerHTML = `
      <div class="card produto-card">
        <a href="pagina-produto.html?id=${produto.id}">
          <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
        </a>
        <div class="card-body">
          <h5 class="card-title"><a href="pagina-produto.html?id=${produto.id}">${produto.nome}</a></h5>
          <p class="card-text">R$ ${produto.preco.toFixed(2)}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <button class="btn btn-primary btn-sm adicionar-carrinho" data-id="${produto.id}">Adicionar ao Carrinho</button>
            <button class="btn btn-outline-secondary btn-sm adicionar-favoritos" data-id="${produto.id}">
              <i class="${favoritos.includes(produto.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    gradeProdutos.appendChild(produtoCard);
  });
  contadorResultados.textContent = `${produtos.length} produtos encontrados.`;
}

function renderizarPaginacao(totalPaginas, paginaAtual) {
  if (!paginacao) return;
  paginacao.innerHTML = '';

  if (totalPaginas <= 1) {
    paginacao.style.display = 'none';
    return;
  }
  paginacao.style.display = 'flex'; // Mostrar paginação

  const ul = document.createElement('ul');
  ul.classList.add('pagination', 'justify-content-center');

  // Botão Anterior
  const liPrev = document.createElement('li');
  liPrev.classList.add('page-item');
  if (paginaAtual === 1) liPrev.classList.add('disabled');
  const aPrev = document.createElement('a');
  aPrev.classList.add('page-link');
  aPrev.href = '#';
  aPrev.textContent = 'Anterior';
  aPrev.addEventListener('click', (e) => {
    e.preventDefault();
    if (paginaAtual > 1) {
      paginacaoConfig.paginaAtual--;
      aplicarFiltros();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  liPrev.appendChild(aPrev);
  ul.appendChild(liPrev);

  // Números das páginas
  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    if (i === paginaAtual) li.classList.add('active');
    const a = document.createElement('a');
    a.classList.add('page-link');
    a.href = '#';
    a.textContent = i;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      paginacaoConfig.paginaAtual = i;
      aplicarFiltros();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    li.appendChild(a);
    ul.appendChild(li);
  }

  // Botão Próximo
  const liNext = document.createElement('li');
  liNext.classList.add('page-item');
  if (paginaAtual === totalPaginas) liNext.classList.add('disabled');
  const aNext = document.createElement('a');
  aNext.classList.add('page-link');
  aNext.href = '#';
  aNext.textContent = 'Próximo';
  aNext.addEventListener('click', (e) => {
    e.preventDefault();
    if (paginaAtual < totalPaginas) {
      paginacaoConfig.paginaAtual++;
      aplicarFiltros();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  liNext.appendChild(aNext);
  ul.appendChild(liNext);

  paginacao.appendChild(ul);
}

function renderizarCategoriasRelacionadas() {
  if (!categoriasRelacionadasContainer) return;

  categoriasRelacionadasContainer.innerHTML = '';

  // Adicionar a opção "Todas as Categorias"
  const liTodas = document.createElement('li');
  const linkTodas = document.createElement('a');
  linkTodas.href = '#';
  linkTodas.textContent = 'Todas as Categorias';
  linkTodas.classList.add('categoria-item');
  if (!filtrosAtuais.categoria) {
    linkTodas.classList.add('ativo');
  }
  linkTodas.addEventListener('click', (e) => {
    e.preventDefault();
    filtrosAtuais.categoria = '';
    filtrosAtuais.subcategoria = '';
    paginacaoConfig.paginaAtual = 1;
    const url = new URL(window.location);
    url.searchParams.delete('categoria');
    url.searchParams.delete('subcategoria');
    window.history.pushState({}, '', url);
    renderizarCategoriasRelacionadas();
    mostrarBannerCategoria('', '');
    aplicarFiltros();
  });
  liTodas.appendChild(linkTodas);
  categoriasRelacionadasContainer.appendChild(liTodas);

  for (const categoriaPrincipal in sistemaCategorias) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = categoriaPrincipal;
    link.classList.add('categoria-item');
    if (filtrosAtuais.categoria === categoriaPrincipal.toLowerCase()) {
      link.classList.add('ativo');
    }
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navegarParaCategoria(categoriaPrincipal);
    });
    li.appendChild(link);

    // Adicionar subcategorias se houver e a categoria principal estiver ativa
    if (filtrosAtuais.categoria === categoriaPrincipal.toLowerCase() && sistemaCategorias[categoriaPrincipal].subcategorias.length > 0) {
      const ulSubcategorias = document.createElement('ul');
      ulSubcategorias.classList.add('subcategorias-lista');
      sistemaCategorias[categoriaPrincipal].subcategorias.forEach(subcategoria => {
        const liSub = document.createElement('li');
        const linkSub = document.createElement('a');
        linkSub.href = '#';
        linkSub.textContent = subcategoria;
        linkSub.classList.add('subcategoria-item');
        if (filtrosAtuais.subcategoria === subcategoria.toLowerCase()) {
          linkSub.classList.add('ativo');
        }
        linkSub.addEventListener('click', (e) => {
          e.preventDefault();
          navegarParaCategoria(categoriaPrincipal, subcategoria);
        });
        liSub.appendChild(linkSub);
        ulSubcategorias.appendChild(liSub);
      });
      li.appendChild(ulSubcategorias);
    }
    categoriasRelacionadasContainer.appendChild(li);
  }
}

// Funções de manipulação de filtros e busca
function inicializarFiltros() {
  // Inicializar campo de busca
  if (campoBusca) {
    campoBusca.value = filtrosAtuais.busca;
    campoBusca.addEventListener('input', () => {
      filtrosAtuais.busca = campoBusca.value.toLowerCase();
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  // Inicializar seletor de marca (preencher com marcas únicas)
  if (seletorMarca) {
    const marcasUnicas = [...new Set(todosOsProdutos.map(p => p.marca))].filter(Boolean).sort();
    seletorMarca.innerHTML = '<option value="">Todas as Marcas</option>';
    marcasUnicas.forEach(marca => {
      const option = document.createElement('option');
      option.value = marca.toLowerCase();
      option.textContent = marca;
      seletorMarca.appendChild(option);
    });
    seletorMarca.value = filtrosAtuais.marca;
    seletorMarca.addEventListener('change', () => {
      filtrosAtuais.marca = seletorMarca.value;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  // Inicializar filtros de preço
  if (faixaPrecoMinimo && faixaPrecoMaximo && spanPrecoMinimo && spanPrecoMaximo) {
    faixaPrecoMinimo.value = filtrosAtuais.precoMinimo;
    spanPrecoMinimo.textContent = filtrosAtuais.precoMinimo.toFixed(2);
    faixaPrecoMaximo.value = filtrosAtuais.precoMaximo;
    spanPrecoMaximo.textContent = filtrosAtuais.precoMaximo.toFixed(2);

    faixaPrecoMinimo.addEventListener('input', () => {
      filtrosAtuais.precoMinimo = parseFloat(faixaPrecoMinimo.value);
      spanPrecoMinimo.textContent = filtrosAtuais.precoMinimo.toFixed(2);
      aplicarFiltros();
    });
    faixaPrecoMaximo.addEventListener('input', () => {
      filtrosAtuais.precoMaximo = parseFloat(faixaPrecoMaximo.value);
      spanPrecoMaximo.textContent = filtrosAtuais.precoMaximo.toFixed(2);
      aplicarFiltros();
    });
  }

  // Inicializar filtro de avaliação
  if (filtroAvaliacao && valorAvaliacao) {
    filtroAvaliacao.value = filtrosAtuais.avaliacaoMinima;
    valorAvaliacao.textContent = filtrosAtuais.avaliacaoMinima;
    filtroAvaliacao.addEventListener('input', () => {
      filtrosAtuais.avaliacaoMinima = parseFloat(filtroAvaliacao.value);
      valorAvaliacao.textContent = filtrosAtuais.avaliacaoMinima;
      aplicarFiltros();
    });
  }

  // Inicializar checkboxes
  if (apenasEmEstoque) {
    apenasEmEstoque.checked = filtrosAtuais.emEstoque;
    apenasEmEstoque.addEventListener('change', () => {
      filtrosAtuais.emEstoque = apenasEmEstoque.checked;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }
  if (apenasComDesconto) {
    apenasComDesconto.checked = filtrosAtuais.desconto;
    apenasComDesconto.addEventListener('change', () => {
      filtrosAtuais.desconto = apenasComDesconto.checked;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }
  if (apenasFreteGratis) {
    apenasFreteGratis.checked = filtrosAtuais.freteGratis;
    apenasFreteGratis.addEventListener('change', () => {
      filtrosAtuais.freteGratis = apenasFreteGratis.checked;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  // Botão Limpar Filtros
  if (botaoLimparFiltros) {
    botaoLimparFiltros.addEventListener('click', () => {
      filtrosAtuais = {
        busca: '',
        categoria: '',
        subcategoria: '',
        marca: '',
        condicao: '',
        precoMinimo: 0,
        precoMaximo: 15000,
        avaliacaoMinima: 0,
        emEstoque: false,
        desconto: false,
        freteGratis: false,
        tags: []
      };
      // Resetar elementos DOM
      if (campoBusca) campoBusca.value = '';
      if (seletorMarca) seletorMarca.value = '';
      if (faixaPrecoMinimo) faixaPrecoMinimo.value = 0;
      if (spanPrecoMinimo) spanPrecoMinimo.textContent = '0.00';
      if (faixaPrecoMaximo) faixaPrecoMaximo.value = 15000;
      if (spanPrecoMaximo) spanPrecoMaximo.textContent = '15000.00';
      if (filtroAvaliacao) filtroAvaliacao.value = 0;
      if (valorAvaliacao) valorAvaliacao.textContent = 0;
      if (apenasEmEstoque) apenasEmEstoque.checked = false;
      if (apenasComDesconto) apenasComDesconto.checked = false;
      if (apenasFreteGratis) apenasFreteGratis.checked = false;

      paginacaoConfig.paginaAtual = 1;
      const url = new URL(window.location);
      url.searchParams.delete('categoria');
      url.searchParams.delete('subcategoria');
      url.searchParams.delete('busca');
      window.history.pushState({}, '', url);
      renderizarCategoriasRelacionadas();
      mostrarBannerCategoria('', '');
      aplicarFiltros();
    });
  }
}

function inicializarEventListeners() {
  // Campo de busca no cabeçalho
  const formBuscaCabecalho = document.getElementById('formBuscaCabecalho');
  if (formBuscaCabecalho) {
    formBuscaCabecalho.addEventListener('submit', (e) => {
      e.preventDefault();
      const termoBusca = document.getElementById('campoBuscaCabecalho').value;
      if (termoBusca) {
        window.location.href = `produtos.html?busca=${encodeURIComponent(termoBusca)}`;
      }
    });
  }

  // Botão de alternar filtros
  if (botaoAlternarFiltros && barraFiltros) {
    botaoAlternarFiltros.addEventListener('click', () => {
      barraFiltros.classList.toggle('show');
      botaoAlternarFiltros.textContent = barraFiltros.classList.contains('show') ? 'Esconder Filtros' : 'Mostrar Filtros';
    });
  }

  // Botões de visualização
  if (botaoVisualizacaoGrade) {
    botaoVisualizacaoGrade.addEventListener('click', () => {
      modoVisualizacao = 'grade';
      aplicarFiltros();
    });
  }
  if (botaoVisualizacaoLista) {
    botaoVisualizacaoLista.addEventListener('click', () => {
      modoVisualizacao = 'lista';
      aplicarFiltros();
    });
  }

  // Seletor de ordenação
  if (seletorOrdenacao) {
    seletorOrdenacao.addEventListener('change', () => {
      ordenacaoAtual = seletorOrdenacao.value;
      aplicarFiltros();
    });
  }

  // Event listeners para adicionar ao carrinho e favoritos (delegação de eventos)
  if (gradeProdutos) {
    gradeProdutos.addEventListener('click', (e) => {
      if (e.target.classList.contains('adicionar-carrinho')) {
        const produtoId = e.target.dataset.id;
        adicionarAoCarrinho(produtoId);
      } else if (e.target.closest('.adicionar-favoritos')) {
        const produtoId = e.target.closest('.adicionar-favoritos').dataset.id;
        alternarFavorito(produtoId, e.target.closest('.adicionar-favoritos').querySelector('i'));
      }
    });
  }
}

function aplicarFiltros() {
  let produtosParaFiltrar = [...todosOsProdutos];

  // Aplicar filtro de busca
  if (filtrosAtuais.busca) {
    const termoBusca = filtrosAtuais.busca;
    produtosParaFiltrar = produtosParaFiltrar.filter(produto =>
      produto.nome.toLowerCase().includes(termoBusca) ||
      produto.descricao.toLowerCase().includes(termoBusca) ||
      produto.tags.some(tag => tag.toLowerCase().includes(termoBusca))
    );
  }

  // Aplicar filtro de categoria/subcategoria
  if (filtrosAtuais.categoria) {
    produtosParaFiltrar = produtosParaFiltrar.filter(produto =>
      produto.categoria.toLowerCase() === filtrosAtuais.categoria
    );
    if (filtrosAtuais.subcategoria) {
      produtosParaFiltrar = produtosParaFiltrar.filter(produto =>
        produto.subcategoria.toLowerCase() === filtrosAtuais.subcategoria
      );
    }
  }

  // Aplicar filtro de marca
  if (filtrosAtuais.marca) {
    produtosParaFiltrar = produtosParaFiltrar.filter(produto =>
      produto.marca.toLowerCase() === filtrosAtuais.marca
    );
  }

  // Aplicar filtro de preço
  produtosParaFiltrar = produtosParaFiltrar.filter(produto =>
    produto.preco >= filtrosAtuais.precoMinimo && produto.preco <= filtrosAtuais.precoMaximo
  );

  // Aplicar filtro de avaliação
  produtosParaFiltrar = produtosParaFiltrar.filter(produto =>
    produto.avaliacao >= filtrosAtuais.avaliacaoMinima
  );

  // Aplicar filtro de em estoque
  if (filtrosAtuais.emEstoque) {
    produtosParaFiltrar = produtosParaFiltrar.filter(produto => produto.emEstoque);
  }

  // Aplicar filtro de desconto
  if (filtrosAtuais.desconto) {
    produtosParaFiltrar = produtosParaFiltrar.filter(produto => produto.desconto > 0);
  }

  // Aplicar filtro de frete grátis
  if (filtrosAtuais.freteGratis) {
    produtosParaFiltrar = produtosParaFiltrar.filter(produto => produto.freteGratis);
  }

  // Ordenar produtos
  produtosParaFiltrar.sort((a, b) => {
    switch (ordenacaoAtual) {
      case 'menor-preco':
        return a.preco - b.preco;
      case 'maior-preco':
        return b.preco - a.preco;
      case 'mais-vendidos':
        return b.vendas - a.vendas; // Assumindo que existe uma propriedade 'vendas'
      case 'melhor-avaliacao':
        return b.avaliacao - a.avaliacao;
      case 'nome-asc':
        return a.nome.localeCompare(b.nome);
      case 'nome-desc':
        return b.nome.localeCompare(a.nome);
      default:
        return 0;
    }
  });

  produtosFiltrados = produtosParaFiltrar;
  paginacaoConfig.totalPaginas = Math.ceil(produtosFiltrados.length / paginacaoConfig.itensPorPagina);
  renderizarProdutosPaginados();
}

function renderizarProdutosPaginados() {
  const inicio = (paginacaoConfig.paginaAtual - 1) * paginacaoConfig.itensPorPagina;
  const fim = inicio + paginacaoConfig.itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(inicio, fim);
  renderizarProdutos(produtosPaginados);
  renderizarPaginacao(paginacaoConfig.totalPaginas, paginacaoConfig.paginaAtual);
  renderizarBreadcrumb();
}

function navegarParaCategoria(categoria, subcategoria = '') {
  filtrosAtuais.categoria = categoria.toLowerCase();
  filtrosAtuais.subcategoria = subcategoria.toLowerCase();
  filtrosAtuais.busca = ''; // Limpar busca ao navegar por categoria
  paginacaoConfig.paginaAtual = 1;

  const url = new URL(window.location);
  url.searchParams.set('categoria', filtrosAtuais.categoria);
  if (filtrosAtuais.subcategoria) {
    url.searchParams.set('subcategoria', filtrosAtuais.subcategoria);
  } else {
    url.searchParams.delete('subcategoria');
  }
  url.searchParams.delete('busca');
  window.history.pushState({}, '', url);

  renderizarCategoriasRelacionadas();
  mostrarBannerCategoria(categoria, subcategoria);
  aplicarFiltros();
}

function processarParametrosURL() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('categoria')) {
    filtrosAtuais.categoria = urlParams.get('categoria');
  }
  if (urlParams.has('subcategoria')) {
    filtrosAtuais.subcategoria = urlParams.get('subcategoria');
  }
  if (urlParams.has('busca')) {
    filtrosAtuais.busca = urlParams.get('busca');
    if (campoBusca) campoBusca.value = filtrosAtuais.busca; // Atualizar campo de busca
  }
  aplicarFiltros();
}

function mostrarBannerCategoria(categoria, subcategoria) {
  if (!bannerCategoria) return;

  let titulo = 'Todos os Produtos';
  let descricao = 'Explore nossa vasta seleção de produtos de alta qualidade.';

  if (categoria) {
    const categoriaFormatada = categoria.charAt(0).toUpperCase() + categoria.slice(1);
    titulo = categoriaFormatada;
    if (sistemaCategorias[categoriaFormatada]) {
      descricao = `Descubra os melhores produtos em ${categoriaFormatada}.`;
    }

    if (subcategoria) {
      const subcategoriaFormatada = subcategoria.charAt(0).toUpperCase() + subcategoria.slice(1);
      titulo = `${subcategoriaFormatada} em ${categoriaFormatada}`;
      descricao = `Confira nossa seleção de ${subcategoriaFormatada} dentro de ${categoriaFormatada}.`;
    }
  }

  if (tituloCategoria) tituloCategoria.textContent = titulo;
  if (descricaoCategoria) descricaoCategoria.textContent = descricao;
  if (infoCategoria) infoCategoria.style.display = 'block'; // Mostrar o banner
}

function renderizarBreadcrumb() {
  if (!caminhoBreadcrumb) return;
  caminhoBreadcrumb.innerHTML = '';

  const homeLink = document.createElement('li');
  homeLink.classList.add('breadcrumb-item');
  homeLink.innerHTML = '<a href="index.html">Home</a>';
  caminhoBreadcrumb.appendChild(homeLink);

  if (filtrosAtuais.busca) {
    const buscaItem = document.createElement('li');
    buscaItem.classList.add('breadcrumb-item', 'active');
    buscaItem.textContent = `Busca: "${filtrosAtuais.busca}"`;
    caminhoBreadcrumb.appendChild(buscaItem);
  } else if (filtrosAtuais.categoria) {
    const categoriaItem = document.createElement('li');
    categoriaItem.classList.add('breadcrumb-item');
    categoriaItem.innerHTML = `<a href="produtos.html?categoria=${filtrosAtuais.categoria}">${filtrosAtuais.categoria.charAt(0).toUpperCase() + filtrosAtuais.categoria.slice(1)}</a>`;
    caminhoBreadcrumb.appendChild(categoriaItem);

    if (filtrosAtuais.subcategoria) {
      const subcategoriaItem = document.createElement('li');
      subcategoriaItem.classList.add('breadcrumb-item', 'active');
      subcategoriaItem.textContent = filtrosAtuais.subcategoria.charAt(0).toUpperCase() + filtrosAtuais.subcategoria.slice(1);
      caminhoBreadcrumb.appendChild(subcategoriaItem);
    }
  } else {
    const produtosItem = document.createElement('li');
    produtosItem.classList.add('breadcrumb-item', 'active');
    produtosItem.textContent = 'Produtos';
    caminhoBreadcrumb.appendChild(produtosItem);
  }
}

// Funções de carrinho e favoritos (simplificadas para o frontend)
function adicionarAoCarrinho(produtoId) {
  console.log(`Produto ${produtoId} adicionado ao carrinho! (Funcionalidade simplificada)`);
  // Implementação real exigiria backend ou localStorage mais robusto
  alert('Produto adicionado ao carrinho! (Funcionalidade de demonstração)');
  if (typeof atualizarContadorCarrinho === "function") {
    atualizarContadorCarrinho();
  }
}

function alternarFavorito(produtoId, iconeElement) {
  const index = favoritos.indexOf(produtoId);
  if (index > -1) {
    favoritos.splice(index, 1); // Remover
    iconeElement.classList.remove('fas');
    iconeElement.classList.add('far');
    console.log(`Produto ${produtoId} removido dos favoritos.`);
  } else {
    favoritos.push(produtoId); // Adicionar
    iconeElement.classList.remove('far');
    iconeElement.classList.add('fas');
    console.log(`Produto ${produtoId} adicionado aos favoritos.`);
  }
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

