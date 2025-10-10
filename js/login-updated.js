/**
 * @file login-updated.js
 * @description Script para gerenciar a lógica de login na página de login da Roxinho Shop.
 * Integra-se com o sistema de autenticação (auth-system.js) para processar o login de usuários.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Verificar se o sistema de autenticação está pronto e, se não estiver, aguarda.
    // Isso garante que `window.authSystem` esteja disponível antes de tentar usá-lo.
    const waitForAuthSystem = () => {
        return new Promise(resolve => {
            if (window.authSystem) {
                resolve();
            } else {
                document.addEventListener("systemReady", () => {
                    resolve();
                }, { once: true });
            }
        });
    };

    // Redirecionar se já estiver logado
    waitForAuthSystem().then(() => {
        if (window.authSystem.isLoggedIn()) {
            if (window.authSystem.isAdmin()) {
                window.location.href = "admin-panel.html";
            } else {
                window.location.href = "index.html";
            }
        }
    });

    // Gerar partículas animadas para o fundo da página de login
    function gerarParticulas() {
        const container = document.createElement("div");
        container.classList.add("particles");
        document.body.appendChild(container);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement("div");
            particle.classList.add("particle");
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDuration = `${3 + Math.random() * 5}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(particle);
        }
    }
    gerarParticulas();

    // Elementos do formulário
    const loginForm = document.getElementById("formularioLogin");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("senha");
    const loginButton = document.querySelector("button[type=\"submit\"]");
    let errorEmailDiv = document.getElementById("erro-email");
    let errorPasswordDiv = document.getElementById("erro-senha");

    // Criar elementos de erro se não existirem
    if (!errorEmailDiv) {
        errorEmailDiv = document.createElement("div");
        errorEmailDiv.id = "erro-email";
        errorEmailDiv.className = "error-message";
        emailInput.parentNode.appendChild(errorEmailDiv);
    }

    if (!errorPasswordDiv) {
        errorPasswordDiv = document.createElement("div");
        errorPasswordDiv.id = "erro-senha";
        errorPasswordDiv.className = "error-message";
        passwordInput.parentNode.appendChild(errorPasswordDiv);
    }

    // Adicionar estilos para mensagens de erro
    if (!document.getElementById("login-error-styles")) {
        const styles = document.createElement("style");
        styles.id = "login-error-styles";
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
            .input-error {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
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
        `;
        document.head.appendChild(styles);
    }

    /**
     * Exibe uma mensagem de erro para um campo específico.
     * @param {("email"|"senha")} field - O campo onde o erro ocorreu.
     * @param {string} message - A mensagem de erro a ser exibida.
     */
    function showErrorMessage(field, message) {
        const input = field === "email" ? emailInput : passwordInput;
        const errorDiv = field === "email" ? errorEmailDiv : errorPasswordDiv;
        
        input.classList.add("input-error");
        errorDiv.textContent = message;
        errorDiv.classList.add("show");
    }

    /**
     * Limpa todas as mensagens de erro e estilos de erro dos campos.
     */
    function clearErrors() {
        emailInput.classList.remove("input-error");
        passwordInput.classList.remove("input-error");
        errorEmailDiv.classList.remove("show");
        errorPasswordDiv.classList.remove("show");
    }

    /**
     * Exibe ou oculta um spinner de carregamento no botão de login.
     * @param {boolean} show - True para mostrar o spinner, false para ocultar.
     */
    function showLoadingSpinner(show) {
        if (show) {
            loginButton.disabled = true;
            loginButton.innerHTML = "<span class=\"loading-spinner\"></span>Entrando...";
        } else {
            loginButton.disabled = false;
            loginButton.innerHTML = "Entrar";
        }
    }

    /**
     * Lida com o evento de submissão do formulário de login.
     * Realiza a validação dos campos e tenta autenticar o usuário.
     * @param {Event} e - O evento de submissão do formulário.
     */
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        
        clearErrors();
        
        const email = emailInput.value.trim();
        const senha = passwordInput.value.trim();
        
        let hasError = false;

        // Validação de e-mail
        if (!email) {
            showErrorMessage("email", "Insira seu e-mail.");
            hasError = true;
        } else if (!/^[^
            showErrorMessage("email", "Insira um e-mail válido.");
            hasError = true;
        }

        // Validação de senha
        if (!senha) {
            showErrorMessage("senha", "Insira sua senha.");
            hasError = true;
        }

        if (hasError) return;

        showLoadingSpinner(true);

        try {
            await waitForAuthSystem();
            const result = await window.authSystem.loginUser(email, senha);
            
            if (result.success) {
                window.authSystem.showMessage("Login realizado com sucesso!", "success");
                
                setTimeout(() => {
                    if (window.authSystem.isAdmin()) {
                        window.location.href = "admin-panel.html";
                    } else {
                        window.location.href = "index.html";
                    }
                }, 1000);
                
            } else {
                showErrorMessage("senha", result.error);
                window.authSystem.showMessage(result.error, "error");
            }
            
        } catch (error) {
            console.error("Erro no login:", error);
            showErrorMessage("senha", "Erro interno. Tente novamente.");
            window.authSystem.showMessage("Erro interno. Tente novamente.", "error");
        } finally {
            showLoadingSpinner(false);
        }
    });

    // Limpar erros quando o usuário começar a digitar
    emailInput.addEventListener("input", () => {
        emailInput.classList.remove("input-error");
        errorEmailDiv.classList.remove("show");
    });

    passwordInput.addEventListener("input", () => {
        passwordInput.classList.remove("input-error");
        errorPasswordDiv.classList.remove("show");
    });

    /**
     * Lida com a resposta de credenciais do Google Sign-In.
     * @param {object} response - O objeto de resposta do Google.
     */
    function handleCredentialResponse(response) {
        console.log("Google JWT: ", response.credential);
        window.authSystem.showMessage("Login com Google em desenvolvimento", "info");
    }

    /**
     * Alterna o estado do checkbox "Lembrar-me" e adiciona um feedback visual.
     */
    function toggleCheckbox() {
        const checkbox = document.getElementById("remember");
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            
            const wrapper = document.querySelector(".remember-me");
            if (wrapper) {
                wrapper.style.transform = "scale(0.98)";
                setTimeout(() => {
                    wrapper.style.transform = "scale(1)";
                }, 100);
            }
        }
    }

    // Inicializar Google Sign-In se disponível
    window.onload = function () {
        if (typeof google !== "undefined" && google.accounts) {
            google.accounts.id.initialize({
                client_id: "SUA_CLIENT_ID_AQUI.apps.googleusercontent.com",
                callback: handleCredentialResponse
            });
            
            const googleBtn = document.getElementById("googleBtn");
            if (googleBtn) {
                google.accounts.id.renderButton(googleBtn, {
                    theme: "outline",
                    size: "large",
                    shape: "pill",
                    logo_alignment: "left"
                });
            }
        }
    };

    // Expor função para uso global
    window.toggleCheckbox = toggleCheckbox;

    console.log("📄 login-updated.js carregado");
});

