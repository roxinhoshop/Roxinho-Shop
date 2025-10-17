// Sistema da página home integrado com carrinho unificado
// Comentários didáticos para facilitar o entendimento


window.API_BASE_URL = 'https://Roxinho-Shop-BACKEND.vercel.app/api';

var slideAtual = 0;
let slides, indicadores;

function inicializarBanner() {
  slides = document.querySelectorAll(".banner-slide");
  indicadores = document.querySelectorAll(".banner-indicadores span");
  
  if (slides.length > 0) {
    mostrarSlide(0);
  }
}

function mostrarSlide(indice) {
  if (!slides || !indicadores) return;
  
  // Remover classe ativo de todos os slides e indicadores
  slides.forEach(slide => slide.classList.remove("ativo"));
  indicadores.forEach(indicador => indicador.classList.remove("ativo"));
  
  // Adicionar classe ativo ao slide e indicador atual
  if (slides[indice]) slides[indice].classList.add("ativo");
  if (indicadores[indice]) indicadores[indice].classList.add("ativo");
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
  
  const container = document.getElementById("grade-produtos-home");
  
  if (!container) {
    console.error("Container 'grade-produtos-home' não encontrado");
    return;
  }

  try {
    let produtos = [];
    
    // Chamada direta para a API externa
    const response = await fetch(`${window.API_BASE_URL}/produtos?limite=8`);
    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    produtos = data.produtos || data.products || data || [];
    
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
      // Normalizar dados do produto
      const nome = produto.nome || produto.name;
      const preco = parseFloat(produto.preco || produto.price);
      const imagem = produto.imagem || produto.image;
      const categoria = produto.categoria || produto.category;
      const estoque = produto.estoque || produto.stock || 0;
      const emEstoque = estoque > 0;
      const marca = produto.marca || produto.brand || categoria;
      const ehFavorito = false;

      // Determinar como renderizar a imagem
      let imagemHTML = '';
      if (imagem && ehURLImagem(imagem)) {
        // Usar imagem real com fallback para gradiente
        imagemHTML = `
          <img src="${imagem}" alt="${nome}" class="imagem-produto-real" 
               onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">
          <div class="fundo-gradiente ${produto.imagemFallback || "gradiente-roxo"}" style="display: none;"></div>
        `;
      } else {
        // Usar gradiente
        imagemHTML = `<div class="fundo-gradiente ${produto.imagemFallback || imagem || "gradiente-roxo"}"></div>`;
      }

      return `
        <a href="src/paginas/pagina-produto.html?id=${produto.id}" class="cartao-link">
          <div class="card-produto-home" data-produto-id="${produto.id}">
            <div class="produto-imagem">
              ${imagemHTML}
              <div class="badges-produto">
                ${!emEstoque ? "<span class=\"badge indisponivel\">Indisponível</span>" : ""}
              </div>
              <button class="botao-favorito ${ehFavorito ? "ativo" : ""}" onclick="event.preventDefault(); event.stopPropagation(); alternarFavorito(\'${produto.id}\')">
                <i class="fas fa-heart"></i>
              </button>
            </div>
            
            <div class="produto-info">
              ${marca ? `<div class="produto-marca">${marca}</div>` : ""}
              
              <h3 class="produto-nome">${nome}</h3>
              
              <div class="produto-avaliacao">
                <div class="estrelas">
                  ${gerarEstrelas(produto.avaliacao || 0)}
                </div>
                <span class="avaliacoes">(${produto.avaliacoes || 0})</span>
              </div>
              
              <div class="produto-precos">
                ${produto.precoOriginal ? `<span class="preco-original">R$ ${parseFloat(produto.precoOriginal).toFixed(2).replace(".", ",")}</span>` : ""}
                <div class="preco-atual">R$ ${preco.toFixed(2).replace(".", ",")}</div>
                ${produto.desconto > 0 ? `<div class="percentual-desconto">-${produto.desconto}%</div>` : ""}
              </div>
              
              <div class="produto-parcelas">
                <span>12x de R$ ${(preco / 12).toFixed(2).replace(".", ",")} sem juros</span>
              </div>
              
              <div class="produto-status">
                ${emEstoque ? "<div class=\"status-item em-estoque\"><i class=\"fas fa-check\"></i> Em estoque</div>" : ""}
              </div>
            </div>

            <!-- Botões de Ação -->
            <div class="botoes-produto-home">
              <button class="btn-comprar-direto ${!emEstoque ? "disabled" : ""}" 
                      onclick="event.preventDefault(); event.stopPropagation(); ${emEstoque ? `comprarDireto(\'${produto.id}\')` : "showNotification(\'Produto indisponível\', \'warning\')"}"
                      ${!emEstoque ? "disabled" : ""}>
                <i class="fas fa-bolt"></i>
                Comprar
              </button>
              <button class="btn-adicionar-carrinho ${!emEstoque ? "disabled" : ""}" 
                      onclick="event.preventDefault(); event.stopPropagation(); ${emEstoque ? `adicionarProdutoAoCarrinho(\'${produto.id}\')` : "showNotification(\'Produto indisponível\', \'warning\')"}"
                      ${!emEstoque ? "disabled" : ""}>
                <i class="fas fa-cart-plus"></i>
                Carrinho
              </button>
            </div>
          </div>
        </a>
      `;
    }).join("");
    

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
    if (typeof showNotification === "function") {
      showNotification("Erro ao carregar produtos em destaque.", "error");
    }
  }
}

// Função auxiliar para verificar se é URL de imagem
function ehURLImagem(url) {
  if (!url || typeof url !== "string") return false;
  
  // Verifica se é uma URL válida
  if (url.startsWith("http") || url.startsWith("./") || url.startsWith("/")) {
    // Verifica extensões de imagem comuns
    const extensoesImagem = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return extensoesImagem.some(ext => url.toLowerCase().includes(ext));
  }
  
  return false;
}

// Sistema de favoritos (placeholder)
function alternarFavorito(produtoId) {
  // Implementação do sistema de favoritos pode ser adicionada aqui
  
  // Exemplo de implementação simples com localStorage
  let favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
  const index = favoritos.indexOf(produtoId);
  
  if (index > -1) {
    favoritos.splice(index, 1);
  } else {
    favoritos.push(produtoId);
  }
  
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  
  // Atualizar UI
  renderizarProdutosDestaque();
}

// Função para gerar estrelas de avaliação
function gerarEstrelas(nota) {
  let estrelas = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= nota) {
      estrelas += "<i class=\"fas fa-star\"></i>";
    } else {
      estrelas += "<i class=\"far fa-star\"></i>";
    }
  }
  return estrelas;
}

// Função removida - produtos agora são carregados diretamente da API


// Executar quando a página carregar
document.addEventListener("DOMContentLoaded", function() {
  
  // Inicializar banner
  inicializarBanner();
  
  // Event listeners para os botões do banner
  const btnProximo = document.getElementById("nextBtn");
  const btnAnterior = document.getElementById("prevBtn");
  
  if (btnProximo) btnProximo.addEventListener("click", proximoSlide);
  if (btnAnterior) btnAnterior.addEventListener("click", slideAnterior);
  
  // Event listeners para os indicadores
  setTimeout(() => {
    const indicadoresAtuais = document.querySelectorAll(".banner-indicadores span");
    indicadoresAtuais.forEach((indicador, indice) => {
      indicador.addEventListener("click", () => {
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
  
  // Carregar produtos da API
  renderizarProdutosDestaque();
  
  // Event listeners para os botões da home
  document.addEventListener("click", function(e) {
    // Botão adicionar ao carrinho
    if (e.target.closest(".btn-adicionar-carrinho")) {
      e.preventDefault();
      const botao = e.target.closest(".btn-adicionar-carrinho");
      const produtoId = parseInt(botao.getAttribute("data-id"));
      
      if (produtoId && typeof adicionarAoCarrinho === "function") {
        adicionarAoCarrinho(produtoId);
      } else {
        if (typeof showNotification === "function") {
          showNotification("Função de carrinho não disponível", "error");
        }
      }
    }
    
    // Botão comprar direto
    if (e.target.closest(".btn-comprar-direto")) {
      e.preventDefault();
      const botao = e.target.closest(".btn-comprar-direto");
      const produtoId = parseInt(botao.getAttribute("data-id"));
      
      if (produtoId) {
        comprarDireto(produtoId);
      }
    }
  });
});

// Também tentar renderizar quando a janela carregar completamente
window.addEventListener("load", function() {
  setTimeout(() => {
    // A função renderizarProdutosDestaque já é chamada no DOMContentLoaded
    // Se houver necessidade de recarregar, pode ser adicionado aqui
  }, 300);
});

// Verificar periodicamente se os produtos foram carregados
const intervaloProdutos = setInterval(() => {
  if (typeof produtos !== "undefined" && produtos && produtos.length > 0) {
    renderizarProdutosDestaque();
    clearInterval(intervaloProdutos);
  }
}, 1000); // Tentar a cada 1 segundo por um tempo limite (ex: 10 vezes)

// Adicionar uma função de inicialização para ser chamada em outros lugares, se necessário
function inicializarHome() {
  inicializarBanner();
  renderizarProdutosDestaque();
  // Outras inicializações da home aqui
}

// Expor funções globais se necessário
window.inicializarHome = inicializarHome;

// Variáveis e funções para o carrinho (simplificado para exemplo)
let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

function adicionarProdutoAoCarrinho(produtoId) {
  const produtoExistente = carrinho.find(item => item.id === produtoId);
  if (produtoExistente) {
    produtoExistente.quantidade++;
  } else {
    carrinho.push({ id: produtoId, quantidade: 1 });
  }
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  if (typeof showNotification === "function") {
    showNotification(`Produto ${produtoId} adicionado ao carrinho!`, "success");
  }
  atualizarContadorCarrinho();
}

function comprarDireto(produtoId) {
  adicionarProdutoAoCarrinho(produtoId);
  // Redirecionar para a página do carrinho ou checkout
  if (typeof showNotification === "function") {
    showNotification(`Redirecionando para o checkout com o produto ${produtoId}.`, "info");
  }
  // window.location.href = "src/paginas/carrinho.html"; // Exemplo
}

function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");
  if (contador) {
    contador.textContent = carrinho.reduce((total, item) => total + item.quantidade, 0);
  }
}

// Chamar atualização do contador ao carregar a página
document.addEventListener("DOMContentLoaded", atualizarContadorCarrinho);

// Exemplo de como obter o BASE_URL da API, pode ser configurado em um arquivo de config.js
window.API_BASE_URL = "https://roxinho-shop-backend.vercel.app/api"; // URL da sua API Backend

// Função para carregar categorias dinamicamente (exemplo)
async function carregarCategoriasDinamicas() {
  const containerCategorias = document.getElementById("menu-categorias");
  if (!containerCategorias) return;

  try {
    const response = await fetch(`${window.API_BASE_URL}/categorias`);
    if (!response.ok) {
      throw new Error(`Erro HTTP! status: ${response.status}`);
    }
    const data = await response.json();
    const categorias = data.categorias || data.categories || data || [];

    if (categorias.length === 0) {
      console.warn("Nenhuma categoria encontrada");
      containerCategorias.innerHTML = `<li class="menu-item">Nenhuma categoria</li>`;
      return;
    }

    containerCategorias.innerHTML = categorias.map(categoria => `
      <li class="menu-item">
        <a href="src/paginas/produtos.html?categoria=${categoria.slug}">
          <i class="${categoria.icone || "fas fa-tag"}"></i>
          <span>${categoria.nome}</span>
        </a>
      </li>
    `).join("");

  } catch (error) {
    console.error("Erro ao carregar categorias dinâmicas: ", error);
    if (typeof showNotification === "function") {
      showNotification("Erro ao carregar categorias.", "error");
    }
  }
}

// Chamar carregamento de categorias ao carregar a página
document.addEventListener("DOMContentLoaded", carregarCategoriasDinamicas);


// Funções de login/logout (placeholders)
function fazerLogin(username, password) {
  console.log(`Tentando logar com ${username} e ${password}`);
  if (typeof showNotification === "function") {
    showNotification("Login em desenvolvimento.", "info");
  }
  // Implementar lógica de autenticação aqui
}

function fazerLogout() {
  console.log("Fazendo logout");
  if (typeof showNotification === "function") {
    showNotification("Logout realizado.", "success");
  }
  // Implementar lógica de logout aqui
}


// Funções de autenticação e cabeçalho
function atualizarEstadoLogin() {
  const usuarioLogado = localStorage.getItem("usuarioLogado") === "true"; // Exemplo simples
  const nomeUsuario = localStorage.getItem("nomeUsuario") || "Usuário";

  const authLink = document.getElementById("auth-link");
  const userMenu = document.getElementById("user-menu");
  const userNameDisplay = document.getElementById("user-name-display");

  if (authLink && userMenu && userNameDisplay) {
    if (usuarioLogado) {
      authLink.style.display = "none";
      userMenu.style.display = "flex";
      userNameDisplay.textContent = nomeUsuario;
    } else {
      authLink.style.display = "flex";
      userMenu.style.display = "none";
    }
  } else {
    console.warn("Elementos do cabeçalho não encontrados");
  }
}

document.addEventListener("DOMContentLoaded", atualizarEstadoLogin);

// Event listener para o botão de logout
const logoutButton = document.getElementById("logout-button");
if (logoutButton) {
  logoutButton.addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nomeUsuario");
    fazerLogout();
    atualizarEstadoLogin();
  });
}



