// ===== ROOXYCE STORE - E-COMMERCE DE ELETRÔNICOS =====
// Desenvolvido por Gabriel (gabwvr)
// Este arquivo contém funções para gerenciar [FUNCIONALIDADE]
// Comentários didáticos para facilitar o entendimento


// ===== SISTEMA DE CHECKOUT =====

class GerenciadorCheckout {
  constructor() {
    this.dadosPedido = this.carregarDadosPedido();
    this.dadosFormulario = {};
    this.compraDireta = false;
    
    this.validacoes = {
      cep: /^\d{5}-\d{3}$/,
      numeroCartao: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
      cvv: /^\d{3,4}$/,
    };

    this.inicializar();
  }

  inicializar() {
    this.configurarProgressoCheckout();
    this.renderizarResumo();
    this.configurarEventListeners();
    this.configurarMascaras();
    this.configurarValidacaoTempo();
    
    console.log("✅ Sistema de checkout inicializado com sucesso!");
  }

  configurarProgressoCheckout() {
    // Verificar se é compra direta ou via carrinho
    this.compraDireta = this.dadosPedido && this.dadosPedido.compraDireta;
    
    const progressoContainer = document.querySelector('.conteudo-cabecalho');
    if (!progressoContainer) return;

    // Verificar se há produtos no pedido
    const temProdutos = this.dadosPedido && this.dadosPedido.produtos && this.dadosPedido.produtos.length > 0;
    
    // Se não há produtos, ocultar a barra de progresso
    if (!temProdutos) {
      const progressoCheckout = document.querySelector('.progresso-checkout');
      if (progressoCheckout) {
        progressoCheckout.style.display = 'none';
      }
      return;
    }

    if (this.compraDireta) {
      // Para compra direta: apenas Pagamento e Confirmação
      progressoContainer.innerHTML = `
        <div class="etapa-progresso atual">
          <div class="numero-etapa"><i class="fa-solid fa-credit-card"></i></div>
          <span>Pagamento</span>
        </div>
        <div class="linha-progresso"></div>
        <div class="etapa-progresso">
          <div class="numero-etapa"><i class="fa-solid fa-check"></i></div>
          <span>Confirmação</span>
        </div>
      `;
    } else {
      // Para carrinho: Carrinho, Pagamento e Confirmação
      progressoContainer.innerHTML = `
        <div class="etapa-progresso concluida">
          <div class="numero-etapa"><i class="fa-solid fa-cart-shopping"></i></div>
          <span>Carrinho</span>
        </div>
        <div class="linha-progresso"></div>
        <div class="etapa-progresso atual">
          <div class="numero-etapa"><i class="fa-solid fa-credit-card"></i></div>
          <span>Pagamento</span>
        </div>
        <div class="linha-progresso"></div>
        <div class="etapa-progresso">
          <div class="numero-etapa"><i class="fa-solid fa-check"></i></div>
          <span>Confirmação</span>
        </div>
      `;
    }
  }

  carregarDadosPedido() {
    const dadosSalvos = localStorage.getItem("dadosCheckout");
    if (dadosSalvos) {
      return JSON.parse(dadosSalvos);
    }

    // Se não houver dados, verificar carrinho
    const carrinho = JSON.parse(localStorage.getItem("rooxyce-carrinho")) || {};
    if (carrinho.carrinho && carrinho.carrinho.length > 0) {
      return this.criarDadosDoCarrinho(carrinho.carrinho);
    }

    // Dados de exemplo se não houver nada
    this.mostrarMensagem("Nenhum produto selecionado. Redirecionando...", "aviso");
    setTimeout(() => {
      window.location.href = "home.html";
    }, 2000);
    
    return this.criarDadosExemplo();
  }

  criarDadosDoCarrinho(carrinho) {
    const produtos = carrinho.map(item => ({
      id: item.id,
      nome: item.nome,
      marca: item.marca,
      descricao: item.descricao || `Produto ${item.marca}`,
      preco: item.preco,
      quantidade: item.quantidade,
      imagem: item.imagem || 'https://via.placeholder.com/60x60/7c3aed/ffffff?text=Produto'
    }));

    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const quantidadeTotal = carrinho.reduce((total, item) => total + item.quantidade, 0);
    const frete = subtotal >= 99 ? 0 : 15.99;

    return {
      produtos: produtos,
      subtotal: subtotal,
      desconto: 0,
      frete: frete,
      total: subtotal + frete,
      quantidadeTotal: quantidadeTotal,
      compraDireta: false
    };
  }

  criarDadosExemplo() {
    return {
      produtos: [
        {
          id: 1,
          nome: "Produto Exemplo",
          descricao: "Produto de exemplo",
          preco: 99.99,
          quantidade: 1,
          imagem: "https://via.placeholder.com/60x60/7c3aed/ffffff?text=Produto",
        }
      ],
      subtotal: 99.99,
      desconto: 0,
      frete: 15.99,
      total: 115.98,
      quantidadeTotal: 1,
      compraDireta: false
    };
  }

  renderizarResumo() {
    if (!this.dadosPedido) return;

    const containerProdutos = document.getElementById("produtos-resumo");
    if (containerProdutos) {
      containerProdutos.innerHTML = "";

      this.dadosPedido.produtos.forEach((item) => {
        const elementoProduto = this.criarElementoProdutoResumo(item);
        containerProdutos.appendChild(elementoProduto);
      });
    }

    // Atualizar totais
    const subtotalElement = document.getElementById("subtotal-resumo");
    if (subtotalElement) {
      subtotalElement.textContent = `R$ ${this.dadosPedido.subtotal.toFixed(2).replace(".", ",")}`;
    }

    const freteElement = document.getElementById("frete-resumo");
    if (freteElement) {
      if (this.dadosPedido.frete === 0) {
        freteElement.textContent = "GRÁTIS";
        freteElement.className = "frete-gratis";
      } else {
        freteElement.textContent = `R$ ${this.dadosPedido.frete.toFixed(2).replace(".", ",")}`;
        freteElement.className = "";
      }
    }

    if (this.dadosPedido.desconto > 0) {
      const linhaDesconto = document.getElementById("linha-desconto");
      const descontoElement = document.getElementById("desconto-resumo");
      if (linhaDesconto && descontoElement) {
        linhaDesconto.style.display = "flex";
        descontoElement.textContent = `- R$ ${this.dadosPedido.desconto.toFixed(2).replace(".", ",")}`;
      }
    }

    const totalElement = document.getElementById("total-final-resumo");
    if (totalElement) {
      totalElement.textContent = `R$ ${this.dadosPedido.total.toFixed(2).replace(".", ",")}`;
    }

    const quantidadeElement = document.getElementById("quantidade-itens");
    if (quantidadeElement) {
      quantidadeElement.textContent = this.dadosPedido.quantidadeTotal;
    }
  }

  criarElementoProdutoResumo(item) {
    const div = document.createElement("div");
    div.className = "produto-resumo-item";

    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" class="produto-resumo-imagem" onerror="this.src='https://via.placeholder.com/60x60/7c3aed/ffffff?text=Produto'">
      <div class="produto-resumo-info">
        <div class="produto-resumo-nome">${item.nome}</div>
        <div class="produto-resumo-quantidade">Qtd: ${item.quantidade}</div>
        ${item.marca ? `<div class="produto-resumo-marca">${item.marca}</div>` : ''}
      </div>
      <div class="produto-resumo-preco">R$ ${(item.preco * item.quantidade).toFixed(2).replace(".", ",")}</div>
    `;

    return div;
  }

  configurarEventListeners() {
    const formCheckout = document.getElementById("form-checkout");
    if (formCheckout) {
      formCheckout.addEventListener("submit", (e) => {
        this.processarFormulario(e);
      });
    }

    const buscarCep = document.getElementById("buscar-cep");
    if (buscarCep) {
      buscarCep.addEventListener("click", () => {
        this.buscarCEP();
      });
    }

    const voltarCarrinho = document.getElementById("voltar-carrinho");
    if (voltarCarrinho) {
      voltarCarrinho.addEventListener("click", () => {
        if (this.compraDireta) {
          window.location.href = "home.html";
        } else {
          window.location.href = "carrinho.html";
        }
      });

      // Atualizar texto do botão baseado no tipo de compra
      if (this.compraDireta) {
        voltarCarrinho.innerHTML = '<i class="fas fa-arrow-left"></i> Voltar à Home';
      }
    }

    document.querySelectorAll('input[name="formaPagamento"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        this.alterarFormaPagamento();
      });
    });

    document.querySelectorAll(".input-campo").forEach((input) => {
      input.addEventListener("blur", () => {
        this.validarCampo(input);
      });

      input.addEventListener("input", () => {
        this.limparErro(input);
      });
    });

    // Configurar expandir/recolher resumo em mobile
    const expandirResumo = document.getElementById("expandir-resumo");
    if (expandirResumo) {
      expandirResumo.addEventListener("click", () => {
        const produtosResumo = document.getElementById("produtos-resumo");
        if (produtosResumo) {
          produtosResumo.classList.toggle("expandido");
          const icone = expandirResumo.querySelector("i");
          if (icone) {
            icone.classList.toggle("fa-chevron-up");
            icone.classList.toggle("fa-chevron-down");
          }
        }
      });
    }
  }

  configurarMascaras() {
    // Máscara para CEP
    const cepInput = document.getElementById("cep");
    if (cepInput) {
      cepInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length <= 8) {
          valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
        }
        e.target.value = valor;
      });
    }

    // Máscara para número do cartão
    const numeroCartao = document.getElementById("numero-cartao");
    if (numeroCartao) {
      numeroCartao.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length <= 16) {
          valor = valor.replace(/(\d{4})(?=\d)/g, "$1 ");
        }
        e.target.value = valor;
      });
    }

    // Máscara para CVV
    const cvv = document.getElementById("cvv");
    if (cvv) {
      cvv.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
      });
    }
  }

  configurarValidacaoTempo() {
    document.querySelectorAll(".input-campo").forEach((input) => {
      input.addEventListener("input", () => {
        this.atualizarContadorCampos();
      });
    });
  }

  atualizarContadorCampos() {
    const camposObrigatorios = document.querySelectorAll(".input-campo[required]");
    const camposPreenchidos = Array.from(camposObrigatorios).filter(
      (campo) => campo.value.trim() !== ""
    ).length;

    const elemento = document.querySelector(".campos-preenchidos");
    if (elemento) {
      elemento.textContent = camposPreenchidos;
    }

    const totalCampos = document.querySelector(".total-campos");
    if (totalCampos) {
      totalCampos.textContent = camposObrigatorios.length;
    }
  }

  async buscarCEP() {
    const campoCep = document.getElementById("cep");
    if (!campoCep) return;

    const cep = campoCep.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      this.mostrarErroCampo(campoCep, "CEP deve ter 8 dígitos");
      return;
    }

    const botaoBuscar = document.getElementById("buscar-cep");
    if (!botaoBuscar) return;

    const textoOriginal = botaoBuscar.innerHTML;
    botaoBuscar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    botaoBuscar.disabled = true;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await response.json();

      if (dados.erro) {
        throw new Error("CEP não encontrado");
      }

      const endereco = document.getElementById("endereco");
      const bairro = document.getElementById("bairro");
      const cidade = document.getElementById("cidade");
      const uf = document.getElementById("uf");

      if (endereco) endereco.value = dados.logradouro || "";
      if (bairro) bairro.value = dados.bairro || "";
      if (cidade) cidade.value = dados.localidade || "";
      if (uf) uf.value = dados.uf || "";

      this.mostrarMensagem("CEP encontrado com sucesso!", "sucesso");
      this.atualizarContadorCampos();
    } catch (error) {
      this.mostrarErroCampo(campoCep, "CEP não encontrado");
    } finally {
      botaoBuscar.innerHTML = textoOriginal;
      botaoBuscar.disabled = false;
    }
  }

  alterarFormaPagamento() {
    const formaSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
    if (!formaSelecionada) return;

    const dadosCartao = document.getElementById("dados-cartao");
    const opcoesParcelas = document.getElementById("opcoes-parcelas");

    if (!dadosCartao) return;

    const valor = formaSelecionada.value;

    if (valor === "cartao-credito" || valor === "cartao-debito") {
      dadosCartao.style.display = "block";

      if (opcoesParcelas) {
        if (valor === "cartao-credito") {
          opcoesParcelas.style.display = "block";
        } else {
          opcoesParcelas.style.display = "none";
        }
      }
    } else {
      dadosCartao.style.display = "none";
    }

    // Aplicar desconto para PIX e Boleto
    this.aplicarDescontoPagamento(valor);
  }

  aplicarDescontoPagamento(formaPagamento) {
    if (!this.dadosPedido) return;

    let desconto = 0;
    let novoTotal = this.dadosPedido.subtotal + (this.dadosPedido.frete || 0);

    if (formaPagamento === "pix") {
      desconto = this.dadosPedido.subtotal * 0.05; // 5% de desconto
    } else if (formaPagamento === "boleto") {
      desconto = this.dadosPedido.subtotal * 0.03; // 3% de desconto
    }

    this.dadosPedido.desconto = desconto;
    this.dadosPedido.total = novoTotal - desconto;

    this.renderizarResumo();
  }

  validarCampo(input) {
    const nome = input.name;
    const valor = input.value.trim();

    if (input.required && !valor) {
      this.mostrarErroCampo(input, "Este campo é obrigatório");
      return false;
    }

    if (valor && this.validacoes[nome] && !this.validacoes[nome].test(valor)) {
      this.mostrarErroCampo(input, this.obterMensagemErro(nome));
      return false;
    }

    this.marcarCampoValido(input);
    return true;
  }

  obterMensagemErro(campo) {
    const mensagens = {
      cep: "CEP inválido. Use o formato 00000-000",
      numeroCartao: "Número do cartão inválido",
      cvv: "CVV deve ter 3 ou 4 dígitos",
    };

    return mensagens[campo] || "Campo inválido";
  }

  mostrarErroCampo(input, mensagem) {
    const campo = input.closest(".campo-formulario");
    if (!campo) return;

    const mensagemErro = campo.querySelector(".mensagem-erro");

    campo.classList.add("campo-invalido");
    campo.classList.remove("campo-valido");
    input.classList.add("erro");

    if (mensagemErro) {
      mensagemErro.textContent = mensagem;
      mensagemErro.classList.add("ativa");
    }
  }

  marcarCampoValido(input) {
    const campo = input.closest(".campo-formulario");
    if (!campo) return;

    const mensagemErro = campo.querySelector(".mensagem-erro");

    campo.classList.add("campo-valido");
    campo.classList.remove("campo-invalido");
    input.classList.remove("erro");

    if (mensagemErro) {
      mensagemErro.classList.remove("ativa");
    }
  }

  limparErro(input) {
    const campo = input.closest(".campo-formulario");
    if (!campo) return;

    const mensagemErro = campo.querySelector(".mensagem-erro");

    campo.classList.remove("campo-invalido");
    input.classList.remove("erro");
    
    if (mensagemErro) {
      mensagemErro.classList.remove("ativa");
    }
  }

  processarFormulario(evento) {
    evento.preventDefault();

    const campos = document.querySelectorAll(".input-campo");
    let formularioValido = true;

    campos.forEach((campo) => {
      if (!this.validarCampo(campo)) {
        formularioValido = false;
      }
    });

    const formaPagamento = document.querySelector('input[name="formaPagamento"]:checked');
    if (!formaPagamento) {
      this.mostrarMensagem("Selecione uma forma de pagamento", "erro");
      return;
    }

    const valorFormaPagamento = formaPagamento.value;

    if (valorFormaPagamento === "cartao-credito" || valorFormaPagamento === "cartao-debito") {
      const camposCartao = ["numero-cartao", "nome-cartao", "cvv"];

      camposCartao.forEach((id) => {
        const campo = document.getElementById(id);
        if (campo && !this.validarCampo(campo)) {
          formularioValido = false;
        }
      });
    }

    if (!formularioValido) {
      this.mostrarMensagem("Por favor, corrija os erros no formulário", "erro");
      return;
    }

    this.coletarDadosFormulario();
    this.finalizarPedido();
  }

  coletarDadosFormulario() {
    const form = document.getElementById("form-checkout");
    if (!form) return;

    const formData = new FormData(form);

    this.dadosFormulario = {};
    for (const [key, value] of formData.entries()) {
      this.dadosFormulario[key] = value;
    }
  }

  async finalizarPedido() {
    const botaoFinalizar = document.getElementById("finalizar-pedido");
    if (!botaoFinalizar) return;
    
    botaoFinalizar.classList.add("loading");
    botaoFinalizar.disabled = true;

    this.mostrarModalLoading();

    try {
      await this.simularProcessamentoPagamento();

      const numeroPedido = this.gerarNumeroPedido();

      const pedidoFinalizado = {
        numero: numeroPedido,
        dados: this.dadosFormulario,
        itens: this.dadosPedido.produtos,
        totais: {
          subtotal: this.dadosPedido.subtotal,
          frete: this.dadosPedido.frete || 0,
          desconto: this.dadosPedido.desconto || 0,
          total: this.dadosPedido.total,
        },
        status: "confirmado",
        dataHora: new Date().toISOString(),
        compraDireta: this.compraDireta
      };

      // Salvar no histórico de pedidos
      this.salvarPedidoHistorico(pedidoFinalizado);

      // Limpar carrinho e dados de checkout
      if (!this.compraDireta) {
        localStorage.removeItem("rooxyce-carrinho");
      }
      localStorage.removeItem("dadosCheckout");

      // Mostrar tela de confirmação
      this.mostrarTelaConfirmacao(pedidoFinalizado);

    } catch (error) {
      this.mostrarMensagem("Erro ao processar o pedido. Tente novamente.", "erro");
    } finally {
      botaoFinalizar.classList.remove("loading");
      botaoFinalizar.disabled = false;
      this.esconderModalLoading();
    }
  }

  salvarPedidoHistorico(pedido) {
    let historico = JSON.parse(localStorage.getItem('historicoPedidos') || '[]');
    historico.unshift(pedido); // Adicionar no início
    
    // Manter apenas os últimos 50 pedidos
    if (historico.length > 50) {
      historico = historico.slice(0, 50);
    }
    
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));
  }

  mostrarTelaConfirmacao(pedido) {
    // Atualizar progresso
    const etapas = document.querySelectorAll('.etapa-progresso');
    etapas.forEach(etapa => etapa.classList.remove('atual'));
    etapas.forEach(etapa => etapa.classList.add('concluida'));
    if (etapas[etapas.length - 1]) {
      etapas[etapas.length - 1].classList.add('atual');
    }

    // Processar XP da compra
    if (window.sistemaXP) {
      const resultadoXP = window.sistemaXP.ganharXP('compra_finalizada', pedido.totais.total, {
        numeroPedido: pedido.numero,
        itens: pedido.itens.length,
        produtos: pedido.itens.map(item => item.nome)
      });
      
      console.log('🎮 XP processado para compra:', resultadoXP);
    }

    // Criar tela de confirmação
    const container = document.querySelector('.layout-checkout');
    if (container) {
      container.innerHTML = `
        <div class="confirmacao-pedido">
          <div class="icone-sucesso">
            <i class="fas fa-check-circle"></i>
          </div>
          
          <h2>Pedido Realizado com Sucesso!</h2>
          <p class="numero-pedido">Número do pedido: <strong>#${pedido.numero}</strong></p>
          
          <div class="detalhes-confirmacao">
            <div class="resumo-pedido-confirmacao">
              <h3>Resumo do Pedido</h3>
              <div class="produtos-confirmacao">
                ${pedido.itens.map(produto => `
                  <div class="produto-confirmacao">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                    <div class="info-produto-confirmacao">
                      <h4>${produto.nome}</h4>
                      <p>Quantidade: ${produto.quantidade}</p>
                      <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="total-confirmacao">
                <p><strong>Total: R$ ${pedido.totais.total.toFixed(2).replace('.', ',')}</strong></p>
              </div>
            </div>
            
            <div class="proximos-passos">
              <h3>Próximos Passos</h3>
              <ul>
                <li><i class="fas fa-envelope"></i> Você receberá um e-mail de confirmação</li>
                <li><i class="fas fa-truck"></i> Seu pedido será processado em até 1 dia útil</li>
                <li><i class="fas fa-user"></i> Acompanhe o status no seu painel</li>
                <li><i class="fas fa-star"></i> XP ganho adicionado ao seu perfil</li>
              </ul>
            </div>
          </div>
          
          <div class="acoes-confirmacao">
            <button class="botao-primario" onclick="window.location.href='painelusuario.html'">
              <i class="fas fa-user"></i>
              Ver Meus Pedidos
            </button>
            <button class="botao-secundario" onclick="window.location.href='home.html'">
              <i class="fas fa-home"></i>
              Continuar Comprando
            </button>
          </div>
        </div>
      `;
    }

    // Mostrar mensagem de sucesso
    this.mostrarMensagem("Pedido realizado com sucesso!", "sucesso");

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  simularProcessamentoPagamento() {
    return new Promise((resolve) => {
      const tempo = Math.random() * 2000 + 2000;
      setTimeout(resolve, tempo);
    });
  }

  gerarNumeroPedido() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`.slice(-8);
  }

  mostrarModalLoading() {
    const modal = document.getElementById("modal-loading");
    if (modal) {
      modal.style.display = "flex";
      setTimeout(() => {
        modal.classList.add("ativo");
      }, 10);
    }
  }

  esconderModalLoading() {
    const modal = document.getElementById("modal-loading");
    if (modal) {
      modal.classList.remove("ativo");
      setTimeout(() => {
        modal.style.display = "none";
      }, 300);
    }
  }

  mostrarMensagem(texto, tipo = "info") {
    const mensagemAnterior = document.querySelector(".mensagem-sistema");
    if (mensagemAnterior) {
      mensagemAnterior.remove();
    }

    const mensagem = document.createElement("div");
    mensagem.className = `mensagem-sistema mensagem-${tipo}`;
    mensagem.textContent = texto;

    mensagem.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    switch (tipo) {
      case "sucesso":
        mensagem.style.backgroundColor = "#10b981";
        break;
      case "erro":
        mensagem.style.backgroundColor = "#ef4444";
        break;
      case "aviso":
        mensagem.style.backgroundColor = "#f59e0b";
        break;
      default:
        mensagem.style.backgroundColor = "#7c3aed";
    }

    document.body.appendChild(mensagem);

    setTimeout(() => {
      if (mensagem.parentNode) {
        mensagem.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (mensagem.parentNode) {
            mensagem.remove();
          }
        }, 300);
      }
    }, 4000);
  }
}

// Estilos para animações
const estilosAdicionais = document.createElement("style");
estilosAdicionais.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .etapa-progresso.concluida {
    color: #10b981;
  }

  .etapa-progresso.concluida .numero-etapa {
    background: #10b981;
    color: white;
  }

  .etapa-progresso.atual {
    color: #7c3aed;
  }

  .etapa-progresso.atual .numero-etapa {
    background: #7c3aed;
    color: white;
  }

  .produto-resumo-marca {
    font-size: 0.8rem;
    color: #666;
    margin-top: 2px;
  }

  #produtos-resumo.expandido {
    max-height: none !important;
  }
`;
document.head.appendChild(estilosAdicionais);

// Inicializar sistema
document.addEventListener("DOMContentLoaded", () => {
  window.gerenciadorCheckout = new GerenciadorCheckout();
});
