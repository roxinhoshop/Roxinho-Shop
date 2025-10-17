// Sistema de produtos integrado com carrinho unificado
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
const categoriasRelacionadas = document.getElementById('categoriasRelacionadas');
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

// Função para buscar produtos da API
async function buscarProdutosDaAPI() {
  try {
    // Verificar se a função listarProdutos está disponível (do api-produtos.js)
    if (typeof listarProdutos === 'function') {
      const produtos = await listarProdutos();
      
      // Transformar produtos da API para o formato esperado
      return produtos.map(p => ({
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
        tags: p.tags ? p.tags.split(',').map(tag => tag.trim()) : [], // Assumindo tags como string separada por vírgulas
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
        freteGratis: false,        parcelamento: `em até 12x de R$ ${(parseFloat(p.preco) / 12).toFixed(2)}`
      }));
    } else {
      console.warn('Função listarProdutos não encontrada. Usando produtos vazios.');
      return [];
    }
  } catch (error) {
    console.error('Erro ao buscar produtos da API:', error);
    return [];
  }
}

// Inicializar a aplicação
document.addEventListener("DOMContentLoaded", async function() {
  // Carregar produtos da API primeiro
  todosOsProdutos = await buscarProdutosDaAPI();

  inicializarCategoriasCabecalho();
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

// Função para inicializar as categorias do cabeçalho
function inicializarCategoriasCabecalho() {
    const linksCategorias = document.querySelectorAll('.barra-categorias ul li:not(.dropdown) a');
    linksCategorias.forEach(link => {
        const titulo = link.textContent.trim();
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navegarParaCategoria(titulo);
        });
    });

    const barraCategoriasDropdowns = document.querySelectorAll('.barra-categorias .dropdown');
    barraCategoriasDropdowns.forEach(dropdown => {
        const linkPrincipal = dropdown.querySelector('a');
        const titulo = linkPrincipal.textContent.trim().replace(/\s*DEPARTAMENTOS\s*/i, '').trim();
        const submenu = dropdown.querySelector('.submenu');

        if (sistemaCategorias[titulo] && submenu) {
            submenu.innerHTML = '';

            const linkCategoriaPrincipal = document.createElement('li');
            const aCategoriaPrincipal = document.createElement('a');
            aCategoriaPrincipal.href = '#';
            aCategoriaPrincipal.textContent = `Ver todos em ${titulo}`;
            aCategoriaPrincipal.style.fontWeight = 'bold';
            aCategoriaPrincipal.style.borderBottom = '1px solid #eee';
            aCategoriaPrincipal.style.paddingBottom = '8px';
            aCategoriaPrincipal.style.marginBottom = '8px';
            aCategoriaPrincipal.addEventListener('click', function (e) {
                e.preventDefault();
                navegarParaCategoria(titulo);
            });
            linkCategoriaPrincipal.appendChild(aCategoriaPrincipal);
            submenu.appendChild(linkCategoriaPrincipal);

            sistemaCategorias[titulo].subcategorias.forEach(subcategoria => {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = subcategoria;
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    navegarParaCategoria(titulo, subcategoria);
                });
                li.appendChild(link);
                submenu.appendChild(li);
            });

            linkPrincipal.addEventListener('click', function (e) {
                e.preventDefault();
                navegarParaCategoria(titulo);
            });
        }
    });
}

// Função para navegar para categoria/subcategoria
function navegarParaCategoria(categoria, subcategoria = '') {
  filtrosAtuais.categoria = categoria.toLowerCase();
  filtrosAtuais.subcategoria = subcategoria.toLowerCase();
  categoriaAtivaSelecionada = categoria.toLowerCase();
  paginacaoConfig.paginaAtual = 1;
  
  // Atualizar URL sem recarregar página
  const url = new URL(window.location);
  url.searchParams.set('categoria', categoria);
  if (subcategoria) {
    url.searchParams.set('subcategoria', subcategoria);
  } else {
    url.searchParams.delete('subcategoria');
  }
  window.history.pushState({}, '', url);
  
  renderizarCategoriasRelacionadas();
  mostrarBannerCategoria(categoria, subcategoria);
  aplicarFiltros();
}

// Processar parâmetros da URL na inicialização
function processarParametrosURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoriaParam = urlParams.get('categoria');
  const subcategoriaParam = urlParams.get('subcategoria');
  const buscaParam = urlParams.get('busca');
  
  if (categoriaParam) {
    filtrosAtuais.categoria = categoriaParam.toLowerCase();
    categoriaAtivaSelecionada = categoriaParam.toLowerCase();
    
    if (subcategoriaParam) {
      filtrosAtuais.subcategoria = subcategoriaParam.toLowerCase();
    }
    
    mostrarBannerCategoria(categoriaParam, subcategoriaParam);
  }
  
  if (buscaParam && campoBusca) {
    filtrosAtuais.busca = buscaParam;
    campoBusca.value = buscaParam;
  }
}

// Função para mostrar banner da categoria com dados personalizados
function mostrarBannerCategoria(categoria, subcategoria = '') {
  if (bannerCategoria && tituloCategoria && descricaoCategoria) {
    const dadosCategoria = sistemaCategorias[categoria];
    
    if (dadosCategoria) {
      // Configurar título e descrição
      if (subcategoria) {
        tituloCategoria.innerHTML = `<i class="${dadosCategoria.icone}"></i> ${subcategoria}`;
        descricaoCategoria.textContent = `Produtos da categoria ${subcategoria} em ${categoria}`;
      } else {
        tituloCategoria.innerHTML = `<i class="${dadosCategoria.icone}"></i> ${categoria}`;
        descricaoCategoria.textContent = dadosCategoria.descricao || `Encontre os melhores produtos em ${categoria}`;
      }

      // 👇 Aqui você move o banner para baixo da seção desejada
      const alvo = document.querySelector(".categoria-perifericos"); // ajuste para o seletor correto
      if (alvo) {
        alvo.insertAdjacentElement("afterend", bannerCategoria);
      }

      bannerCategoria.style.display = 'block';
    }
  }
}

// Inicializar filtros
function inicializarFiltros() {
  // Popular seletor de marcas (se existir)
  if (seletorMarca) {
    const marcas = ['', ...new Set(todosOsProdutos.map(p => p.marca))];
    marcas.forEach(marca => {
      const opcao = document.createElement('option');
      opcao.value = marca;
      opcao.textContent = marca || 'Todas as Marcas';
      seletorMarca.appendChild(opcao);
    });
  }

  // Popular lista de marcas com checkboxes
  popularListaMarcas();

  // Renderizar categorias relacionadas
  renderizarCategoriasRelacionadas();

  // Definir valores iniciais da faixa de preço
  if (spanPrecoMinimo) spanPrecoMinimo.textContent = filtrosAtuais.precoMinimo;
  if (spanPrecoMaximo) spanPrecoMaximo.textContent = filtrosAtuais.precoMaximo;
  if (valorAvaliacao) valorAvaliacao.textContent = filtrosAtuais.avaliacaoMinima;
}

// Popular lista de marcas com checkboxes
function popularListaMarcas() {
  const listaMarcas = document.getElementById('listaMarcas');
  const buscaMarca = document.getElementById('buscaMarca');
  const verMaisMarcas = document.getElementById('verMaisMarcas');
  
  if (!listaMarcas) return;

  // Extrair marcas únicas dos produtos
  const marcasUnicas = [...new Set(todosOsProdutos.map(p => p.marca))].filter(m => m).sort();
  
  let marcasSelecionadas = [];
  let mostrarTodas = false;
  const LIMITE_INICIAL = 8;

  function renderizarMarcas(filtro = '') {
    listaMarcas.innerHTML = '';
    
    const marcasFiltradas = marcasUnicas.filter(marca => 
      marca.toLowerCase().includes(filtro.toLowerCase())
    );

    const marcasParaMostrar = mostrarTodas ? marcasFiltradas : marcasFiltradas.slice(0, LIMITE_INICIAL);

    marcasParaMostrar.forEach(marca => {
      const div = document.createElement('div');
      div.className = 'opcao-marca';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `marca-${marca.replace(/\s+/g, '-')}`;
      checkbox.value = marca;
      checkbox.checked = marcasSelecionadas.includes(marca);
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = marca;
      
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          marcasSelecionadas.push(marca);
        } else {
          marcasSelecionadas = marcasSelecionadas.filter(m => m !== marca);
        }
        
        // Aplicar filtro de marcas
        if (marcasSelecionadas.length > 0) {
          filtrosAtuais.marca = marcasSelecionadas;
        } else {
          filtrosAtuais.marca = '';
        }
        
        paginacaoConfig.paginaAtual = 1;
        aplicarFiltros();
      });
      
      div.appendChild(checkbox);
      div.appendChild(label);
      listaMarcas.appendChild(div);
    });

    // Mostrar/ocultar botão "Ver mais"
    if (verMaisMarcas) {
      verMaisMarcas.style.display = marcasFiltradas.length > LIMITE_INICIAL ? 'block' : 'none';
      verMaisMarcas.textContent = mostrarTodas ? 'Ver menos' : 'Ver mais';
    }
  }

  // Busca de marcas
  if (buscaMarca) {
    buscaMarca.addEventListener('input', (e) => {
      renderizarMarcas(e.target.value);
    });
  }

  // Botão ver mais/menos
  if (verMaisMarcas) {
    verMaisMarcas.addEventListener('click', () => {
      mostrarTodas = !mostrarTodas;
      renderizarMarcas(buscaMarca ? buscaMarca.value : '');
    });
  }

  // Renderizar inicialmente
  renderizarMarcas();
}

// Renderizar categorias relacionadas - com layout melhorado
function renderizarCategoriasRelacionadas() {
  if (!categoriasRelacionadas) return;

  categoriasRelacionadas.innerHTML = '';

  Object.entries(sistemaCategorias).forEach(([categoria, data]) => {
    // Se há uma categoria ativa selecionada e não é esta, não mostrar
    if (categoriaAtivaSelecionada && categoriaAtivaSelecionada.toLowerCase() !== categoria.toLowerCase()) {
      return;
    }

    // Criar container da categoria
    const categoriaItem = document.createElement('div');
    categoriaItem.className = 'categoria-item';

    // Criar label da categoria principal
    const labelCategoria = document.createElement('span');
    labelCategoria.className = `label-categoria ${filtrosAtuais.categoria.toLowerCase() === categoria.toLowerCase() ? 'ativo' : ''}`;
    labelCategoria.innerHTML = `<i class="${data.icone}"></i> ${categoria}`;

    labelCategoria.addEventListener('click', () => {
      // Se clicar na categoria já ativa, limpar seleção
      if (filtrosAtuais.categoria.toLowerCase() === categoria.toLowerCase()) {
        filtrosAtuais.categoria = '';
        filtrosAtuais.subcategoria = '';
        categoriaAtivaSelecionada = '';
        
        // Limpar URL
        const url = new URL(window.location);
        url.searchParams.delete('categoria');
        url.searchParams.delete('subcategoria');
        window.history.pushState({}, '', url);
        
        // Ocultar banner
        if (bannerCategoria) bannerCategoria.style.display = 'none';
      } else {
        navegarParaCategoria(categoria);
      }
      
      paginacaoConfig.paginaAtual = 1;
      renderizarCategoriasRelacionadas();
      aplicarFiltros();
    });

    categoriaItem.appendChild(labelCategoria);

    // Se esta categoria está ativa, mostrar subcategorias
    if (categoriaAtivaSelecionada.toLowerCase() === categoria.toLowerCase()) {
      const subcategoriasContainer = document.createElement('div');
      subcategoriasContainer.className = 'subcategorias-container visivel';
      
      data.subcategorias.forEach(subcategoria => {
        const subcategoriaItem = document.createElement('div');
        subcategoriaItem.className = 'subcategoria-item';
        
        const labelSub = document.createElement('span');
        labelSub.className = `label-subcategoria ${filtrosAtuais.subcategoria.toLowerCase() === subcategoria.toLowerCase() ? 'ativo' : ''}`;
        labelSub.textContent = subcategoria;
        
        labelSub.addEventListener('click', (e) => {
          e.stopPropagation();
          
          if (filtrosAtuais.subcategoria.toLowerCase() === subcategoria.toLowerCase()) {
            navegarParaCategoria(categoria);
          } else {
            navegarParaCategoria(categoria, subcategoria);
          }
          
          paginacaoConfig.paginaAtual = 1;
          renderizarCategoriasRelacionadas();
          aplicarFiltros();
        });
        
        subcategoriaItem.appendChild(labelSub);
        subcategoriasContainer.appendChild(subcategoriaItem);
      });
      
      categoriaItem.appendChild(subcategoriasContainer);
    }

    categoriasRelacionadas.appendChild(categoriaItem);
  });
}

// Event Listeners
function inicializarEventListeners() {
  // Busca
  if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
      filtrosAtuais.busca = e.target.value;
      paginacaoConfig.paginaAtual = 1;
      
      // Atualizar URL
      const url = new URL(window.location);
      if (e.target.value) {
        url.searchParams.set('busca', e.target.value);
      } else {
        url.searchParams.delete('busca');
      }
      window.history.pushState({}, '', url);
      
      aplicarFiltros();
    });
  }

  // Alternar filtros
  if (botaoAlternarFiltros) {
    botaoAlternarFiltros.addEventListener('click', () => {
      barraFiltros.classList.toggle('oculta');
    });
  }

  // Modo de visualização
  if (botaoVisualizacaoGrade) {
    botaoVisualizacaoGrade.addEventListener('click', () => {
      modoVisualizacao = 'grade';
      botaoVisualizacaoGrade.classList.add('ativo');
      if (botaoVisualizacaoLista) botaoVisualizacaoLista.classList.remove('ativo');
      renderizarProdutos();
    });
  }

  if (botaoVisualizacaoLista) {
    botaoVisualizacaoLista.addEventListener('click', () => {
      modoVisualizacao = 'lista';
      botaoVisualizacaoLista.classList.add('ativo');
      if (botaoVisualizacaoGrade) botaoVisualizacaoGrade.classList.remove('ativo');
      renderizarProdutos();
    });
  }

  // Filtros
  if (seletorMarca) {
    seletorMarca.addEventListener('change', (e) => {
      filtrosAtuais.marca = e.target.value;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  if (faixaPrecoMinimo) {
    faixaPrecoMinimo.addEventListener('input', (e) => {
      filtrosAtuais.precoMinimo = parseInt(e.target.value);
      if (spanPrecoMinimo) spanPrecoMinimo.textContent = filtrosAtuais.precoMinimo;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  if (faixaPrecoMaximo) {
    faixaPrecoMaximo.addEventListener('input', (e) => {
      filtrosAtuais.precoMaximo = parseInt(e.target.value);
      if (spanPrecoMaximo) spanPrecoMaximo.textContent = filtrosAtuais.precoMaximo;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  if (filtroAvaliacao) {
    filtroAvaliacao.addEventListener('input', (e) => {
      filtrosAtuais.avaliacaoMinima = parseFloat(e.target.value);
      if (valorAvaliacao) valorAvaliacao.textContent = filtrosAtuais.avaliacaoMinima;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  if (apenasEmEstoque) {
    apenasEmEstoque.addEventListener('change', (e) => {
      filtrosAtuais.emEstoque = e.target.checked;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  if (apenasComDesconto) {
    apenasComDesconto.addEventListener('change', (e) => {
      filtrosAtuais.desconto = e.target.checked;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  if (apenasFreteGratis) {
    apenasFreteGratis.addEventListener('change', (e) => {
      filtrosAtuais.freteGratis = e.target.checked;
      paginacaoConfig.paginaAtual = 1;
      aplicarFiltros();
    });
  }

  if (botaoLimparFiltros) {
    botaoLimparFiltros.addEventListener('click', limparFiltros);
  }

  if (seletorOrdenacao) {
    seletorOrdenacao.addEventListener('change', (e) => {
      ordenacaoAtual = e.target.value;
      aplicarFiltros();
    });
  }
}

// Aplicar filtros
function aplicarFiltros() {
  // Filtrar produtos
  produtosFiltrados = todosOsProdutos.filter(produto => {
    const correspondeABusca = !filtrosAtuais.busca || 
      produto.nome.toLowerCase().includes(filtrosAtuais.busca.toLowerCase()) ||
      (produto.marca && produto.marca.toLowerCase().includes(filtrosAtuais.busca.toLowerCase())) ||
      (produto.tags && produto.tags.some(tag => tag.toLowerCase().includes(filtrosAtuais.busca.toLowerCase())));

    const correspondeACategoria = !filtrosAtuais.categoria || (produto.categoria && produto.categoria.toLowerCase() === filtrosAtuais.categoria.toLowerCase());
    const correspondeASubcategoria = !filtrosAtuais.subcategoria || (produto.subcategoria && produto.subcategoria.toLowerCase() === filtrosAtuais.subcategoria.toLowerCase());
    
    // Suportar filtro de marca como string ou array
    const correspondeAMarca = !filtrosAtuais.marca || 
      (Array.isArray(filtrosAtuais.marca) 
        ? filtrosAtuais.marca.includes(produto.marca) 
        : (produto.marca && produto.marca.toLowerCase() === filtrosAtuais.marca.toLowerCase()));

    const correspondeACondicao = !filtrosAtuais.condicao || produto.condicao === filtrosAtuais.condicao;

    const correspondeAoPreco = produto.preco >= filtrosAtuais.precoMinimo && produto.preco <= filtrosAtuais.precoMaximo;
    const correspondeAAvaliacao = produto.avaliacao >= filtrosAtuais.avaliacaoMinima;
    const correspondeAoEstoque = !filtrosAtuais.emEstoque || produto.emEstoque;
    const correspondeAoDesconto = !filtrosAtuais.desconto || produto.desconto > 0;
    const correspondeAoFrete = !filtrosAtuais.freteGratis || produto.freteGratis;

    return correspondeABusca && correspondeACategoria && correspondeASubcategoria && correspondeAMarca && 
           correspondeAoPreco && correspondeAAvaliacao && correspondeAoEstoque && 
           correspondeAoDesconto && correspondeAoFrete;
  });

  // Ordenar produtos
  ordenarProdutos();

  // Calcular paginação
  calcularPaginacao();

  // Atualizar UI
  atualizarBreadcrumb();
  atualizarInfoResultados();
  renderizarProdutos();
  renderizarPaginacao();
}

// Ordenar produtos
function ordenarProdutos() {
  switch (ordenacaoAtual) {
    case 'preco-asc':
      produtosFiltrados.sort((a, b) => a.preco - b.preco);
      break;
    case 'preco-desc':
      produtosFiltrados.sort((a, b) => b.preco - a.preco);
      break;
    case 'avaliacao':
      produtosFiltrados.sort((a, b) => b.avaliacao - a.avaliacao);
      break;
    case 'desconto':
      produtosFiltrados.sort((a, b) => b.desconto - a.desconto);
      break;
    case 'avaliacoes':
      produtosFiltrados.sort((a, b) => b.avaliacoes - a.avaliacoes);
      break;
    case 'nome':
      produtosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    default:
      // Manter ordem original para relevância
      break;
  }
}

// Calcular paginação
function calcularPaginacao() {
  paginacaoConfig.totalPaginas = Math.ceil(produtosFiltrados.length / paginacaoConfig.itensPorPagina);
}

// Atualizar breadcrumb
function atualizarBreadcrumb() {
  if (caminhoBreadcrumb) {
    caminhoBreadcrumb.innerHTML = '<a href="index.html" class="item-caminho">Início</a>';

    if (filtrosAtuais.categoria) {
      caminhoBreadcrumb.innerHTML += ` <span class="separador">></span> <a href="produtos.html?categoria=${encodeURIComponent(filtrosAtuais.categoria)}" class="item-caminho">${filtrosAtuais.categoria}</a>`;
    }

    if (filtrosAtuais.subcategoria) {
      caminhoBreadcrumb.innerHTML += ` <span class="separador">></span> <span class="item-caminho ativo">${filtrosAtuais.subcategoria}</span>`;
    } else if (filtrosAtuais.categoria) {
      caminhoBreadcrumb.querySelector('a:last-of-type').classList.add('ativo');
    } else {
      caminhoBreadcrumb.innerHTML += ' <span class="separador">></span> <span class="item-caminho ativo">Produtos</span>';
    }
  }
}


// Atualizar informações de resultados
function atualizarInfoResultados() {
  if (contadorResultados) {
    contadorResultados.textContent = produtosFiltrados.length;
  }
}

// Renderizar produtos
function renderizarProdutos() {
  if (!gradeProdutos) return;

  gradeProdutos.innerHTML = '';
  gradeProdutos.className = `grade-produtos ${modoVisualizacao}`;

  if (produtosFiltrados.length === 0) {
    semResultados.style.display = 'flex';
    paginacao.style.display = 'none';
    return;
  }

  semResultados.style.display = 'none';

  const inicio = (paginacaoConfig.paginaAtual - 1) * paginacaoConfig.itensPorPagina;
  const fim = inicio + paginacaoConfig.itensPorPagina;
  const produtosDaPagina = produtosFiltrados.slice(inicio, fim);

  produtosDaPagina.forEach(produto => {
    const card = document.createElement('div');
    card.className = 'card-produto';
    card.dataset.id = produto.id;

    let precoPrincipal = produto.precoMercadoLivre || produto.precoAmazon || produto.preco;

    card.innerHTML = `
      <div class="imagem-produto">
        <a href="produto.html?id=${produto.id}">
          <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
        </a>
        <div class="tags-produto">
          ${produto.desconto > 0 ? `<span class="tag-desconto">-${produto.desconto}%</span>` : ''}
          ${produto.freteGratis ? '<span class="tag-frete">Frete Grátis</span>' : ''}
        </div>
        <button class="botao-favorito ${favoritos.includes(produto.id) ? 'ativo' : ''}" onclick="alternarFavorito(${produto.id}, this)">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="info-produto">
        <h3 class="nome-produto"><a href="produto.html?id=${produto.id}">${produto.nome}</a></h3>
        <div class="avaliacao-produto">
          ${renderizarEstrelas(produto.avaliacao)}
          <span class="num-avaliacoes">(${produto.avaliacoes})</span>
        </div>
        <div class="preco-produto">
          ${produto.desconto > 0 ? `<span class="preco-antigo">R$ ${(precoPrincipal / (1 - produto.desconto / 100)).toFixed(2)}</span>` : ''}
          <span class="preco-atual">R$ ${precoPrincipal.toFixed(2)}</span>
        </div>
        <div class="parcelamento-produto">${produto.parcelamento}</div>
        <div class="botoes-compra-card">
            ${produto.linkMercadoLivre ? `<a href="${produto.linkMercadoLivre}" target="_blank" class="botao-mercadolivre"><i class="fas fa-shopping-cart"></i> Mercado Livre <span class="preco-card">R$ ${produto.precoMercadoLivre.toFixed(2)}</span></a>` : ''}
            ${produto.linkAmazon ? `<a href="${produto.linkAmazon}" target="_blank" class="botao-amazon"><i class="fab fa-amazon"></i> Amazon <span class="preco-card">R$ ${produto.precoAmazon.toFixed(2)}</span></a>` : ''}
        </div>
      </div>
    `;

    gradeProdutos.appendChild(card);
  });

  renderizarPaginacao();
}

// Renderizar estrelas de avaliação
function renderizarEstrelas(avaliacao) {
  let estrelas = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= avaliacao) {
      estrelas += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 <= avaliacao) {
      estrelas += '<i class="fas fa-star-half-alt"></i>';
    } else {
      estrelas += '<i class="far fa-star"></i>';
    }
  }
  return `<div class="estrelas">${estrelas}</div>`;
}

// Alternar favorito
function alternarFavorito(id, botao) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(favId => favId !== id);
    botao.classList.remove('ativo');
  } else {
    favoritos.push(id);
    botao.classList.add('ativo');
  }
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

// Renderizar paginação
function renderizarPaginacao() {
  if (!paginacao) return;

  paginacao.innerHTML = '';

  if (paginacaoConfig.totalPaginas <= 1) {
    paginacao.style.display = 'none';
    return;
  }

  paginacao.style.display = 'flex';

  // Botão "Anterior"
  const botaoAnterior = document.createElement('button');
  botaoAnterior.textContent = 'Anterior';
  botaoAnterior.disabled = paginacaoConfig.paginaAtual === 1;
  botaoAnterior.addEventListener('click', () => {
    paginacaoConfig.paginaAtual--;
    renderizarProdutos();
    window.scrollTo(0, 0);
  });
  paginacao.appendChild(botaoAnterior);

  // Números das páginas
  for (let i = 1; i <= paginacaoConfig.totalPaginas; i++) {
    const botaoPagina = document.createElement('button');
    botaoPagina.textContent = i;
    botaoPagina.className = paginacaoConfig.paginaAtual === i ? 'ativo' : '';
    botaoPagina.addEventListener('click', () => {
      paginacaoConfig.paginaAtual = i;
      renderizarProdutos();
      window.scrollTo(0, 0);
    });
    paginacao.appendChild(botaoPagina);
  }

  // Botão "Próximo"
  const botaoProximo = document.createElement('button');
  botaoProximo.textContent = 'Próximo';
  botaoProximo.disabled = paginacaoConfig.paginaAtual === paginacaoConfig.totalPaginas;
  botaoProximo.addEventListener('click', () => {
    paginacaoConfig.paginaAtual++;
    renderizarProdutos();
    window.scrollTo(0, 0);
  });
  paginacao.appendChild(botaoProximo);
}

// Limpar filtros
function limparFiltros() {
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
  
  // Limpar URL
  const url = new URL(window.location);
  url.search = '';
  window.history.pushState({}, '', url);

  // Resetar campos do formulário
  if (campoBusca) campoBusca.value = '';
  if (seletorMarca) seletorMarca.selectedIndex = 0;
  if (faixaPrecoMinimo) faixaPrecoMinimo.value = 0;
  if (faixaPrecoMaximo) faixaPrecoMaximo.value = 15000;
  if (spanPrecoMinimo) spanPrecoMinimo.textContent = 0;
  if (spanPrecoMaximo) spanPrecoMaximo.textContent = 15000;
  if (filtroAvaliacao) filtroAvaliacao.value = 0;
  if (valorAvaliacao) valorAvaliacao.textContent = 0;
  if (apenasEmEstoque) apenasEmEstoque.checked = false;
  if (apenasComDesconto) apenasComDesconto.checked = false;
  if (apenasFreteGratis) apenasFreteGratis.checked = false;

  paginacaoConfig.paginaAtual = 1;
  categoriaAtivaSelecionada = '';
  renderizarCategoriasRelacionadas();
  aplicarFiltros();
}

}


