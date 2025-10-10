/**
 * @file cadastro-updated.js
 * @description Script para gerenciar a lógica de cadastro na página de cadastro da Roxinho Shop.
 * Integra-se com o sistema de autenticação (auth-system.js) para processar o registro de novos usuários.
 */

/**
 * Classe para manuseio do formulário de cadastro atualizado.
 * Gerencia a validação de campos, feedback de força de senha e integração com o sistema de autenticação.
 */
class FormularioCadastroAtualizado {
    /**
     * Construtor da classe FormularioCadastroAtualizado.
     * Inicializa os elementos do formulário e configura os event listeners.
     */
    constructor() {
        /** @type {HTMLFormElement} */
        this.formulario = document.getElementById("formularioCadastro");
        /** @type {HTMLInputElement} */
        this.entradaNome = document.getElementById("nome");
        /** @type {HTMLInputElement} */
        this.entradaSobrenome = document.getElementById("sobrenome");
        /** @type {HTMLInputElement} */
        this.entradaEmail = document.getElementById("email");
        /** @type {HTMLInputElement} */
        this.entradaSenha = document.getElementById("senha");
        /** @type {HTMLInputElement} */
        this.entradaConfirmarSenha = document.getElementById("confirmar-senha"); // Corrigido para 'confirmar-senha'
        /** @type {HTMLButtonElement} */
        this.botaoCadastro = document.querySelector("button[type=\"submit\"]");
        
        /** @type {HTMLElement} */
        this.passwordStrengthBar = document.getElementById("progresso-senha");
        /** @type {HTMLElement} */
        this.passwordLevelText = document.getElementById("nivel-senha");
        /** @type {HTMLElement} */
        this.passwordScoreText = document.getElementById("pontuacao-senha");
        /** @type {HTMLElement} */
        this.shortPasswordWarning = document.getElementById("aviso-senha-curta");

        this.inicializar();
    }

    /**
     * Inicializa o formulário de cadastro.
     * Verifica se o usuário já está logado, adiciona estilos e configura os eventos.
     */
    inicializar() {
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            window.location.href = "painelusuario.html";
            return;
        }

        this.adicionarEstilos();
        this.configurarEventos();
        console.log("📝 Formulário de cadastro atualizado inicializado");
    }

    /**
     * Adiciona estilos CSS dinamicamente para mensagens de erro e feedback de senha.
     */
    adicionarEstilos() {
        if (!document.getElementById("cadastro-updated-styles")) {
            const styles = document.createElement("style");
            styles.id = "cadastro-updated-styles";
            styles.textContent = `
                .error-message {
                    color: #dc3545;
                    font-size: 14px;
                    margin-top: 5px;
                    display: none;
                }
                .error-message.show {
                    display: block;
                }
                .success-message {
                    color: #28a745;
                    font-size: 14px;
                    margin-top: 5px;
                    display: none;
                }
                .success-message.show {
                    display: block;
                }
                .input-error {
                    border-color: #dc3545 !important;
                    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                }
                .input-success {
                    border-color: #28a745 !important;
                    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
                }
                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 10px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .password-strength {
                    margin-top: 10px;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 14px;
                    display: none;
                }
                .password-strength.show {
                    display: block;
                }
                .strength-weak {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                .strength-medium {
                    background-color: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }
                .strength-strong {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    /**
     * Configura os event listeners para o formulário e seus campos.
     */
    configurarEventos() {
        this.formulario.addEventListener("submit", this.lidarComEnvio.bind(this));
        
        this.entradaNome.addEventListener("blur", () => this.validarNome());
        this.entradaNome.addEventListener("input", () => this.limparErro("nome"));
        
        this.entradaSobrenome.addEventListener("blur", () => this.validarSobrenome());
        this.entradaSobrenome.addEventListener("input", () => this.limparErro("sobrenome"));
        
        this.entradaEmail.addEventListener("blur", () => this.validarEmail());
        this.entradaEmail.addEventListener("input", () => this.limparErro("email"));
        
        this.entradaSenha.addEventListener("input", () => {
            this.verificarForcaSenha();
            this.limparErro("senha");
            if (this.entradaConfirmarSenha.value) {
                this.validarConfirmacaoSenha();
            }
        });
        
        this.entradaConfirmarSenha.addEventListener("input", () => {
            this.validarConfirmacaoSenha();
        });
    }

    /**
     * Lida com o evento de submissão do formulário de cadastro.
     * Realiza a validação dos campos e tenta registrar o novo usuário através do `authSystem`.
     * @param {Event} e - O evento de submissão do formulário.
     */
    async lidarComEnvio(e) {
        e.preventDefault();
        
        this.limparTodosErros();
        
        const nomeValido = this.validarNome();
        const sobrenomeValido = this.validarSobrenome();
        const emailValido = this.validarEmail();
        const senhaValida = this.validarSenha();
        const confirmacaoValida = this.validarConfirmacaoSenha();
        
        if (!nomeValido || !sobrenomeValido || !emailValido || !senhaValida || !confirmacaoValida) {
            window.authSystem.showMessage("Por favor, corrija os erros no formulário.", "error");
            return;
        }

        this.mostrarLoading(true);

        try {
            const dadosUsuario = {
                nome: this.entradaNome.value.trim(),
                sobrenome: this.entradaSobrenome.value.trim(),
                email: this.entradaEmail.value.trim(),
                senha: this.entradaSenha.value
            };

            const resultado = await window.authSystem.registerUser(dadosUsuario);
            
            if (resultado.success) {
                window.authSystem.showMessage("Cadastro realizado com sucesso! Redirecionando para o login...", "success");
                
                this.formulario.reset();
                this.limparTodosErros();
                
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
                
            } else {
                window.authSystem.showMessage(resultado.error, "error");
                
                if (resultado.error.includes("e-mail já está cadastrado")) {
                    this.mostrarErro("email", resultado.error);
                }
            }
            
        } catch (error) {
            console.error("Erro no cadastro:", error);
            window.authSystem.showMessage("Erro interno. Tente novamente.", "error");
        } finally {
            this.mostrarLoading(false);
        }
    }

    /**
     * Valida o campo nome.
     * @returns {boolean} True se o nome for válido, false caso contrário.
     */
    validarNome() {
        const nome = this.entradaNome.value.trim();
        if (!nome) return this.mostrarErro("nome", "Nome é obrigatório");
        if (nome.length < 2) return this.mostrarErro("nome", "Nome deve ter pelo menos 2 caracteres");
        if (!/^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(nome)) return this.mostrarErro("nome", "Nome deve conter apenas letras");
        this.mostrarSucesso("nome");
        return true;
    }

    /**
     * Valida o campo sobrenome.
     * @returns {boolean} True se o sobrenome for válido, false caso contrário.
     */
    validarSobrenome() {
        const sobrenome = this.entradaSobrenome.value.trim();
        if (!sobrenome) return this.mostrarErro("sobrenome", "Sobrenome é obrigatório");
        if (sobrenome.length < 2) return this.mostrarErro("sobrenome", "Sobrenome deve ter pelo menos 2 caracteres");
        if (!/^[a-záàâãéèêíïóôõöúçñ\s]+$/i.test(sobrenome)) return this.mostrarErro("sobrenome", "Sobrenome deve conter apenas letras");
        this.mostrarSucesso("sobrenome");
        return true;
    }

    /**
     * Valida o campo e-mail.
     * @returns {boolean} True se o e-mail for válido, false caso contrário.
     */
    validarEmail() {
        const email = this.entradaEmail.value.trim();
        const padraoEmail = /^[^
        if (!email) return this.mostrarErro("email", "E-mail é obrigatório");
        if (!padraoEmail.test(email)) return this.mostrarErro("email", "E-mail inválido");
        this.mostrarSucesso("email");
        return true;
    }

    /**
     * Valida o campo senha.
     * @returns {boolean} True se a senha for válida, false caso contrário.
     */
    validarSenha() {
        const senha = this.entradaSenha.value;
        if (!senha) return this.mostrarErro("senha", "Senha é obrigatória");
        if (senha.length < 8) return this.mostrarErro("senha", "Senha deve ter pelo menos 8 caracteres");
        this.mostrarSucesso("senha");
        return true;
    }

    /**
     * Valida o campo de confirmação de senha.
     * @returns {boolean} True se as senhas coincidirem e o campo for válido, false caso contrário.
     */
    validarConfirmacaoSenha() {
        const senha = this.entradaSenha.value;
        const confirmacao = this.entradaConfirmarSenha.value;
        
        if (!confirmacao) return this.mostrarErro("confirmar-senha", "Confirmação de senha é obrigatória");
        if (senha !== confirmacao) return this.mostrarErro("confirmar-senha", "As senhas não coincidem");
        this.mostrarSucesso("confirmar-senha");
        return true;
    }

    /**
     * Calcula a força da senha e atualiza o feedback visual.
     */
    verificarForcaSenha() {
        const senha = this.entradaSenha.value;
        
        if (senha.length === 0) {
            this.esconderForcaSenha();
            return;
        }

        let score = 0;
        let feedback = "";
        
        if (senha.length >= 8) score += 25;
        if (senha.length >= 12) score += 25;
        if (/[a-z]/.test(senha)) score += 10;
        if (/[A-Z]/.test(senha)) score += 10;
        if (/[0-9]/.test(senha)) score += 15;
        if (/[^A-Za-z0-9]/.test(senha)) score += 15;

        if (score < 50) {
            feedback = "Senha fraca - Adicione mais caracteres, números e símbolos";
            this.mostrarForcaSenha(feedback, "weak");
        } else if (score < 80) {
            feedback = "Senha média - Boa, mas pode ser melhorada";
            this.mostrarForcaSenha(feedback, "medium");
        } else {
            feedback = "Senha forte - Excelente!";
            this.mostrarForcaSenha(feedback, "strong");
        }

        if (senha.length > 0 && senha.length < 8) {
            this.shortPasswordWarning.textContent = "A senha deve ter pelo menos 8 caracteres.";
            this.shortPasswordWarning.classList.remove("apenas-leitura-tela");
        } else {
            this.shortPasswordWarning.textContent = "";
            this.shortPasswordWarning.classList.add("apenas-leitura-tela");
        }
    }

    /**
     * Exibe o indicador de força da senha com o texto e nível especificados.
     * @param {string} text - O texto de feedback da força da senha.
     * @param {("weak"|"medium"|"strong")} level - O nível de força da senha para estilização.
     */
    mostrarForcaSenha(text, level) {
        let indicador = document.getElementById("password-strength");
        if (!indicador) {
            indicador = document.createElement("div");
            indicador.id = "password-strength";
            indicador.className = "password-strength";
            this.entradaSenha.parentNode.appendChild(indicador);
        }
        
        indicador.textContent = text;
        indicador.className = `password-strength strength-${level} show`;
    }

    /**
     * Esconde o indicador de força da senha.
     */
    esconderForcaSenha() {
        const indicador = document.getElementById("password-strength");
        if (indicador) {
            indicador.classList.remove("show");
        }
    }

    /**
     * Exibe uma mensagem de erro para um campo específico do formulário.
     * @param {string} field - O nome do campo (ex: 'nome', 'email').
     * @param {string} message - A mensagem de erro a ser exibida.
     * @returns {boolean} Sempre retorna false.
     */
    mostrarErro(field, message) {
        const inputElement = this[`entrada${field.charAt(0).toUpperCase() + field.slice(1)}`];
        let errorDiv = document.getElementById(`erro-${field}`);
        
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.id = `erro-${field}`;
            errorDiv.className = "error-message";
            inputElement.parentNode.appendChild(errorDiv);
        }
        
        inputElement.classList.remove("input-success");
        inputElement.classList.add("input-error");
        errorDiv.textContent = message;
        errorDiv.classList.add("show");
        return false;
    }

    /**
     * Exibe um feedback de sucesso para um campo específico do formulário.
     * @param {string} field - O nome do campo (ex: 'nome', 'email').
     * @returns {boolean} Sempre retorna true.
     */
    mostrarSucesso(field) {
        const inputElement = this[`entrada${field.charAt(0).toUpperCase() + field.slice(1)}`];
        const errorDiv = document.getElementById(`erro-${field}`);
        
        inputElement.classList.remove("input-error");
        inputElement.classList.add("input-success");
        
        if (errorDiv) {
            errorDiv.classList.remove("show");
        }
        return true;
    }

    /**
     * Limpa a mensagem de erro e os estilos de erro/sucesso de um campo específico.
     * @param {string} field - O nome do campo (ex: 'nome', 'email').
     */
    limparErro(field) {
        const inputElement = this[`entrada${field.charAt(0).toUpperCase() + field.slice(1)}`];
        const errorDiv = document.getElementById(`erro-${field}`);
        
        inputElement.classList.remove("input-error", "input-success");
        
        if (errorDiv) {
            errorDiv.classList.remove("show");
            errorDiv.textContent = "";
        }
    }

    /**
     * Limpa todas as mensagens de erro e estilos de erro/sucesso de todos os campos do formulário.
     */
    limparTodosErros() {
        ["nome", "sobrenome", "email", "senha", "confirmar-senha"].forEach(field => { // Corrigido para 'confirmar-senha'
            this.limparErro(field);
        });
    }

    /**
     * Exibe ou oculta um spinner de carregamento no botão de cadastro.
     * @param {boolean} show - True para mostrar o spinner, false para ocultar.
     */
    mostrarLoading(show) {
        if (show) {
            this.botaoCadastro.disabled = true;
            this.botaoCadastro.innerHTML = "<span class=\"loading-spinner\"></span>Criando conta...";
        } else {
            this.botaoCadastro.disabled = false;
            this.botaoCadastro.innerHTML = "Criar Conta";
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
    // Aguardar o sistema de autenticação estar disponível
    const inicializarCadastro = () => {
        if (window.authSystem) {
            new FormularioCadastroAtualizado();
        } else {
            setTimeout(inicializarCadastro, 100);
        }
    };
    
    inicializarCadastro();
});

console.log("📝 Sistema de cadastro atualizado carregado");
