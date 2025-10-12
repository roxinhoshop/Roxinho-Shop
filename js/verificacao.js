// Este arquivo contém funções para gerenciar [FUNCIONALIDADE]
// Comentários didáticos para facilitar o entendimento



class SistemaVerificaca  constructor() {
    this.emailUsuario = \'\';
    this.tentativas = 0;
    this.maxTentativas = 3;
    this.tempoReenvio = 60; // 60 segundos
    this.timerReenvioAtivo = false;
    
    this.inicializar();
  }

  inicializar() {
    this.configurarEventListeners();
    this.configurarCamposCodigo();
    this.carregarEmailUsuario();
    this.solicitarCodigoInicial();
    
    console.log(\'🔐 Sistema de verificação inicializado\');
  }

  // ===== CONFIGURAÇÕES INICIAIS =====
  configurarEventListeners() {
    const formulario = document.getElementById('formularioVerificacao');
    const botaoReenviar = document.getElementById('botaoReenviar');
    
    if (formulario) {
      formulario.addEventListener('submit', (e) => this.processarVerificacao(e));
    }
    
    if (botaoReenviar) {
      botaoReenviar.addEventListener('click', () => this.reenviarCodigo());
    }
  }

  configurarCamposCodigo() {
    const campos = document.querySelectorAll('.codigo-input');
    
    campos.forEach((campo, index) => {
      // Navegação entre campos
      campo.addEventListener('input', (e) => this.handleInputCodigo(e, index));
      campo.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
      campo.addEventListener('paste', (e) => this.handlePaste(e));
      
      // Validação em tempo real
      campo.addEventListener('input', () => this.validarCampo(campo));
    });
  }

  carregarEmailUsuario() {
    // Carregar email do localStorage ou URL params
    const urlParams = new URLSearchParams(window.location.search);
    this.emailUsuario = urlParams.get(\'email\') || localStorage.getItem(\'emailCadastro\') || \'usuario@exemplo.com\';
    
    const emailElement = document.getElementById(\'email-usuario\');
    if (emailElement) {
      emailElement.textContent = this.emailUsuario;
    }// ===== GERAÇÃO E VALIDAÇÃO DE CÓDIGO =====
  async solicitarCodigoInicial() {
    try {
      const response = await fetch("/api/auth/request-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: this.emailUsuario })
      });

      const result = await response.json();

      if (response.ok) {
        this.mostrarNotificacao("Código de verificação enviado para o seu e-mail!", "sucesso");
      } else {
        this.mostrarNotificacao(`Erro ao solicitar código: ${result.message}`, "erro");
        console.error("Erro ao solicitar código de verificação:", result.message);
      }
    } catch (error) {
      this.mostrarNotificacao("Erro de conexão ao solicitar código.", "erro");
      console.error("Erro de rede ao solicitar código de verificação:", error);
    }
  }

  // ===== MANIPULAÇÃO DOS CAMPOS =====
  handleInputCodigo(evento, index) {
    const campo = evento.target;
    const valor = campo.value;
    
    // Permitir apenas números
    if (!/^\d$/.test(valor) && valor !== '') {
      campo.value = '';
      return;
    }
    
    // Mover para próximo campo
    if (valor && index < 5) {
      const proximoCampo = document.querySelectorAll('.codigo-input')[index + 1];
      if (proximoCampo) {
        proximoCampo.focus();
      }
    }
    
    // Verificar se todos os campos estão preenchidos
    this.verificarCamposCompletos();
  }

  handleKeyDown(evento, index) {
    const campo = evento.target;
    
    // Backspace - mover para campo anterior
    if (evento.key === 'Backspace' && !campo.value && index > 0) {
      const campoAnterior = document.querySelectorAll('.codigo-input')[index - 1];
      if (campoAnterior) {
        campoAnterior.focus();
      }
    }
    
    // Enter - submeter formulário se todos os campos estiverem preenchidos
    if (evento.key === 'Enter') {
      evento.preventDefault();
      if (this.todosCamposPreenchidos()) {
        this.processarVerificacao(evento);
      }
    }
  }

  handlePaste(evento) {
    evento.preventDefault();
    const dadosColados = evento.clipboardData.getData('text').replace(/\D/g, '');
    
    if (dadosColados.length === 6) {
      const campos = document.querySelectorAll('.codigo-input');
      dadosColados.split('').forEach((digito, index) => {
        if (campos[index]) {
          campos[index].value = digito;
          this.validarCampo(campos[index]);
        }
      });
      
      // Focar no último campo
      campos[5].focus();
      this.verificarCamposCompletos();
    }
  }

  validarCampo(campo) {
    if (campo.value && /^\d$/.test(campo.value)) {
      campo.classList.add('preenchido');
      campo.classList.remove('erro');
    } else {
      campo.classList.remove('preenchido');
    }
  }

  verificarCamposCompletos() {
    if (this.todosCamposPreenchidos()) {
      const botao = document.getElementById('botaoVerificar');
      if (botao) {
        botao.disabled = false;
      }
    }
  }

  todosCamposPreenchidos() {
    const campos = document.querySelectorAll('.codigo-input');
    return Array.from(campos).every(campo => campo.value.length === 1);
  }

  obterCodigoDigitado() {
    const campos = document.querySelectorAll('.codigo-input');
    return Array.from(campos).map(campo => campo.value).join('');
  }

  // ===== PROCESSAMENTO DA VERIFICAÇÃO =====
  async processarVerificacao(evento) {
    evento.preventDefault();
    
    if (!this.todosCamposPreenchidos()) {
      this.mostrarErro('Por favor, preencha todos os campos');
      return;
    }
    
    const codigoDigitado = this.obterCodigoDigitado();
    
    // Mostrar loading
    this.mostrarLoading(true);
    
    // Simular verificação no servidor
    await this.simularVerificacaoServidor(codigoDigitado);
  }

  async simularVerificacaoServidor(codigo) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (codigo === this.codigoCorreto) {
          this.verificacaoSucesso();
        } else {
          this.verificacaoFalhou();
        }
        resolve();
      }, 1500);
    });
  }

  verificacaoSucesso() {
    this.mostrarLoading(false);
    
    // Marcar campos como sucesso
    const campos = document.querySelectorAll('.codigo-input');
    campos.forEach(campo => {
      campo.classList.add('sucesso');
      campo.classList.remove('erro');
    });
    
    // Marcar card como sucesso
    const card = document.querySelector('.verificacao-card');
    if (card) {
      card.classList.add('sucesso');
    }
    
    this.mostrarNotificacao('E-mail verificado com sucesso!', 'sucesso');
    
    // Redirecionar após sucesso
    setTimeout(() => {
      this.redirecionarAposVerificacao();
    }, 2000);
  }

  verificacaoFalhou() {
    this.mostrarLoading(false);
    this.tentativas++;
    
    // Marcar campos como erro
    const campos = document.querySelectorAll('.codigo-input');
    campos.forEach(campo => {
      campo.classList.add('erro');
      campo.classList.remove('preenchido', 'sucesso');
    });
    
    // Mostrar mensagem de erro
    if (this.tentativas >= this.maxTentativas) {
      this.mostrarErro('Muitas tentativas incorretas. Solicite um novo código.');
      this.bloquearFormulario();
    } else {
      const tentativasRestantes = this.maxTentativas - this.tentativas;
      this.mostrarErro(`Código incorreto. ${tentativasRestantes} tentativa(s) restante(s).`);
    }
    
    // Limpar campos após erro
    setTimeout(() => {
      this.limparCampos();
    }, 1000);
  }

  redirecionarAposVerificacao() {
    // Salvar status de verificação
    localStorage.setItem('emailVerificado', 'true');
    localStorage.removeItem('dadosVerificacao');
    
    // Redirecionar para login ou painel
    const destino = new URLSearchParams(window.location.search).get('redirect') || 'login.html';
    window.location.href = destino;
  }

  // ===== REENVIO DE CÓDIGO =====
  async reenviarCodigo() {
    if (this.timerReenvioAtivo) return;
    
    // Gerar novo código
    this.codigoCorreto = this.gerarCodigoVerificacao();
    this.tentativas = 0;
    
    console.log('📧 Novo código de verificação (para teste):', this.codigoCorreto);
    
    // Simular reenvio
    this.mostrarNotificacao('Novo código enviado!', 'sucesso');
    
    // Iniciar timer de reenvio
    this.iniciarTimerReenvio();
    
    // Limpar campos e resetar estados
    this.limparCampos();
    this.esconderErro();
  }

  iniciarTimerReenvio() {
    this.timerReenvioAtivo = true;
    let tempoRestante = this.tempoReenvio;
    
    const botaoReenviar = document.getElementById('botaoReenviar');
    const timerElement = document.getElementById('timerReenvio');
    const tempoElement = document.getElementById('tempoRestante');
    
    if (botaoReenviar) botaoReenviar.disabled = true;
    if (timerElement) timerElement.style.display = 'block';
    
    const interval = setInterval(() => {
      tempoRestante--;
      
      if (tempoElement) {
        tempoElement.textContent = tempoRestante;
      }
      
      if (tempoRestante <= 0) {
        clearInterval(interval);
        this.timerReenvioAtivo = false;
        
        if (botaoReenviar) botaoReenviar.disabled = false;
        if (timerElement) timerElement.style.display = 'none';
      }
    }, 1000);
  }

  // ===== UTILITÁRIOS DE UI =====
  mostrarLoading(mostrar) {
    const botao = document.getElementById('botaoVerificar');
    if (!botao) return;
    
    if (mostrar) {
      botao.classList.add('loading');
      botao.disabled = true;
    } else {
      botao.classList.remove('loading');
      botao.disabled = false;
    }
  }

  mostrarErro(mensagem) {
    const elementoErro = document.getElementById('mensagemErro');
    if (elementoErro) {
      elementoErro.querySelector('span').textContent = mensagem;
      elementoErro.style.display = 'flex';
    }
  }

  esconderErro() {
    const elementoErro = document.getElementById('mensagemErro');
    if (elementoErro) {
      elementoErro.style.display = 'none';
    }
  }

  limparCampos() {
    const campos = document.querySelectorAll('.codigo-input');
    campos.forEach(campo => {
      campo.value = '';
      campo.classList.remove('preenchido', 'erro', 'sucesso');
    });
    
    // Focar no primeiro campo
    if (campos[0]) {
      campos[0].focus();
    }
  }

  bloquearFormulario() {
    const campos = document.querySelectorAll('.codigo-input');
    const botao = document.getElementById('botaoVerificar');
    
    campos.forEach(campo => campo.disabled = true);
    if (botao) botao.disabled = true;
  }

  mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificação anterior
    const notificacaoAnterior = document.querySelector('.notificacao-sistema');
    if (notificacaoAnterior) {
      notificacaoAnterior.remove();
    }

    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-sistema notificacao-${tipo}`;
    notificacao.textContent = mensagem;

    notificacao.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    switch (tipo) {
      case 'sucesso':
        notificacao.style.backgroundColor = '#10b981';
        break;
      case 'erro':
        notificacao.style.backgroundColor = '#ef4444';
        break;
      default:
        notificacao.style.backgroundColor = '#7c3aed';
    }

    document.body.appendChild(notificacao);

    setTimeout(() => {
      if (notificacao.parentNode) {
        notificacao.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (notificacao.parentNode) {
            notificacao.remove();
          }
        }, 300);
      }
    }, 4000);
  }
}

function voltarParaCadastro() {
  if (confirm('Tem certeza que deseja alterar o e-mail? Você precisará fazer o cadastro novamente.')) {
    window.location.href = 'cadastro.html';
  }
}

const estilosAdicionais = document.createElement('style');
estilosAdicionais.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(estilosAdicionais);

document.addEventListener('DOMContentLoaded', () => {
  window.sistemaVerificacao = new SistemaVerificacao();
});

