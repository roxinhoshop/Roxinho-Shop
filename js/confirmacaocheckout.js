// ===== ROOXYCE STORE - E-COMMERCE DE ELETRÔNICOS =====
// Desenvolvido por Gabriel (gabwvr)
// Este arquivo contém funções para gerenciar [FUNCIONALIDADE]
// Comentários didáticos para facilitar o entendimento


// ===== GERENCIADOR DA CONFIRMAÇÃO DE PEDIDO =====
// Sistema completo de confirmação com dados dinâmicos

class GerenciadorConfirmacao {
  constructor() {
    this.dadosPedido = null;
    this.dadosFormulario = null;
    this.numeroPedido = this.gerarNumeroPedido();

    // Inicializa o sistema
    this.inicializar();
  }

  // Método principal de inicialização
  inicializar() {
    this.carregarDadosPedido();
    this.renderizarConfirmacao();
    this.configurarEventos();
    this.limparCarrinho();

    console.log("✅ Confirmação inicializada com sucesso");
  }

  // Carrega dados do pedido do localStorage
  carregarDadosPedido() {
    const dadosCheckout = localStorage.getItem("dadosCheckout");
    const pedidoFinalizado = localStorage.getItem("pedidoFinalizado");

    if (pedidoFinalizado) {
      const pedido = JSON.parse(pedidoFinalizado);
      this.dadosPedido = {
        produtos: pedido.itens,
        subtotal: pedido.totais.subtotal,
        desconto: pedido.totais.desconto,
        total: pedido.totais.total,
      };
      this.dadosFormulario = pedido.dados;
      this.numeroPedido = pedido.numero;
    } else if (dadosCheckout) {
      this.dadosPedido = JSON.parse(dadosCheckout);
    }

    // Se não houver dados, cria dados de exemplo
    if (!this.dadosPedido) {
      this.criarDadosExemplo();
    }
  }

  // Cria dados de exemplo quando não há dados salvos
  criarDadosExemplo() {
    this.dadosPedido = {
      produtos: [
        {
          id: 1,
          nome: "Smartphone Samsung Galaxy",
          descricao: "128GB, Câmera 64MP",
          preco: 899.99,
          quantidade: 1,
          imagem: "https://via.placeholder.com/80x80/7c3aed/ffffff?text=Phone",
        },
        {
          id: 2,
          nome: "Fone de Ouvido Sony",
          descricao: "Wireless, Cancelamento de ruído",
          preco: 299.99,
          quantidade: 1,
          imagem: "https://via.placeholder.com/80x80/7c3aed/ffffff?text=Fone",
        },
      ],
      subtotal: 1199.98,
      desconto: 0,
      total: 1199.98,
    };

    this.dadosFormulario = {
      cep: "01234-567",
      uf: "SP",
      cidade: "São Paulo",
      bairro: "Centro",
      endereco: "Rua das Flores",
      numero: "123",
      complemento: "Apto 45",
      formaPagamento: "cartao-credito",
      numeroCartao: "1234567890123456",
      nomeCartao: "João Silva",
    };
  }

  // Renderiza todos os elementos da confirmação
  renderizarConfirmacao() {
    this.renderizarNumeroPedido();
    this.renderizarProdutos();
    this.renderizarResumoValores();
    this.renderizarInformacoesEntrega();
    this.renderizarFormaPagamento();
    this.calcularPrazoEntrega();
  }

  // Renderiza o número do pedido
  renderizarNumeroPedido() {
    document.getElementById("numeroPedido").textContent = this.numeroPedido;
  }

  // Renderiza a lista de produtos
  renderizarProdutos() {
    const container = document.getElementById("produtosConfirmacao");

    if (!this.dadosPedido.produtos || this.dadosPedido.produtos.length === 0) {
      container.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
    }

    container.innerHTML = this.dadosPedido.produtos
      .map(
        (produto) => `
            <div class="produto-confirmacao">
                <img src="${produto.imagem}" alt="${produto.nome}" class="produto-imagem-pequena">
                <div class="produto-info">
                    <h4>${produto.nome}</h4>
                    <p class="produto-descricao">${produto.descricao}</p>
                    <div class="produto-quantidade-preco">
                        <span class="quantidade">Qtd: ${produto.quantidade}</span>
                        <span class="preco">R$ ${(produto.preco * produto.quantidade).toFixed(2).replace(".", ",")}</span>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Renderiza o resumo de valores
  renderizarResumoValores() {
    if (!this.dadosPedido) return;

    document.getElementById("subtotalConfirmacao").textContent =
      `R$ ${this.dadosPedido.subtotal.toFixed(2).replace(".", ",")}`;

    document.getElementById("totalConfirmacao").textContent =
      `R$ ${this.dadosPedido.total.toFixed(2).replace(".", ",")}`;

    // Mostra desconto se houver
    if (this.dadosPedido.desconto > 0) {
      document.getElementById("linhaDescontoConfirmacao").style.display = "flex";
      document.getElementById("descontoConfirmacao").textContent =
        `-R$ ${this.dadosPedido.desconto.toFixed(2).replace(".", ",")}`;
    }
  }

  // Renderiza informações de entrega
  renderizarInformacoesEntrega() {
    if (!this.dadosFormulario) return;

    // Nome do destinatário (usa nome do cartão como fallback)
    const nomeDestinatario = this.dadosFormulario.nomeCartao || "João Silva";
    document.getElementById("nomeDestinatario").textContent = nomeDestinatario;

    // Endereço completo
    const enderecoCompleto = `${this.dadosFormulario.endereco || "Rua das Flores"}, ${this.dadosFormulario.numero || "123"}${
      this.dadosFormulario.complemento ? ` - ${this.dadosFormulario.complemento}` : ""
    }`;
    document.getElementById("enderecoCompleto").textContent = enderecoCompleto;

    // Cidade e CEP
    const cidadeCep = `${this.dadosFormulario.cidade || "São Paulo"} - ${this.dadosFormulario.uf || "SP"}, CEP: ${
      this.dadosFormulario.cep || "01234-567"
    }`;
    document.getElementById("cidadeCep").textContent = cidadeCep;
  }

  // Renderiza forma de pagamento
  renderizarFormaPagamento() {
    if (!this.dadosFormulario || !this.dadosFormulario.formaPagamento) {
      document.getElementById("detalhesPagamento").textContent = "Cartão de Crédito";
      return;
    }

    const { formaPagamento } = this.dadosFormulario;
    let detalhes = "";

    switch (formaPagamento) {
      case "cartao-credito":
        const cartaoMascarado = this.dadosFormulario.numeroCartao
          ? `**** **** **** ${this.dadosFormulario.numeroCartao.slice(-4)}`
          : "**** **** **** 3456";
        detalhes = `Cartão de Crédito ${cartaoMascarado}`;
        break;
      case "cartao-debito":
        const debitoMascarado = this.dadosFormulario.numeroCartao
          ? `**** **** **** ${this.dadosFormulario.numeroCartao.slice(-4)}`
          : "**** **** **** 3456";
        detalhes = `Cartão de Débito ${debitoMascarado}`;
        break;
      case "pix":
        detalhes = "PIX - Pagamento à vista";
        break;
      case "boleto":
        detalhes = "Boleto Bancário - Vencimento em 3 dias";
        break;
      default:
        detalhes = "Cartão de Crédito";
    }

    document.getElementById("detalhesPagamento").textContent = detalhes;
  }

  // Calcula e exibe prazo de entrega
  calcularPrazoEntrega() {
    const hoje = new Date();
    const prazoMinimo = 5; // dias úteis
    const prazoMaximo = 7; // dias úteis

    // Calcula data considerando apenas dias úteis
    const dataEntregaMin = this.adicionarDiasUteis(hoje, prazoMinimo);
    const dataEntregaMax = this.adicionarDiasUteis(hoje, prazoMaximo);

    const formatoData = { day: "2-digit", month: "2-digit", year: "numeric" };
    const dataMinFormatada = dataEntregaMin.toLocaleDateString("pt-BR", formatoData);
    const dataMaxFormatada = dataEntregaMax.toLocaleDateString("pt-BR", formatoData);

    document.getElementById("dataEntrega").textContent = 
      `Entre ${dataMinFormatada} e ${dataMaxFormatada}`;
  }

  // Adiciona dias úteis a uma data
  adicionarDiasUteis(data, dias) {
    const resultado = new Date(data);
    let diasAdicionados = 0;

    while (diasAdicionados < dias) {
      resultado.setDate(resultado.getDate() + 1);
      // Se não for sábado (6) nem domingo (0)
      if (resultado.getDay() !== 0 && resultado.getDay() !== 6) {
        diasAdicionados++;
      }
    }

    return resultado;
  }

  // Gera número único do pedido
  gerarNumeroPedido() {
    const ano = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `#LP-${ano}-${timestamp}`;
  }

  // Configura eventos da página
  configurarEventos() {
    // Botão rastrear pedido
    document.getElementById("botaoRastrear").addEventListener("click", () => {
      this.mostrarToast("Funcionalidade de rastreamento em desenvolvimento", "info");
    });

    // Salva dados do pedido para possível consulta futura
    this.salvarPedidoHistorico();
  }

  // Salva pedido no histórico (localStorage)
  salvarPedidoHistorico() {
    const historicoPedidos = JSON.parse(localStorage.getItem("historicoPedidos") || "[]");

    const pedido = {
      numero: this.numeroPedido,
      data: new Date().toISOString(),
      produtos: this.dadosPedido.produtos,
      total: this.dadosPedido.total,
      status: "confirmado",
      dadosEntrega: this.dadosFormulario,
    };

    historicoPedidos.unshift(pedido); // Adiciona no início

    // Mantém apenas os últimos 10 pedidos
    if (historicoPedidos.length > 10) {
      historicoPedidos.splice(10);
    }

    localStorage.setItem("historicoPedidos", JSON.stringify(historicoPedidos));
  }

  // Limpa dados do carrinho após confirmação
  limparCarrinho() {
    localStorage.removeItem("carrinho");
    localStorage.removeItem("dadosCheckout");
    // Mantém pedidoFinalizado para possível reutilização
  }

  // Sistema de notificações toast
  mostrarToast(mensagem, tipo = "sucesso", duracao = 3000) {
    const toast = document.getElementById("toastNotificacao");
    const icone = toast.querySelector(".toast-icone");
    const mensagemElemento = toast.querySelector(".toast-mensagem");

    const icones = {
      sucesso: "fas fa-check-circle",
      erro: "fas fa-exclamation-circle",
      aviso: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    };

    icone.className = `toast-icone ${icones[tipo] || icones.sucesso}`;
    mensagemElemento.textContent = mensagem;

    toast.className = `toast-notificacao ${tipo}`;
    toast.classList.add("ativo");

    setTimeout(() => {
      toast.classList.remove("ativo");
    }, duracao);
  }
}

// Inicializa quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
  window.gerenciadorConfirmacao = new GerenciadorConfirmacao();
});