// Desenvolvido por Gabriel (gabwvr)
// Este arquivo contém funções para gerenciar [FUNCIONALIDADE]
// Comentários didáticos para facilitar o entendimento


// Classe para manuseio do formulário de cadastro
class FormularioCadastro {
    constructor() {
        this.formulario = document.getElementById('formularioCadastro');
        this.entradaNome = document.getElementById('nome');
        this.entradaSobrenome = document.getElementById('sobrenome');
        this.entradaEmail = document.getElementById('email');
        this.entradaSenha = document.getElementById('senha');
        this.entradaConfirmarSenha = document.getElementById('confirmarSenha');
        this.botaoCadastro = document.getElementById('botaoCadastro');
        this.indicadorContainer = document.getElementById('indicador-senha-container');
        this.progressoSenha = document.getElementById('progresso-senha');
        this.nivelSenha = document.getElementById('nivel-senha');
        this.pontuacaoSenha = document.getElementById('pontuacao-senha');
        this.avisoSenhaCurta = document.getElementById('aviso-senha-curta');
        
        this.inicializar();
    }

    inicializar() {
        this.formulario.addEventListener('submit', this.lidarComEnvio.bind(this));
        
        // Validações em tempo real
        this.entradaNome.addEventListener('blur', () => this.validarNome());
        this.entradaNome.addEventListener('input', () => this.limparErro('nome'));
        
        this.entradaSobrenome.addEventListener('blur', () => this.validarSobrenome());
        this.entradaSobrenome.addEventListener('input', () => this.limparErro('sobrenome'));
        
        this.entradaEmail.addEventListener('blur', () => this.validarEmail());
        this.entradaEmail.addEventListener('input', () => this.limparErro('email'));
        
        this.entradaSenha.addEventListener('input', () => {
            this.verificarForcaSenha();
            this.limparErro('senha');

            // ✅ Revalida confirmação em tempo real
            this.validarConfirmacaoSenha();
        });
        
        this.entradaConfirmarSenha.addEventListener('input', () => {
            this.validarConfirmacaoSenha();
        });
    }

    validarNome() {
        const nome = this.entradaNome.value.trim();
        if (!nome) return this.mostrarErro('nome', 'Nome é obrigatório');
        if (nome.length < 2) return this.mostrarErro('nome', 'Nome deve ter pelo menos 2 caracteres');
        if (!/^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(nome)) return this.mostrarErro('nome', 'Nome deve conter apenas letras');
        this.mostrarSucesso('nome'); return true;
    }

    validarSobrenome() {
        const sobrenome = this.entradaSobrenome.value.trim();
        if (!sobrenome) return this.mostrarErro('sobrenome', 'Sobrenome é obrigatório');
        if (sobrenome.length < 2) return this.mostrarErro('sobrenome', 'Sobrenome deve ter pelo menos 2 caracteres');
        if (!/^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(sobrenome)) return this.mostrarErro('sobrenome', 'Sobrenome deve conter apenas letras');
        this.mostrarSucesso('sobrenome'); return true;
    }

    validarEmail() {
        const email = this.entradaEmail.value.trim();
        const padraoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return this.mostrarErro('email', 'E-mail é obrigatório');
        if (!padraoEmail.test(email)) return this.mostrarErro('email', 'E-mail inválido');
        this.mostrarSucesso('email'); return true;
    }

    verificarForcaSenha() {
        const senha = this.entradaSenha.value;
        
        if (senha.length === 0) {
            this.indicadorContainer.classList.remove('visivel');
            this.avisoSenhaCurta.classList.remove('visivel');
            return 0;
        }

        if (senha.length < 8) {
            this.indicadorContainer.classList.remove('visivel');
            this.avisoSenhaCurta.classList.add('visivel');
            return 0;
        }

        this.avisoSenhaCurta.classList.remove('visivel');

        let score = 0;
        if (senha.length < 8) score = 10;
        else if (senha.length < 12) score = 20;
        else if (senha.length < 16) score = 40;
        else score = 90;

        if (/[a-z]/.test(senha)) score += 1;
        if (/[A-Z]/.test(senha)) score += 10;
