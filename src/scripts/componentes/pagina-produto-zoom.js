/**
 * Sistema de Zoom e Funcionalidades da Página de Produto
 */

// Sistema de Zoom nas Imagens
function initZoom() {
  const img = document.getElementById('imagemProduto');
  const lens = document.getElementById('zoomLens');
  const result = document.getElementById('zoomResult');
  const container = document.getElementById('containerImagemPrincipal');
  
  if (!img || !lens || !result || !container) return;
  
  let cx, cy;
  
  // Criar imagem ampliada
  result.style.backgroundImage = `url('${img.src}')`;
  result.style.backgroundSize = `${img.width * 2}px ${img.height * 2}px`;
  
  // Calcular proporção
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  
  // Eventos do mouse
  container.addEventListener('mouseenter', showZoom);
  container.addEventListener('mouseleave', hideZoom);
  container.addEventListener('mousemove', moveZoom);
  
  function showZoom() {
    lens.style.display = 'block';
    result.style.display = 'block';
  }
  
  function hideZoom() {
    lens.style.display = 'none';
    result.style.display = 'none';
  }
  
  function moveZoom(e) {
    e.preventDefault();
    const pos = getCursorPos(e);
    let x = pos.x - (lens.offsetWidth / 2);
    let y = pos.y - (lens.offsetHeight / 2);
    
    // Limites
    if (x > img.width - lens.offsetWidth) x = img.width - lens.offsetWidth;
    if (x < 0) x = 0;
    if (y > img.height - lens.offsetHeight) y = img.height - lens.offsetHeight;
    if (y < 0) y = 0;
    
    lens.style.left = x + 'px';
    lens.style.top = y + 'px';
    result.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
  }
  
  function getCursorPos(e) {
    const a = img.getBoundingClientRect();
    const x = e.pageX - a.left - window.pageXOffset;
    const y = e.pageY - a.top - window.pageYOffset;
    return {x, y};
  }
}

// Carregar Produto
async function carregarProduto() {
  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get('id');
  
  if (!produtoId) {
    console.error('ID do produto não encontrado');
    return;
  }
  
  try {
    const response = await fetch(`${window.API_BASE_URL}/produtos/${produtoId}`);
    const data = await response.json();
    
    if (data.success && data.product) {
      const produto = data.product;
      
      // Atualizar breadcrumb
      document.getElementById('breadcrumbProduto').textContent = produto.nome;
      if (produto.categoria_nome) {
        const breadcrumbCat = document.getElementById('breadcrumbCategoria');
        breadcrumbCat.textContent = produto.categoria_nome;
        breadcrumbCat.href = `produtos.html?categoria=${produto.categoria_nome}`;
      }
      
      // Atualizar informações básicas
      document.getElementById('nomeProduto').textContent = produto.nome;
      document.getElementById('descricaoProduto').textContent = produto.descricao || '';
      document.getElementById('precoProduto').textContent = `R$ ${parseFloat(produto.preco).toFixed(2)}`;
      
      // Marca
      if (produto.marca) {
        document.getElementById('marcaProduto').textContent = produto.marca;
      }
      
      // Imagem principal
      const imgPrincipal = document.getElementById('imagemProduto');
      imgPrincipal.src = produto.imagem_principal || produto.imagem || '';
      imgPrincipal.alt = produto.nome;
      
      // Galeria de imagens
      carregarGaleria(produto);
      
      // Botões Marketplace
      configurarBotoesMarketplace(produto);
      
      // Inicializar zoom
      setTimeout(initZoom, 500);
      
      // Carregar produtos relacionados
      carregarProdutosRelacionados(produto.categoria_id);
      
    } else {
      console.error('Produto não encontrado');
    }
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
  }
}

// Carregar Galeria
function carregarGaleria(produto) {
  const miniaturas = document.getElementById('miniaturas');
  if (!miniaturas) return;
  
  miniaturas.innerHTML = '';
  
  // Imagem principal
  const img1 = criarMiniatura(produto.imagem_principal || produto.imagem, true);
  miniaturas.appendChild(img1);
  
  // Galeria adicional
  if (produto.galeria_imagens) {
    try {
      const galeria = typeof produto.galeria_imagens === 'string' 
        ? JSON.parse(produto.galeria_imagens) 
        : produto.galeria_imagens;
      
      galeria.slice(0, 2).forEach(url => {
        const mini = criarMiniatura(url, false);
        miniaturas.appendChild(mini);
      });
    } catch (e) {
      console.error('Erro ao carregar galeria:', e);
    }
  }
}

function criarMiniatura(url, ativa) {
  const div = document.createElement('div');
  div.className = `miniatura-item ${ativa ? 'ativa' : ''}`;
  
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Miniatura';
  
  div.appendChild(img);
  
  div.addEventListener('click', () => {
    document.getElementById('imagemProduto').src = url;
    document.querySelectorAll('.miniatura-item').forEach(m => m.classList.remove('ativa'));
    div.classList.add('ativa');
    initZoom();
  });
  
  return div;
}

// Configurar Botões Marketplace
function configurarBotoesMarketplace(produto) {
  const container = document.getElementById('botoesMarketplace');
  const btnML = document.getElementById('btnMercadoLivre');
  const btnAmazon = document.getElementById('btnAmazon');
  
  if (!container) return;
  
  let temLink = false;
  
  // Mercado Livre
  if (produto.link_mercado_livre && produto.preco_mercado_livre) {
    btnML.href = produto.link_mercado_livre;
    document.getElementById('precoML').textContent = `R$ ${parseFloat(produto.preco_mercado_livre).toFixed(2)}`;
    btnML.style.display = 'flex';
    temLink = true;
  }
  
  // Amazon
  if (produto.link_amazon && produto.preco_amazon) {
    btnAmazon.href = produto.link_amazon;
    document.getElementById('precoAmazon').textContent = `R$ ${parseFloat(produto.preco_amazon).toFixed(2)}`;
    btnAmazon.style.display = 'flex';
    temLink = true;
  }
  
  if (temLink) {
    container.style.display = 'flex';
  }
}

// Carregar Produtos Relacionados
async function carregarProdutosRelacionados(categoriaId) {
  if (!categoriaId) return;
  
  try {
    const response = await fetch(`${window.API_BASE_URL}/produtos?categoria_id=${categoriaId}&limit=4`);
    const data = await response.json();
    
    if (data.success && data.products && data.products.length > 0) {
      const container = document.getElementById('produtosRelacionados');
      container.innerHTML = '';
      
      data.products.forEach(produto => {
        const card = criarCardProdutoRelacionado(produto);
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar produtos relacionados:', error);
  }
}

function criarCardProdutoRelacionado(produto) {
  const a = document.createElement('a');
  a.href = `pagina-produto.html?id=${produto.id}`;
  a.className = 'produto-relacionado-card';
  
  const img = document.createElement('img');
  img.src = produto.imagem_principal || produto.imagem || '';
  img.alt = produto.nome;
  img.className = 'produto-relacionado-imagem';
  
  const nome = document.createElement('div');
  nome.className = 'produto-relacionado-nome';
  nome.textContent = produto.nome;
  
  const preco = document.createElement('div');
  preco.className = 'produto-relacionado-preco';
  preco.textContent = `R$ ${parseFloat(produto.preco).toFixed(2)}`;
  
  a.appendChild(img);
  a.appendChild(nome);
  a.appendChild(preco);
  
  return a;
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  carregarProduto();
});

