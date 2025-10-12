// Sistema da página home integrado com carrinho unificado
// Comentários didáticos para facilitar o entendimento


let slideAtual = 0;
let slides, indicadores;

function inicializarBanner() {
  slides = document.querySelectorAll('.banner-slide');
  indicadores = document.querySelectorAll('.banner-indicadores span');
  
  if (slides.length > 0) {
    mostrarSlide(0);
  }
}

function mostrarSlide(indice) {
  if (!slides || !indicadores) return;
  
  // Remover classe ativo de todos os slides e indicadores
  slides.forEach(slide => slide.classList.remove('ativo'));
  indicadores.forEach(indicador => indicador.classList.remove('ativo'));
  
  // Adicionar classe ativo ao slide e indicador atual
  if (slides[indice]) slides[indice].classList.add('ativo');
  if (indicadores[indice]) indicadores[indice].classList.add('ativo');
}

function proximoSlide() {
  if (!slides) return;
  slideAtual = (slideAtual + 1) % slides.length;
  mostrarSlide(slideAtual);
}

function slideAnterior() {
  if (!slides) return;
  slideAtual = (slideAtual - 1 + slides.length) % slides.length;
  mostrarSlide(slideAtual);
}


// Função para renderizar produtos em destaque
async function renderizarProdutosDestaque() {
  console.log("Renderizando produtos em destaque...");
  
  const container = document.getElementById("grade-produtos-home");
  
  if (!container) {
    console.error("Container 'grade-produtos-home' não encontrado");
    return;
  }

  try {
    const response = await fetch("https://roxinho-shop-backend.vercel.app/api/products"); // Endpoint para listar todos os produtos
    if (!response.ok) {
      throw new Error(`Erro HTTP! status:  ${response.status}`);
    }
    const produtos = await response.json();

    if (!produtos || produtos.length === 0) {
      container.innerHTML = `
        <div class="erro-produtos">
          <p>Produtos não disponíveis no momento.</p>
          <button onclick="location.reload()" class="btn-recarregar">Recarregar</button>
        </div>
      `;
      return;
    }
    
    const produtosParaExibir = produtos.slice(0, 8); // Exibir os primeiros 8 produtos em destaque
    
    container.innerHTML = produtosParaExibir.map(produto => {
      // Converter preço de string para número
      produto.preco = parseFloat(produto.preco);
      if (produto.precoOriginal) produto.precoOriginal = parseFloat(produto.precoOriginal);
      if (produto.preco_promocional) produto.preco_promocional = parseFloat(produto.preco_promocional);
      const ehFavorito = false; // Sistema de favoritos pode ser implementado depois

      // Determinar como renderizar a imagem
      let imagemHTML = '';
      if (produto.imagem && ehURLImagem(produto.imagem)) {
        // Usar imagem real com fallback para gradiente
        imagemHTML = `
          <img src="${produto.imagem}" alt="${produto.nome}" class="imagem-produto-real" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="fundo-gradiente ${produto.imagemFallback || 'gradiente-roxo'}" style="display: none;"></div>
        `;
      } else {
        // Usar gradiente
        imagemHTML = `<div class="fundo-gradiente ${produto.imagemFallback || produto.imagem || 'gradiente-roxo'}"></div>`;
      }

      return `
        <a href="paginaproduto.html?id=${produto.id}" class="cartao-link">
          <div class="card-produto-home" data-produto-id="${produto.id}">
            <div class="produto-imagem">
              ${imagemHTML}
              <div class="badges-produto">
                ${!produto.emEstoque ? '<span class="badge indisponivel">Indisponível</span>' : ''}
              </div>
              <button class="botao-favorito ${ehFavorito ? 'ativo' : ''}" onclick="event.preventDefault(); event.stopPropagation(); alternarFavorito(${produto.id})">
                <i class="fas fa-heart"></i>
              </button>
            </div>
            
            <div class="produto-info">
              <div class="produto-marca">${produto.marca}</div>
              
              <h3 class="produto-nome">${produto.nome}</h3>
              
              <div class="produto-avaliacao">
                <div class="estrelas">
                  ${gerarEstrelas(produto.avaliacao || 0)}
                </div>
                <span class="avaliacoes">(${produto.avaliacoes || 0})</span>
              </div>
              
              <div class="produto-precos">
                ${produto.precoOriginal ? `<span class="preco-original">R$ ${produto.precoOriginal.toFixed(2).replace('.', ',')}</span>` : ''}
                <div class="preco-atual">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                ${produto.desconto > 0 ? `<div class="percentual-desconto">-${produto.desconto}%</div>` : ''}
              </div>
              
              <div class="produto-parcelas">
                <span>12x de R$ ${(produto.preco / 12).toFixed(2).replace('.', ',')} sem juros</span>
              </div>
              
              <div class="produto-status">
                ${produto.emEstoque ? '<div class="status-item em-estoque"><i class="fas fa-check"></i> Em estoque</div>' : ''}
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="botoes-produto-home">
              <button class="btn-comprar-direto ${!produto.emEstoque ? 'disabled' : ''}" 
                      onclick="event.preventDefault(); event.stopPropagation(); ${produto.emEstoque ? `comprarDireto(${produto.id})` : 'showNotification(\'Produto indisponível\', \'warning\')'}"
                      ${!produto.emEstoque ? 'disabled' : ''}>
                <i class="fas fa-bolt"></i>
                Comprar
              </button>
              <button class="btn-adicionar-carrinho ${!produto.emEstoque ? 'disabled' : ''}" 
                      onclick="event.preventDefault(); event.stopPropagation(); ${produto.emEstoque ? `adicionarProdutoAoCarrinho(${produto.id})` : 'showNotification(\'Produto indisponível\', \'warning\')'}"
                      ${!produto.emEstoque ? 'disabled' : ''}>
                <i class="fas fa-cart-plus"></i>
                Carrinho
              </button>
            </div>
          </div>
        </a>
      `;
    }).join('');
    
    console.log(`${produtos.length} produtos em destaque renderizados`);

  } catch (error) {
    console.error("Erro ao carregar produtos em destaque: ", error);
    
    // Mostrar mensagem de erro mais amigável
    container.innerHTML = `
      <div class="erro-produtos" style="
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%);
        border-radius: 16px;
        border: 2px dashed rgba(124, 58, 237, 0.2);
      ">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #7c3aed; margin-bottom: 20px;"></i>
        <p style="font-size: 18px; color: #475569; margin-bottom: 20px;">Erro ao carregar produtos. Tente recarregar a página.</p>
        <button onclick="location.reload()" class="btn-recarregar" style="
          background: #7c3aed;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          <i class="fas fa-redo"></i> Recarregar
        </button>
      </div>
    `;
    
    // Notificação opcional
    if (typeof showNotification === 'function') {
      showNotification("Erro ao carregar produtos em destaque.", "error");
    }
  }
}

// Função auxiliar para verificar se é URL de imagem
function ehURLImagem(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Verifica se é uma URL válida
  if (url.startsWith('http') || url.startsWith('./') || url.startsWith('/')) {
    // Verifica extensões de imagem comuns
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return extensoesImagem.some(ext => url.toLowerCase().includes(ext));
  }
  
  return false;
}

// Sistema de favoritos (placeholder)
function alternarFavorito(produtoId) {
  // Implementação do sistema de favoritos pode ser adicionada aqui
  console.log(`Favorito alternado para produto ${produtoId}`);
  
  // Exemplo de implementação simples com localStorage
  let favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]');
  const index = favoritos.indexOf(produtoId);
  
  if (index > -1) {
    favoritos.splice(index, 1);
  } else {
    favoritos.push(produtoId);
  }
  
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  
  // Atualizar UI
  renderizarProdutosDestaque();
}

// Função para gerar estrelas de avaliação
function gerarEstrelas(nota) {
  let estrelas = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= nota) {
      estrelas += '<i class="fas fa-star"></i>';
    } else {
      estrelas += '<i class="far fa-star"></i>';
    }
  }
  return estrelas;
}

// Função para tentar carregar produtos várias vezes
function tentarCarregarProdutos(tentativas = 0) {
  const maxTentativas = 10;
  
  if (typeof produtos !== 'undefined' && produtos && produtos.length > 0) {
    renderizarProdutosDestaque();
    return;
  }
  
  if (tentativas < maxTentativas) {
    console.log(`Tentativa ${tentativas + 1} de carregar produtos...`);
    setTimeout(() => {
      tentarCarregarProdutos(tentativas + 1);
    }, 200);
  } else {
    console.error('Não foi possível carregar os produtos após', maxTentativas, 'tentativas');
    const container = document.getElementById('grade-produtos-home');
    if (container) {
      container.innerHTML = `
        <div class="erro-produtos">
          <p>Erro ao carregar produtos. Tente recarregar a página.</p>
          <button onclick="location.reload()" class="btn-recarregar">Recarregar</button>
        </div>
      `;
    }
  }
}


// Executar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('Página inicial carregada');
  
  // Inicializar banner
  inicializarBanner();
  
  // Event listeners para os botões do banner
  const btnProximo = document.getElementById('nextBtn');
  const btnAnterior = document.getElementById('prevBtn');
  
  if (btnProximo) btnProximo.addEventListener('click', proximoSlide);
  if (btnAnterior) btnAnterior.addEventListener('click', slideAnterior);
  
  // Event listeners para os indicadores
  setTimeout(() => {
    const indicadoresAtuais = document.querySelectorAll('.banner-indicadores span');
    indicadoresAtuais.forEach((indicador, indice) => {
      indicador.addEventListener('click', () => {
        slideAtual = indice;
        mostrarSlide(slideAtual);
      });
    });
  }, 100);
  
  // Auto-play do banner (opcional)
  setInterval(() => {
    if (slides && slides.length > 0) {
      proximoSlide();
    }
  }, 5000); // Muda slide a cada 5 segundos
  
  // Tentar carregar produtos
  tentarCarregarProdutos();
  
  // Event listeners para os botões da home
  document.addEventListener('click', function(e) {
    // Botão adicionar ao carrinho
    if (e.target.closest('.btn-adicionar-carrinho')) {
      e.preventDefault();
      const botao = e.target.closest('.btn-adicionar-carrinho');
      const produtoId = parseInt(botao.getAttribute('data-id'));
      
      if (produtoId && typeof adicionarAoCarrinho === 'function') {
        adicionarAoCarrinho(produtoId);
      } else {
        if (typeof showNotification === 'function') {
          showNotification('Função de carrinho não disponível', 'error');
        }
      }
    }
    
    // Botão comprar direto
    if (e.target.closest('.btn-comprar-direto')) {
      e.preventDefault();
      const botao = e.target.closest('.btn-comprar-direto');
      const produtoId = parseInt(botao.getAttribute('data-id'));
      
      if (produtoId) {
        comprarDireto(produtoId);
      }
    }
  });
});

// Também tentar renderizar quando a janela carregar completamente
window.addEventListener('load', function() {
  setTimeout(() => {
    tentarCarregarProdutos();
  }, 300);
});

// Verificar periodicamente se os produtos foram carregados
const intervaloProdutos = setInterval(() => {
  if (typeof produtos !== 'undefined' && produtos && produtos.length > 0) {
    renderizarProdutosDestaque();
    clearInterval(intervaloProdutos);
  }
}, 500);

// Limpar o intervalo após 10 segundos para evitar loop infinito
setTimeout(() => {
  clearInterval(intervaloProdutos);
}, 10000);


// Função para inicializar a página home
function inicializarHome() {
  console.log('Inicializando página home...');
  
  // Renderizar produtos em destaque
  if (typeof renderizarProdutosDestaque === 'function') {
    renderizarProdutosDestaque();
  }
  
  // Inicializar banner se existir
  if (typeof inicializarBanner === 'function') {
    inicializarBanner();
  }
  
  // Atualizar contador do carrinho
  if (typeof atualizarContadorCarrinho === 'function') {
    atualizarContadorCarrinho();
  }
  
  console.log('Página home inicializada com sucesso!');
}

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Aguardar um pouco para garantir que todos os scripts foram carregados
  setTimeout(inicializarHome, 100);
});

// Executar também quando a página for totalmente carregada
window.addEventListener('load', function() {
  // Verificar se os produtos já foram renderizados
  const container = document.getElementById('grade-produtos-home');
  if (container && container.innerHTML.trim() === '') {
    inicializarHome();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  
  // ==================== CONFIGURAÇÕES DO CARROSSEL ====================
  const carrossel = {
    slideAtual: 0,
    totalSlides: 3,
    autoPlay: true,
    intervalo: 5000,
    timer: null,
    
    elementos: {
      slidesWrapper: document.getElementById('slidesWrapper'),
      indicadores: document.querySelectorAll('.indicador'),
      btnAnterior: document.getElementById('btnAnterior'),
      btnProximo: document.getElementById('btnProximo'),
      btnPlayPause: document.getElementById('btnPlayPause')
    }
  };
  
  // ==================== FUNÇÕES DO CARROSSEL ====================
  function irParaSlide(indice) {
    carrossel.slideAtual = indice;
    
    if (carrossel.elementos.slidesWrapper) {
      const translateX = -indice * 100;
      carrossel.elementos.slidesWrapper.style.transform = `translateX(${translateX}%)`;
    }
    
    // Atualizar indicadores
    carrossel.elementos.indicadores.forEach((indicador, i) => {
      indicador.classList.toggle('ativo', i === indice);
    });
    
    // Atualizar slides ativos
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, i) => {
      slide.classList.toggle('ativo', i === indice);
    });
  }
  
  function proximoSlide() {
    const proximo = (carrossel.slideAtual + 1) % carrossel.totalSlides;
    irParaSlide(proximo);
  }
  
  function slideAnterior() {
    const anterior = carrossel.slideAtual === 0 ? carrossel.totalSlides - 1 : carrossel.slideAtual - 1;
    irParaSlide(anterior);
  }
  
  function iniciarAutoPlay() {
    if (carrossel.autoPlay) {
      carrossel.timer = setInterval(proximoSlide, carrossel.intervalo);
    }
  }
  
  function pararAutoPlay() {
    if (carrossel.timer) {
      clearInterval(carrossel.timer);
      carrossel.timer = null;
    }
  }
  
  function alternarAutoPlay() {
    if (carrossel.autoPlay) {
      pararAutoPlay();
      carrossel.autoPlay = false;
      if (carrossel.elementos.btnPlayPause) {
        carrossel.elementos.btnPlayPause.innerHTML = '<i class="fas fa-play"></i>';
      }
    } else {
      iniciarAutoPlay();
      carrossel.autoPlay = true;
      if (carrossel.elementos.btnPlayPause) {
        carrossel.elementos.btnPlayPause.innerHTML = '<i class="fas fa-pause"></i>';
      }
    }
  }
  
  // ==================== EVENT LISTENERS DO CARROSSEL ====================
  
  // Botões de navegação
  if (carrossel.elementos.btnAnterior) {
    carrossel.elementos.btnAnterior.addEventListener('click', slideAnterior);
  }
  
  if (carrossel.elementos.btnProximo) {
    carrossel.elementos.btnProximo.addEventListener('click', proximoSlide);
  }
  
  // Botão play/pause
  if (carrossel.elementos.btnPlayPause) {
    carrossel.elementos.btnPlayPause.addEventListener('click', alternarAutoPlay);
  }
  
  // Indicadores
  carrossel.elementos.indicadores.forEach((indicador, indice) => {
    indicador.addEventListener('click', () => irParaSlide(indice));
  });
  
  // Navegação por teclado
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      slideAnterior();
    } else if (e.key === 'ArrowRight') {
      proximoSlide();
    } else if (e.key === ' ') {
      e.preventDefault();
      alternarAutoPlay();
    }
  });
  
  // Pausar autoplay ao passar o mouse
  const carrosselContainer = document.querySelector('.carrossel-moderno');
  if (carrosselContainer) {
    carrosselContainer.addEventListener('mouseenter', pararAutoPlay);
    carrosselContainer.addEventListener('mouseleave', () => {
      if (carrossel.autoPlay) {
        iniciarAutoPlay();
      }
    });
  }
  
  // Clique nos slides para navegar
  const slides = document.querySelectorAll('.slide');
  slides.forEach((slide, indice) => {
    slide.addEventListener('click', function() {
      const link = slide.getAttribute('data-link');
      if (link) {
        window.location.href = link;
      }
    });
  });
  
  // ==================== CONTROLES DE VÍDEO ====================
  const video = document.getElementById('videoAnuncio');
  const btnPlayPauseVideo = document.getElementById('btnPlayPauseVideo');
  const btnMute = document.getElementById('btnMute');
  
  if (video && btnPlayPauseVideo) {
    btnPlayPauseVideo.addEventListener('click', function() {
      if (video.paused) {
        video.play();
        btnPlayPauseVideo.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        video.pause();
        btnPlayPauseVideo.innerHTML = '<i class="fas fa-play"></i>';
      }
    });
  }
  
  if (video && btnMute) {
    btnMute.addEventListener('click', function() {
      if (video.muted) {
        video.muted = false;
        btnMute.innerHTML = '<i class="fas fa-volume-up"></i>';
      } else {
        video.muted = true;
        btnMute.innerHTML = '<i class="fas fa-volume-mute"></i>';
      }
    });
  }
  
  // ==================== ANIMAÇÕES DE ENTRADA ====================
  function animarElementos() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeIn 0.8s ease forwards';
        }
      });
    }, {
      threshold: 0.1
    });
    
    // Observar categorias
    const categorias = document.querySelectorAll('.categoria-card');
    categorias.forEach((categoria, indice) => {
      categoria.style.opacity = '0';
      categoria.style.animationDelay = `${indice * 0.2}s`;
      observer.observe(categoria);
    });
    
    // Observar vídeo
    const videoSection = document.querySelector('.video-anuncio');
    if (videoSection) {
      videoSection.style.opacity = '0';
      observer.observe(videoSection);
    }
  }
  
  // ==================== OTIMIZAÇÕES DE PERFORMANCE ====================
  
  // Lazy loading para imagens
  function implementarLazyLoading() {
    const imagens = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    imagens.forEach(img => imageObserver.observe(img));
  }
  
  // Preload das próximas imagens do carrossel
  function preloadImagens() {
    const slides = document.querySelectorAll('.slide img');
    slides.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    });
  }
  
  // ==================== RESPONSIVIDADE AVANÇADA ====================
  function ajustarParaMobile() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Ajustar intervalo do carrossel para mobile
      carrossel.intervalo = 7000;
      
      // Pausar vídeo em mobile para economizar dados
      if (video && !video.paused) {
        video.pause();
      }
    }
  }
  
  // ==================== ANALYTICS E TRACKING ====================
  function trackInteracoes() {
    // Track cliques nos slides
    slides.forEach((slide, indice) => {
      slide.addEventListener('click', () => {
        console.log(`Slide ${indice + 1} clicado`);
        // Aqui você pode integrar com Google Analytics ou outro serviço
      });
    });
    
    // Track tempo de visualização
    let tempoInicio = Date.now();
    window.addEventListener('beforeunload', () => {
      const tempoTotal = Date.now() - tempoInicio;
      console.log(`Tempo na página: ${Math.round(tempoTotal / 1000)}s`);
    });
  }
  
  // ==================== ACESSIBILIDADE ====================
  function melhorarAcessibilidade() {
    // Adicionar ARIA labels
    const controles = document.querySelectorAll('.btn-controle');
    controles.forEach(controle => {
      if (controle.classList.contains('btn-anterior')) {
        controle.setAttribute('aria-label', 'Slide anterior');
      } else if (controle.classList.contains('btn-proximo')) {
        controle.setAttribute('aria-label', 'Próximo slide');
      }
    });
    
    // Adicionar role para indicadores
    carrossel.elementos.indicadores.forEach((indicador, indice) => {
      indicador.setAttribute('role', 'button');
      indicador.setAttribute('aria-label', `Ir para slide ${indice + 1}`);
    });
    
    // Pausar animações se o usuário preferir
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      carrossel.autoPlay = false;
      pararAutoPlay();
    }
  }
  
  // ==================== INICIALIZAÇÃO ====================
  function inicializar() {
    // Iniciar carrossel
    iniciarAutoPlay();
    
    // Configurar animações
    animarElementos();
    
    // Implementar lazy loading
    implementarLazyLoading();
    
    // Preload de imagens
    preloadImagens();
    
    // Ajustes para mobile
    ajustarParaMobile();
    
    // Tracking
    trackInteracoes();
    
    // Acessibilidade
    melhorarAcessibilidade();
    
    console.log('Home melhorada inicializada com sucesso!');
  }
  
  // ==================== EVENT LISTENERS GLOBAIS ====================
  
  // Redimensionamento da janela
  window.addEventListener('resize', ajustarParaMobile);
  
  // Visibilidade da página (pausar quando não visível)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      pararAutoPlay();
      if (video && !video.paused) {
        video.pause();
      }
    } else if (carrossel.autoPlay) {
      iniciarAutoPlay();
    }
  });
  
  // ==================== INICIALIZAR TUDO ====================
  inicializar();
});


// Função para criar notificações
window.mostrarNotificacaoHome = function(mensagem, tipo = 'info') {
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao-home notificacao-${tipo}`;
  notificacao.innerHTML = `
    <div class="notificacao-conteudo">
      <i class="fas fa-${tipo === 'sucesso' ? 'check-circle' : 'info-circle'}"></i>
      <span>${mensagem}</span>
    </div>
  `;
  
  document.body.appendChild(notificacao);
  
  // Animar entrada
  setTimeout(() => {
    notificacao.classList.add('mostrar');
  }, 100);
  
  // Remover após 3 segundos
  setTimeout(() => {
    notificacao.classList.remove('mostrar');
    setTimeout(() => {
      if (notificacao.parentElement) {
        notificacao.remove();
      }
    }, 300);
  }, 3000);
};

// Função para scroll suave
window.scrollSuave = function(elemento) {
  if (typeof elemento === 'string') {
    elemento = document.querySelector(elemento);
  }
  
  if (elemento) {
    elemento.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const estilosNotificacoes = `
<style>
.notificacao-home {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 1rem 1.5rem;
  z-index: 10000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  max-width: 300px;
}

.notificacao-home.mostrar {
  transform: translateX(0);
}

.notificacao-conteudo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.notificacao-sucesso {
  border-left: 4px solid #10b981;
}

.notificacao-info {
  border-left: 4px solid #3b82f6;
}

.notificacao-sucesso i {
  color: #10b981;
}

.notificacao-info i {
  color: #3b82f6;
}
</style>
`;

// Adicionar estilos ao head
document.head.insertAdjacentHTML('beforeend', estilosNotificacoes);

