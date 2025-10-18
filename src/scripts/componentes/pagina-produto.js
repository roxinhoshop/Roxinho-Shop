import { buscarProdutosDaAPI } from "../servicos/banco-dados.js";

class PaginaProduto {
  constructor() {
    this.produtoAtual = null;
    this.inicializar();
  }

  inicializar() {
    this.carregarProdutoDaURL();
  }

  async carregarProdutoDaURL() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = params.get("id");

    if (!idProduto) {
      this.exibirErroProduto("ID do produto não fornecido na URL.");
      return;
    }

    try {
      const todosProdutos = await buscarProdutosDaAPI();
      this.produtoAtual = todosProdutos.find(p => p.id === idProduto);

      if (this.produtoAtual) {
        this.renderizarProduto();
      } else {
        this.exibirErroProduto(`Produto com ID ${idProduto} não encontrado.`);
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      this.exibirErroProduto("Não foi possível carregar o produto. Tente novamente mais tarde.");
    }
  }

  exibirErroProduto(mensagem) {
    const container = document.querySelector(".pagina-produto");
    if (container) {
      container.innerHTML = `
        <div class="erro-produto">
          <h2>Erro ao carregar produto</h2>
          <p>${mensagem}</p>
          <a href="index.html" class="btn-voltar">Voltar à página inicial</a>
        </div>
      `;
    }
  }

  renderizarProduto() {
    const produto = this.produtoAtual;
    if (!produto) return;

    document.title = `${produto.nome} | Roxinho Shop`;

    // Breadcrumb
    document.getElementById("breadcrumbCategoria").textContent = produto.categoria || "Categoria";
    document.getElementById("breadcrumbCategoria").href = `produtos.html?categoria=${encodeURIComponent(produto.categoria || "")}`;
    document.getElementById("breadcrumbProduto").textContent = produto.nome;

    // Imagem Principal
    const imagemProduto = document.getElementById("imagemProduto");
    if (imagemProduto) {
      imagemProduto.src = produto.imagem || "https://via.placeholder.com/400?text=Sem+Imagem";
      imagemProduto.alt = produto.nome;
    }

    // Informações do Produto
    document.getElementById("nomeProduto").textContent = produto.nome;
    document.getElementById("descricaoProduto").textContent = produto.descricao || "";
    document.getElementById("marcaProduto").textContent = produto.marca || "";
    document.getElementById("estoqueStatus").textContent = produto.emEstoque ? "● Em estoque" : "● Indisponível";
    document.getElementById("skuProduto").textContent = `SKU: PROD${produto.id.toString().padStart(5, "0")}`;

    // Preços
    document.getElementById("precoProduto").textContent = `R$ ${produto.preco.toFixed(2).replace(".", ",")}`;
    if (produto.preco_original) {
      const precoOriginalElement = document.getElementById("precoOriginal");
      if (precoOriginalElement) {
        precoOriginalElement.textContent = `De R$ ${produto.preco_original.toFixed(2).replace(".", ",")}`;
        precoOriginalElement.style.display = "block";
      }
    }
    if (produto.desconto && produto.desconto > 0) {
      const descontoProdutoElement = document.getElementById("descontoProduto");
      if (descontoProdutoElement) {
        descontoProdutoElement.textContent = `-${produto.desconto}%`;
        descontoProdutoElement.style.display = "inline-block";
      }
    }
    document.getElementById("parcelamentoProduto").textContent = produto.parcelamento || `em até 12x de R$ ${(produto.preco / 12).toFixed(2).replace(".", ",")}`;

    // Preços e links dos marketplaces
    const btnMercadoLivre = document.getElementById("btnMercadoLivre");
    const btnAmazon = document.getElementById("btnAmazon");

    if (produto.linkMercadoLivre && btnMercadoLivre) {
      btnMercadoLivre.href = produto.linkMercadoLivre;
      btnMercadoLivre.style.display = "flex";
      // Adicionar preço do Mercado Livre se disponível
      if (produto.precoMercadoLivre) {
        const precoMLSpan = document.createElement("span");
        precoMLSpan.textContent = `R$ ${produto.precoMercadoLivre.toFixed(2).replace(".", ",")}`;
        precoMLSpan.style.marginLeft = "auto";
        btnMercadoLivre.insertBefore(precoMLSpan, btnMercadoLivre.querySelector("i.fa-external-link-alt"));
      }
    } else if (btnMercadoLivre) {
      btnMercadoLivre.style.display = "none";
    }

    if (produto.linkAmazon && btnAmazon) {
      btnAmazon.href = produto.linkAmazon;
      btnAmazon.style.display = "flex";
      // Adicionar preço da Amazon se disponível
      if (produto.precoAmazon) {
        const precoAmazonSpan = document.createElement("span");
        precoAmazonSpan.textContent = `R$ ${produto.precoAmazon.toFixed(2).replace(".", ",")}`;
        precoAmazonSpan.style.marginLeft = "auto";
        btnAmazon.insertBefore(precoAmazonSpan, btnAmazon.querySelector("i.fa-external-link-alt"));
      }
    } else if (btnAmazon) {
      btnAmazon.style.display = "none";
    }

    // Descrição completa
    const descricaoCompleta = document.getElementById("descricaoProdutoCompleta");
    if (descricaoCompleta) {
      descricaoCompleta.innerHTML = produto.descricao_longa || produto.descricao || "Nenhuma descrição detalhada disponível.";
    }

    // Miniaturas (se houver)
    const miniaturasContainer = document.getElementById("miniaturas");
    if (miniaturasContainer && produto.imagens_secundarias && produto.imagens_secundarias.length > 0) {
      miniaturasContainer.innerHTML = produto.imagens_secundarias.map(img => `
        <img src="${img}" alt="${produto.nome}" class="miniatura" onclick="paginaProduto.trocarImagemPrincipal(\'${img}\')">
      `).join("");
    } else if (miniaturasContainer) {
      miniaturasContainer.innerHTML = ""; // Limpa se não houver miniaturas
    }
  }

  trocarImagemPrincipal(novaImagemSrc) {
    const imagemPrincipal = document.getElementById("imagemProduto");
    if (imagemPrincipal) {
      imagemPrincipal.src = novaImagemSrc;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.paginaProduto = new PaginaProduto();
});

