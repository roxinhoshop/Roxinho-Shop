// ===== ROOXYCE STORE - E-COMMERCE DE ELETRÔNICOS =====
// Desenvolvido por Gabriel (gabwvr)
// Este arquivo contém funções para gerenciar [FUNCIONALIDADE]
// Comentários didáticos para facilitar o entendimento


// ===== SISTEMA DE XP ROOXYCE STORE =====

/**
 * Sistema de experiência (XP) para usuários da ROOXYCE Store
 * Permite ganhar XP através de compras e outras ações
 */

class SistemaXP {
  constructor() {
    this.niveis = this.definirNiveis();
    this.acoes = this.definirAcoes();
    this.dadosUsuario = this.carregarDadosUsuario();
    
    this.inicializar();
  }

  // ===== INICIALIZAÇÃO =====
  inicializar() {
    console.log('🎮 Sistema de XP inicializado');
    this.verificarLevelUp();
    this.atualizarInterface();
  }

  // ===== DEFINIÇÃO DE NÍVEIS =====
  definirNiveis() {
    return [
      { nivel: 1, xpNecessario: 0, titulo: 'Novato', cor: '#6b7280', beneficios: ['Bem-vindo à ROOXYCE!'] },
      { nivel: 2, xpNecessario: 100, titulo: 'Comprador', cor: '#10b981', beneficios: ['Desconto de 2% em compras'] },
      { nivel: 3, xpNecessario: 300, titulo: 'Cliente Fiel', cor: '#3b82f6', beneficios: ['Desconto de 5%', 'Frete grátis acima de R$ 100'] },
      { nivel: 4, xpNecessario: 600, titulo: 'Entusiasta', cor: '#8b5cf6', beneficios: ['Desconto de 8%', 'Frete grátis acima de R$ 50'] },
      { nivel: 5, xpNecessario: 1000, titulo: 'Expert', cor: '#f59e0b', beneficios: ['Desconto de 12%', 'Frete grátis sempre', 'Acesso antecipado'] },
      { nivel: 6, xpNecessario: 1500, titulo: 'Master', cor: '#ef4444', beneficios: ['Desconto de 15%', 'Suporte prioritário', 'Produtos exclusivos'] },
      { nivel: 7, xpNecessario: 2200, titulo: 'Legend', cor: '#7c3aed', beneficios: ['Desconto de 20%', 'Cashback 5%', 'Eventos VIP'] },
      { nivel: 8, xpNecessario: 3000, titulo: 'Champion', cor: '#dc2626', beneficios: ['Desconto de 25%', 'Cashback 8%', 'Consultoria gratuita'] },
      { nivel: 9, xpNecessario: 4000, titulo: 'Elite', cor: '#7c2d12', beneficios: ['Desconto de 30%', 'Cashback 10%', 'Produtos personalizados'] },
      { nivel: 10, xpNecessario: 5500, titulo: 'ROOXYCE VIP', cor: '#a855f7', beneficios: ['Desconto máximo 35%', 'Cashback 15%', 'Acesso total VIP'] }
    ];
  }

  // ===== DEFINIÇÃO DE AÇÕES QUE GERAM XP =====
  definirAcoes() {
    return {
      // Compras
      'compra_finalizada': { xp: 50, descricao: 'Compra finalizada' },
      'primeira_compra': { xp: 100, descricao: 'Primeira compra realizada' },
      'compra_acima_100': { xp: 25, descricao: 'Compra acima de R$ 100' },
      'compra_acima_500': { xp: 75, descricao: 'Compra acima de R$ 500' },
      'compra_acima_1000': { xp: 150, descricao: 'Compra acima de R$ 1000' },
      
      // Engajamento
      'cadastro_completo': { xp: 50, descricao: 'Cadastro completo realizado' },
      'email_verificado': { xp: 25, descricao: 'E-mail verificado' },
      'avaliacao_produto': { xp: 15, descricao: 'Produto avaliado' },
      'compartilhamento': { xp: 10, descricao: 'Produto compartilhado' },
      
      // Fidelidade
      'compra_mensal': { xp: 30, descricao: 'Compra mensal consecutiva' },
      'indicacao_amigo': { xp: 100, descricao: 'Amigo indicado fez primeira compra' },
      'aniversario_conta': { xp: 200, descricao: 'Aniversário da conta' }
    };
  }

  // ===== GERENCIAMENTO DE DADOS =====
  carregarDadosUsuario() {
    const dados = localStorage.getItem('dadosXP');
    if (dados) {
      return JSON.parse(dados);
    }
    
    // Dados iniciais do usuário
    return {
      xpTotal: 0,
      nivelAtual: 1,
      xpProximoNivel: 100,
      historicoXP: [],
      conquistas: [],
      estatisticas: {
        totalCompras: 0,
        valorTotalGasto: 0,
        primeiraCompra: null,
        ultimaCompra: null,
        diasConsecutivos: 0
      }
    };
  }

  salvarDadosUsuario() {
    localStorage.setItem('dadosXP', JSON.stringify(this.dadosUsuario));
  }

  // ===== GANHO DE XP =====
  ganharXP(acao, valorCompra = 0, detalhesExtras = {}) {
    if (!this.acoes[acao]) {
      console.warn(`Ação "${acao}" não encontrada no sistema de XP`);
      return false;
    }

    let xpGanho = this.acoes[acao].xp;
    let descricao = this.acoes[acao].descricao;

    // Cálculos especiais baseados no valor da compra
    if (acao === 'compra_finalizada' && valorCompra > 0) {
      // XP adicional baseado no valor (1 XP para cada R$ 10)
      const xpPorValor = Math.floor(valorCompra / 10);
      xpGanho += xpPorValor;
      
      // Verificar bônus por valor
      if (valorCompra >= 1000) {
        this.ganharXP('compra_acima_1000');
      } else if (valorCompra >= 500) {
        this.ganharXP('compra_acima_500');
      } else if (valorCompra >= 100) {
        this.ganharXP('compra_acima_100');
      }
      
      // Verificar se é primeira compra
      if (this.dadosUsuario.estatisticas.totalCompras === 0) {
        this.ganharXP('primeira_compra');
      }
      
      // Atualizar estatísticas
      this.dadosUsuario.estatisticas.totalCompras++;
      this.dadosUsuario.estatisticas.valorTotalGasto += valorCompra;
      this.dadosUsuario.estatisticas.ultimaCompra = new Date().toISOString();
      
      if (!this.dadosUsuario.estatisticas.primeiraCompra) {
        this.dadosUsuario.estatisticas.primeiraCompra = new Date().toISOString();
      }
    }

    // Aplicar XP
    this.dadosUsuario.xpTotal += xpGanho;
    
    // Registrar no histórico
    const registro = {
      acao: acao,
      xpGanho: xpGanho,
      descricao: descricao,
      timestamp: new Date().toISOString(),
      valorCompra: valorCompra,
      detalhes: detalhesExtras
    };
    
    this.dadosUsuario.historicoXP.unshift(registro);
    
    // Manter apenas os últimos 100 registros
    if (this.dadosUsuario.historicoXP.length > 100) {
      this.dadosUsuario.historicoXP = this.dadosUsuario.historicoXP.slice(0, 100);
    }

    // Verificar level up
    this.verificarLevelUp();
    
    // Salvar dados
    this.salvarDadosUsuario();
    
    // Mostrar notificação
    this.mostrarNotificacaoXP(xpGanho, descricao);
    
    console.log(`🎮 XP ganho: +${xpGanho} (${descricao})`);
    
    return {
      xpGanho: xpGanho,
      xpTotal: this.dadosUsuario.xpTotal,
      nivelAtual: this.dadosUsuario.nivelAtual,
      levelUp: false // será atualizado se houver level up
    };
  }

  // ===== SISTEMA DE NÍVEIS =====
  verificarLevelUp() {
    const nivelAnterior = this.dadosUsuario.nivelAtual;
    let novoNivel = nivelAnterior;
    
    // Encontrar o nível correto baseado no XP total
    for (let i = this.niveis.length - 1; i >= 0; i--) {
      if (this.dadosUsuario.xpTotal >= this.niveis[i].xpNecessario) {
        novoNivel = this.niveis[i].nivel;
        break;
      }
    }
    
    // Verificar se houve level up
    if (novoNivel > nivelAnterior) {
      this.dadosUsuario.nivelAtual = novoNivel;
      
      // Adicionar conquista
      const conquista = {
        tipo: 'level_up',
        nivel: novoNivel,
        titulo: this.niveis[novoNivel - 1].titulo,
        timestamp: new Date().toISOString()
      };
      
      this.dadosUsuario.conquistas.unshift(conquista);
      
      // Mostrar celebração de level up
      this.celebrarLevelUp(nivelAnterior, novoNivel);
      
      console.log(`🎉 LEVEL UP! ${nivelAnterior} → ${novoNivel}`);
    }
    
    // Calcular XP para próximo nível
    this.calcularXPProximoNivel();
  }

  calcularXPProximoNivel() {
    const nivelAtual = this.dadosUsuario.nivelAtual;
    
    if (nivelAtual >= this.niveis.length) {
      // Nível máximo atingido
      this.dadosUsuario.xpProximoNivel = 0;
      return;
    }
    
    const xpNecessarioProximoNivel = this.niveis[nivelAtual].xpNecessario;
    this.dadosUsuario.xpProximoNivel = xpNecessarioProximoNivel - this.dadosUsuario.xpTotal;
  }

  // ===== INTERFACE E NOTIFICAÇÕES =====
  mostrarNotificacaoXP(xpGanho, descricao) {
    // Criar notificação de XP
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao-xp';
    notificacao.innerHTML = `
      <div class="icone-xp">
        <i class="fas fa-star"></i>
      </div>
      <div class="conteudo-xp">
        <span class="xp-ganho">+${xpGanho} XP</span>
        <span class="descricao-xp">${descricao}</span>
      </div>
    `;
    
    // Estilos inline
    notificacao.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #7c3aed, #a78bfa);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
      z-index: 1001;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: slideInXP 0.5s ease-out;
      min-width: 200px;
    `;
    
    // Adicionar estilos para os elementos internos
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInXP {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .notificacao-xp .icone-xp {
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .notificacao-xp .conteudo-xp {
        display: flex;
        flex-direction: column;
      }
      
      .notificacao-xp .xp-ganho {
        font-weight: 700;
        font-size: 1.1rem;
      }
      
      .notificacao-xp .descricao-xp {
        font-size: 0.85rem;
        opacity: 0.9;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notificacao);
    
    // Remover após 4 segundos
    setTimeout(() => {
      notificacao.style.animation = 'slideInXP 0.3s ease-in reverse';
      setTimeout(() => {
        if (notificacao.parentNode) {
          notificacao.remove();
        }
      }, 300);
    }, 4000);
  }

  celebrarLevelUp(nivelAnterior, novoNivel) {
    const dadosNivel = this.niveis[novoNivel - 1];
    
    // Criar modal de celebração
    const modal = document.createElement('div');
    modal.className = 'modal-level-up';
    modal.innerHTML = `
      <div class="modal-overlay-xp">
        <div class="modal-conteudo-xp">
          <div class="celebracao-header">
            <div class="icone-celebracao">
              <i class="fas fa-trophy"></i>
            </div>
            <h2>LEVEL UP!</h2>
            <div class="nivel-info">
              <span class="nivel-anterior">${nivelAnterior}</span>
              <i class="fas fa-arrow-right"></i>
              <span class="nivel-novo" style="color: ${dadosNivel.cor}">${novoNivel}</span>
            </div>
          </div>
          
          <div class="novo-titulo">
            <h3 style="color: ${dadosNivel.cor}">${dadosNivel.titulo}</h3>
          </div>
          
          <div class="beneficios-nivel">
            <h4>Novos Benefícios:</h4>
            <ul>
              ${dadosNivel.beneficios.map(beneficio => `<li>${beneficio}</li>`).join('')}
            </ul>
          </div>
          
          <button class="botao-continuar" onclick="this.closest('.modal-level-up').remove()">
            Continuar
          </button>
        </div>
      </div>
    `;
    
    // Estilos do modal
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Adicionar estilos específicos
    const styleModal = document.createElement('style');
    styleModal.textContent = `
      .modal-overlay-xp {
        background: rgba(0,0,0,0.8);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
      }
      
      .modal-conteudo-xp {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        text-align: center;
        max-width: 400px;
        margin: 0 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: modalBounce 0.6s ease-out;
      }
      
      @keyframes modalBounce {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .celebracao-header .icone-celebracao {
        font-size: 4rem;
        color: #f59e0b;
        margin-bottom: 1rem;
        animation: bounce 1s infinite;
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      .celebracao-header h2 {
        font-size: 2rem;
        font-weight: 800;
        color: #7c3aed;
        margin-bottom: 1rem;
      }
      
      .nivel-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }
      
      .nivel-anterior {
        color: #9ca3af;
      }
      
      .nivel-novo {
        font-size: 1.8rem;
      }
      
      .novo-titulo h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }
      
      .beneficios-nivel h4 {
        color: #374151;
        margin-bottom: 0.75rem;
      }
      
      .beneficios-nivel ul {
        list-style: none;
        padding: 0;
        text-align: left;
        margin-bottom: 2rem;
      }
      
      .beneficios-nivel li {
        padding: 0.5rem 0;
        color: #10b981;
        font-weight: 500;
      }
      
      .beneficios-nivel li::before {
        content: "✓ ";
        color: #10b981;
        font-weight: 700;
        margin-right: 0.5rem;
      }
      
      .botao-continuar {
        background: linear-gradient(135deg, #7c3aed, #a78bfa);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .botao-continuar:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(124, 58, 237, 0.3);
      }
    `;
    
    document.head.appendChild(styleModal);
    document.body.appendChild(modal);
  }

  atualizarInterface() {
    // Atualizar elementos da interface com dados do XP
    this.atualizarBarraXP();
    this.atualizarInfoNivel();
  }

  atualizarBarraXP() {
    const barraXP = document.querySelector('.barra-xp');
    if (!barraXP) return;
    
    const nivelAtual = this.dadosUsuario.nivelAtual;
    const xpAtual = this.dadosUsuario.xpTotal;
    
    if (nivelAtual >= this.niveis.length) {
      // Nível máximo
      barraXP.style.width = '100%';
      return;
    }
    
    const xpNivelAtual = this.niveis[nivelAtual - 1].xpNecessario;
    const xpProximoNivel = this.niveis[nivelAtual].xpNecessario;
    const xpProgresso = xpAtual - xpNivelAtual;
    const xpNecessario = xpProximoNivel - xpNivelAtual;
    
    const porcentagem = (xpProgresso / xpNecessario) * 100;
    barraXP.style.width = `${Math.min(porcentagem, 100)}%`;
  }

  atualizarInfoNivel() {
    const infoNivel = document.querySelector('.info-nivel');
    if (!infoNivel) return;
    
    const dadosNivel = this.niveis[this.dadosUsuario.nivelAtual - 1];
    infoNivel.innerHTML = `
      <span class="nivel-atual">Nível ${this.dadosUsuario.nivelAtual}</span>
      <span class="titulo-nivel" style="color: ${dadosNivel.cor}">${dadosNivel.titulo}</span>
      <span class="xp-info">${this.dadosUsuario.xpTotal} XP</span>
    `;
  }

  // ===== MÉTODOS PÚBLICOS =====
  obterDadosUsuario() {
    return { ...this.dadosUsuario };
  }

  obterNivelAtual() {
    return this.niveis[this.dadosUsuario.nivelAtual - 1];
  }

  obterHistoricoXP(limite = 10) {
    return this.dadosUsuario.historicoXP.slice(0, limite);
  }

  obterConquistas(limite = 10) {
    return this.dadosUsuario.conquistas.slice(0, limite);
  }

  resetarDados() {
    localStorage.removeItem('dadosXP');
    this.dadosUsuario = this.carregarDadosUsuario();
    this.atualizarInterface();
    console.log('🔄 Dados de XP resetados');
  }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaXP;

document.addEventListener('DOMContentLoaded', () => {
  sistemaXP = new SistemaXP();
  window.sistemaXP = sistemaXP; // Disponibilizar globalmente
  
  console.log('🎮 Sistema de XP carregado e disponível globalmente');
});

// ===== INTEGRAÇÃO COM CHECKOUT =====
// Esta função será chamada quando uma compra for finalizada
function processarXPCompra(valorTotal, detalhesCompra = {}) {
  if (window.sistemaXP) {
    return window.sistemaXP.ganharXP('compra_finalizada', valorTotal, detalhesCompra);
  }
  return null;
}

// ===== EXPORTAR PARA USO EM OUTROS ARQUIVOS =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SistemaXP, processarXPCompra };
}

